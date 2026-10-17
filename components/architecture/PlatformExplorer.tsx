"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { MemoryModel, NodeRole, StepKind } from "@/data/schema";
import { PLATFORMS, ROLE_INFO, getPlatform } from "@/data/platforms";
import { ArchDiagram, DiagramLegend } from "./ArchDiagram";
import { PlatformPicker } from "./PlatformPicker";
import { Badge, CompanyTag, Kicker, Panel, ScopeTag } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { STEP_COLOR, resolveFlow } from "@/lib/flow";

interface DataPath {
  id: string;
  label: string;
  kind: StepKind;
  route: Record<MemoryModel, [NodeRole, NodeRole]>;
  text: Record<MemoryModel, string>;
}

/** Canonical data movements, written per memory model so the explanation matches the picture. */
const DATA_PATHS: DataPath[] = [
  {
    id: "handoff",
    label: "CPU → GPU hand-off",
    kind: "copy",
    route: { discrete: ["sysmem", "vram"], unified: ["sysmem", "gpu"], "integrated-shared": ["sysmem", "gpu"] },
    text: {
      discrete:
        "The CPU prepared data in system RAM. For the GPU to use it at full speed it is typically transferred across PCIe into the card's VRAM — a real trip over a link that is much slower than VRAM itself. Drivers and APIs manage this, and games/AI tools try hard to upload once and reuse.",
      unified:
        "The CPU prepared data in unified memory. The GPU reads the very same memory — no separate VRAM pool to copy into. The software still has to share it correctly (synchronisation, caching), but the bulk transfer disappears.",
      "integrated-shared":
        "The integrated GPU also reads system RAM, so no PCIe copy is needed. The tradeoff: a typical laptop memory bus (often 128-bit) gives the iGPU far less bandwidth than a graphics card's VRAM.",
    },
  },
  {
    id: "load",
    label: "Load a file",
    kind: "load",
    route: { discrete: ["storage", "sysmem"], unified: ["storage", "sysmem"], "integrated-shared": ["storage", "sysmem"] },
    text: {
      discrete:
        "Opening a file streams it from the NVMe SSD over PCIe lanes into system RAM (via DMA, handled by the CPU's I/O and memory controllers). Storage is roughly a thousand times slower to reach than RAM, which is why programs load data into memory first.",
      unified:
        "On Apple Silicon the SSD controller lives inside the SoC; the NAND flash chips sit outside. Data flows from flash into unified memory — where CPU and GPU can both reach it.",
      "integrated-shared": "The NVMe SSD streams data over PCIe into system RAM, which both the CPU and the integrated GPU use.",
    },
  },
  {
    id: "frame",
    label: "Display a frame",
    kind: "output",
    route: { discrete: ["gpu", "display"], unified: ["gpu", "display"], "integrated-shared": ["gpu", "display"] },
    text: {
      discrete:
        "The GPU renders into a frame buffer in VRAM; the card's display engine scans it out to the monitor connected to the graphics card.",
      unified: "The GPU renders into a frame buffer in unified memory; the SoC's display engine scans it out.",
      "integrated-shared": "The iGPU renders into a frame buffer in system RAM; the processor's display engine scans it out.",
    },
  },
  {
    id: "cpu-read",
    label: "CPU reads memory",
    kind: "sync",
    route: { discrete: ["sysmem", "cpu"], unified: ["sysmem", "cpu"], "integrated-shared": ["sysmem", "cpu"] },
    text: {
      discrete:
        "A cache miss: the core asks the memory controller, which fetches a 64-byte line from DRAM (~80–120 ns) and fills the caches on the way back. The next nearby access will hit in cache.",
      unified:
        "Same idea on a unified design: the CPU cluster's caches and the system level cache sit between the cores and memory. The CPU usually cannot use all of the memory bandwidth — that headroom exists for the GPU.",
      "integrated-shared":
        "The cores fetch through their caches from system RAM — the same RAM the integrated GPU is using, so both compete for bandwidth.",
    },
  },
];

export function PlatformExplorer({ initial = "traditional-pc" }: { initial?: string }) {
  const [pid, setPid] = useState(initial);
  const [selected, setSelected] = useState<string | null>(null);
  const [pathId, setPathId] = useState<string>("handoff");
  const platform = getPlatform(pid) ?? PLATFORMS[0];

  const dp = DATA_PATHS.find((d) => d.id === pathId);
  const flow = useMemo(() => {
    if (!dp) return null;
    const [from, to] = dp.route[platform.memoryModel];
    return resolveFlow(platform, from, to, STEP_COLOR[dp.kind], dp.id);
  }, [dp, platform]);

  const node = platform.nodes.find((n) => n.id === selected);
  const info = node?.role ? ROLE_INFO[node.role] : undefined;

  return (
    <div>
      <PlatformPicker
        value={pid}
        onChange={(id) => {
          setPid(id);
          setSelected(null);
        }}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-dim">Animate a data path</span>
            </div>
            <Segmented
              size="sm"
              ariaLabel="Data path"
              value={pathId}
              onChange={setPathId}
              options={[
                ...DATA_PATHS.map((d) => ({ value: d.id, label: d.label, color: STEP_COLOR[d.kind] })),
                { value: "none", label: "Off" },
              ]}
            />
          </div>
          <div className="scroll-thin overflow-x-auto p-2 sm:p-4">
            <div className="min-w-[600px] sm:min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.25 }}
                >
                  <ArchDiagram
                    platform={platform}
                    selected={selected}
                    onSelect={(id) => setSelected((s) => (s === id ? null : id))}
                    activeNodes={flow?.nodes ?? []}
                    activeEdges={flow?.edges ?? []}
                    packets={flow?.packet ? [flow.packet] : []}
                    pulse={flow?.pulse && dp ? { node: flow.pulse, color: STEP_COLOR[dp.kind], key: `${platform.id}-${dp.id}` } : null}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="border-t border-line px-4 py-3">
            {dp ? (
              <p className="text-sm leading-relaxed text-muted">
                <span className="mr-2 font-mono text-[11px] uppercase tracking-wider" style={{ color: STEP_COLOR[dp.kind] }}>
                  {dp.label}
                </span>
                {dp.text[platform.memoryModel]}
              </p>
            ) : (
              <p className="text-sm text-dim">Click any block in the diagram to see what it does.</p>
            )}
            <DiagramLegend className="mt-3" />
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <ScopeTag scope={platform.scope} />
              {platform.generic ? (
                <Badge>Vendor-neutral archetype</Badge>
              ) : (
                <>
                  <CompanyTag company={platform.cpuVendor} />
                  {platform.gpuVendor !== platform.cpuVendor && <CompanyTag company={platform.gpuVendor} />}
                </>
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-fg">{platform.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{platform.summary}</p>
            <dl className="mt-4 space-y-2.5 border-t border-line pt-4">
              {platform.traits.map((t) => (
                <div key={t.label} className="grid grid-cols-[96px_1fr] gap-2 text-xs">
                  <dt className="font-mono uppercase tracking-wider text-dim">{t.label}</dt>
                  <dd className="text-muted">{t.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <AnimatePresence mode="wait">
            {node && (
              <motion.div key={node.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Panel className="p-5">
                  <Kicker>Selected</Kicker>
                  <div className="mt-1.5 font-medium text-fg">{node.label}</div>
                  {node.sublabel && <div className="font-mono text-xs text-dim">{node.sublabel}</div>}
                  {info && <p className="mt-2 text-sm leading-relaxed text-muted">{info.text}</p>}
                  {info?.lesson && (
                    <Link href={info.lesson} className="mt-3 inline-block text-sm text-accent">
                      Open the lesson →
                    </Link>
                  )}
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Panel className="p-5">
          <Kicker color="var(--good)">Why this design helps</Kicker>
          <ul className="mt-3 space-y-2">
            {platform.advantages.map((a) => (
              <li key={a} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-good" />
                {a}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="p-5">
          <Kicker color="var(--warn)">What it costs you</Kicker>
          <ul className="mt-3 space-y-2">
            {platform.disadvantages.map((a) => (
              <li key={a} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-warn" />
                {a}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

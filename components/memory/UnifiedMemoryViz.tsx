"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { NodeKind } from "@/data/schema";
import { KIND_VAR, Kicker, Panel } from "@/components/ui/primitives";

type P = [number, number];

interface Box {
  id: string;
  label: string;
  sub?: string;
  kind: NodeKind;
  x: number;
  y: number;
  w: number;
  h: number;
}

const PC_BOXES: Box[] = [
  { id: "ram", label: "System RAM", sub: "DDR5 · CPU's memory", kind: "memory", x: 20, y: 30, w: 130, h: 58 },
  { id: "cpu", label: "CPU", sub: "mem. controller + PCIe", kind: "cpu", x: 205, y: 30, w: 120, h: 58 },
  { id: "ssd", label: "SSD", sub: "NVMe", kind: "storage", x: 20, y: 222, w: 130, h: 58 },
  { id: "gpu", label: "GPU", sub: "discrete card", kind: "gpu", x: 205, y: 222, w: 120, h: 58 },
  { id: "vram", label: "VRAM", sub: "GDDR, on the card", kind: "vram", x: 350, y: 222, w: 100, h: 58 },
];

const AS_BOXES: Box[] = [
  { id: "cpu", label: "CPU", sub: "P + E cores", kind: "cpu", x: 34, y: 46, w: 92, h: 50 },
  { id: "gpu", label: "GPU", kind: "gpu", x: 136, y: 46, w: 92, h: 50 },
  { id: "npu", label: "Neural Engine", kind: "accel", x: 238, y: 46, w: 98, h: 50 },
  { id: "media", label: "Media engines", kind: "accel", x: 34, y: 108, w: 92, h: 40 },
  { id: "mc", label: "Memory controllers · cache", kind: "interconnect", x: 136, y: 108, w: 200, h: 40 },
  { id: "um", label: "Unified memory", sub: "LPDDR on the package · one pool for every engine", kind: "memory", x: 20, y: 222, w: 330, h: 58 },
  { id: "ssd", label: "SSD", sub: "NAND flash", kind: "storage", x: 365, y: 222, w: 85, h: 58 },
];

const c = (b: Box): P => [b.x + b.w / 2, b.y + b.h / 2];
const pcB = Object.fromEntries(PC_BOXES.map((b) => [b.id, b])) as Record<string, Box>;
const asB = Object.fromEntries(AS_BOXES.map((b) => [b.id, b])) as Record<string, Box>;

interface StepDef {
  title: string;
  pc: { path: P[]; active: string[]; text: string; copies: number; pcie: number; where: string[] };
  as: { path: P[]; active: string[]; text: string; copies: number; where: string[] };
}

const PCIE_X = 265;

const STEPS: StepDef[] = [
  {
    title: "The data starts on the SSD",
    pc: { path: [c(pcB.ssd)], active: ["ssd"], text: "A texture, a video frame or a model's weights sits in storage.", copies: 0, pcie: 0, where: ["ssd"] },
    as: { path: [c(asB.ssd)], active: ["ssd"], text: "Same starting point.", copies: 0, where: ["ssd"] },
  },
  {
    title: "Load it into memory",
    pc: {
      path: [c(pcB.ssd), [175, 251], [175, 70], c(pcB.ram)],
      active: ["ssd", "cpu", "ram"],
      text: "The SSD transfers it (via the CPU's PCIe lanes) into system RAM.",
      copies: 1,
      pcie: 0,
      where: ["ram"],
    },
    as: {
      path: [c(asB.ssd), [407, 128], [300, 128], [300, 200], c(asB.um)],
      active: ["ssd", "mc", "um"],
      text: "The SoC's storage controller loads it into unified memory.",
      copies: 1,
      where: ["um"],
    },
  },
  {
    title: "The CPU prepares it",
    pc: { path: [c(pcB.ram), c(pcB.cpu)], active: ["ram", "cpu"], text: "The CPU reads and modifies it in system RAM (decompressing, sorting, building commands).", copies: 1, pcie: 0, where: ["ram"] },
    as: { path: [c(asB.um), [80, 190], c(asB.cpu)], active: ["um", "mc", "cpu"], text: "The CPU reads and modifies it in unified memory.", copies: 1, where: ["um"] },
  },
  {
    title: "The GPU needs the same data",
    pc: {
      path: [c(pcB.ram), c(pcB.cpu), [PCIE_X, 155], c(pcB.gpu), c(pcB.vram)],
      active: ["ram", "cpu", "gpu", "vram"],
      text: "The data is copied across PCIe into VRAM — a second copy, in a second pool, over a link much slower than VRAM itself.",
      copies: 2,
      pcie: 1,
      where: ["ram", "vram"],
    },
    as: {
      path: [c(asB.um), [182, 190], c(asB.gpu)],
      active: ["um", "mc", "gpu"],
      text: "The GPU reads the very same bytes. No copy into a separate GPU memory is needed.",
      copies: 1,
      where: ["um"],
    },
  },
  {
    title: "The GPU computes a result",
    pc: { path: [c(pcB.vram), c(pcB.gpu), c(pcB.vram)], active: ["gpu", "vram"], text: "The GPU works out of its own fast VRAM.", copies: 2, pcie: 1, where: ["ram", "vram"] },
    as: { path: [c(asB.gpu), [182, 190], c(asB.um)], active: ["gpu", "mc", "um"], text: "The GPU writes its result into the shared pool.", copies: 1, where: ["um"] },
  },
  {
    title: "The CPU needs the result",
    pc: {
      path: [c(pcB.vram), c(pcB.gpu), [PCIE_X, 155], c(pcB.cpu), c(pcB.ram)],
      active: ["vram", "gpu", "cpu", "ram"],
      text: "If the CPU needs it, it travels back across PCIe. Well-written apps minimise these round-trips.",
      copies: 2,
      pcie: 2,
      where: ["ram", "vram"],
    },
    as: { path: [c(asB.um), [80, 190], c(asB.cpu)], active: ["um", "mc", "cpu"], text: "The CPU reads it where the GPU left it (after the two synchronise).", copies: 1, where: ["um"] },
  },
];

function Boxes({ boxes, active }: { boxes: Box[]; active: string[] }) {
  return (
    <>
      {boxes.map((b) => {
        const on = active.includes(b.id);
        const col = KIND_VAR[b.kind];
        return (
          <g key={b.id}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={8}
              fill={`color-mix(in oklab, ${col} ${on ? 16 : 6}%, var(--panel))`}
              stroke={col}
              strokeOpacity={on ? 0.95 : 0.35}
              strokeWidth={on ? 1.6 : 1}
              style={{ transition: "all .3s" }}
            />
            <text x={b.x + 10} y={b.y + 20} className="diagram-text" fontSize={12} fontWeight={600}>
              {b.label}
            </text>
            {b.sub && (
              <text x={b.x + 10} y={b.y + 36} className="diagram-mono" fontSize={8.5}>
                {b.sub}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

function Packet({ path, k, reduced }: { path: P[]; k: string; reduced: boolean }) {
  const xs = path.map((p) => p[0] - 6);
  const ys = path.map((p) => p[1] - 6);
  if (reduced || path.length < 2) return <rect x={xs[xs.length - 1]} y={ys[ys.length - 1]} width={12} height={12} rx={2} fill="var(--warn)" />;
  return (
    <motion.rect
      key={k}
      width={12}
      height={12}
      rx={2}
      fill="var(--warn)"
      initial={{ x: xs[0], y: ys[0], opacity: 0 }}
      animate={{ x: xs, y: ys, opacity: 1 }}
      transition={{ duration: 0.5 * (path.length - 1) + 0.4, ease: "easeInOut" }}
      style={{ filter: "drop-shadow(0 0 6px var(--warn))" }}
    />
  );
}

export function UnifiedMemoryViz() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  useEffect(() => {
    if (!auto || reduced) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 3200);
    return () => clearInterval(id);
  }, [auto, reduced]);

  const s = STEPS[step];

  return (
    <Panel className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Kicker>
            Step {step + 1} / {STEPS.length}
          </Kicker>
          <div className="mt-1 text-lg font-semibold text-fg">{s.title}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAuto(false);
              setStep((x) => (x - 1 + STEPS.length) % STEPS.length);
            }}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-fg"
            aria-label="Previous step"
          >
            ←
          </button>
          <button
            onClick={() => setAuto((a) => !a)}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-fg"
          >
            {auto ? "Pause" : "Auto-play"}
          </button>
          <button
            onClick={() => {
              setAuto(false);
              setStep((x) => (x + 1) % STEPS.length);
            }}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink"
            aria-label="Next step"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg-elev p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-fg">PC with a discrete GPU</div>
            <div className="font-mono text-[11px] text-dim">
              copies {s.pc.copies} · PCIe crossings {s.pc.pcie}
            </div>
          </div>
          <svg viewBox="0 0 470 300" className="w-full" role="img" aria-label="PC memory architecture">
            <path d="M150 59H205" stroke="var(--k-memory)" strokeWidth={3} />
            <path d="M150 251H175V70H205" fill="none" stroke="var(--k-storage)" strokeWidth={1.5} strokeOpacity={0.6} />
            <path d={`M${PCIE_X} 88V222`} stroke="var(--k-interconnect)" strokeWidth={6} strokeOpacity={0.35} />
            <path d={`M${PCIE_X} 88V222`} stroke="var(--k-interconnect)" strokeWidth={1.5} className="flow-dash" />
            <text x={PCIE_X + 10} y={160} className="diagram-mono" fontSize={9.5}>
              PCIe ×16
            </text>
            <path d="M325 251H350" stroke="var(--k-vram)" strokeWidth={5} />
            <Boxes boxes={PC_BOXES} active={s.pc.active} />
            <Packet path={s.pc.path} k={`pc-${step}`} reduced={reduced} />
            {s.pc.where.map((w) => {
              const b = pcB[w];
              return <rect key={w} x={b.x + b.w - 22} y={b.y + b.h - 20} width={12} height={12} rx={2} fill="var(--warn)" opacity={0.85} />;
            })}
          </svg>
          <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-muted">{s.pc.text}</p>
        </div>

        <div className="rounded-xl border border-line bg-bg-elev p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-fg">Apple Silicon (unified memory)</div>
            <div className="font-mono text-[11px] text-dim">copies {s.as.copies} · PCIe crossings 0</div>
          </div>
          <svg viewBox="0 0 470 300" className="w-full" role="img" aria-label="Apple Silicon memory architecture">
            <rect x={20} y={18} width={330} height={142} rx={14} fill="none" stroke="var(--line-strong)" strokeDasharray="5 5" />
            <text x={30} y={34} className="diagram-mono" fontSize={9}>
              SoC — one chip
            </text>
            {[60, 120, 180, 240, 300].map((x) => (
              <path key={x} d={`M${x} 160V222`} stroke="var(--k-memory)" strokeWidth={3} strokeOpacity={0.55} />
            ))}
            <path d="M80 148V160M182 96V108M287 96V108M80 96V108" stroke="var(--line-strong)" />
            <path d="M407 222V128H336" fill="none" stroke="var(--k-storage)" strokeWidth={1.5} strokeOpacity={0.6} />
            <text x={306} y={196} className="diagram-mono" fontSize={9}>
              wide bus
            </text>
            <Boxes boxes={AS_BOXES} active={s.as.active} />
            <Packet path={s.as.path} k={`as-${step}`} reduced={reduced} />
            {s.as.where.map((w) => {
              const b = asB[w];
              return <rect key={w} x={b.x + b.w - 22} y={b.y + b.h - 20} width={12} height={12} rx={2} fill="var(--warn)" opacity={0.85} />;
            })}
          </svg>
          <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-muted">{s.as.text}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-1" role="tablist" aria-label="Steps">
        {STEPS.map((st, i) => (
          <button
            key={st.title}
            role="tab"
            aria-selected={i === step}
            aria-label={st.title}
            onClick={() => {
              setAuto(false);
              setStep(i);
            }}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i === step ? "var(--accent)" : i < step ? "var(--line-strong)" : "var(--panel-3)" }}
          />
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-dim">
        Simplified on purpose. On a real PC, drivers and APIs can hide or reduce copies (pinned memory, Resizable BAR, unified virtual addressing),
        and on a Mac the CPU and GPU still have their own caches and must synchronise. The physical difference — one pool vs two pools joined by
        PCIe — is real.
      </p>
    </Panel>
  );
}

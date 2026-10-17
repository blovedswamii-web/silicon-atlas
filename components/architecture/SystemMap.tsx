"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { MAP_EDGES, MAP_LAYERS, MAP_NODES, type MapLayer, type MapMode } from "@/data/system-map";
import { KIND_VAR, Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";

const EDGE_COLOR = { data: "var(--k-memory)", power: "var(--k-power)", software: "var(--k-software)" };
const SPRING = { type: "spring", stiffness: 90, damping: 20 } as const;

const CONTAINERS: Record<MapMode, { id: string; label: string; x: number; y: number; w: number; h: number; color: string }[]> = {
  pc: [
    { id: "c1", label: "CPU package", x: 23.5, y: 2.5, w: 22, h: 32, color: "var(--k-cpu)" },
    { id: "c2", label: "Graphics card", x: 64.5, y: 2.5, w: 20, h: 63, color: "var(--k-gpu)" },
  ],
  apple: [
    { id: "c1", label: "SoC package · CPU, GPU, NPU and memory together", x: 23.5, y: 2.5, w: 41, h: 72, color: "var(--k-accel)" },
    { id: "c2", label: "SoC die", x: 24.2, y: 5, w: 39.6, h: 39.5, color: "var(--k-accel)" },
  ],
};

export function SystemMap() {
  const [mode, setMode] = useState<MapMode>("pc");
  const [layer, setLayer] = useState<MapLayer | "all">("all");
  const [sel, setSel] = useState<string | null>("ram");

  const nodes = MAP_NODES.map((n) => ({ ...n, l: n.layout[mode] }));
  const pos = Object.fromEntries(nodes.map((n) => [n.id, { cx: n.l.x + n.l.w / 2, cy: n.l.y + n.l.h / 2 }]));
  const edges = MAP_EDGES[mode];
  const selNode = nodes.find((n) => n.id === sel && !n.l.hidden);
  const layerInfo = MAP_LAYERS.find((l) => l.id === layer);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Architecture"
          value={mode}
          onChange={setMode}
          options={[
            { value: "pc", label: "Traditional PC" },
            { value: "apple", label: "Apple Silicon" },
          ]}
        />
        <Segmented
          size="sm"
          ariaLabel="Layer"
          value={layer}
          onChange={setLayer}
          options={[{ value: "all", label: "All layers" }, ...MAP_LAYERS.map((l) => ({ value: l.id, label: l.label }))]}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel className="scroll-thin overflow-x-auto">
          <div className="relative aspect-[16/10] min-w-[860px]">
            {/* containers */}
            <AnimatePresence>
              {CONTAINERS[mode].map((c) => (
                <motion.div
                  key={`${mode}-${c.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="absolute rounded-2xl border border-dashed"
                  style={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    width: `${c.w}%`,
                    height: `${c.h}%`,
                    borderColor: `color-mix(in oklab, ${c.color} 40%, var(--line))`,
                    background: `color-mix(in oklab, ${c.color} 4%, transparent)`,
                  }}
                >
                  <span className="absolute -top-2.5 left-3 bg-panel px-1.5 font-mono text-[9.5px] uppercase tracking-wider text-dim">{c.label}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* edges */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {edges.map((e) => {
                  const a = pos[e.a];
                  const b = pos[e.b];
                  const na = nodes.find((n) => n.id === e.a)!;
                  const nb = nodes.find((n) => n.id === e.b)!;
                  const lit = layer === "all" || na.layer === layer || nb.layer === layer;
                  return (
                    <motion.line
                      key={`${mode}-${e.a}-${e.b}`}
                      initial={{ opacity: 0, x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy }}
                      animate={{ opacity: lit ? 0.85 : 0.15, x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy }}
                      transition={SPRING}
                      stroke={EDGE_COLOR[e.type]}
                      strokeWidth={e.type === "data" ? 2 : 1.4}
                      strokeDasharray={e.type === "data" ? undefined : "4 4"}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
            </svg>

            {/* nodes */}
            {nodes.map((n) => {
              const lit = layer === "all" || n.layer === layer;
              const color = KIND_VAR[n.kind];
              return (
                <motion.button
                  key={n.id}
                  onClick={() => setSel(n.id)}
                  disabled={n.l.hidden}
                  aria-label={n.l.label}
                  initial={false}
                  animate={{
                    left: `${n.l.x}%`,
                    top: `${n.l.y}%`,
                    width: `${n.l.w}%`,
                    height: `${n.l.h}%`,
                    opacity: n.l.hidden ? 0 : lit ? 1 : 0.28,
                    scale: n.l.hidden ? 0.6 : 1,
                  }}
                  transition={SPRING}
                  className={clsx(
                    "absolute flex flex-col items-center justify-center overflow-hidden rounded-xl border px-2 text-center",
                    n.l.hidden && "pointer-events-none",
                  )}
                  style={{
                    borderColor: sel === n.id ? color : `color-mix(in oklab, ${color} 45%, var(--line))`,
                    background: `color-mix(in oklab, ${color} ${sel === n.id ? 20 : 10}%, var(--panel-2))`,
                    boxShadow: sel === n.id ? `0 0 0 3px color-mix(in oklab, ${color} 25%, transparent)` : undefined,
                  }}
                >
                  <span className="text-[12.5px] font-semibold leading-tight text-fg">{n.l.label}</span>
                  {n.l.sub && <span className="mt-0.5 font-mono text-[9.5px] leading-tight text-dim">{n.l.sub}</span>}
                </motion.button>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <Kicker>{layerInfo ? `${layerInfo.label} layer` : "Reading the map"}</Kicker>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {layerInfo
                ? layerInfo.text[mode]
                : mode === "pc"
                  ? "A PC is a set of separate chips on separate boards, each with its own memory, joined by buses. Switch to Apple Silicon and watch the GPU, NPU and cache move inside one SoC — and VRAM disappear into unified memory."
                  : "Everything that was a separate part on the PC has moved into, or next to, one SoC. VRAM and its bus are gone — the GPU's memory is now the unified pool. PCIe remains, but only for I/O."}
            </p>
            <div className="mt-4 space-y-1.5 text-[11px] text-dim">
              {(["data", "software", "power"] as const).map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <svg width="22" height="4" aria-hidden>
                    <line x1="0" y1="2" x2="22" y2="2" stroke={EDGE_COLOR[t]} strokeWidth="2" strokeDasharray={t === "data" ? undefined : "4 3"} />
                  </svg>
                  {t === "data" ? "Data path" : t === "software" ? "Software layer" : "Power"}
                </div>
              ))}
            </div>
          </Panel>
          <AnimatePresence mode="wait">
            {selNode && (
              <motion.div key={`${mode}-${selNode.id}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Panel className="p-5">
                  <Kicker color={KIND_VAR[selNode.kind]}>{selNode.layer}</Kicker>
                  <div className="mt-1.5 font-medium text-fg">{selNode.l.label}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{selNode.l.text}</p>
                  {selNode.layout.pc.text !== selNode.layout.apple.text && !selNode.layout[mode === "pc" ? "apple" : "pc"].hidden && (
                    <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-dim">
                      <span className="font-mono uppercase tracking-wider">On {mode === "pc" ? "Apple Silicon" : "a PC"}: </span>
                      {selNode.layout[mode === "pc" ? "apple" : "pc"].text}
                    </p>
                  )}
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { APPLE_HIERARCHY, PC_HIERARCHY, formatNs, humanScale, type LatencyTier } from "@/data/latency";
import { ApproxBadge, KIND_VAR } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { Frame, logPos } from "@/components/cpu/Frame";

const MIN = 0.1;
const MAX = 1e9;
const TICKS = [0.1, 1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9];

type Mode = "pc" | "apple";

function tickLabel(ns: number, human: boolean) {
  if (human) return humanScale(ns);
  return formatNs(ns).replace(".0 ", " ");
}

export function LatencyLadder() {
  const [mode, setMode] = useState<Mode>("pc");
  const [human, setHuman] = useState(false);
  const tiers = mode === "pc" ? PC_HIERARCHY : APPLE_HIERARCHY;
  const [selected, setSelected] = useState("dram");
  const sel: LatencyTier = tiers.find((t) => t.id === selected) ?? tiers[4];

  return (
    <Frame
      kicker="Interactive · log scale"
      title="How long does it take to get data?"
      controls={
        <>
          <Segmented
            size="sm"
            ariaLabel="Platform"
            value={mode}
            onChange={setMode}
            options={[
              { value: "pc", label: "PC + discrete GPU" },
              { value: "apple", label: "Apple Silicon" },
            ]}
          />
          <Segmented
            size="sm"
            ariaLabel="Scale"
            value={human ? "human" : "real"}
            onChange={(v) => setHuman(v === "human")}
            options={[
              { value: "real", label: "Real time" },
              { value: "human", label: "1 cycle = 1 s" },
            ]}
          />
        </>
      }
      footer={
        <>
          Bars show representative ranges, not measurements of any specific product. Each step right on the axis is{" "}
          <strong className="text-muted">ten times</strong> slower. “1 cycle = 1 s” stretches one ~0.25 ns clock tick (4 GHz) into one second so the
          gaps feel human.
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ApproxBadge label="Representative ranges" />
        <span className="text-xs text-dim">Click any row for details.</span>
      </div>

      {/* Axis */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-4 px-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:px-2">
        <div className="hidden sm:block" />
        <div className="relative h-6">
          {TICKS.map((t, i) => (
            <span
              key={t}
              className={clsx(
                "absolute -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-dim",
                i % 2 === 1 && "hidden md:inline",
              )}
              style={{ left: `${logPos(t, MIN, MAX) * 100}%` }}
            >
              {tickLabel(t, human)}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <AnimatePresence initial={false} mode="popLayout">
          {tiers.map((t, i) => {
            const prevBranch = tiers[i - 1]?.branch;
            const startsBranch = t.branch === "gpu" && prevBranch !== "gpu";
            const left = logPos(t.minNs, MIN, MAX) * 100;
            const width = Math.max(0.8, (logPos(t.maxNs, MIN, MAX) - logPos(t.minNs, MIN, MAX)) * 100);
            const color = KIND_VAR[t.kind];
            const active = t.id === selected;
            const mid = Math.sqrt(t.minNs * t.maxNs);
            return (
              <motion.div
                key={`${mode}-${t.id}`}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: i * 0.015 }}
              >
                {startsBranch && (
                  <div className="mb-1 mt-2 flex items-center gap-2 pl-0 font-mono text-[10px] uppercase tracking-wider text-[var(--k-vram)] sm:pl-3">
                    <span className="h-px w-4 bg-[var(--k-vram)]" /> Discrete-GPU branch — a separate memory system reached over PCIe
                  </div>
                )}
                {mode === "apple" && t.id === "dram" && (
                  <div className="mb-1 mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--k-memory)] sm:pl-3">
                    No separate VRAM branch — CPU, GPU and Neural Engine all read this pool
                  </div>
                )}
                <button
                  onClick={() => setSelected(t.id)}
                  className={clsx(
                    "grid w-full grid-cols-[minmax(0,1fr)] items-center gap-x-4 gap-y-1 rounded-lg px-1 py-1.5 text-left transition-colors sm:grid-cols-[11rem_minmax(0,1fr)] sm:px-2",
                    active ? "bg-panel-3" : "hover:bg-panel-2",
                    t.branch === "gpu" && "sm:border-l-2 sm:border-[color-mix(in_oklab,var(--k-vram)_40%,transparent)]",
                  )}
                >
                  <div className="flex min-w-0 items-baseline gap-2 sm:block">
                    <div className="truncate text-sm font-medium text-fg">{t.label}</div>
                    <div className="truncate text-[11px] text-dim">{t.sub}</div>
                  </div>
                  <div className="relative h-6">
                    <div className="absolute inset-y-[11px] left-0 right-0 bg-line" style={{ height: 1 }} />
                    <motion.div
                      layout
                      className="absolute top-1 h-4 rounded-full"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: `color-mix(in oklab, ${color} ${active ? 85 : 55}%, transparent)`,
                        boxShadow: active ? `0 0 0 1px ${color}` : undefined,
                      }}
                    />
                    <span
                      className="absolute top-0.5 whitespace-nowrap pl-2 font-mono text-[11px] tabular-nums text-muted"
                      style={left + width > 72 ? { right: `${100 - left + 1}%`, textAlign: "right" } : { left: `${left + width}%` }}
                    >
                      {human ? humanScale(mid) : `${formatNs(t.minNs)} – ${formatNs(t.maxNs)}`}
                    </span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${mode}-${sel.id}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="mt-4 grid gap-3 rounded-xl border border-line bg-panel-2 p-4 sm:grid-cols-[1fr_auto]"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: KIND_VAR[sel.kind] }} />
              <span className="text-sm font-semibold text-fg">{sel.label}</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{sel.note}</p>
            <p className="mt-1.5 text-xs text-dim">Typical capacity: {sel.capacity}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:w-64 sm:grid-cols-1">
            <div className="rounded-lg border border-line bg-panel px-3 py-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-dim">Real time</div>
              <div className="font-mono text-sm text-fg">
                {formatNs(sel.minNs)} – {formatNs(sel.maxNs)}
              </div>
            </div>
            <div className="rounded-lg border border-line bg-panel px-3 py-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-dim">If 1 cycle took 1 s</div>
              <div className="font-mono text-sm text-fg">
                {humanScale(sel.minNs)} – {humanScale(sel.maxNs)}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

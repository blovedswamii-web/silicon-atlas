"use client";

import { useState } from "react";
import { ApproxBadge, Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";

interface Inflator {
  id: string;
  label: string;
  factor: number;
  explain: string;
}

const INFLATORS: Inflator[] = [
  { id: "boost", label: "Use peak boost clock", factor: 2.6 / 2.2, explain: "Spec sheets use the highest boost clock. Sustained clocks under heavy load, heat or laptop power limits can be lower." },
  { id: "dual", label: "Count dual-issue", factor: 2, explain: "Some architectures can issue two FP32 operations per lane per clock — but only when the compiler finds pairs of independent instructions." },
  { id: "matrix", label: "Quote matrix units (FP16)", factor: 4, explain: "Tensor/matrix units deliver many more operations per clock than shader lanes, but only for matrix multiplication." },
  { id: "fp8", label: "…at FP8", factor: 2, explain: "Halving the precision roughly doubles matrix throughput on hardware that supports it." },
  { id: "fp4", label: "…at FP4", factor: 2, explain: "Newest hardware quotes FP4. Useful for quantised inference — irrelevant for FP32 graphics." },
  { id: "sparse", label: "Assume 2:4 sparsity", factor: 2, explain: "If half of the weights are zero in a specific pattern, hardware can skip them. Most models are not trained this way." },
];

const WORKLOADS = [
  { id: "matmul", label: "Big, well-tuned matrix multiply", util: 0.7, why: "Large dense matmuls with optimised libraries can keep matrix units busy most of the time." },
  { id: "decode", label: "LLM token generation (batch 1)", util: 0.03, why: "Each token must stream all weights from memory; compute units mostly wait on memory bandwidth." },
  { id: "game", label: "Game frame", util: 0.35, why: "A frame mixes many shaders, fixed-function work and synchronisation; utilisation varies widely by game and resolution." },
];

export function TflopsReality() {
  const [lanes, setLanes] = useState(8192);
  const [on, setOn] = useState<Record<string, boolean>>({ boost: true });
  const [wl, setWl] = useState("matmul");

  const sustained = 2.2;
  const base = (lanes * 2 * sustained) / 1000; // TFLOPS, FP32 FMA = 2 ops
  let headline = base;
  const applied: { label: string; value: number }[] = [{ label: "FP32 lanes × 2 (FMA) × sustained clock", value: base }];
  for (const inf of INFLATORS) {
    const enabled = on[inf.id] && (inf.id !== "fp4" || on.fp8) && (!["fp8", "fp4", "sparse"].includes(inf.id) || on.matrix);
    if (enabled) {
      headline *= inf.factor;
      applied.push({ label: inf.label, value: headline });
    }
  }
  const w = WORKLOADS.find((x) => x.id === wl)!;
  // The realistic figure is relative to the dense, non-sparse number for the relevant unit.
  const denseRelevant = headline / (on.sparse && on.matrix ? 2 : 1);
  const realistic = denseRelevant * w.util;
  const max = Math.max(headline, 1);

  return (
    <Panel className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>Build a marketing number</Kicker>
        <ApproxBadge label="Illustrative multipliers, not a product" />
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        Peak TFLOPS = lanes × operations per lane per clock × clock speed. A fused multiply-add counts as two operations. Start from an
        imaginary GPU and switch on the assumptions that spec sheets commonly use.
      </p>

      <label className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
        FP32 lanes
        <input type="range" min={1024} max={20480} step={256} value={lanes} onChange={(e) => setLanes(+e.target.value)} className="w-48 accent-[var(--accent)]" />
        <span className="font-mono text-fg">{lanes.toLocaleString()}</span>
        <span className="text-dim">@ {sustained} GHz sustained</span>
      </label>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {INFLATORS.map((inf) => {
          const disabled = (["fp8", "fp4", "sparse"].includes(inf.id) && !on.matrix) || (inf.id === "fp4" && !on.fp8);
          return (
            <label
              key={inf.id}
              className={`flex cursor-pointer gap-2 rounded-lg border border-line p-2.5 text-xs leading-snug ${disabled ? "opacity-40" : "hover:border-line-strong"}`}
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={!!on[inf.id]}
                onChange={(e) => setOn((s) => ({ ...s, [inf.id]: e.target.checked }))}
                className="mt-0.5 accent-[var(--accent)]"
              />
              <span>
                <span className="font-medium text-fg">
                  {inf.label} <span className="font-mono text-dim">×{inf.factor.toFixed(inf.factor % 1 ? 2 : 0)}</span>
                </span>
                <span className="mt-0.5 block text-dim">{inf.explain}</span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-fg">Headline number</span>
            <span className="font-mono text-fg">{headline.toFixed(0)} {on.matrix ? "TOPS/TFLOPS" : "TFLOPS"}</span>
          </div>
          <div className="relative h-4 overflow-hidden rounded-md bg-panel-3">
            {applied.map((a, i) => (
              <div
                key={a.label}
                className="absolute inset-y-0 left-0 rounded-md transition-[width] duration-500"
                style={{ width: `${(a.value / max) * 100}%`, background: `color-mix(in oklab, var(--accent) ${30 + (i / applied.length) * 50}%, transparent)` }}
                title={a.label}
              />
            )).reverse()}
          </div>
          <div className="mt-1 text-[11px] text-dim">{applied.map((a) => a.label).join(" → ")}</div>
        </div>

        <div className="rounded-xl border border-line bg-panel-2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-fg">What a workload might actually sustain</span>
            <Segmented size="sm" ariaLabel="Workload" value={wl} onChange={setWl} options={WORKLOADS.map((x) => ({ value: x.id, label: x.label }))} />
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-md bg-panel-3">
            <div className="h-full rounded-md transition-[width] duration-500" style={{ width: `${(realistic / max) * 100}%`, background: "var(--good)" }} />
          </div>
          <div className="mt-1 flex justify-between text-xs">
            <span className="text-dim">{w.why}</span>
            <span className="shrink-0 pl-3 font-mono text-fg">≈ {realistic < 10 ? realistic.toFixed(1) : realistic.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Note title="TFLOPS vs TOPS">
          TFLOPS counts floating-point operations; TOPS usually counts integer (INT8, sometimes INT4) operations. NPU figures are almost always TOPS.
        </Note>
        <Note title="Always ask">
          Which precision? Dense or sparse? Which unit (shaders, matrix units, NPU, or all of them added together)? At what clock and power?
        </Note>
        <Note title="Why it still isn't enough">
          Peak compute ignores memory bandwidth, capacity, cache, software support and how well a program uses the hardware.
        </Note>
      </div>
    </Panel>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="text-xs font-semibold text-fg">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted">{children}</p>
    </div>
  );
}

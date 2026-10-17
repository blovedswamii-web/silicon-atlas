"use client";

import { useEffect, useMemo, useState } from "react";
import { ApproxBadge, Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";

const S = 8; // 8×8 matrices → 512 multiply-adds
const CELL = 18;
const GRID = S * CELL;

type Mac = [number, number, number]; // i, j, k

function scalarSteps(): Mac[][] {
  const all: Mac[] = [];
  for (let k = 0; k < S; k++) for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) all.push([i, j, k]);
  const steps: Mac[][] = [];
  for (let s = 0; s < all.length; s += 32) steps.push(all.slice(s, s + 32));
  return steps;
}

function tileSteps(): Mac[][] {
  const ops: Mac[][] = [];
  for (let kc = 0; kc < 2; kc++)
    for (let ti = 0; ti < 2; ti++)
      for (let tj = 0; tj < 2; tj++) {
        const op: Mac[] = [];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) op.push([ti * 4 + i, tj * 4 + j, kc * 4 + k]);
        ops.push(op);
      }
  const steps: Mac[][] = [];
  for (let s = 0; s < ops.length; s += 2) steps.push([...ops[s], ...ops[s + 1]]);
  return steps;
}

function Grid({
  x,
  y,
  label,
  color,
  active,
  fill,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
  active: Set<string>;
  fill?: (r: number, c: number) => number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <text x={0} y={-8} className="diagram-mono" fontSize={11}>
        {label}
      </text>
      {Array.from({ length: S * S }, (_, n) => {
        const r = Math.floor(n / S),
          c = n % S;
        const on = active.has(`${r},${c}`);
        const f = fill ? fill(r, c) : 0;
        return (
          <rect
            key={n}
            x={c * CELL + 1}
            y={r * CELL + 1}
            width={CELL - 2}
            height={CELL - 2}
            rx={2.5}
            fill={on ? color : f > 0 ? color : "var(--panel-3)"}
            fillOpacity={on ? 0.95 : f > 0 ? 0.12 + f * 0.5 : 1}
            stroke={on ? color : "var(--line)"}
            strokeWidth={0.8}
          />
        );
      })}
    </g>
  );
}

export function MatrixTiles() {
  const [mode, setMode] = useState<"scalar" | "tile">("scalar");
  const [step, setStep] = useState(0);
  const steps = useMemo(() => (mode === "scalar" ? scalarSteps() : tileSteps()), [mode]);

  useEffect(() => setStep(0), [mode]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((s) => (s >= steps.length + 1 ? 0 : s + 1)), mode === "scalar" ? 450 : 1100);
    return () => clearInterval(id);
  }, [steps.length, mode]);

  const cur = steps[step] ?? [];
  const aOn = new Set(cur.map(([i, , k]) => `${i},${k}`));
  const bOn = new Set(cur.map(([, j, k]) => `${k},${j}`));
  const cOn = new Set(cur.map(([i, j]) => `${i},${j}`));
  const acc = useMemo(() => {
    const a = Array.from({ length: S }, () => new Array(S).fill(0));
    for (let s = 0; s < Math.min(step + 1, steps.length); s++) for (const [i, j] of steps[s]) a[i][j]++;
    return a;
  }, [step, steps]);
  const done = Math.min(step + 1, steps.length);
  const macsPerStep = steps[0]?.length ?? 0;

  return (
    <Panel className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>Matrix multiplication: the heart of AI</Kicker>
        <Segmented
          size="sm"
          ariaLabel="Execution style"
          value={mode}
          onChange={setMode}
          options={[
            { value: "scalar", label: "32 shader lanes" },
            { value: "tile", label: "2 matrix units (4×4×4 tiles)" },
          ]}
        />
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        C = A × B needs {S * S * S} multiply-adds for two {S}×{S} matrices. Neural networks are mostly enormous versions of this. Shader lanes
        each do one multiply-add at a time; matrix units (Tensor Cores, XMX, AI/Matrix accelerators, neural accelerators) consume whole tiles per
        instruction and reuse each loaded value many times.
      </p>

      <div className="scroll-thin mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${GRID * 3 + 90} ${GRID + 30}`} className="w-full min-w-[480px] max-w-3xl" role="img" aria-label="Matrix multiplication animation">
          <Grid x={0} y={22} label="A" color="var(--k-cpu)" active={aOn} />
          <text x={GRID + 14} y={22 + GRID / 2 + 5} className="diagram-text" fontSize={18}>
            ×
          </text>
          <Grid x={GRID + 45} y={22} label="B" color="var(--k-accel)" active={bOn} />
          <text x={GRID * 2 + 59} y={22 + GRID / 2 + 5} className="diagram-text" fontSize={18}>
            =
          </text>
          <Grid x={GRID * 2 + 90} y={22} label="C (accumulating)" color="var(--k-gpu)" active={cOn} fill={(r, c) => acc[r][c] / S} />
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Readout label="Multiply-adds per step" value={macsPerStep.toString()} />
        <Readout label="Steps" value={`${done} / ${steps.length}`} />
        <Readout label="Each loaded A value reused" value={mode === "scalar" ? "1× per step" : "4× per step"} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <ApproxBadge label="Illustrative unit sizes" />
        <span className="text-xs text-dim">Real matrix units differ in tile shape, precision and count per vendor and generation.</span>
      </div>
    </Panel>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel-2 p-3">
      <div className="text-[11px] text-dim">{label}</div>
      <div className="mt-1 font-mono text-base tabular-nums text-fg">{value}</div>
    </div>
  );
}

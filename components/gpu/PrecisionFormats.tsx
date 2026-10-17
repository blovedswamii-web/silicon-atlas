"use client";

import { useMemo, useState } from "react";
import { PRECISION_FORMATS, type PrecisionFormat } from "@/data/gpu-architectures";
import { Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";

/** Round x to the nearest value representable in a small float format (round-to-nearest, saturating). */
function roundFloat(x: number, f: PrecisionFormat): number {
  if (x === 0) return 0;
  const sign = Math.sign(x);
  const ax = Math.abs(x);
  if (ax >= f.maxFinite) return sign * f.maxFinite;
  const bias = 2 ** (f.exponent - 1) - 1;
  const minExp = 1 - bias;
  const e = Math.max(Math.floor(Math.log2(ax)), minExp);
  const step = 2 ** (e - f.mantissa);
  return sign * Math.min(f.maxFinite, Math.round(ax / step) * step);
}

function roundInt8(x: number, range: number) {
  const scale = range / 127;
  const q = Math.max(-127, Math.min(127, Math.round(x / scale)));
  return { q, value: q * scale };
}

const SAMPLES = [
  { id: "pi", label: "π", value: Math.PI },
  { id: "tenth", label: "0.1", value: 0.1 },
  { id: "weight", label: "0.0137 (a typical weight)", value: 0.0137 },
  { id: "big", label: "70,000", value: 70000 },
];

function fmt(v: number) {
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-4) return v.toExponential(4);
  return Number(v.toPrecision(8)).toString();
}

export function PrecisionFormats() {
  const [sample, setSample] = useState("pi");
  const [range, setRange] = useState(4);
  const x = SAMPLES.find((s) => s.id === sample)!.value;

  const rows = useMemo(
    () =>
      PRECISION_FORMATS.map((f) => {
        if (f.integer) {
          const r = roundInt8(x, range);
          const clipped = Math.abs(x) > range;
          return { f, value: r.value, note: clipped ? `clipped to ±${range} by the scale` : `stored as ${r.q} × scale` };
        }
        const v = roundFloat(x, f);
        const sat = Math.abs(x) >= f.maxFinite;
        return { f, value: v, note: sat ? `exceeds max ${f.maxFinite.toLocaleString()} — overflow/saturate` : "" };
      }),
    [x, range],
  );

  return (
    <Panel className="p-4 sm:p-6">
      <Kicker>Number formats · bits per value</Kicker>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        Fewer bits per number means less memory, less bandwidth and more operations per second — at the cost of range and precision.
        Pick a value and see what each format can actually store.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Segmented size="sm" ariaLabel="Value" value={sample} onChange={setSample} options={SAMPLES.map((s) => ({ value: s.id, label: s.label }))} />
        <label className="flex items-center gap-2 text-xs text-dim">
          INT8 scale covers ±
          <input type="range" min={0.05} max={8} step={0.05} value={range} onChange={(e) => setRange(+e.target.value)} className="w-28 accent-[var(--accent)]" />
          <span className="w-10 font-mono text-muted">{range.toFixed(2)}</span>
        </label>
      </div>

      <div className="mt-5 space-y-3">
        {rows.map(({ f, value, note }) => {
          const total = f.sign + f.exponent + f.mantissa;
          const err = x === 0 ? 0 : Math.abs((value - x) / x);
          return (
            <div key={f.id} className="grid items-center gap-2 sm:grid-cols-[110px_minmax(0,1fr)_200px] sm:gap-4">
              <div>
                <div className="text-sm font-medium text-fg">{f.name}</div>
                <div className="font-mono text-[11px] text-dim">
                  {total} bits · {f.bytes} B
                </div>
              </div>
              <div className="flex h-6 overflow-hidden rounded-md border border-line" style={{ width: `${Math.max(14, (total / 32) * 100)}%` }}>
                <Seg n={f.sign} color="var(--bad)" label="sign" total={total} />
                {!f.integer && <Seg n={f.exponent} color="var(--k-accel)" label="exponent" total={total} />}
                <Seg n={f.mantissa} color="var(--k-cpu)" label={f.integer ? "value" : "mantissa"} total={total} />
              </div>
              <div className="text-right sm:text-left">
                <div className="font-mono text-sm tabular-nums text-fg">{fmt(value)}</div>
                <div className="text-[11px] text-dim">{note || (err < 1e-7 ? "≈ exact" : `error ${(err * 100).toPrecision(2)}%`)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-dim">
        <Legend color="var(--bad)" label="sign" />
        <Legend color="var(--k-accel)" label="exponent → range" />
        <Legend color="var(--k-cpu)" label="mantissa → precision" />
      </div>

      <div className="scroll-thin mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left font-mono text-[10.5px] uppercase tracking-wider text-dim">
              <th className="py-2 pr-3 font-normal">Format</th>
              <th className="py-2 pr-3 font-normal">1B parameters need</th>
              <th className="py-2 pr-3 font-normal">Typical use</th>
            </tr>
          </thead>
          <tbody>
            {PRECISION_FORMATS.map((f) => (
              <tr key={f.id} className="border-t border-line align-top">
                <td className="py-2 pr-3 text-fg">{f.name}</td>
                <td className="py-2 pr-3 font-mono text-muted">{f.bytes} GB</td>
                <td className="py-2 pr-3 text-muted">
                  {f.usedFor}
                  <div className="text-xs text-dim">{f.note}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Seg({ n, color, label, total }: { n: number; color: string; label: string; total: number }) {
  return (
    <div
      title={`${n} ${label} bit${n > 1 ? "s" : ""}`}
      className="flex items-center justify-center overflow-hidden border-r border-[var(--bg)] font-mono text-[10px] last:border-r-0"
      style={{ width: `${(n / total) * 100}%`, background: `color-mix(in oklab, ${color} 55%, transparent)`, color: "var(--fg)" }}
    >
      {n}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-3 rounded-sm" style={{ background: `color-mix(in oklab, ${color} 55%, transparent)` }} />
      {label}
    </span>
  );
}

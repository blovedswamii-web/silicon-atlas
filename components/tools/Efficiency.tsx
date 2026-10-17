"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ApproxBadge, Badge, Kicker, Panel, Stat } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { Slider } from "./controls";
import { SAME_NAME_PAIRS } from "./efficiencyData";

// ---------------------------------------------------------------------------
// Illustrative voltage–frequency–power model (one hypothetical chip)
// ---------------------------------------------------------------------------
const F_MIN = 1.0;
const F_MAX = 5.8;
const volt = (f: number) => 0.65 + 0.03 * (f - 1) + 0.022 * (f - 1) ** 2;
const power = (f: number) => 7.2 * volt(f) ** 2 * f + 3; // watts, illustrative
/** Performance relative to max clock. Memory-bound work saturates: extra clock spends more time waiting. */
const perf = (f: number, memBound: boolean) => {
  if (!memBound) return f / F_MAX;
  const g = (x: number) => x / (1 + 0.35 * x);
  return g(f) / g(F_MAX);
};
/** Clock the chip can run at a given power budget. */
const freqAtPower = (p: number) => {
  let lo = F_MIN, hi = F_MAX;
  if (power(lo) >= p) return lo;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (power(mid) > p) hi = mid; else lo = mid;
  }
  return lo;
};

export function PowerCurve() {
  const [f, setF] = useState(3.2);
  const [mem, setMem] = useState(false);
  const W = 560, H = 300, pad = { l: 46, r: 16, t: 16, b: 38 };
  const pMax = power(F_MAX);
  const x = (p: number) => pad.l + (p / (pMax * 1.05)) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - v * (H - pad.t - pad.b);

  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let ff = F_MIN; ff <= F_MAX + 1e-9; ff += 0.05) pts.push(`${x(power(ff)).toFixed(1)},${y(perf(ff, mem)).toFixed(1)}`);
    return "M" + pts.join(" L");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mem]);

  const p = power(f);
  const pf = perf(f, mem);
  const eff = pf / p;
  const effMax = perf(F_MAX, mem) / power(F_MAX);

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>Performance vs power — one chip, many operating points</Kicker>
        <ApproxBadge label="Illustrative model" />
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Performance versus power curve">
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <g key={v}>
                <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
                <text x={pad.l - 8} y={y(v) + 3} textAnchor="end" className="diagram-mono" fontSize={10}>{Math.round(v * 100)}%</text>
              </g>
            ))}
            {[0, 20, 40, 60, 80].map((w) => (
              <text key={w} x={x(w)} y={H - pad.b + 16} textAnchor="middle" className="diagram-mono" fontSize={10}>{w} W</text>
            ))}
            <text x={(W + pad.l) / 2} y={H - 4} textAnchor="middle" className="diagram-mono" fontSize={10}>power drawn →</text>
            {/* zones */}
            <rect x={x(power(2.2))} y={pad.t} width={x(power(3.6)) - x(power(2.2))} height={H - pad.t - pad.b} fill="var(--good)" opacity={0.06} />
            <text x={(x(power(2.2)) + x(power(3.6))) / 2} y={pad.t + 14} textAnchor="middle" fontSize={10} fill="var(--good)">efficient zone</text>
            <rect x={x(power(5.0))} y={pad.t} width={x(pMax) - x(power(5.0))} height={H - pad.t - pad.b} fill="var(--bad)" opacity={0.06} />
            <text x={(x(power(5.0)) + x(pMax)) / 2} y={pad.t + 14} textAnchor="middle" fontSize={10} fill="var(--bad)">max boost</text>
            <path d={curve} fill="none" stroke="var(--k-cpu)" strokeWidth={2.5} />
            <line x1={x(p)} x2={x(p)} y1={y(0)} y2={y(pf)} stroke="var(--fg-dim)" strokeDasharray="3 4" />
            <line x1={pad.l} x2={x(p)} y1={y(pf)} y2={y(pf)} stroke="var(--fg-dim)" strokeDasharray="3 4" />
            <motion.circle cx={x(p)} cy={y(pf)} r={7} fill="var(--k-cpu)" stroke="var(--bg)" strokeWidth={2} initial={false} animate={{ cx: x(p), cy: y(pf) }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
          </svg>
        </div>
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm"><span className="text-muted">Clock speed</span><span className="font-mono text-fg">{f.toFixed(1)} GHz</span></div>
            <Slider ariaLabel="Clock speed" min={F_MIN} max={F_MAX} step={0.1} value={f} onChange={setF} />
          </div>
          <Segmented size="sm" value={mem ? "mem" : "compute"} onChange={(v) => setMem(v === "mem")} options={[
            { value: "compute", label: "Compute-bound work" },
            { value: "mem", label: "Memory-bound work" },
          ]} />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Voltage" value={`${volt(f).toFixed(2)} V`} />
            <Stat label="Power" value={`${p.toFixed(0)} W`} hint={`${Math.round((p / pMax) * 100)}% of max`} />
            <Stat label="Performance" value={`${Math.round(pf * 100)}%`} hint="of max-clock speed" />
            <Stat label="Perf per watt" value={`${(eff / effMax).toFixed(1)}×`} hint="vs running at max boost" />
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Power grows roughly with <span className="font-mono text-fg">voltage² × frequency</span>, and higher clocks need higher voltage. The last
            ~20% of performance can cost about half the power. That’s why the same silicon looks far more efficient in a laptop
            running in the green zone than in a desktop pushed to the red one.
          </p>
        </div>
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Thermal throttling simulation
// ---------------------------------------------------------------------------
const T_AMB = 30;
const T_MAX = 100;
const SIM_SECONDS = 120;

function simulate(coolingW: number) {
  const pBoost = power(F_MAX);
  const G = coolingW / (T_MAX - T_AMB); // W per °C the cooler removes at T_MAX
  const C = 30; // thermal mass, J/°C (illustrative; heatsink + chip)
  let T = 45;
  const out: { t: number; T: number; f: number }[] = [];
  for (let t = 0; t <= SIM_SECONDS; t += 0.5) {
    let f = F_MAX;
    let P = pBoost;
    if (T >= T_MAX - 0.5) {
      P = Math.min(pBoost, (T_MAX - T_AMB) * G);
      f = freqAtPower(P);
    }
    T += ((P - (T - T_AMB) * G) / C) * 0.5;
    T = Math.min(T, T_MAX);
    out.push({ t, T, f });
  }
  return out;
}

const COOLERS = [
  { w: 18, label: "Fanless / very thin" },
  { w: 35, label: "Thin laptop" },
  { w: 55, label: "Thick laptop" },
  { w: 90, label: "Desktop tower cooler" },
];

export function ThermalSim() {
  const [cool, setCool] = useState(35);
  const [t, setT] = useState(SIM_SECONDS);
  const reduce = useReducedMotion();
  const raf = useRef<number | null>(null);
  const data = useMemo(() => simulate(cool), [cool]);

  const play = () => {
    if (reduce) { setT(SIM_SECONDS); return; }
    const start = performance.now();
    const step = (now: number) => {
      const el = ((now - start) / 4000) * SIM_SECONDS;
      setT(Math.min(SIM_SECONDS, el));
      if (el < SIM_SECONDS) raf.current = requestAnimationFrame(step);
    };
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  useEffect(() => { play(); /* replay when cooling changes */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cool]);

  const W = 560, H = 220, pad = { l: 40, r: 40, t: 14, b: 30 };
  const x = (s: number) => pad.l + (s / SIM_SECONDS) * (W - pad.l - pad.r);
  const yF = (f: number) => H - pad.b - ((f - F_MIN) / (F_MAX - F_MIN)) * (H - pad.t - pad.b);
  const yT = (temp: number) => H - pad.b - ((temp - T_AMB) / (T_MAX + 5 - T_AMB)) * (H - pad.t - pad.b);
  const visible = data.filter((d) => d.t <= t);
  if (visible.length === 0) visible.push(data[0]);
  const pathF = "M" + visible.map((d) => `${x(d.t).toFixed(1)},${yF(d.f).toFixed(1)}`).join(" L");
  const pathT = "M" + visible.map((d) => `${x(d.t).toFixed(1)},${yT(d.T).toFixed(1)}`).join(" L");
  const last = data[data.length - 1];
  const throttleAt = data.find((d) => d.f < F_MAX - 0.01)?.t;

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>Thermal throttling — same chip, different coolers</Kicker>
        <ApproxBadge label="Illustrative model" />
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Clock speed and temperature over time">
            <line x1={pad.l} x2={W - pad.r} y1={yT(T_MAX)} y2={yT(T_MAX)} stroke="var(--bad)" strokeDasharray="4 4" opacity={0.6} />
            <text x={W - pad.r + 4} y={yT(T_MAX) + 3} fontSize={10} fill="var(--bad)">{T_MAX}°C</text>
            {[F_MIN, 3, F_MAX].map((f) => (
              <text key={f} x={pad.l - 6} y={yF(f) + 3} textAnchor="end" className="diagram-mono" fontSize={10}>{f.toFixed(1)}</text>
            ))}
            {[0, 30, 60, 90, 120].map((s) => (
              <text key={s} x={x(s)} y={H - pad.b + 16} textAnchor="middle" className="diagram-mono" fontSize={10}>{s}s</text>
            ))}
            <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="var(--line-strong)" />
            <path d={pathT} fill="none" stroke="var(--k-power)" strokeWidth={2} opacity={0.8} />
            <path d={pathF} fill="none" stroke="var(--k-cpu)" strokeWidth={2.5} />
          </svg>
          <div className="mt-2 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-k-cpu" /> Clock (GHz)</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-k-power" /> Temperature</span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm"><span className="text-muted">Cooling capacity</span><span className="font-mono text-fg">{cool} W</span></div>
            <Slider ariaLabel="Cooling capacity" min={12} max={100} value={cool} onChange={setCool} />
            <div className="mt-2 flex flex-wrap gap-1">
              {COOLERS.map((c) => (
                <button key={c.w} onClick={() => setCool(c.w)} className={clsx("rounded-full border px-2.5 py-1 text-xs", cool === c.w ? "border-line-strong bg-panel-3 text-fg" : "border-line text-muted hover:text-fg")}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Sustained clock" value={`${last.f.toFixed(1)} GHz`} hint={`${Math.round((perf(last.f, false)) * 100)}% of peak speed`} />
            <Stat label="Hits 100°C after" value={throttleAt !== undefined ? `${throttleAt.toFixed(0)} s` : "never"} />
          </div>
          <button onClick={play} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-fg">Replay ▶</button>
          <p className="text-sm leading-relaxed text-muted">
            The chip boosts to full speed while the heatsink soaks up heat. Once it reaches its temperature limit, it can only draw as
            much power as the cooler removes — and clocks settle there. Peak benchmarks on a cold machine hide this; long renders and
            exports reveal it.
          </p>
        </div>
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Same name, different machine
// ---------------------------------------------------------------------------
export function LaptopVsDesktop() {
  const [id, setId] = useState(SAME_NAME_PAIRS[0].id);
  const pair = SAME_NAME_PAIRS.find((p) => p.id === id)!;
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>Same name, different machine</Kicker>
        <Segmented size="sm" value={id} onChange={setId} options={SAME_NAME_PAIRS.map((p) => ({ value: p.id, label: p.tab }))} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-fg">{pair.title}</h3>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">{pair.intro}</p>
      <div className="mt-5 overflow-x-auto scroll-thin">
        <div className="min-w-[520px] overflow-hidden rounded-xl border border-line">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-line bg-panel-2 text-xs">
            <div className="px-4 py-2.5 font-mono uppercase tracking-[0.12em] text-dim">Property</div>
            <div className="px-4 py-2.5 font-medium text-fg">{pair.a}</div>
            <div className="px-4 py-2.5 font-medium text-fg">{pair.b}</div>
          </div>
          {pair.rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-line text-sm last:border-b-0">
              <div className="px-4 py-3 text-muted">{r.label}</div>
              {[r.a, r.b].map((v, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="text-fg">{v.text}</div>
                  {v.rel !== undefined && (
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-panel-3">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: i === 0 ? "var(--k-gpu)" : "var(--k-cpu)" }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${v.rel * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{pair.takeaway}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-dim">
        {pair.representative ? <ApproxBadge label="Representative ranges — check the specific model" /> : <Badge>Manufacturer specs · compiled, verify at source</Badge>}
        {pair.sources.map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            {s.label} ↗
          </a>
        ))}
      </div>
    </Panel>
  );
}

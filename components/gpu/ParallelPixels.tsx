"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CompanyId } from "@/data/schema";
import { GPU_ORGS } from "@/data/gpu-architectures";
import { ApproxBadge, COMPANY_VAR, Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { Rich } from "@/components/ui/Rich";

const N = 100; // 100 × 100 = 10,000 pixels
const GPU_UNITS = 16; // same conceptual size for every vendor
const LANES_PER_UNIT = 64;
const CPU_CORES = 8;
const CPU_SIMD = 8; // e.g. one 256-bit FP32 vector per step
const CPU_STEP = 0.5; // CPU clocks ~2× higher than GPU → each step is half a tick
const TICK_MS = 140;

// ---------------------------------------------------------------------------
// The "image" being shaded: a lit sphere on a gradient. Inside the sphere is
// branch A of the shader, outside is branch B — used to show divergence.
// ---------------------------------------------------------------------------
const CX = 50,
  CY = 48,
  R = 31;

function inSphere(x: number, y: number) {
  return (x - CX) ** 2 + (y - CY) ** 2 <= R * R;
}

function shade(x: number, y: number): [number, number, number] {
  if (inSphere(x, y)) {
    const nx = (x - CX) / R,
      ny = (y - CY) / R;
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const l = Math.max(0, -0.5 * nx - 0.6 * ny + 0.62 * nz);
    const spec = Math.pow(Math.max(0, l), 24);
    return [40 + 150 * l + 80 * spec, 120 + 110 * l + 60 * spec, 210 + 40 * l + 5 * spec].map((v) => Math.min(255, v)) as [
      number,
      number,
      number,
    ];
  }
  const t = y / N;
  return [18 + 50 * t, 22 + 30 * t, 38 + 40 * (1 - t)];
}

function hsl(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

// ---------------------------------------------------------------------------
// Schedules: for every pixel, when it starts, when it finishes, and which worker ran it.
// ---------------------------------------------------------------------------
interface Schedule {
  start: Float32Array;
  end: Float32Array;
  worker: Uint8Array;
  makespan: number;
  utilization: number; // useful lane-ticks ÷ capacity
  divergent: number;
  groups: number;
}

function groupShape(size: number): [number, number] {
  return ({ 8: [4, 2], 16: [4, 4], 32: [8, 4], 64: [8, 8] } as Record<number, [number, number]>)[size] ?? [8, 4];
}

function gpuSchedule(groupSize: number, tiled: boolean, divergence: boolean): Schedule {
  const [gw, gh] = groupShape(groupSize);
  const groups: { px: number[]; cost: number; divergent: boolean }[] = [];
  const pushGroups = (x0: number, y0: number, x1: number, y1: number) => {
    for (let gy = y0; gy < y1; gy += gh)
      for (let gx = x0; gx < x1; gx += gw) {
        const px: number[] = [];
        let a = 0;
        for (let y = gy; y < Math.min(gy + gh, y1); y++)
          for (let x = gx; x < Math.min(gx + gw, x1); x++) {
            px.push(y * N + x);
            if (inSphere(x, y)) a++;
          }
        const div = divergence && a > 0 && a < px.length;
        groups.push({ px, cost: div ? 2 : 1, divergent: div });
      }
  };
  if (tiled) {
    const T = 20;
    for (let ty = 0; ty < N; ty += T) for (let tx = 0; tx < N; tx += T) pushGroups(tx, ty, tx + T, ty + T);
  } else pushGroups(0, 0, N, N);

  const slotsPerUnit = LANES_PER_UNIT / groupSize;
  const slots = Array.from({ length: GPU_UNITS * slotsPerUnit }, (_, i) => ({ free: 0, unit: i % GPU_UNITS }));
  const start = new Float32Array(N * N),
    end = new Float32Array(N * N),
    worker = new Uint8Array(N * N);
  let makespan = 0;
  for (const g of groups) {
    let best = slots[0];
    for (const s of slots) if (s.free < best.free) best = s;
    const st = best.free,
      en = st + g.cost;
    best.free = en;
    makespan = Math.max(makespan, en);
    for (const p of g.px) {
      start[p] = st;
      end[p] = en;
      worker[p] = best.unit;
    }
  }
  const capacity = GPU_UNITS * LANES_PER_UNIT * makespan;
  return {
    start,
    end,
    worker,
    makespan,
    utilization: (N * N) / capacity,
    divergent: groups.filter((g) => g.divergent).length,
    groups: groups.length,
  };
}

function cpuSchedule(): Schedule {
  const start = new Float32Array(N * N),
    end = new Float32Array(N * N),
    worker = new Uint8Array(N * N);
  const rowsPer = N / CPU_CORES;
  let makespan = 0;
  for (let c = 0; c < CPU_CORES; c++) {
    let step = 0;
    for (let y = Math.round(c * rowsPer); y < Math.round((c + 1) * rowsPer); y++)
      for (let x = 0; x < N; x += CPU_SIMD) {
        for (let k = x; k < Math.min(x + CPU_SIMD, N); k++) {
          const p = y * N + k;
          start[p] = step * CPU_STEP;
          end[p] = (step + 1) * CPU_STEP;
          worker[p] = c;
        }
        step++;
      }
    makespan = Math.max(makespan, step * CPU_STEP);
  }
  return { start, end, worker, makespan, utilization: 1, divergent: 0, groups: 0 };
}

// ---------------------------------------------------------------------------

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
  }, []);
  return r;
}

function PixelCanvas({ schedule, t, workers, label }: { schedule: Schedule; t: number; workers: number; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const image = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) arr.push(shade(x, y));
    return arr;
  }, []);
  const palette = useMemo(() => Array.from({ length: workers }, (_, i) => hsl((i * 360) / workers + 10, 80, 62)), [workers]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const light = document.documentElement.dataset.theme === "light";
    const pending: [number, number, number] = light ? [226, 228, 223] : [28, 32, 40];
    const img = ctx.createImageData(N, N);
    for (let p = 0; p < N * N; p++) {
      let c: [number, number, number];
      if (t >= schedule.end[p]) c = image[p];
      else if (t >= schedule.start[p]) c = palette[schedule.worker[p] % palette.length];
      else c = pending;
      img.data[p * 4] = c[0];
      img.data[p * 4 + 1] = c[1];
      img.data[p * 4 + 2] = c[2];
      img.data[p * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [schedule, t, image, palette]);

  return (
    <canvas
      ref={ref}
      width={N}
      height={N}
      aria-label={label}
      className="aspect-square w-full rounded-lg border border-line"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export function ParallelPixels() {
  const [vendor, setVendor] = useState<CompanyId>("nvidia");
  const [amdWave, setAmdWave] = useState<"32" | "64">("32");
  const [intelSimd, setIntelSimd] = useState<"8" | "16" | "32">("16");
  const [divergence, setDivergence] = useState(false);
  const [speed, setSpeed] = useState<"1" | "0.25">("1");
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const raf = useRef<number>(0);
  const last = useRef<number>(0);

  const org = GPU_ORGS.find((o) => o.company === vendor)!;
  const groupSize = vendor === "amd" ? +amdWave : vendor === "intel" ? +intelSimd : 32;

  const gpu = useMemo(() => gpuSchedule(groupSize, org.traversal === "tiled", divergence), [groupSize, org.traversal, divergence]);
  const cpu = useMemo(() => cpuSchedule(), []);
  const total = Math.max(cpu.makespan, gpu.makespan);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setPlaying(false);
  }, []);

  const tRef = useRef(0);
  const speedRef = useRef(1);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  useEffect(() => {
    speedRef.current = +speed;
  }, [speed]);

  const play = useCallback(() => {
    if (reduced) {
      setT(total);
      return;
    }
    if (tRef.current >= total) tRef.current = 0;
    setPlaying(true);
    last.current = performance.now();
    const loop = (now: number) => {
      const dt = (now - last.current) / TICK_MS;
      last.current = now;
      const nx = Math.min(total, tRef.current + dt * speedRef.current);
      tRef.current = nx;
      setT(nx);
      if (nx >= total) setPlaying(false);
      else raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  }, [reduced, total]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => {
    stop();
    setT(0);
  }, [vendor, amdWave, intelSimd, divergence, stop]);

  const pct = (s: Schedule) => {
    let done = 0;
    for (let p = 0; p < N * N; p++) if (t >= s.end[p]) done++;
    return Math.round((done / (N * N)) * 100);
  };

  return (
    <Panel className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Kicker>Process 10,000 pixels</Kicker>
          <p className="mt-1 text-sm text-muted">Same image, same clock. Watch how the work is divided.</p>
        </div>
        <ApproxBadge label="Conceptual model — not a benchmark" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Segmented
          ariaLabel="GPU architecture"
          size="sm"
          value={vendor}
          onChange={setVendor}
          options={GPU_ORGS.map((o) => ({ value: o.company, label: o.family, color: COMPANY_VAR[o.company] }))}
        />
        {vendor === "amd" && (
          <Segmented ariaLabel="Wave size" size="sm" value={amdWave} onChange={setAmdWave} options={[{ value: "32", label: "wave32" }, { value: "64", label: "wave64" }]} />
        )}
        {vendor === "intel" && (
          <Segmented
            ariaLabel="SIMD width"
            size="sm"
            value={intelSimd}
            onChange={setIntelSimd}
            options={[{ value: "8", label: "SIMD8" }, { value: "16", label: "SIMD16" }, { value: "32", label: "SIMD32" }]}
          />
        )}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-sm font-medium" style={{ color: "var(--k-cpu)" }}>
              CPU · {CPU_CORES} powerful cores
            </div>
            <div className="font-mono text-xs text-dim">{pct(cpu)}%</div>
          </div>
          <PixelCanvas schedule={cpu} t={t} workers={CPU_CORES} label="CPU progress" />
          <p className="mt-2 text-xs leading-relaxed text-dim">
            Each core takes a horizontal stripe and shades {CPU_SIMD} pixels per step with its vector unit, at roughly twice the GPU&apos;s clock.
            Cores are big: deep out-of-order pipelines, branch predictors, large caches.
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-sm font-medium" style={{ color: "var(--k-gpu)" }}>
              GPU · {GPU_UNITS} {org.unitPlural.split(" (")[0]} × {LANES_PER_UNIT} lanes
            </div>
            <div className="font-mono text-xs text-dim">{pct(gpu)}%</div>
          </div>
          <PixelCanvas schedule={gpu} t={t} workers={GPU_UNITS} label="GPU progress" />
          <p className="mt-2 text-xs leading-relaxed text-dim">
            Pixels go out in {org.groupName}s of {groupSize}
            {org.traversal === "tiled" ? ", tile by tile" : ""}. Colours show which {org.unit} is working on them.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={playing ? stop : play}
          className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
        >
          {playing ? "Pause" : t >= total ? "Replay" : t > 0 ? "Resume" : "Run"}
        </button>
        <button
          onClick={() => {
            stop();
            setT(0);
          }}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-fg"
        >
          Reset
        </button>
        <Segmented ariaLabel="Speed" size="sm" value={speed} onChange={setSpeed} options={[{ value: "1", label: "1×" }, { value: "0.25", label: "Slow-mo" }]} />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={divergence} onChange={(e) => setDivergence(e.target.checked)} className="accent-[var(--accent)]" />
          Branchy shader (sphere vs background take different code paths)
        </label>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Readout label="CPU finishes" value={`${cpu.makespan.toFixed(0)} ticks`} />
        <Readout label="GPU finishes" value={`${gpu.makespan.toFixed(0)} ticks`} />
        <Readout label={`${org.groupName}s launched`} value={gpu.groups.toLocaleString()} />
        <Readout
          label="GPU lanes doing useful work"
          value={`${Math.round(gpu.utilization * 100)}%`}
          hint={divergence ? `${gpu.divergent} divergent ${org.groupName}s ran both paths` : "partial groups at edges leave lanes idle"}
        />
      </div>

      <div className="mt-6 grid gap-4 rounded-xl border border-line bg-panel-2 p-4 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="text-sm font-semibold text-fg">How {org.family} organises the work</div>
          <div className="mt-2">
            <Rich text={org.howItWorks} />
          </div>
        </div>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-dim">Hierarchy</div>
          <ol className="mt-2 space-y-1">
            {org.hierarchy.map((h, i) => (
              <li key={h} className="flex items-center gap-2 text-xs text-muted" style={{ paddingLeft: i * 10 }}>
                <span className="h-1 w-1 rounded-full" style={{ background: COMPANY_VAR[org.company] }} />
                {h}
              </li>
            ))}
          </ol>
          <dl className="mt-3 space-y-1.5 text-xs">
            <div>
              <dt className="inline text-dim">Matrix hardware: </dt>
              <dd className="inline text-muted">{org.matrix}</dd>
            </div>
            <div>
              <dt className="inline text-dim">Ray tracing: </dt>
              <dd className="inline text-muted">{org.rayTracing}</dd>
            </div>
          </dl>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-dim">
        Every vendor here gets the same conceptual GPU ({GPU_UNITS * LANES_PER_UNIT} lanes) so that only the <em>organisation</em> changes. Real GPUs
        range from a few hundred to over twenty thousand lanes, and per-lane capabilities differ — this visual says nothing about which brand is faster.
        Try wave64 with the branchy shader on: wider groups straddle the sphere&apos;s edge more often, so more lanes sit idle.
      </p>
    </Panel>
  );
}

function Readout({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel-2 p-3">
      <div className="text-[11px] leading-tight text-dim">{label}</div>
      <div className="mt-1 font-mono text-lg tabular-nums text-fg">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] leading-snug text-dim">{hint}</div>}
    </div>
  );
}

/** Latency vs throughput: one long dependent chain, where a CPU core shines. */
export function LatencyVsThroughput() {
  const [run, setRun] = useState(0);
  return (
    <Panel className="p-4 sm:p-6">
      <Kicker>The opposite case: one long chain of dependent steps</Kicker>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Some work can&apos;t be split: each step needs the previous answer (parsing a file, running game logic, most of a compiler, the
        operating system). Now only <strong className="text-fg">one</strong> worker can help, and what matters is how fast that single worker is.
      </p>
      <div className="mt-4 space-y-3" key={run}>
        <Race label="One CPU core" color="var(--k-cpu)" seconds={1.6} note="high clock, out-of-order, big caches, branch prediction" />
        <Race label="One GPU lane" color="var(--k-gpu)" seconds={7} note="lower clock, simple in-order lane, long memory latency" />
      </div>
      <button onClick={() => setRun((r) => r + 1)} className="mt-4 rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-fg">
        Run again
      </button>
      <p className="mt-3 text-xs text-dim">
        Bar lengths are illustrative. This is why every computer still has a CPU, and why games and apps are often limited by single-thread speed.
      </p>
    </Panel>
  );
}

function Race({ label, color, seconds, note }: { label: string; color: string; seconds: number; note: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span style={{ color }}>{label}</span>
        <span className="text-dim">{note}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-panel-3">
        <div className="h-full rounded-full motion-safe:animate-[grow_var(--d)_linear_forwards]" style={{ background: color, width: "100%", transformOrigin: "left", ["--d" as string]: `${seconds}s` }} />
      </div>
      <style>{`@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </div>
  );
}

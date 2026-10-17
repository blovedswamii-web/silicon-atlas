"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { STORAGE_DEVICES } from "@/data/latency";
import { ApproxBadge } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { Frame, Slider, logPos } from "@/components/cpu/Frame";

type Metric = "seq" | "rand" | "lat";

const METRICS: Record<Metric, { label: string; unit: string; get: (d: (typeof STORAGE_DEVICES)[number]) => number; better: "high" | "low"; note: string }> = {
  seq: {
    label: "Sequential read",
    unit: "MB/s",
    get: (d) => d.seqMBs,
    better: "high",
    note: "Reading one big file front to back. This is the number on the box — and it doubles each PCIe generation.",
  },
  rand: {
    label: "4K random read (QD1)",
    unit: "MB/s",
    get: (d) => d.rand4kMBs,
    better: "high",
    note: "Small scattered reads, one at a time — what booting, launching apps and many game asset lookups feel like. Notice how little it changes between NVMe generations: it's limited by flash latency, not the PCIe link.",
  },
  lat: {
    label: "Access latency",
    unit: "µs",
    get: (d) => d.latencyUs,
    better: "low",
    note: "Time for one small read to come back. The jump from spinning disk to any SSD is ~100×; between SSD generations it's small.",
  },
};

export function StorageCompare() {
  const [metric, setMetric] = useState<Metric>("seq");
  const [gb, setGb] = useState(4);
  const [seqShare, setSeqShare] = useState(85);
  const [cpuS, setCpuS] = useState(8);
  const m = METRICS[metric];
  const vals = STORAGE_DEVICES.map(m.get);
  const lo = Math.min(...vals) / 2;
  const hi = Math.max(...vals) * 1.6;

  const loads = STORAGE_DEVICES.map((d) => {
    const s = seqShare / 100;
    const eff = 1 / (s / d.seqMBs + (1 - s) / d.mixedMBs); // MB/s
    const io = (gb * 1024) / eff;
    // Loading overlaps reading with decompression / setup; only part of the shorter phase is hidden.
    const total = Math.max(io, cpuS) + 0.3 * Math.min(io, cpuS);
    return { d, io, total };
  });
  const maxTotal = Math.max(...loads.filter((l) => l.d.id !== "hdd").map((l) => l.total)) * 1.15;
  const g4 = loads.find((l) => l.d.id === "gen4")!;
  const g5 = loads.find((l) => l.d.id === "gen5")!;

  return (
    <Frame
      kicker="Interactive · storage"
      title="What actually changes between drives?"
      footer="Representative values for typical consumer drives; specific models vary widely (DRAM cache, controller, flash type, how full the drive is, thermal throttling)."
    >
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          size="sm"
          ariaLabel="Metric"
          value={metric}
          onChange={setMetric}
          options={(Object.keys(METRICS) as Metric[]).map((k) => ({ value: k, label: METRICS[k].label }))}
        />
        <ApproxBadge label="Typical values" />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{m.note}</p>

      <div className="mt-4 space-y-2">
        {STORAGE_DEVICES.map((d) => {
          const v = m.get(d);
          const pct = Math.max(3, logPos(v, lo, hi) * 100);
          return (
            <div key={d.id} className="grid grid-cols-[7.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 sm:grid-cols-[11rem_minmax(0,1fr)_5.5rem]">
              <div className="min-w-0">
                <div className="truncate text-sm text-fg">{d.label}</div>
                <div className="truncate text-[11px] text-dim">{d.iface}</div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-panel-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: d.id === "hdd" ? "var(--fg-dim)" : "var(--k-storage)" }}
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-right font-mono text-xs tabular-nums text-muted">
                {v.toLocaleString()} {m.unit}
              </div>
            </div>
          );
        })}
        <div className="pl-[8.25rem] text-[10px] text-dim sm:pl-[11.75rem]">log scale · {m.better === "high" ? "longer = better" : "longer = slower"}</div>
      </div>

      <div className="mt-6 rounded-xl border border-line bg-panel-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-fg">Model: a game level load</div>
          <ApproxBadge />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Slider label="Data read" value={gb} min={1} max={20} onChange={setGb} display={`${gb} GB`} />
          <Slider label="Share that is sequential" value={seqShare} min={30} max={100} step={5} onChange={setSeqShare} display={`${seqShare}%`} />
          <Slider label="CPU/GPU work (decompress, shaders, setup)" value={cpuS} min={1} max={20} onChange={setCpuS} display={`${cpuS} s`} />
        </div>
        <div className="mt-5 space-y-2">
          {loads.map(({ d, io, total }) => {
            const capped = Math.min(total, maxTotal);
            return (
              <div key={d.id} className="grid grid-cols-[7.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 sm:grid-cols-[11rem_minmax(0,1fr)_5.5rem]">
                <div className="truncate text-xs text-muted">{d.label}</div>
                <div className="relative h-4 overflow-hidden rounded bg-panel-3">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[var(--k-cpu)] opacity-70"
                    initial={false}
                    animate={{ width: `${(Math.min(cpuS, capped) / maxTotal) * 100}%` }}
                  />
                  <motion.div
                    className="absolute inset-y-0 bg-[var(--k-storage)]"
                    initial={false}
                    animate={{
                      left: `${(Math.min(cpuS, capped) / maxTotal) * 100}%`,
                      width: `${(Math.max(0, capped - Math.min(cpuS, capped)) / maxTotal) * 100}%`,
                    }}
                  />
                  {total > maxTotal && <span className="absolute right-1 top-0 font-mono text-[10px] leading-4 text-bg">off scale →</span>}
                </div>
                <div className="text-right font-mono text-xs tabular-nums text-fg" title={`I/O alone: ${io.toFixed(1)} s`}>
                  {total.toFixed(1)} s
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-dim">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--k-cpu)] opacity-70" /> CPU/GPU work
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--k-storage)]" /> extra time waiting on storage
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          PCIe 5.0 doubles sequential bandwidth over PCIe 4.0, yet this load goes from{" "}
          <strong className="text-fg">{g4.total.toFixed(1)} s</strong> to <strong className="text-fg">{g5.total.toFixed(1)} s</strong>. Once storage
          is fast enough, the CPU work (decompression, shader compilation, building the world) dominates. The big jump is from a hard disk to{" "}
          <em>any</em> SSD. Technologies like DirectStorage aim to shrink the CPU part by changing how data is requested and decompressed.
        </p>
      </div>
    </Frame>
  );
}

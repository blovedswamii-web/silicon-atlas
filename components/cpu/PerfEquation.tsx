"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { ApproxBadge } from "@/components/ui/primitives";
import { Frame, Slider } from "./Frame";

interface Chip {
  ipc: number;
  ghz: number;
  cores: number;
}

const PRESETS: { id: string; label: string; a: Chip; b: Chip; p: number; story: string }[] = [
  {
    id: "same-ghz",
    label: "5 GHz vs 5 GHz",
    a: { ipc: 1.0, ghz: 5.0, cores: 8 },
    b: { ipc: 1.4, ghz: 5.0, cores: 8 },
    p: 20,
    story: "Both chips advertise 5 GHz. Core B finishes ~40% more work per cycle (a newer, wider design with better prediction and bigger caches), so at the same clock it is ~40% faster. The GHz number told you nothing about that.",
  },
  {
    id: "lower-clock",
    label: "Lower clock wins",
    a: { ipc: 1.0, ghz: 5.6, cores: 8 },
    b: { ipc: 1.5, ghz: 4.4, cores: 8 },
    p: 20,
    story: "Core A runs at a much higher clock, but core B does far more per cycle. B wins despite being 1.2 GHz 'slower' — and a lower clock usually also means less power and heat.",
  },
  {
    id: "cores-serial",
    label: "More cores, serial task",
    a: { ipc: 1.2, ghz: 5.2, cores: 8 },
    b: { ipc: 1.2, ghz: 4.6, cores: 24 },
    p: 30,
    story: "Only 30% of this task can run in parallel. Tripling the core count barely helps, and B's lower clock actually loses. Slide 'parallel share' to 95% (a render or compile) and watch B pull ahead.",
  },
];

/** Amdahl's law: speed-up from n cores when a fraction p of the work parallelises perfectly. */
const amdahl = (n: number, p: number) => 1 / (1 - p + p / n);

export function PerfEquation() {
  const [presetId, setPresetId] = useState("same-ghz");
  const preset = PRESETS.find((x) => x.id === presetId)!;
  const [a, setA] = useState<Chip>(preset.a);
  const [b, setB] = useState<Chip>(preset.b);
  const [p, setP] = useState(preset.p);

  const choose = (id: string) => {
    const x = PRESETS.find((q) => q.id === id)!;
    setPresetId(id);
    setA(x.a);
    setB(x.b);
    setP(x.p);
  };

  const score = (c: Chip) => c.ipc * c.ghz * amdahl(c.cores, p / 100);
  const sa = score(a);
  const sb = score(b);
  const max = Math.max(sa, sb);

  return (
    <Frame
      kicker="Interactive · the performance equation"
      title="Performance ≈ IPC × clock × useful parallelism"
      footer="IPC (instructions per cycle) is not a fixed property of a chip — it changes with every workload, because it depends on cache hits, branch prediction, dependencies and memory. This is a teaching model; it ignores memory bandwidth, turbo behaviour and thermal limits."
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((x) => (
          <button
            key={x.id}
            onClick={() => choose(x.id)}
            className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${presetId === x.id ? "border-line-strong bg-panel-3 text-fg" : "border-line text-dim hover:text-fg"}`}
          >
            {x.label}
          </button>
        ))}
        <ApproxBadge label="Hypothetical cores" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {([
          ["A", a, setA, "var(--k-cpu)"],
          ["B", b, setB, "var(--k-accel)"],
        ] as const).map(([name, c, set, color]) => (
          <div key={name} className="rounded-xl border border-line bg-panel-2 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-md font-mono text-xs text-bg" style={{ background: color }}>
                {name}
              </span>
              <span className="text-sm font-medium text-fg">Core {name}</span>
              <span className="ml-auto font-mono text-[11px] text-dim">{(c.ipc * c.ghz).toFixed(1)} billion instr/s per core</span>
            </div>
            <div className="mt-4 space-y-4">
              <Slider label="IPC — work per cycle" value={c.ipc} min={0.5} max={3} step={0.1} onChange={(v) => set({ ...c, ipc: v })} display={c.ipc.toFixed(1)} />
              <Slider label="Clock speed" value={c.ghz} min={2} max={6} step={0.1} onChange={(v) => set({ ...c, ghz: v })} display={`${c.ghz.toFixed(1)} GHz`} />
              <Slider label="Cores" value={c.cores} min={1} max={32} onChange={(v) => set({ ...c, cores: v })} display={c.cores} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Slider
          label="Parallel share of the workload (how much can be split across cores)"
          value={p}
          min={0}
          max={99}
          onChange={setP}
          display={`${p}% · ${p < 40 ? "mostly serial (many games, UI)" : p < 85 ? "mixed" : "highly parallel (render, compile)"}`}
        />
      </div>

      <div className="mt-5 space-y-2">
        {([
          ["A", sa, "var(--k-cpu)", a],
          ["B", sb, "var(--k-accel)", b],
        ] as const).map(([n, s, color, c]) => (
          <div key={n} className="grid grid-cols-[4rem_minmax(0,1fr)_5rem] items-center gap-3">
            <span className="font-mono text-xs text-muted">Core {n}</span>
            <div className="h-4 overflow-hidden rounded bg-panel-3">
              <motion.div className="h-full rounded" style={{ background: color }} initial={false} animate={{ width: `${(s / max) * 100}%` }} />
            </div>
            <span className="text-right font-mono text-xs tabular-nums text-fg">
              {((s / max) * 100).toFixed(0)}%
              <span className="ml-1 text-dim">×{amdahl(c.cores, p / 100).toFixed(1)}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 text-right text-[10px] text-dim">×n = effective speed-up from extra cores (Amdahl’s law)</div>

      <div className="mt-4 rounded-xl border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
        <strong className="text-fg">{sa > sb ? "A" : "B"} is ~{Math.round((Math.max(sa, sb) / Math.min(sa, sb) - 1) * 100)}% faster here.</strong> {preset.story}
      </div>
    </Frame>
  );
}

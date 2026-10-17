"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { ApproxBadge } from "@/components/ui/primitives";
import { Btn, Frame, Slider } from "@/components/cpu/Frame";

const WORDS_PER_LINE = 4;
const BLOCKS = 32; // memory shown = 32 cache lines = 128 elements
const HIT_NS = 1;
const MISS_NS = 80;

type PatternId = "loop" | "stream" | "stride" | "random" | "list";

function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const PATTERNS: Record<PatternId, { label: string; explain: string; seq: number[] }> = {
  loop: {
    label: "Small loop",
    explain: "Temporal locality: the same 12 elements are used again and again. After the first pass, everything is already in cache.",
    seq: Array.from({ length: 48 }, (_, i) => i % 12),
  },
  stream: {
    label: "Stream",
    explain: "Spatial locality: walking an array in order. Each miss brings in a whole 4-element line, so 3 of every 4 accesses hit — and a prefetcher can hide the rest.",
    seq: Array.from({ length: 48 }, (_, i) => i),
  },
  stride: {
    label: "Strided",
    explain: "Touching every 4th element means every access lands on a new line — no spatial locality at all. A prefetcher that spots the pattern rescues it.",
    seq: Array.from({ length: 32 }, (_, i) => i * 4),
  },
  random: {
    label: "Random",
    explain: "Random access over data larger than the cache: little re-use, little locality. Bigger caches help only by holding more of the working set.",
    seq: (() => {
      const r = lcg(7);
      return Array.from({ length: 48 }, () => Math.floor(r() * BLOCKS * WORDS_PER_LINE));
    })(),
  },
  list: {
    label: "Linked list",
    explain: "Pointer chasing: each address is only known after the previous load returns. Prefetchers can't predict it and the CPU can't overlap the misses — pure latency.",
    seq: (() => {
      const r = lcg(42);
      return Array.from({ length: 40 }, () => Math.floor(r() * BLOCKS) * WORDS_PER_LINE + 1);
    })(),
  },
};

type Outcome = "hit" | "miss" | "prefetch";

function simulate(seq: number[], lines: number, prefetch: boolean, steps: number) {
  let cache: number[] = []; // most-recently-used last
  const prefetched = new Set<number>();
  const log: Outcome[] = [];
  const touch = (b: number) => {
    cache = cache.filter((x) => x !== b);
    cache.push(b);
    if (cache.length > lines) {
      const ev = cache.shift()!;
      prefetched.delete(ev);
    }
  };
  for (let i = 0; i < Math.min(steps, seq.length); i++) {
    const b = Math.floor(seq[i] / WORDS_PER_LINE);
    if (cache.includes(b)) {
      log.push(prefetched.has(b) ? "prefetch" : "hit");
      prefetched.delete(b);
      touch(b);
    } else {
      log.push("miss");
      touch(b);
    }
    if (prefetch && b + 1 < BLOCKS && !cache.includes(b + 1)) {
      touch(b + 1);
      // keep the demand line most-recent so the prefetch doesn't evict it first
      touch(b);
      prefetched.add(b + 1);
    }
  }
  return { cache, log, prefetched };
}

export function CacheSim() {
  const [pattern, setPattern] = useState<PatternId>("stream");
  const [lines, setLines] = useState(4);
  const [prefetch, setPrefetch] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const seq = PATTERNS[pattern].seq;

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [pattern, lines, prefetch]);

  useEffect(() => {
    if (!playing) return;
    if (step >= seq.length) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 260);
    return () => clearTimeout(t);
  }, [playing, step, seq.length]);

  const { cache, log, prefetched } = useMemo(() => simulate(seq, lines, prefetch, step), [seq, lines, prefetch, step]);
  const hits = log.filter((o) => o !== "miss").length;
  const misses = log.length - hits;
  const avg = log.length ? (hits * HIT_NS + misses * MISS_NS) / log.length : 0;
  const current = step > 0 ? seq[step - 1] : -1;
  const currentBlock = current >= 0 ? Math.floor(current / WORDS_PER_LINE) : -1;
  const lastOutcome = log[log.length - 1];

  return (
    <Frame
      kicker="Simulator"
      title="Why caches work: locality"
      controls={
        <>
          <Btn onClick={() => setPlaying((p) => !p)} active={playing}>
            {playing ? "Pause" : step >= seq.length ? "Done" : "Play"}
          </Btn>
          <Btn onClick={() => setStep((s) => Math.min(seq.length, s + 1))}>Step</Btn>
          <Btn onClick={() => setStep(0)}>Reset</Btn>
        </>
      }
      footer={
        <>
          A tiny fully-associative cache with least-recently-used eviction, 4 elements per line. Real L1 caches hold hundreds of 64-byte lines and are
          set-associative, but locality works the same way. Hit = {HIT_NS} ns, miss to DRAM = ~{MISS_NS} ns.
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          size="sm"
          ariaLabel="Access pattern"
          value={pattern}
          onChange={setPattern}
          options={(Object.keys(PATTERNS) as PatternId[]).map((p) => ({ value: p, label: PATTERNS[p].label }))}
        />
        <Btn active={prefetch} onClick={() => setPrefetch((p) => !p)}>
          <span className={clsx("h-2 w-2 rounded-full", prefetch ? "bg-[var(--k-cache)]" : "bg-[var(--line-strong)]")} />
          Next-line prefetcher
        </Btn>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{PATTERNS[pattern].explain}</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-dim">
            <span>Main memory · 32 lines × 4 elements</span>
            <span className="font-mono">{current >= 0 ? `accessing element ${current}` : "—"}</span>
          </div>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: BLOCKS }, (_, b) => {
              const inCache = cache.includes(b);
              const isPf = prefetched.has(b);
              return (
                <div
                  key={b}
                  className={clsx(
                    "grid grid-cols-4 gap-px rounded-[5px] border p-0.5 transition-colors",
                    b === currentBlock ? "border-fg" : inCache ? "border-[var(--k-cache)]" : "border-line",
                  )}
                  style={{ background: inCache ? `color-mix(in oklab, var(--k-cache) ${isPf ? 10 : 18}%, transparent)` : undefined }}
                >
                  {Array.from({ length: WORDS_PER_LINE }, (_, w) => {
                    const idx = b * WORDS_PER_LINE + w;
                    return (
                      <div
                        key={w}
                        className="h-2.5 rounded-[2px] sm:h-3"
                        style={{
                          background:
                            idx === current
                              ? lastOutcome === "miss"
                                ? "var(--bad)"
                                : "var(--good)"
                              : "var(--panel-3)",
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="mt-4 mb-2 text-xs text-dim">Access history</div>
          <div className="flex flex-wrap gap-1">
            {seq.map((_, i) => {
              const o = log[i];
              return (
                <span
                  key={i}
                  className="h-3 w-3 rounded-[3px]"
                  style={{
                    background: !o ? "var(--panel-3)" : o === "miss" ? "var(--bad)" : o === "prefetch" ? "var(--k-cache)" : "var(--good)",
                  }}
                />
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-dim">
            <Legend color="var(--good)" label="hit" />
            <Legend color="var(--k-cache)" label="hit thanks to prefetch" />
            <Legend color="var(--bad)" label="miss → DRAM" />
          </div>
        </div>

        <div className="space-y-4">
          <Slider label="Cache size" value={lines} min={2} max={8} onChange={setLines} display={`${lines} lines`} />
          <div>
            <div className="mb-2 text-xs text-dim">Cache contents (oldest → newest)</div>
            <div className="flex gap-1.5">
              {Array.from({ length: lines }, (_, i) => {
                const b = cache[i];
                return (
                  <motion.div
                    layout
                    key={b ?? `empty-${i}`}
                    className="grid h-10 flex-1 place-items-center rounded-lg border font-mono text-xs"
                    style={{
                      borderColor: b === undefined ? "var(--line)" : "var(--k-cache)",
                      color: b === undefined ? "var(--fg-dim)" : "var(--fg)",
                      background: b === undefined ? "transparent" : "color-mix(in oklab, var(--k-cache) 12%, transparent)",
                    }}
                  >
                    {b === undefined ? "·" : `L${b}`}
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Mini label="Hit rate" value={log.length ? `${Math.round((hits / log.length) * 100)}%` : "—"} />
            <Mini label="Misses" value={String(misses)} />
            <Mini label="Avg access" value={log.length ? `${avg.toFixed(1)} ns` : "—"} />
          </div>
          <div className="flex items-center gap-2">
            <ApproxBadge label="Toy model" />
            <span className="text-[11px] text-dim">
              Even a 90% hit rate averages ~{(0.9 * HIT_NS + 0.1 * MISS_NS).toFixed(0)} ns — misses dominate.
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      {label}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel-2 px-2.5 py-2">
      <div className="font-mono text-[9.5px] uppercase tracking-wider text-dim">{label}</div>
      <div className="mt-0.5 font-mono text-sm tabular-nums text-fg">{value}</div>
    </div>
  );
}

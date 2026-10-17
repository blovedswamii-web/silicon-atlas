"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { DATA_LINKS, TRANSFER_SIZES, formatBytesPerSec, formatNs } from "@/data/latency";
import { ApproxBadge, KIND_VAR } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { Frame, logPos } from "@/components/cpu/Frame";

/**
 * time = latency + size / bandwidth.
 * Conveniently, 1 GB/s = 1 byte per nanosecond, so size(bytes) / bandwidth(GB/s) is already in ns.
 */
export function LatencyVsBandwidth() {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [hideSlow, setHideSlow] = useState(true);
  const size = TRANSFER_SIZES[sizeIdx];

  const rows = useMemo(() => {
    const links = hideSlow ? DATA_LINKS.filter((l) => l.id !== "nvme" && l.id !== "gbe") : DATA_LINKS;
    return links
      .map((l) => {
        const stream = size.bytes / l.bandwidthGBs;
        const total = l.latencyNs + stream;
        return { ...l, stream, total, latShare: l.latencyNs / total };
      })
      .sort((a, b) => a.total - b.total);
  }, [size, hideSlow]);

  const minT = Math.min(...rows.map((r) => r.total)) / 3;
  const maxT = Math.max(...rows.map((r) => r.total)) * 1.5;
  const winner = rows[0];

  return (
    <Frame
      kicker="Interactive · latency vs bandwidth"
      title="Which link delivers the data first?"
      controls={
        <Segmented
          size="sm"
          ariaLabel="Links shown"
          value={hideSlow ? "mem" : "all"}
          onChange={(v) => setHideSlow(v === "mem")}
          options={[
            { value: "mem", label: "Memory & PCIe" },
            { value: "all", label: "+ SSD & network" },
          ]}
        />
      }
      footer={
        <>
          Model: <code className="font-mono text-muted">time ≈ latency + size ÷ bandwidth</code>. Real transfers add queuing, protocol overhead,
          parallel requests and caching — but the shape of the result holds: <strong className="text-muted">latency</strong> decides small, dependent
          accesses; <strong className="text-muted">bandwidth</strong> decides big streams.
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-dim">Transfer size</span>
        <Segmented
          size="sm"
          ariaLabel="Transfer size"
          value={String(sizeIdx)}
          onChange={(v) => setSizeIdx(+v)}
          options={TRANSFER_SIZES.map((s, i) => ({ value: String(i), label: s.label }))}
        />
        <ApproxBadge label="Representative figures" />
      </div>
      <p className="mt-2 text-sm text-muted">
        <span className="text-fg">{size.label}</span> — {size.example}.
      </p>

      <div className="mt-5 space-y-2.5">
        {rows.map((r, i) => {
          const color = KIND_VAR[r.kind];
          const pct = Math.max(2, logPos(r.total, minT, maxT) * 100);
          return (
            <motion.div layout key={r.id} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="rounded-xl border border-line bg-panel-2 p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-4 font-mono text-xs text-dim">{i + 1}</span>
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  <span className="text-sm font-medium text-fg">{r.label}</span>
                  <span className="hidden text-xs text-dim sm:inline">{r.sub}</span>
                </div>
                <div className="font-mono text-xs text-muted">
                  first byte {formatNs(r.latencyNs)} · {formatBytesPerSec(r.bandwidthGBs)}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-panel-3">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: color }}
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right font-mono text-sm tabular-nums text-fg">{formatNs(r.total)}</span>
              </div>
              {/* Where the time goes: waiting vs streaming (linear split) */}
              <div className="mt-2 flex items-center gap-2 text-[11px] text-dim">
                <div className="flex h-1.5 w-28 overflow-hidden rounded-full bg-panel-3 sm:w-40">
                  <motion.div className="h-full bg-[var(--warn)]" initial={false} animate={{ width: `${r.latShare * 100}%` }} />
                  <div className="h-full flex-1" style={{ background: `color-mix(in oklab, ${color} 70%, transparent)` }} />
                </div>
                <span>
                  {Math.round(r.latShare * 100)}% waiting for first byte · {Math.round((1 - r.latShare) * 100)}% streaming
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
        <span className="font-medium text-fg">{winner.label}</span> wins at {size.label}. {winner.analogy}{" "}
        {sizeIdx <= 1
          ? "For tiny transfers almost all the time is the on-ramp. A wider highway does not help a single car that only needs to travel a few metres — this is why a CPU's random pointer-chasing loves low-latency DDR5 and caches, while GDDR's huge bandwidth goes unused."
          : sizeIdx >= 3
            ? "For big transfers the on-ramp is irrelevant and the number of lanes is everything. This is why GPUs, AI inference and video editing care so much about bandwidth, and why a model's token rate tracks memory bandwidth."
            : "At this size both terms matter — the crossover region where neither latency nor bandwidth alone tells the story."}
      </div>
    </Frame>
  );
}

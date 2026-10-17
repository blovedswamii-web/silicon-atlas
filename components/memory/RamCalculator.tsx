"use client";

import clsx from "clsx";
import { useState } from "react";
import { RAM_PRESETS, type RamPreset } from "@/data/latency";
import { ApproxBadge, Stat } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { Frame, Slider } from "@/components/cpu/Frame";

const WIDTHS: Record<RamPreset["type"], number[]> = {
  DDR4: [64, 128, 256],
  DDR5: [64, 128, 256],
  LPDDR5X: [64, 128, 256, 512],
  GDDR7: [128, 192, 256, 384, 512],
};

const RANGES: Record<RamPreset["type"], [number, number, number]> = {
  DDR4: [2133, 4800, 133],
  DDR5: [4000, 9600, 200],
  LPDDR5X: [6400, 10700, 133],
  GDDR7: [20000, 36000, 1000],
};

function widthName(type: RamPreset["type"], bits: number) {
  if (type === "DDR4" || type === "DDR5") {
    const ch = bits / 64;
    return `${bits}-bit (${ch === 1 ? "single" : ch === 2 ? "dual" : "quad"} channel)`;
  }
  return `${bits}-bit bus`;
}

export function RamCalculator() {
  const [type, setType] = useState<RamPreset["type"]>("DDR5");
  const [mts, setMts] = useState(6000);
  const [cl, setCl] = useState(30);
  const [bits, setBits] = useState(128);
  const [presetId, setPresetId] = useState<string | null>("ddr5-6000");

  const hasCl = type === "DDR4" || type === "DDR5";
  const casNs = (2000 * cl) / mts;
  const bwGBs = (mts * bits) / 8 / 1000;
  const preset = RAM_PRESETS.find((p) => p.id === presetId);

  const apply = (p: RamPreset) => {
    setType(p.type);
    setMts(p.mts);
    if (p.cl) setCl(p.cl);
    setBits(p.busBits);
    setPresetId(p.id);
  };

  const [lo, hi, step] = RANGES[type];

  return (
    <Frame
      kicker="Calculator"
      title="RAM latency & bandwidth"
      footer={
        <>
          <code className="font-mono text-muted">true CAS latency (ns) = CL × 2000 ÷ MT/s</code> ·{" "}
          <code className="font-mono text-muted">peak bandwidth (GB/s) = MT/s × bus bits ÷ 8 ÷ 1000</code>. Peak bandwidth is a theoretical ceiling;
          sustained bandwidth is typically lower. DDR5 DIMMs internally split each 64-bit channel into two 32-bit sub-channels — the total width is
          the same.
        </>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {RAM_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => apply(p)}
            className={clsx(
              "rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-colors",
              presetId === p.id ? "border-line-strong bg-panel-3 text-fg" : "border-line text-dim hover:text-fg",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset && <p className="mt-2 text-xs text-dim">{preset.context}</p>}

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <Segmented
            size="sm"
            ariaLabel="Memory type"
            value={type}
            onChange={(t) => {
              setType(t);
              setPresetId(null);
              const [a, b] = RANGES[t];
              setMts(Math.round((a + b) / 2 / 100) * 100);
              setBits(t === "GDDR7" ? 256 : t === "LPDDR5X" ? 128 : 128);
            }}
            options={(["DDR4", "DDR5", "LPDDR5X", "GDDR7"] as const).map((t) => ({ value: t, label: t }))}
          />
          <Slider
            label={type === "GDDR7" ? "Data rate per pin" : "Data rate"}
            value={mts}
            min={lo}
            max={hi}
            step={step}
            onChange={(v) => {
              setMts(v);
              setPresetId(null);
            }}
            display={type === "GDDR7" ? `${(mts / 1000).toFixed(0)} Gbps` : `${mts} MT/s`}
          />
          {hasCl ? (
            <Slider
              label="CAS latency (CL, in memory-clock cycles)"
              value={cl}
              min={10}
              max={56}
              onChange={(v) => {
                setCl(v);
                setPresetId(null);
              }}
              display={`CL${cl}`}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-line px-3 py-2 text-xs leading-relaxed text-dim">
              {type} timings are usually not published as a single “CL” figure and the memory controller manages them differently, so this
              calculator shows bandwidth only for {type}.
            </p>
          )}
          <div>
            <div className="mb-1.5 text-xs text-muted">Total bus width</div>
            <Segmented
              size="sm"
              ariaLabel="Bus width"
              value={String(bits)}
              onChange={(v) => {
                setBits(+v);
                setPresetId(null);
              }}
              options={WIDTHS[type].map((w) => ({ value: String(w), label: `${w}-bit` }))}
            />
            <div className="mt-1 text-[11px] text-dim">{widthName(type, bits)}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Peak bandwidth" value={`${bwGBs.toFixed(bwGBs < 100 ? 1 : 0)} GB/s`} hint="theoretical ceiling" />
            {hasCl ? (
              <Stat label="True CAS latency" value={`${casNs.toFixed(2)} ns`} hint={`CL${cl} at ${mts / 2} MHz clock`} />
            ) : (
              <Stat label="Transfers / second" value={`${(mts / 1000).toFixed(1)} G`} hint="per pin" />
            )}
          </div>

          {hasCl && (
            <div className="rounded-xl border border-line bg-panel-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-fg">Where a full DRAM access goes</div>
                <ApproxBadge />
              </div>
              <AccessBreakdown casNs={casNs} />
              <p className="mt-3 text-xs leading-relaxed text-dim">
                CAS is only one slice. A real load that misses every cache also pays for the cache lookups, the trip across the chip to the memory
                controller, queuing, opening the DRAM row (tRCD) and sending data back — typically <strong className="text-muted">60–110 ns</strong>{" "}
                total on desktops.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-line bg-panel-2 p-4 text-xs leading-relaxed text-muted">
            <span className="font-medium text-fg">Try it:</span> DDR4-3200 CL16 and DDR5-6000 CL30 both come out at{" "}
            <strong className="text-fg">10 ns</strong> true CAS latency. A bigger CL number is not automatically slower — it is counted in cycles,
            and DDR5's cycles are shorter. Meanwhile DDR5-6000 roughly doubles bandwidth.
          </div>
        </div>
      </div>
    </Frame>
  );
}

function AccessBreakdown({ casNs }: { casNs: number }) {
  // Representative split of a ~80 ns load-to-use DRAM access. Only CAS follows the sliders.
  const parts = [
    { label: "Cache misses (L1→L3)", ns: 14, color: "var(--k-cache)" },
    { label: "On-chip fabric & controller", ns: 20, color: "var(--k-interconnect)" },
    { label: "Queuing", ns: 8, color: "var(--fg-dim)" },
    { label: "Row open (tRCD)", ns: Math.max(8, casNs), color: "var(--k-memory)" },
    { label: "CAS", ns: casNs, color: "var(--accent)" },
    { label: "Data back to core", ns: 16, color: "var(--k-cpu)" },
  ];
  const total = parts.reduce((s, p) => s + p.ns, 0);
  return (
    <div className="mt-3">
      <div className="flex h-5 overflow-hidden rounded-md">
        {parts.map((p) => (
          <div
            key={p.label}
            title={`${p.label}: ~${p.ns.toFixed(0)} ns`}
            className="h-full border-r border-[var(--panel-2)] transition-[width] duration-300 last:border-0"
            style={{ width: `${(p.ns / total) * 100}%`, background: p.color }}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-1.5 text-[11px] text-dim">
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: p.color }} />
            <span className="truncate">{p.label}</span>
            <span className="ml-auto font-mono text-muted">~{p.ns.toFixed(0)}</span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 text-right font-mono text-[11px] text-muted">≈ {total.toFixed(0)} ns total</div>
    </div>
  );
}

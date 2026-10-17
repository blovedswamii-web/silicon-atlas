"use client";

import { useState } from "react";
import { ApproxBadge, Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";

const OS_GB = 5; // OS + background services, representative

interface Seg {
  label: string;
  gb: number;
  color: string;
  hatched?: boolean;
}

function PoolBar({ capacity, segs, marker, markerLabel }: { capacity: number; segs: Seg[]; marker?: number; markerLabel?: string }) {
  const used = segs.reduce((a, s) => a + s.gb, 0);
  const scale = Math.max(capacity, used);
  return (
    <div>
      <div className="relative h-9 overflow-hidden rounded-lg border border-line bg-panel-3">
        <div className="flex h-full">
          {segs.map((s) => (
            <div
              key={s.label}
              title={`${s.label}: ${s.gb.toFixed(1)} GB`}
              className="h-full border-r border-[var(--bg)] transition-[width] duration-300 last:border-r-0"
              style={{
                width: `${(s.gb / scale) * 100}%`,
                background: s.hatched
                  ? `repeating-linear-gradient(135deg, color-mix(in oklab, ${s.color} 70%, transparent) 0 6px, transparent 6px 11px)`
                  : `color-mix(in oklab, ${s.color} 65%, transparent)`,
              }}
            />
          ))}
        </div>
        {used > capacity && (
          <div className="absolute inset-y-0 border-l-2 border-dashed border-[var(--fg)]" style={{ left: `${(capacity / scale) * 100}%` }} title="Physical capacity" />
        )}
        {marker !== undefined && (
          <div className="absolute inset-y-0 border-l border-[var(--warn)]" style={{ left: `${(Math.min(marker, scale) / scale) * 100}%` }} title={markerLabel} />
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-dim">
        {segs.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
            {s.label} {s.gb.toFixed(0)} GB
          </span>
        ))}
      </div>
    </div>
  );
}

function Verdict({ tone, children }: { tone: "good" | "warn" | "bad"; children: React.ReactNode }) {
  const color = { good: "var(--good)", warn: "var(--warn)", bad: "var(--bad)" }[tone];
  return (
    <div className="mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed text-muted" style={{ borderColor: `color-mix(in oklab, ${color} 35%, var(--line))` }}>
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: color }} />
      {children}
    </div>
  );
}

export function UnifiedPressure() {
  const [mac, setMac] = useState("32");
  const [ram, setRam] = useState("32");
  const [vram, setVram] = useState("16");
  const [apps, setApps] = useState(10);
  const [gpu, setGpu] = useState(14);

  // ---- Apple: one pool
  const total = +mac;
  const gpuLimit = Math.round(total * (total >= 48 ? 0.75 : 0.67));
  const used = OS_GB + apps + gpu;
  const macOver = Math.max(0, used - total);
  const macSegs: Seg[] = [
    { label: "OS", gb: OS_GB, color: "var(--k-interconnect)" },
    { label: "Apps", gb: apps, color: "var(--k-cpu)" },
    { label: "GPU working set", gb: gpu, color: "var(--k-gpu)" },
  ];
  if (macOver > 0) macSegs.push({ label: "Swapped to SSD", gb: macOver, color: "var(--bad)", hatched: true });

  // ---- PC: two pools
  const r = +ram,
    v = +vram;
  const vramUsable = v - 0.8;
  const gpuInVram = Math.min(gpu, vramUsable);
  const gpuSpill = Math.max(0, gpu - vramUsable);
  const ramUsed = OS_GB + apps + gpuSpill;
  const ramOver = Math.max(0, ramUsed - r);
  const ramSegs: Seg[] = [
    { label: "OS", gb: OS_GB, color: "var(--k-interconnect)" },
    { label: "Apps", gb: apps, color: "var(--k-cpu)" },
  ];
  if (gpuSpill > 0) ramSegs.push({ label: "GPU overflow (shared GPU memory)", gb: gpuSpill, color: "var(--k-gpu)", hatched: true });
  if (ramOver > 0) ramSegs.push({ label: "Paged to SSD", gb: ramOver, color: "var(--bad)", hatched: true });
  const vramSegs: Seg[] = [
    { label: "Driver/display", gb: 0.8, color: "var(--k-interconnect)" },
    { label: "GPU working set", gb: gpuInVram, color: "var(--k-gpu)" },
  ];

  return (
    <Panel className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>Memory pressure · one pool vs two pools</Kicker>
        <ApproxBadge />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-muted">
          <div className="flex justify-between">
            <span>Apps (browser, IDE, editors…)</span>
            <span className="font-mono text-fg">{apps} GB</span>
          </div>
          <input type="range" min={2} max={48} value={apps} onChange={(e) => setApps(+e.target.value)} className="mt-1 w-full accent-[var(--accent)]" />
        </label>
        <label className="text-sm text-muted">
          <div className="flex justify-between">
            <span>GPU working set (model, textures, scene)</span>
            <span className="font-mono text-fg">{gpu} GB</span>
          </div>
          <input type="range" min={0} max={110} value={gpu} onChange={(e) => setGpu(+e.target.value)} className="mt-1 w-full accent-[var(--accent)]" />
        </label>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg-elev p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-fg">Mac · unified memory</div>
            <Segmented size="sm" ariaLabel="Mac memory" value={mac} onChange={setMac} options={["16", "24", "32", "64", "128"].map((x) => ({ value: x, label: `${x} GB` }))} />
          </div>
          <div className="mt-4">
            <PoolBar capacity={total} segs={macSegs} marker={gpuLimit} markerLabel="Default GPU limit" />
            <div className="mt-1 text-[11px] text-dim">
              Orange line ≈ default GPU working-set limit (~{gpuLimit} GB, approximate).
            </div>
          </div>
          {macOver > 0 ? (
            <Verdict tone="bad">
              Everything shares one {total} GB pool, and together it needs {used.toFixed(0)} GB. macOS compresses memory and then swaps to the SSD —
              apps slow down, and a GPU working set that doesn&apos;t fit becomes impractically slow. Capacity can&apos;t be upgraded later.
            </Verdict>
          ) : gpu > gpuLimit ? (
            <Verdict tone="warn">
              The GPU wants more than its default share. Advanced users can raise the limit, but it competes directly with your apps for the same
              memory.
            </Verdict>
          ) : used > total * 0.85 ? (
            <Verdict tone="warn">Memory pressure rising: macOS starts compressing memory to make room.</Verdict>
          ) : (
            <Verdict tone="good">
              Fits. The GPU can use a large share of the pool — no separate VRAM limit — and spare memory flows to whichever engine needs it.
            </Verdict>
          )}
        </div>

        <div className="rounded-xl border border-line bg-bg-elev p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-fg">PC · system RAM + VRAM</div>
            <div className="flex flex-wrap gap-1.5">
              <Segmented size="sm" ariaLabel="System RAM" value={ram} onChange={setRam} options={["16", "32", "64"].map((x) => ({ value: x, label: `${x}` }))} />
              <Segmented size="sm" ariaLabel="VRAM" value={vram} onChange={setVram} options={["8", "12", "16", "24", "32"].map((x) => ({ value: x, label: `${x}` }))} />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 text-xs text-dim">System RAM · {r} GB (upgradeable on most desktops)</div>
              <PoolBar capacity={r} segs={ramSegs} />
            </div>
            <div>
              <div className="mb-1 text-xs text-dim">VRAM · {v} GB (fixed on the graphics card)</div>
              <PoolBar capacity={v} segs={vramSegs} />
            </div>
          </div>
          {gpuSpill > 0 ? (
            <Verdict tone="bad">
              {gpuSpill.toFixed(0)} GB of GPU data doesn&apos;t fit in VRAM. It spills into system RAM and is reached over PCIe — far slower than
              VRAM. Games stutter; AI runtimes offload layers to the CPU.
            </Verdict>
          ) : ramOver > 0 ? (
            <Verdict tone="bad">System RAM is full and pages to the SSD. The GPU is fine; your apps are not.</Verdict>
          ) : (
            <Verdict tone="good">
              Apps and GPU data live in separate pools, so they don&apos;t compete — but the GPU can only use its {v} GB at full speed.
            </Verdict>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-dim">
        OS footprint (~{OS_GB} GB), GPU limits and driver reservations are rough illustrations. Both systems also compress memory and use the SSD
        as overflow; the point is <em>which</em> data competes for <em>which</em> pool.
      </p>
    </Panel>
  );
}

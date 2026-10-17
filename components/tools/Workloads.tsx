"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { FIT_PLATFORM_LABEL, FIT_WORKLOADS, UPSCALERS } from "@/data/workload-fit";
import { ApproxBadge, Badge, COMPANY_VAR, Kicker, Panel, Stat } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { Chips } from "./controls";

export function WorkloadFitExplorer({ initial = "gaming" }: { initial?: string }) {
  const [id, setId] = useState(initial);
  const w = FIT_WORKLOADS.find((x) => x.id === id)!;
  return (
    <div>
      <Chips value={id} onChange={setId} options={FIT_WORKLOADS.map((x) => ({ value: x.id, label: x.name }))} />
      <AnimatePresence mode="wait">
        <motion.div key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-6">
          <Panel className="p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <Kicker>{w.name}</Kicker>
                <p className="mt-2 text-base leading-relaxed text-fg">{w.summary}</p>
                <p className="mt-3 text-sm text-muted">
                  <span className="text-dim">Rule of thumb: </span>
                  {w.bottomLine}
                </p>
              </div>
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">Performance depends on</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {w.dependsOn.map((d) => (
                    <span key={d} className="rounded-md border border-line bg-panel-2 px-2 py-1 text-xs text-muted">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {w.fits.map((f) => (
              <Panel key={f.platform} className="relative overflow-hidden p-5">
                <div className="absolute inset-y-0 left-0 w-0.5" style={{ background: COMPANY_VAR[f.platform] }} />
                <div className="font-medium text-fg">{FIT_PLATFORM_LABEL[f.platform]}</div>
                <div className="mt-3">
                  <Badge color="var(--good)">Why it may suit</Badge>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
                    {f.reasons.map((r) => <li key={r}>· {r}</li>)}
                  </ul>
                </div>
                <div className="mt-3">
                  <Badge color="var(--warn)">Caveats</Badge>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
                    {f.caveats.map((r) => <li key={r}>· {r}</li>)}
                  </ul>
                </div>
              </Panel>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upscaling & frame generation explainer
// ---------------------------------------------------------------------------
type Mode = "native" | "upscale" | "framegen";
const PRESETS = [
  { id: "quality", label: "Quality", scale: 0.667 },
  { id: "balanced", label: "Balanced", scale: 0.58 },
  { id: "performance", label: "Performance", scale: 0.5 },
];

/** Illustrative frame-time model for a 4K target. */
function model(mode: Mode, scale: number) {
  const s = mode === "native" ? 1 : scale;
  const gpuMs = 3 + 22 * s * s + (mode === "native" ? 0 : 1.2); // fixed work + per-pixel work + upscale pass
  const cpuMs = 7; // game logic per frame
  const renderMs = Math.max(gpuMs, cpuMs);
  const renderedFps = 1000 / renderMs;
  const displayedFps = mode === "framegen" ? renderedFps * 1.85 : renderedFps;
  // Latency: input sampled on rendered frames; frame generation holds back one rendered frame to interpolate.
  const latency = 12 + renderMs * 2 + (mode === "framegen" ? renderMs * 0.6 + 2 : 0);
  return { s, renderedFps, displayedFps, latency, pixels: Math.round(3840 * s) * Math.round(2160 * s) };
}

export function UpscalingExplainer() {
  const [mode, setMode] = useState<Mode>("upscale");
  const [preset, setPreset] = useState("performance");
  const scale = PRESETS.find((p) => p.id === preset)!.scale;
  const m = model(mode, scale);
  const native = model("native", 1);
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const iv = setInterval(() => setTick((t) => t + 1), 450);
    return () => clearInterval(iv);
  }, [reduce]);

  // Pixel grid: 12x12 output pixels; rendered ones form an evenly spaced subset.
  const N = 12;
  const renderedN = mode === "native" ? N : Math.round(N * scale);
  const isRendered = (i: number) => {
    if (renderedN === N) return true;
    return Array.from({ length: renderedN }, (_, k) => Math.floor((k * N) / renderedN)).includes(i);
  };

  // Timeline: 14 display slots. With frame generation every other slot is generated.
  const SLOTS = 14;
  const slots = Array.from({ length: SLOTS }, (_, i) => (mode === "framegen" ? (i % 2 === 0 ? "rendered" : "generated") : "rendered"));
  const active = tick % SLOTS;

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>Upscaling & frame generation — 4K output</Kicker>
        <ApproxBadge label="Illustrative model, not a benchmark" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Segmented size="sm" value={mode} onChange={setMode} options={[
          { value: "native", label: "Native 4K" },
          { value: "upscale", label: "Upscaling" },
          { value: "framegen", label: "Upscaling + frame gen" },
        ]} />
        {mode !== "native" && (
          <Segmented size="sm" value={preset} onChange={setPreset} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <div className="mb-2 text-xs text-dim">A patch of the output image</div>
          <div className="grid aspect-square max-w-[300px] gap-[3px]" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
            {Array.from({ length: N * N }, (_, idx) => {
              const r = Math.floor(idx / N), c = idx % N;
              const rendered = isRendered(r) && isRendered(c);
              return (
                <motion.div
                  key={idx}
                  layout={false}
                  animate={{ opacity: rendered ? 1 : 0.55 }}
                  className="rounded-[2px]"
                  style={{
                    background: rendered ? "var(--k-gpu)" : "transparent",
                    border: rendered ? "none" : "1px dashed color-mix(in oklab, var(--k-accel) 70%, transparent)",
                  }}
                />
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-k-gpu" /> Shaded by the GPU</span>
            {mode !== "native" && <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] border border-dashed border-k-accel" /> Reconstructed by the upscaler</span>}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {mode === "native"
              ? "Every one of ~8.3 million pixels is shaded each frame."
              : `The GPU shades ${Math.round(m.s * 3840)}×${Math.round(m.s * 2160)} ≈ ${(m.pixels / 1e6).toFixed(1)} M pixels (${Math.round(m.s * m.s * 100)}% of 4K). The upscaler reconstructs the rest using motion vectors, previous frames and — in ML-based upscalers — a trained network.`}
          </p>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Rendered fps" value={Math.round(m.renderedFps)} hint={`native: ${Math.round(native.renderedFps)}`} />
            <Stat label="Displayed fps" value={Math.round(m.displayedFps)} hint={mode === "framegen" ? "includes generated frames" : "= rendered"} />
            <Stat label="Input latency" value={`~${Math.round(m.latency)} ms`} hint={`native: ~${Math.round(native.latency)} ms`} />
          </div>
          <div className="mt-5">
            <div className="mb-2 text-xs text-dim">Frames sent to the display</div>
            <div className="flex gap-1">
              {slots.map((s, i) => (
                <div key={i} className="relative flex-1">
                  <div
                    className={clsx("h-10 rounded-md transition-all", i === active && "ring-2 ring-fg")}
                    style={
                      s === "rendered"
                        ? { background: "var(--k-gpu)" }
                        : { border: "1.5px dashed var(--k-accel)", background: "color-mix(in oklab, var(--k-accel) 12%, transparent)" }
                    }
                  />
                  {s === "rendered" && <div className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-fg" title="input sampled" />}
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-k-gpu" /> Rendered by the game</span>
              {mode === "framegen" && <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] border border-dashed border-k-accel" /> Generated in between</span>}
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-fg" /> Your input is read</span>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {mode === "framegen"
              ? "Generated frames make motion look smoother, but the game only reads your input on rendered frames — and has to hold a frame back to interpolate. Responsiveness doesn't improve, and can get slightly worse. It works best when the base frame rate is already decent."
              : mode === "upscale"
                ? "Fewer shaded pixels means each frame finishes sooner, so more real frames — with real input — reach the screen. Image quality depends on the upscaler, the preset and the game's implementation."
                : "Native rendering is the quality reference, but every pixel costs GPU time."}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto scroll-thin">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {["Technology", "How it works (conceptually)", "Runs on"].map((h) => (
                <th key={h} className="py-2 pr-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {UPSCALERS.map((u) => (
              <tr key={u.name} className="border-b border-line last:border-b-0">
                <td className="py-2.5 pr-4 font-medium" style={{ color: COMPANY_VAR[u.company] }}>{u.name}</td>
                <td className="py-2.5 pr-4 text-muted">{u.how}</td>
                <td className="py-2.5 text-muted">{u.runsOn}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-dim">Each requires the game to integrate it. Quality differs by version, preset and title — compare in the games you play.</p>
      </div>
    </Panel>
  );
}

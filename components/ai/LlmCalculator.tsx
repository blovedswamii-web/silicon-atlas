"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import {
  BANDWIDTH_CLASSES,
  COMPUTE_CLASSES,
  CONTEXT_OPTIONS,
  KV_PRECISIONS,
  MEMORY_TARGETS,
  MODEL_PRESETS,
  RUNTIMES,
  SUPPORT_LABEL,
  WEIGHT_PRECISIONS,
  overheadGB,
  shapeFor,
  type MemoryTarget,
  type Support,
} from "@/data/llm";
import { ApproxBadge, COMPANY_NAME, COMPANY_VAR, Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";

const GB = 1e9;
const OFFLOAD_SYSRAM_GBPS = 80; // dual-channel DDR5, representative

type Status = "fits" | "tight" | "no";

function statusFor(need: number, t: MemoryTarget): Status {
  if (need <= t.usableGB * 0.9) return "fits";
  if (need <= t.usableGB) return "tight";
  return "no";
}

const STATUS_STYLE: Record<Status, { label: string; color: string }> = {
  fits: { label: "Fits", color: "var(--good)" },
  tight: { label: "Tight", color: "var(--warn)" },
  no: { label: "Doesn't fit", color: "var(--bad)" },
};

function fmtGB(v: number) {
  return v >= 100 ? v.toFixed(0) : v.toFixed(1);
}

function fmtCtx(n: number) {
  return n >= 1024 ? `${Math.round(n / 1024)}K` : `${n}`;
}

export function LlmCalculator() {
  const [size, setSize] = useState<string>("14b");
  const [custom, setCustom] = useState(24);
  const [prec, setPrec] = useState("q4");
  const [ctx, setCtx] = useState(8192);
  const [kvp, setKvp] = useState<string>("fp16");
  const [targetId, setTargetId] = useState("vram-16");
  const [bwId, setBwId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(4000);
  const [computeId, setComputeId] = useState("mid");

  const params = size === "custom" ? custom : MODEL_PRESETS.find((p) => p.id === size)!.params;
  const shape = shapeFor(params);
  const precision = WEIGHT_PRECISIONS.find((p) => p.id === prec)!;
  const kvBytes = KV_PRECISIONS.find((k) => k.id === kvp)!.bytes;

  const weightsGB = (params * 1e9 * precision.bits) / 8 / GB;
  const kvPerToken = 2 * shape.layers * shape.kvHeads * shape.headDim * kvBytes; // bytes
  const kvGB = (kvPerToken * ctx) / GB;
  const overhead = overheadGB(weightsGB);
  const total = weightsGB + kvGB + overhead;

  const target = MEMORY_TARGETS.find((t) => t.id === targetId)!;
  const bwOptions = BANDWIDTH_CLASSES.filter((b) => b.kind === target.kind);
  const bw = bwOptions.find((b) => b.id === bwId) ?? bwOptions[target.kind === "vram" ? 0 : Math.min(2, bwOptions.length - 1)];

  // Decode: every new token reads (roughly) all weights plus the KV cache so far.
  const bytesPerToken = (weightsGB + kvGB) * GB;
  const st = statusFor(total, target);
  const fitCeiling = (bw.gbps * GB) / bytesPerToken;
  const offload = target.kind === "vram" && st === "no";
  const onGpu = Math.max(0, target.usableGB - overhead - kvGB); // GB of weights that fit
  const spill = Math.max(0, weightsGB - onGpu);
  const offloadCeiling = offload
    ? 1 / ((onGpu + kvGB) / bw.gbps + spill / OFFLOAD_SYSRAM_GBPS)
    : null;
  const unifiedOver = target.kind === "unified" && st === "no";

  const compute = COMPUTE_CLASSES.find((c) => c.id === computeId)!;
  const prefillTflop = (2 * params * 1e9 * prompt) / 1e12;
  const prefillSec = prefillTflop / compute.tflops;

  const scaleMax = Math.max(128, total * 1.1);

  return (
    <div className="space-y-5">
      {/* --------------------------------------------------- inputs + result */}
      <Panel className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Kicker>1 · Choose a model</Kicker>
          <ApproxBadge />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Parameters">
            <Segmented
              size="sm"
              ariaLabel="Model size"
              value={size}
              onChange={setSize}
              options={[...MODEL_PRESETS.map((p) => ({ value: p.id, label: `${p.params}B` })), { value: "custom", label: "Custom" }]}
            />
            {size === "custom" && (
              <div className="mt-2 flex items-center gap-3">
                <input type="range" min={1} max={235} value={custom} onChange={(e) => setCustom(+e.target.value)} className="w-48 accent-[var(--accent)]" />
                <span className="font-mono text-sm text-fg">{custom}B</span>
              </div>
            )}
          </Field>
          <Field label="Weight precision">
            <Segmented size="sm" ariaLabel="Weight precision" value={prec} onChange={setPrec} options={WEIGHT_PRECISIONS.map((p) => ({ value: p.id, label: p.label }))} />
            <p className="mt-1.5 text-xs text-dim">{precision.note}</p>
          </Field>
          <Field label="Context length (tokens kept in memory)">
            <Segmented size="sm" ariaLabel="Context" value={String(ctx)} onChange={(v) => setCtx(+v)} options={CONTEXT_OPTIONS.map((c) => ({ value: String(c), label: fmtCtx(c) }))} />
          </Field>
          <Field label="KV cache precision">
            <Segmented size="sm" ariaLabel="KV cache precision" value={kvp} onChange={setKvp} options={KV_PRECISIONS.map((k) => ({ value: k.id, label: k.label }))} />
          </Field>
        </div>

        <div className="mt-6 rounded-xl border border-line bg-panel-2 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-sm text-muted">
              <span className="font-mono text-fg">{params}B</span> × <span className="font-mono text-fg">{(precision.bits / 8).toFixed(precision.bits % 8 ? 2 : 0)} bytes</span> ≈{" "}
              <span className="font-mono text-fg">{fmtGB(weightsGB)} GB</span> of weights
            </div>
            <div className="text-sm">
              Total ≈ <span className="font-mono text-xl font-semibold text-fg">{fmtGB(total)} GB</span>
            </div>
          </div>
          <div className="mt-3 flex h-5 overflow-hidden rounded-md">
            <BarSeg value={weightsGB} total={total} color="var(--k-gpu)" />
            <BarSeg value={kvGB} total={total} color="var(--k-accel)" />
            <BarSeg value={overhead} total={total} color="var(--k-interconnect)" />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-dim">
            <Key color="var(--k-gpu)" label={`Weights ${fmtGB(weightsGB)} GB`} />
            <Key color="var(--k-accel)" label={`KV cache ${fmtGB(kvGB)} GB`} />
            <Key color="var(--k-interconnect)" label={`Runtime overhead ~${fmtGB(overhead)} GB`} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-dim">
            KV cache assumes a representative grouped-query-attention shape for this size: {shape.layers} layers × {shape.kvHeads} KV heads ×{" "}
            {shape.headDim} dims × 2 (keys and values) × {kvBytes} byte{kvBytes > 1 ? "s" : ""} ≈ {(kvPerToken / 1024).toFixed(0)} KB per token. Real
            models differ; overhead is a rough allowance for buffers and the runtime.
          </p>
        </div>
      </Panel>

      {/* --------------------------------------------------- capacity */}
      <Panel className="p-4 sm:p-6">
        <Kicker color="var(--k-memory)">2 · Capacity — will it fit?</Kicker>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Capacity decides <strong className="text-fg">whether</strong> the model can live in fast memory. It says nothing about speed. Click a row to
          use it in the panels below.
        </p>
        <div className="mt-4 space-y-1.5">
          {MEMORY_TARGETS.map((t) => {
            const s = statusFor(total, t);
            const active = t.id === targetId;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTargetId(t.id);
                  setBwId(null);
                }}
                className={clsx(
                  "grid w-full grid-cols-[88px_minmax(0,1fr)_72px] items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors sm:grid-cols-[130px_minmax(0,1fr)_110px]",
                  active ? "border-line-strong bg-panel-2" : "border-transparent hover:bg-panel-2",
                )}
              >
                <span className="text-sm text-fg">
                  {t.label}
                  <span className="block font-mono text-[10px] uppercase tracking-wider" style={{ color: t.kind === "vram" ? "var(--k-vram)" : "var(--k-memory)" }}>
                    {t.kind === "vram" ? "dedicated VRAM" : "unified"}
                  </span>
                </span>
                <span className="relative h-3 rounded-full bg-panel-3">
                  <span className="absolute inset-y-0 left-0 rounded-full opacity-25" style={{ width: `${(t.capacityGB / scaleMax) * 100}%`, background: t.kind === "vram" ? "var(--k-vram)" : "var(--k-memory)" }} />
                  <span className="absolute inset-y-0 left-0 rounded-full opacity-50" style={{ width: `${(t.usableGB / scaleMax) * 100}%`, background: t.kind === "vram" ? "var(--k-vram)" : "var(--k-memory)" }} />
                  <span className="absolute -top-0.5 h-4 w-0.5 rounded bg-[var(--fg)]" style={{ left: `${Math.min(100, (total / scaleMax) * 100)}%` }} title="Model needs" />
                </span>
                <span className="text-right font-mono text-xs" style={{ color: STATUS_STYLE[s].color }}>
                  {STATUS_STYLE[s].label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-dim">
          <span>Light bar = total capacity · darker = realistically usable by the GPU · white tick = what this model needs</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-line p-4 text-sm leading-relaxed text-muted">
            <div className="text-xs font-semibold text-fg">{target.label}: usable ≈ {fmtGB(target.usableGB)} GB</div>
            <p className="mt-1 text-xs">{target.usableNote}</p>
          </div>
          <div
            className="rounded-xl border p-4 text-sm leading-relaxed text-muted"
            style={{ borderColor: `color-mix(in oklab, ${STATUS_STYLE[st].color} 35%, var(--line))` }}
          >
            <div className="text-xs font-semibold" style={{ color: STATUS_STYLE[st].color }}>
              {STATUS_STYLE[st].label}
            </div>
            <p className="mt-1 text-xs">
              {st === "fits" && "The whole model and its cache sit in memory the GPU can read at full speed, with some headroom."}
              {st === "tight" &&
                "It fits with little headroom. Longer contexts, other apps, or a display attached to the GPU could push it over."}
              {offload &&
                `About ${fmtGB(spill)} GB of weights would have to stay in system RAM. Runtimes like llama.cpp can split layers between GPU and CPU, but those layers run at system-memory speed — usually a large slowdown.`}
              {unifiedOver &&
                (total > target.capacityGB
                  ? "More than the machine's entire memory: the OS would swap to SSD, which is impractically slow. Pick a smaller model or lower precision."
                  : "Exceeds the GPU's default share of unified memory. It may be possible to raise the limit, but the OS and other apps also need room — expect memory pressure.")}
            </p>
          </div>
        </div>
      </Panel>

      {/* --------------------------------------------------- bandwidth + compute */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-4 sm:p-6">
          <Kicker color="var(--k-cache)">3 · Memory bandwidth — how fast can it talk?</Kicker>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Generating each token reads essentially every weight once. So a hard upper bound is <span className="font-mono text-fg">bandwidth ÷ bytes per token</span>.
          </p>
          <div className="mt-3">
            <div className="mb-1.5 text-xs text-dim">Bandwidth class for {target.kind === "vram" ? "a discrete GPU" : "unified memory"}</div>
            <div className="flex flex-col gap-1">
              {bwOptions.map((b) => (
                <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                  <input type="radio" name="bw" checked={b.id === bw.id} onChange={() => setBwId(b.id)} className="accent-[var(--accent)]" />
                  {b.label} <span className="font-mono text-xs text-dim">{b.range}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Big label="Theoretical ceiling if it fits" value={`${fitCeiling < 10 ? fitCeiling.toFixed(1) : fitCeiling.toFixed(0)} tok/s`} />
            {offloadCeiling !== null ? (
              <Big label={`With ${fmtGB(spill)} GB offloaded to DDR5`} value={`${offloadCeiling.toFixed(1)} tok/s`} color="var(--bad)" />
            ) : (
              <Big label="Bytes read per token" value={`${fmtGB(bytesPerToken / GB)} GB`} />
            )}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-dim">
            Real speeds are typically well below the ceiling (often roughly half to four-fifths of it) depending on the runtime, kernels and
            batch size. This is an upper bound to build intuition — <strong className="text-muted">not a prediction</strong>.
          </p>
        </Panel>

        <Panel className="p-4 sm:p-6">
          <Kicker color="var(--k-gpu)">4 · Compute — reading your prompt</Kicker>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Before the first output token, the model processes the whole prompt at once (&ldquo;prefill&rdquo;). That is big matrix math, so it is{" "}
            <strong className="text-fg">compute-bound</strong>: ≈ 2 × parameters × prompt tokens operations.
          </p>
          <label className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            Prompt
            <input type="range" min={200} max={32000} step={200} value={prompt} onChange={(e) => setPrompt(+e.target.value)} className="w-40 accent-[var(--accent)]" />
            <span className="font-mono text-fg">{prompt.toLocaleString()} tokens</span>
          </label>
          <div className="mt-3">
            <Segmented size="sm" ariaLabel="Compute class" value={computeId} onChange={setComputeId} options={COMPUTE_CLASSES.map((c) => ({ value: c.id, label: c.label }))} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Big label="Work for prefill" value={`${prefillTflop.toFixed(0)} TFLOP`} />
            <Big label={`At ~${compute.tflops} effective TFLOPS`} value={prefillSec < 1 ? `${(prefillSec * 1000).toFixed(0)} ms` : `${prefillSec.toFixed(1)} s`} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-dim">
            Effective throughputs are illustrative classes, not products. Attention adds extra cost that grows with context length. This is why a
            system with lots of memory but modest compute can generate tokens reasonably yet take a long time to read a long document.
          </p>
        </Panel>
      </div>

      {/* --------------------------------------------------- software */}
      <Panel className="p-4 sm:p-6">
        <Kicker color="var(--k-software)">5 · Software — will it run well at all?</Kicker>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          The same hardware can be fast or unusable depending on the runtime. Support changes quickly — check each project&apos;s documentation for your
          exact GPU and OS.
        </p>
        <div className="scroll-thin mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-3 font-mono text-[10.5px] font-normal uppercase tracking-wider text-dim">Runtime</th>
                {(["nvidia", "apple", "amd", "intel"] as const).map((v) => (
                  <th key={v} className="px-2 py-2 font-mono text-[10.5px] font-normal uppercase tracking-wider" style={{ color: COMPANY_VAR[v] }}>
                    {COMPANY_NAME[v]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RUNTIMES.map((r) => (
                <tr key={r.name} className="border-t border-line align-top">
                  <td className="py-2.5 pr-3">
                    <div className="text-fg">{r.name}</div>
                    <div className="text-xs text-dim">{r.what}</div>
                  </td>
                  {(["nvidia", "apple", "amd", "intel"] as const).map((v) => (
                    <td key={v} className="px-2 py-2.5">
                      <SupportChip s={r.support[v]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-dim">Snapshot of the general landscape, simplified. &ldquo;Limited&rdquo; can mean experimental backends, CPU-only paths or a subset of GPUs.</p>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Capacity", "decides if it runs on the GPU at all.", "var(--k-memory)"],
          ["Bandwidth", "caps how fast tokens come out.", "var(--k-cache)"],
          ["Compute", "decides how fast long prompts are read.", "var(--k-gpu)"],
          ["Software", "decides whether the hardware gets used well.", "var(--k-software)"],
        ].map(([t, d, c]) => (
          <div key={t} className="rounded-xl border border-line bg-panel p-4">
            <div className="text-sm font-semibold" style={{ color: c }}>
              {t}
            </div>
            <div className="mt-1 text-sm text-muted">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs text-dim">{label}</div>
      {children}
    </div>
  );
}

function BarSeg({ value, total, color }: { value: number; total: number; color: string }) {
  return <div className="h-full transition-[width] duration-500" style={{ width: `${(value / total) * 100}%`, background: color }} />;
}

function Key({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function Big({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel-2 p-3">
      <div className="text-[11px] leading-tight text-dim">{label}</div>
      <div className="mt-1 font-mono text-xl font-semibold tabular-nums" style={{ color: color ?? "var(--fg)" }}>
        {value}
      </div>
    </div>
  );
}

function SupportChip({ s }: { s: Support }) {
  const color = { first: "var(--good)", yes: "var(--accent)", partial: "var(--warn)", no: "var(--fg-dim)" }[s];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {SUPPORT_LABEL[s]}
    </span>
  );
}

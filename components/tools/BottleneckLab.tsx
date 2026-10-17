"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  APPLE_TIERS,
  CPU_TIERS,
  GPU_TIERS,
  LAB_PLATFORMS,
  LAB_WORKLOADS,
  LLM_SIZES,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  SUBSYSTEM_FIX,
  SUBSYSTEM_LABEL,
  type LabPlatformId,
  type LabWorkloadId,
  type Subsystem,
} from "@/data/bottleneck";
import { ApproxBadge, COMPANY_VAR, Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { evaluate, severity, type LabConfig, type LabResult } from "./bottleneckEngine";
import { Chips, Field, Select } from "./controls";

const ORDER: Subsystem[] = ["cpuSingle", "cpuMulti", "gpu", "memCapacity", "bandwidth", "storage", "software", "power"];

const DEFAULT: LabConfig = {
  platform: "amd-nvidia",
  formFactor: "desktop",
  cpuTier: "mid",
  gpuTier: "upper16",
  ramGB: 32,
  storage: "nvme4",
  appleTier: "pro",
  appleMemGB: 48,
  workload: "gaming4k",
  llmSize: "32b",
};

/** Keep tier selections valid when the platform changes. */
function normalise(cfg: LabConfig): LabConfig {
  const p = LAB_PLATFORMS.find((x) => x.id === cfg.platform)!;
  const next = { ...cfg };
  if (!p.unified) {
    const cpus = CPU_TIERS.filter((c) => c.vendors.includes(p.cpuVendor));
    if (!cpus.some((c) => c.id === next.cpuTier)) next.cpuTier = cpus[1]?.id ?? cpus[0].id;
    const gpus = GPU_TIERS.filter((g) => g.vendors.includes(p.gpuVendor));
    if (!gpus.some((g) => g.id === next.gpuTier)) next.gpuTier = gpus[gpus.length > 1 ? 1 : 0].id;
  } else {
    const t = APPLE_TIERS.find((a) => a.id === next.appleTier)!;
    if (!t.memoryOptions.includes(next.appleMemGB)) next.appleMemGB = t.memoryOptions[1] ?? t.memoryOptions[0];
    if (t.id === "ultra") next.formFactor = "desktop";
  }
  return next;
}

export function BottleneckLab({ compact = false }: { compact?: boolean }) {
  const [cfg, setCfg] = useState<LabConfig>(DEFAULT);
  const set = <K extends keyof LabConfig>(k: K, v: LabConfig[K]) => setCfg((c) => normalise({ ...c, [k]: v }));
  const platform = LAB_PLATFORMS.find((p) => p.id === cfg.platform)!;
  const wl = LAB_WORKLOADS.find((w) => w.id === cfg.workload)!;
  const result = useMemo(() => evaluate(cfg), [cfg]);

  useEffect(() => setCfg((c) => normalise(c)), []);

  const cpuOptions = CPU_TIERS.filter((c) => c.vendors.includes(platform.cpuVendor));
  const gpuOptions = GPU_TIERS.filter((g) => g.vendors.includes(platform.gpuVendor));
  const appleTier = APPLE_TIERS.find((a) => a.id === cfg.appleTier)!;

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <Kicker>Bottleneck Lab</Kicker>
        <ApproxBadge label="EDUCATIONAL APPROXIMATION — representative tiers, not benchmarks" />
      </div>
      <div className={compact ? "grid gap-0" : "grid gap-0 lg:grid-cols-[340px_minmax(0,1fr)]"}>
        {/* ----------------------------------------------------------- config */}
        <div className="space-y-5 border-b border-line p-5 lg:border-b-0 lg:border-r">
          <Field label="1 · Platform">
            <Chips
              size="sm"
              value={cfg.platform}
              onChange={(v) => set("platform", v as LabPlatformId)}
              options={LAB_PLATFORMS.map((p) => ({
                value: p.id,
                label: p.label,
                color: COMPANY_VAR[p.gpuVendor],
              }))}
            />
          </Field>
          {!compact && (
            <Field label="Form factor">
              <Segmented
                size="sm"
                value={cfg.formFactor}
                onChange={(v) => set("formFactor", v)}
                options={[
                  { value: "desktop", label: "Desktop" },
                  { value: "laptop", label: platform.unified && cfg.appleTier === "ultra" ? "Laptop (n/a)" : "Laptop" },
                ]}
              />
            </Field>
          )}
          {platform.unified ? (
            <div className="grid grid-cols-2 gap-3">
              <Field asLabel label="Chip tier">
                <Select value={cfg.appleTier} onChange={(v) => set("appleTier", v)} options={APPLE_TIERS.map((a) => ({ value: a.id, label: a.label }))} />
              </Field>
              <Field asLabel label="Unified memory">
                <Select
                  value={cfg.appleMemGB}
                  onChange={(v) => set("appleMemGB", v)}
                  options={appleTier.memoryOptions.map((m) => ({ value: m, label: `${m} GB` }))}
                />
              </Field>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field asLabel label="CPU tier">
                <Select value={cfg.cpuTier} onChange={(v) => set("cpuTier", v)} options={cpuOptions.map((c) => ({ value: c.id, label: c.label }))} />
              </Field>
              <Field asLabel label="GPU tier">
                <Select value={cfg.gpuTier} onChange={(v) => set("gpuTier", v)} options={gpuOptions.map((g) => ({ value: g.id, label: g.label }))} />
              </Field>
              {!compact && (
                <>
                  <Field asLabel label="System RAM">
                    <Select value={cfg.ramGB} onChange={(v) => set("ramGB", v)} options={RAM_OPTIONS.map((r) => ({ value: r, label: `${r} GB` }))} />
                  </Field>
                  <Field asLabel label="Storage">
                    <Select value={cfg.storage} onChange={(v) => set("storage", v)} options={STORAGE_OPTIONS.map((s) => ({ value: s.id, label: s.label }))} />
                  </Field>
                </>
              )}
            </div>
          )}
          <Field label="2 · Workload">
            <Chips
              size="sm"
              value={cfg.workload}
              onChange={(v) => set("workload", v as LabWorkloadId)}
              options={LAB_WORKLOADS.map((w) => ({ value: w.id, label: w.label }))}
            />
          </Field>
          {cfg.workload === "llm" && (
            <Field label="Model size">
              <Segmented size="sm" value={cfg.llmSize} onChange={(v) => set("llmSize", v)} options={LLM_SIZES.map((s) => ({ value: s.id, label: s.label }))} />
            </Field>
          )}
        </div>

        {/* ---------------------------------------------------------- results */}
        <div className="min-w-0 p-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <MiniSystem unified={platform.unified} result={result} labels={platformLabels(cfg)} />
            <div className="space-y-2.5">
              {ORDER.map((s) => {
                const p = result.pressure[s];
                const sev = severity(p);
                const top = s === result.limiter || s === result.coLimiter;
                return (
                  <div key={s} className={top ? "rounded-lg bg-panel-2 px-2 py-1.5 -mx-2" : "px-0 py-0"}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className={top ? "font-medium text-fg" : "text-muted"}>{SUBSYSTEM_LABEL[s]}</span>
                      <span className="font-mono text-[10.5px]" style={{ color: sev.color }}>
                        {sev.label}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-panel-3">
                      <motion.div
                        className="h-full rounded-full"
                        initial={false}
                        animate={{ width: `${p * 10}%`, background: sev.color }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-line bg-panel-2 p-4">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: severity(result.pressure[result.limiter]).color }}>
              Most likely limiter
            </div>
            <div className="mt-1 text-lg font-semibold text-fg">
              {SUBSYSTEM_LABEL[result.limiter]}
              {result.coLimiter && <span className="text-muted"> + {SUBSYSTEM_LABEL[result.coLimiter]}</span>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {limiterWhy(result.limiter, wl.why, wl.software[platform.gpuVendor].why)}
            </p>
            {result.coLimiter && (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {limiterWhy(result.coLimiter, wl.why, wl.software[platform.gpuVendor].why)}
              </p>
            )}
            <p className="mt-3 text-sm text-dim">
              <span className="text-muted">What would move the limit: </span>
              {SUBSYSTEM_FIX[result.limiter]}
            </p>
          </div>

          {(result.notes.length > 0 || result.tokensCeiling !== undefined || result.gpuMemNeedGB > 0) && (
            <ul className="mt-4 space-y-1.5 text-sm text-muted">
              {result.gpuMemNeedGB > 0 && (
                <li>
                  GPU-accessible memory: needs ~{result.gpuMemNeedGB} GB, has ~{Math.round(result.gpuMemHaveGB)} GB
                  {platform.unified ? " (default share of unified memory)" : " VRAM"} —{" "}
                  <span style={{ color: result.fits ? "var(--good)" : "var(--bad)" }}>{result.fits ? "fits" : "does not fit"}</span>.
                </li>
              )}
              {result.tokensCeiling !== undefined && (
                <li>
                  Theoretical generation ceiling ≈ {Math.round(result.effectiveBandwidth)} GB/s ÷{" "}
                  {LLM_SIZES.find((s) => s.id === cfg.llmSize)!.gb} GB ≈{" "}
                  <span className="font-mono text-fg">{Math.round(result.tokensCeiling)} tokens/s</span> upper bound. Real speeds are lower.
                </li>
              )}
              {result.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}

          {!compact && (
            <details className="mt-5 text-sm text-dim">
              <summary className="cursor-pointer text-muted hover:text-fg">How this estimate works</summary>
              <p className="mt-2 leading-relaxed">
                Each workload has a demand (0–10) for each subsystem; each configuration has a representative capability. Pressure
                rises as demand outgrows capability. Memory capacity is a hard threshold: if data doesn’t fit, the lab shows the
                spill to slower memory. Software support reflects how mature each vendor’s drivers, APIs and frameworks are for that
                workload. Real systems shift bottlenecks moment to moment and vary by specific product, game, driver and settings —
                use this to build intuition, then check benchmarks.
              </p>
            </details>
          )}
        </div>
      </div>
    </Panel>
  );
}

function limiterWhy(s: Subsystem, why: Partial<Record<Subsystem, string>>, swWhy: string) {
  if (s === "software") return swWhy;
  if (why[s]) return why[s]!;
  const generic: Record<Subsystem, string> = {
    cpuSingle: "Some part of this workload waits on one fast thread.",
    cpuMulti: "This workload keeps many cores busy, and this CPU tier has fewer or lower-power cores.",
    gpu: "The GPU's execution units are busy most of the time.",
    memCapacity: "The working set is close to — or over — the memory available.",
    bandwidth: "Data can't be delivered to the compute units fast enough.",
    storage: "Reading or writing files is a noticeable part of the time spent.",
    software: swWhy,
    power: "Sustained load runs into the power and cooling budget, so clocks settle lower than peak.",
  };
  return generic[s];
}

function platformLabels(cfg: LabConfig) {
  const p = LAB_PLATFORMS.find((x) => x.id === cfg.platform)!;
  if (p.unified) {
    const t = APPLE_TIERS.find((a) => a.id === cfg.appleTier)!;
    return { cpu: "CPU cores", gpu: "GPU cores", mem: `${cfg.appleMemGB} GB unified`, soc: t.label };
  }
  const g = GPU_TIERS.find((x) => x.id === cfg.gpuTier)!;
  return { cpu: `${p.cpuVendor === "amd" ? "AMD" : "Intel"} CPU`, gpu: `${{ nvidia: "NVIDIA", amd: "AMD", intel: "Intel", apple: "" }[p.gpuVendor]} GPU`, mem: `${g.vramGB} GB VRAM`, ram: `${cfg.ramGB} GB RAM`, soc: "" };
}

/** Small system diagram with each block tinted by its pressure. */
function MiniSystem({
  unified,
  result,
  labels,
}: {
  unified: boolean;
  result: LabResult;
  labels: { cpu: string; gpu: string; mem: string; ram?: string; soc: string };
}) {
  const P = result.pressure;
  const cpuP = Math.max(P.cpuSingle, P.cpuMulti);
  const memP = Math.max(P.memCapacity, P.bandwidth);
  const isLim = (subs: Subsystem[]) => subs.includes(result.limiter) || (!!result.coLimiter && subs.includes(result.coLimiter));

  const Block = ({
    x, y, w, h, label, sub, p, lim,
  }: { x: number; y: number; w: number; h: number; label: string; sub?: string; p: number; lim: boolean }) => {
    const col = severity(p).color;
    return (
      <g>
        {lim && (
          <motion.rect
            x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={12}
            fill="none" stroke={col} strokeWidth={1.5}
            animate={{ opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
        <rect x={x} y={y} width={w} height={h} rx={9} fill={`color-mix(in oklab, ${col} 14%, var(--panel-2))`} stroke={`color-mix(in oklab, ${col} 55%, var(--line))`} />
        <text x={x + w / 2} y={y + h / 2 - (sub ? 3 : -4)} textAnchor="middle" className="diagram-text" fontSize={12} fontWeight={600}>
          {label}
        </text>
        {sub && (
          <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" className="diagram-mono" fontSize={9.5}>
            {sub}
          </text>
        )}
      </g>
    );
  };

  const line = (d: string, key: string) => <path key={key} d={d} stroke="var(--line-strong)" strokeWidth={2} fill="none" />;

  return (
    <div className="rounded-xl border border-line bg-bg-elev p-2">
      <svg viewBox="0 0 360 250" className="h-auto w-full" role="img" aria-label="System diagram tinted by pressure">
        {unified ? (
          <>
            <rect x={20} y={14} width={320} height={120} rx={14} fill="none" stroke="var(--line-strong)" strokeDasharray="4 4" />
            <text x={32} y={30} className="diagram-mono" fontSize={9.5}>{labels.soc} · SoC package</text>
            {line("M180 134 V158", "a")}
            {line("M300 190 H316 V232 H180", "b")}
            <Block x={36} y={42} w={130} h={78} label="CPU" sub="P + E cores" p={cpuP} lim={isLim(["cpuSingle", "cpuMulti"])} />
            <Block x={194} y={42} w={130} h={78} label="GPU" sub="+ Neural / media" p={P.gpu} lim={isLim(["gpu"])} />
            <Block x={60} y={158} w={240} h={50} label="Unified memory" sub={labels.mem} p={memP} lim={isLim(["memCapacity", "bandwidth"])} />
            <Block x={20} y={216} w={110} h={30} label="SSD" p={P.storage} lim={isLim(["storage"])} />
            <Block x={230} y={216} w={110} h={30} label="Power/thermal" p={P.power} lim={isLim(["power"])} />
          </>
        ) : (
          <>
            {line("M95 82 V128", "a")}
            {line("M160 50 H200", "b")}
            {line("M265 82 V128", "c")}
            {line("M95 175 V200", "d")}
            <text x={180} y={44} textAnchor="middle" className="diagram-mono" fontSize={9}>PCIe</text>
            <Block x={30} y={18} w={130} h={64} label={labels.cpu} sub="cores + cache" p={cpuP} lim={isLim(["cpuSingle", "cpuMulti"])} />
            <Block x={200} y={18} w={130} h={64} label={labels.gpu} p={P.gpu} lim={isLim(["gpu"])} />
            <Block x={30} y={128} w={130} h={47} label="System RAM" sub={labels.ram} p={result.gpuMemNeedGB === 0 ? memP : P.memCapacity * 0.6} lim={false} />
            <Block x={200} y={128} w={130} h={47} label="VRAM" sub={labels.mem} p={result.gpuMemNeedGB === 0 ? 2 : memP} lim={isLim(["memCapacity", "bandwidth"])} />
            <Block x={30} y={200} w={130} h={40} label="SSD" p={P.storage} lim={isLim(["storage"])} />
            <Block x={200} y={200} w={130} h={40} label="PSU / cooling" p={P.power} lim={isLim(["power"])} />
          </>
        )}
      </svg>
    </div>
  );
}

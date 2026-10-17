"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { FlowStep, Platform, Workload } from "@/data/schema";
import { PLATFORMS, getPlatform } from "@/data/platforms";
import { WORKLOADS, getWorkload } from "@/data/workloads";
import { ArchDiagram, DiagramLegend } from "@/components/architecture/ArchDiagram";
import { PlatformPicker } from "@/components/architecture/PlatformPicker";
import { ApproxBadge, Callout, Kicker, Meter, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { STEP_COLOR, STEP_LABEL, fill, resolveFlow, stepsFor } from "@/lib/flow";
import { WorkloadIcon } from "./icons";

const STEP_MS = 3600;

const DEMAND_LABELS: { key: keyof Workload["demands"]; label: string; color: string }[] = [
  { key: "cpuSingle", label: "CPU single-thread", color: "var(--k-cpu)" },
  { key: "cpuMulti", label: "CPU multi-thread", color: "var(--k-cpu)" },
  { key: "gpuRaster", label: "GPU graphics", color: "var(--k-gpu)" },
  { key: "gpuCompute", label: "GPU compute", color: "var(--k-gpu)" },
  { key: "matrix", label: "Matrix / AI units", color: "var(--k-accel)" },
  { key: "vramCapacity", label: "GPU memory capacity", color: "var(--k-vram)" },
  { key: "memBandwidth", label: "Memory bandwidth", color: "var(--k-memory)" },
  { key: "storage", label: "Storage speed", color: "var(--k-storage)" },
  { key: "media", label: "Media engines", color: "var(--k-accel)" },
  { key: "software", label: "Software support", color: "var(--k-software)" },
];

function StepCaption({
  step,
  platform,
  index,
  total,
  done,
}: {
  step?: FlowStep;
  platform: Platform;
  index: number;
  total: number;
  done: boolean;
}) {
  if (!step) return null;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={done ? "done" : `${platform.id}-${index}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="min-h-[7.5rem]"
      >
        {done ? (
          <div className="text-sm text-muted">
            <span className="font-mono text-[11px] uppercase tracking-wider text-good">Finished</span>
            <p className="mt-1">
              {platform.short} completed this workload in <strong className="text-fg">{total} conceptual steps</strong>. Step count is about
              architecture — not speed.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
              <span className="text-dim">
                Step {index + 1}/{total}
              </span>
              <span style={{ color: STEP_COLOR[step.kind] }}>· {STEP_LABEL[step.kind]}</span>
            </div>
            <div className="mt-1 font-medium text-fg">{fill(step.label, platform)}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{fill(step.detail, platform)}</p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function RunPanel({
  platform,
  workload,
  tick,
  onPick,
  showSteps,
}: {
  platform: Platform;
  workload: Workload;
  tick: number;
  onPick?: (i: number) => void;
  showSteps: boolean;
}) {
  const steps = useMemo(() => stepsFor(workload.steps, platform), [workload, platform]);
  const done = tick >= steps.length;
  const idx = Math.min(tick, steps.length - 1);
  const step = steps[idx];
  const flow = useMemo(
    () => (step && !done ? resolveFlow(platform, step.from, step.to, STEP_COLOR[step.kind], `${workload.id}-${idx}`) : null),
    [step, done, platform, workload.id, idx],
  );
  const note = workload.notes[platform.id] ?? workload.notes[platform.memoryModel];

  return (
    <Panel className="flex min-w-0 flex-col overflow-hidden">
      <div className="scroll-thin overflow-x-auto p-2 sm:p-3">
        <div className="min-w-[560px] sm:min-w-0">
          <ArchDiagram
            platform={platform}
            compact={!showSteps}
            activeNodes={flow?.nodes ?? []}
            activeEdges={flow?.edges ?? []}
            packets={flow?.packet ? [flow.packet] : []}
            pulse={flow?.pulse && step ? { node: flow.pulse, color: STEP_COLOR[step.kind], key: `${platform.id}-${idx}` } : null}
          />
        </div>
      </div>
      <div className="border-t border-line px-4 py-3">
        <StepCaption step={step} platform={platform} index={idx} total={steps.length} done={done} />
      </div>
      <div className="flex gap-1 px-4 pb-3">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => onPick?.(i)}
            aria-label={`Go to step ${i + 1}: ${fill(s.label, platform)}`}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i <= tick ? STEP_COLOR[s.kind] : "var(--panel-3)", opacity: i === idx && !done ? 1 : i < tick ? 0.55 : 1 }}
          />
        ))}
      </div>
      {showSteps && (
        <ol className="border-t border-line px-2 py-2">
          {steps.map((s, i) => (
            <li key={i}>
              <button
                onClick={() => onPick?.(i)}
                className={clsx(
                  "flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                  i === idx && !done ? "bg-panel-2 text-fg" : "text-dim hover:text-muted",
                )}
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: STEP_COLOR[s.kind] }} />
                <span>{fill(s.label, platform)}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      {note && (
        <div className="mt-auto border-t border-line bg-panel-2 px-4 py-3 text-xs leading-relaxed text-muted">
          <span className="font-mono uppercase tracking-wider text-dim">On this platform · </span>
          {note}
        </div>
      )}
    </Panel>
  );
}

export function RunProgram({ defaultWorkload = "llm", embedded = false }: { defaultWorkload?: string; embedded?: boolean }) {
  const [wid, setWid] = useState(defaultWorkload);
  const [mode, setMode] = useState<"single" | "compare">("compare");
  const [a, setA] = useState("apple-silicon");
  const [b, setB] = useState("amd-nvidia");
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Read shareable state from the URL once (?w=llm&a=apple-silicon&b=amd-nvidia).
  useEffect(() => {
    if (embedded) return;
    const q = new URLSearchParams(window.location.search);
    const w = q.get("w");
    if (w && getWorkload(w)) setWid(w);
    const qa = q.get("a");
    if (qa && getPlatform(qa)) setA(qa);
    const qb = q.get("b");
    if (qb && getPlatform(qb)) setB(qb);
    if (q.get("mode") === "single") setMode("single");
  }, [embedded]);

  useEffect(() => {
    if (embedded) return;
    const q = new URLSearchParams({ w: wid, a, b, mode });
    window.history.replaceState(null, "", `?${q.toString()}`);
  }, [embedded, wid, a, b, mode]);

  const workload = getWorkload(wid) ?? WORKLOADS[0];
  const pa = getPlatform(a) ?? PLATFORMS[0];
  const pb = getPlatform(b) ?? PLATFORMS[0];
  const shown = mode === "compare" ? [pa, pb] : [pa];
  const maxLen = Math.max(...shown.map((p) => stepsFor(workload.steps, p).length));

  useEffect(() => setTick(0), [wid, a, b, mode]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setTick((x) => (x >= maxLen ? 0 : x + 1)), tick >= maxLen ? 2600 : STEP_MS);
    return () => clearTimeout(t);
  }, [playing, tick, maxLen]);

  const pick = (i: number) => {
    setTick(i);
    setPlaying(false);
  };

  return (
    <div>
      {/* Workload chooser */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {WORKLOADS.map((w) => (
          <button
            key={w.id}
            onClick={() => setWid(w.id)}
            aria-pressed={w.id === wid}
            className={clsx(
              "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
              w.id === wid
                ? "border-line-strong bg-panel-3 text-fg"
                : "border-line bg-panel text-muted hover:border-line-strong hover:text-fg",
            )}
          >
            <span className={w.id === wid ? "text-accent" : "text-dim"}>
              <WorkloadIcon name={w.icon} />
            </span>
            <span className="text-sm font-medium">{w.name}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{workload.summary}</p>

      {/* Platform choosers + transport */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "compare", label: "Compare two computers" },
            { value: "single", label: "One computer" },
          ]}
        />
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => pick(Math.max(0, Math.min(tick, maxLen) - 1))}
            className="rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted hover:text-fg"
            aria-label="Previous step"
          >
            ←
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="min-w-[5.5rem] rounded-lg border border-line-strong bg-panel-3 px-3 py-1.5 text-sm font-medium text-fg"
          >
            {playing ? "Pause" : tick >= maxLen ? "Replay" : "Play"}
          </button>
          <button
            onClick={() => pick(Math.min(maxLen, tick + 1))}
            className="rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted hover:text-fg"
            aria-label="Next step"
          >
            →
          </button>
          <button
            onClick={() => {
              setTick(0);
              setPlaying(true);
            }}
            className="rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted hover:text-fg"
          >
            Restart
          </button>
        </div>
      </div>

      <div className={clsx("mt-4 grid gap-4", mode === "compare" && "lg:grid-cols-2")}>
        {shown.map((p, i) => (
          <div key={i} className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Kicker>{mode === "compare" ? `Computer ${i === 0 ? "A" : "B"}` : "Computer"}</Kicker>
            </div>
            <PlatformPicker value={p.id} onChange={i === 0 ? setA : setB} className="mb-3" />
            <RunPanel platform={p} workload={workload} tick={tick} onPick={pick} showSteps={mode === "single"} />
          </div>
        ))}
      </div>
      <DiagramLegend className="mt-3" />

      {/* What changed between the machines */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Kicker>Architecture, answered</Kicker>
            <ApproxBadge label="Conceptual model — not a benchmark" />
          </div>
          <div className="mt-4 space-y-4">
            {(workload.facts ?? []).map((f) => (
              <div key={f.q}>
                <div className="text-sm font-medium text-fg">{f.q}</div>
                <div className={clsx("mt-2 grid gap-2", shown.length > 1 && "sm:grid-cols-2")}>
                  {shown.map((p, i) => (
                    <div key={i} className="rounded-lg border border-line bg-panel-2 px-3 py-2">
                      <div className="font-mono text-[10.5px] uppercase tracking-wider text-dim">{p.short}</div>
                      <div className="mt-0.5 text-sm leading-relaxed text-muted">{f.a[p.memoryModel] ?? "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Callout tone="good" title="Takeaway" className="mt-5">
            {workload.takeaway}
          </Callout>
        </Panel>
        <Panel className="p-5">
          <Kicker>What this workload leans on</Kicker>
          <div className="mt-4 space-y-3">
            {DEMAND_LABELS.map((d) => (
              <Meter key={d.key} value={workload.demands[d.key]} color={d.color} label={d.label} right={`${workload.demands[d.key]}/10`} />
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-dim">
            Relative emphasis for a typical run of this workload, used for teaching. Real demands depend on the specific app, settings and
            data.
          </p>
        </Panel>
      </div>
    </div>
  );
}

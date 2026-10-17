"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DEFAULT_ANSWERS,
  FAMILIES,
  MODIFIERS,
  PRIORITY_DEFS,
  SPEC_TARGETS,
  WORKLOAD_OPTIONS,
  WORKLOAD_PRIORITIES,
  type BuyAnswers,
  type BuyWorkload,
  type Level,
  type PriorityId,
} from "@/data/buying";
import { Badge, COMPANY_VAR, Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { Chips } from "@/components/tools/controls";

export function rankPriorities(a: BuyAnswers): { id: PriorityId; weight: number }[] {
  const w: Partial<Record<PriorityId, number>> = { ...WORKLOAD_PRIORITIES[a.workload] };
  for (const m of MODIFIERS) {
    if (!m.when(a)) continue;
    for (const [k, d] of Object.entries(m.adjust) as [PriorityId, number][]) w[k] = (w[k] ?? 0) + d;
  }
  if (a.os === "macos") {
    delete w.vram;
    delete w.upgradeability;
    w["unified-capacity"] = Math.max(w["unified-capacity"] ?? 0, (WORKLOAD_PRIORITIES[a.workload].vram ?? 0) + 2, 6);
  }
  if (a.os === "windows" || a.os === "linux") delete w["unified-capacity"];
  return (Object.entries(w) as [PriorityId, number][])
    .filter(([, v]) => v > 0)
    .sort((x, y) => y[1] - x[1])
    .map(([id, weight]) => ({ id, weight }));
}

const LEVELS: { value: string; label: string }[] = [
  { value: "0", label: "Not important" },
  { value: "1", label: "Somewhat" },
  { value: "2", label: "Very" },
];

const STEPS = ["Workload", "Constraints", "Priorities", "Results"];

export function BuyingAssistant() {
  const [a, setA] = useState<BuyAnswers>(DEFAULT_ANSWERS);
  const [step, setStep] = useState(0);
  const set = <K extends keyof BuyAnswers>(k: K, v: BuyAnswers[K]) => setA((s) => ({ ...s, [k]: v }));

  return (
    <Panel className="overflow-hidden">
      <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2.5 scroll-thin">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={clsx(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
              i === step ? "bg-panel-3 text-fg" : "text-dim hover:text-muted",
            )}
          >
            <span
              className={clsx(
                "grid h-5 w-5 place-items-center rounded-full border font-mono text-[10px]",
                i < step ? "border-accent text-accent" : i === step ? "border-fg text-fg" : "border-line-strong",
              )}
            >
              {i + 1}
            </span>
            {s}
          </button>
        ))}
      </div>
      <div className="p-5 sm:p-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <div>
                <h3 className="text-lg font-semibold text-fg">What will you mostly do with it?</h3>
                <p className="mt-1 text-sm text-dim">Pick the workload that matters most. You can add secondary interests in step 3.</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {WORKLOAD_OPTIONS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => {
                        set("workload", w.value);
                        setStep(1);
                      }}
                      className={clsx(
                        "rounded-xl border p-4 text-left transition-colors",
                        a.workload === w.value ? "border-accent bg-panel-2" : "border-line hover:border-line-strong hover:bg-panel-2",
                      )}
                    >
                      <div className="font-medium text-fg">{w.label}</div>
                      <div className="mt-1 text-xs leading-snug text-dim">{w.blurb}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-6 md:grid-cols-2">
                <Q label="Budget">
                  <Segmented size="sm" value={a.budget} onChange={(v) => set("budget", v)} options={[
                    { value: "low", label: "Tight" },
                    { value: "mid", label: "Mid-range" },
                    { value: "high", label: "High" },
                    { value: "max", label: "No limit" },
                  ]} />
                </Q>
                <Q label="Desktop or laptop?">
                  <Segmented size="sm" value={a.form} onChange={(v) => set("form", v)} options={[
                    { value: "laptop", label: "Laptop" },
                    { value: "desktop", label: "Desktop" },
                    { value: "either", label: "Either" },
                  ]} />
                </Q>
                <Q label="Operating system preference">
                  <Segmented size="sm" value={a.os} onChange={(v) => set("os", v)} options={[
                    { value: "any", label: "No preference" },
                    { value: "windows", label: "Windows" },
                    { value: "macos", label: "macOS" },
                    { value: "linux", label: "Linux" },
                  ]} />
                </Q>
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-6 md:grid-cols-2">
                {(
                  [
                    ["battery", "Battery life"],
                    ["portability", "Portability"],
                    ["gaming", "Gaming"],
                    ["ai", "AI / local models"],
                    ["upgrade", "Upgradeability later"],
                  ] as const
                ).map(([k, label]) => (
                  <Q key={k} label={`How important is ${label.toLowerCase()}?`}>
                    <Segmented
                      size="sm"
                      value={String(a[k])}
                      onChange={(v) => set(k, Number(v) as Level)}
                      options={LEVELS}
                    />
                  </Q>
                ))}
              </div>
            )}
            {step === 3 && <Results a={a} />}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-fg disabled:opacity-30"
          >
            ← Back
          </button>
          {step < 3 ? (
            <button onClick={() => setStep((s) => s + 1)} className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink">
              {step === 2 ? "See what to prioritise" : "Next"} →
            </button>
          ) : (
            <button onClick={() => { setA(DEFAULT_ANSWERS); setStep(0); }} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-fg">
              Start over
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
}

function Q({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-fg">{label}</div>
      {children}
    </div>
  );
}

function Results({ a }: { a: BuyAnswers }) {
  const ranked = useMemo(() => rankPriorities(a), [a]);
  const top = ranked.slice(0, 4);
  const also = ranked.slice(4, 8);
  const max = ranked[0]?.weight ?? 1;
  const wl = WORKLOAD_OPTIONS.find((w) => w.value === a.workload)!;

  return (
    <div className="space-y-8">
      <div>
        <Kicker>For {wl.label.toLowerCase()} · prioritise, in this order</Kicker>
        <ol className="mt-4 space-y-3">
          {top.map((p, i) => (
            <li key={p.id} className="flex gap-4 rounded-xl border border-line bg-panel-2 p-4">
              <span className="font-mono text-2xl font-semibold text-accent">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-fg">{PRIORITY_DEFS[p.id].title}</span>
                  <div className="h-1 w-20 overflow-hidden rounded-full bg-panel-3">
                    <div className="h-full bg-accent" style={{ width: `${(p.weight / max) * 100}%` }} />
                  </div>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{PRIORITY_DEFS[p.id].why}</p>
              </div>
            </li>
          ))}
        </ol>
        {also.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-dim">Also worth weighing</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {also.map((p) => (
                <span key={p.id} title={PRIORITY_DEFS[p.id].why} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                  {PRIORITY_DEFS[p.id].title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <Kicker>Spec targets to start from</Kicker>
        <div className="mt-3 overflow-hidden rounded-xl border border-line">
          {SPEC_TARGETS[a.workload].map((t) => (
            <div key={t.spec} className="grid gap-1 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[160px_1fr]">
              <div className="font-mono text-xs uppercase tracking-wider text-dim">{t.spec}</div>
              <div className="text-sm text-muted">{t.target}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Kicker>Platform families — when each is attractive, and what to watch</Kicker>
        <p className="mt-2 max-w-2xl text-sm text-dim">
          No single company is best for every workload. These are tradeoffs to weigh, not a verdict.
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {FAMILIES.map((f) => {
            const excluded = f.excluded(a);
            const pros = f.attractive.filter((x) => x.when(a)).map((x) => x.text);
            const cons = f.caution.filter((x) => x.when(a)).map((x) => x.text);
            return (
              <div key={f.id} className={clsx("rounded-xl border border-line p-4", excluded ? "opacity-50" : "bg-panel-2")}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-fg">{f.name}</span>
                  {f.companies.map((c) => (
                    <span key={c} className="h-2 w-2 rounded-full" style={{ background: COMPANY_VAR[c] }} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-dim">{f.description}</p>
                {excluded ? (
                  <p className="mt-3 text-sm text-muted">Set aside: {excluded}</p>
                ) : (
                  <div className="mt-3 space-y-3 text-sm">
                    {pros.length > 0 && (
                      <div>
                        <Badge color="var(--good)">Attractive because</Badge>
                        <ul className="mt-1.5 space-y-1 text-muted">
                          {pros.map((t) => <li key={t}>· {t}</li>)}
                        </ul>
                      </div>
                    )}
                    {cons.length > 0 && (
                      <div>
                        <Badge color="var(--warn)">Watch out for</Badge>
                        <ul className="mt-1.5 space-y-1 text-muted">
                          {cons.map((t) => <li key={t}>· {t}</li>)}
                        </ul>
                      </div>
                    )}
                    {pros.length === 0 && cons.length === 0 && <p className="text-muted">No strong pull either way for your answers.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Compact widget for lessons: pick a workload, see the top four specs to prioritise. */
export function BuyMini() {
  const [w, setW] = useState<BuyWorkload>("ai");
  const ranked = rankPriorities({ ...DEFAULT_ANSWERS, workload: w, form: "either", battery: 0, portability: 0 }).slice(0, 4);
  return (
    <Panel className="p-5">
      <Kicker>What to prioritise</Kicker>
      <div className="mt-3">
        <Chips size="sm" value={w} onChange={setW} options={WORKLOAD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {ranked.map((p, i) => (
          <li key={p.id} className="rounded-lg border border-line bg-panel-2 p-3">
            <div className="text-sm font-medium text-fg">
              <span className="mr-2 font-mono text-accent">{i + 1}</span>
              {PRIORITY_DEFS[p.id].title}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-dim">{PRIORITY_DEFS[p.id].why}</p>
          </li>
        ))}
      </ol>
      <Link href="/buy" className="mt-3 inline-block text-sm text-accent">Full buying assistant →</Link>
    </Panel>
  );
}

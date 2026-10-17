"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { SPECS, SPEC_FILTERS } from "@/data/specs";
import type { SpecDefinition } from "@/data/schema";
import { CompanyTag, Kicker, Panel } from "@/components/ui/primitives";

const VERDICT = {
  yes: { label: "YES", color: "var(--good)", sub: "Comparable across brands" },
  partly: { label: "PARTLY", color: "var(--warn)", sub: "Comparable with caveats" },
  no: { label: "NO", color: "var(--bad)", sub: "Not comparable across brands" },
} as const;

const ROWS: { key: keyof SpecDefinition; label: string }[] = [
  { key: "whatItIs", label: "What it is" },
  { key: "whyItExists", label: "Why it exists" },
  { key: "whyItMatters", label: "Why it matters" },
  { key: "whenItMatters", label: "When it matters" },
  { key: "whenItDoesnt", label: "When it doesn't" },
];

export function SpecDetail({ s }: { s: SpecDefinition }) {
  const v = VERDICT[s.crossBrand.verdict];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-semibold tracking-tight text-fg">{s.name}</h3>
        {s.vendorSpecific && <CompanyTag company={s.vendorSpecific} />}
      </div>
      <div
        className="mt-4 rounded-xl border p-4"
        style={{ borderColor: `color-mix(in oklab, ${v.color} 40%, var(--line))`, background: `color-mix(in oklab, ${v.color} 7%, var(--panel))` }}
      >
        <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">Can I compare this number across brands?</div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
          <span className="text-3xl font-semibold tracking-tight" style={{ color: v.color }}>
            {v.label}
          </span>
          <span className="text-sm text-muted">{v.sub}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{s.crossBrand.explain}</p>
      </div>
      <dl className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line">
        {ROWS.map((r) => (
          <div key={r.key} className="grid gap-1 px-4 py-3 sm:grid-cols-[150px_1fr]">
            <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">{r.label}</dt>
            <dd className="text-sm leading-relaxed text-muted">{s[r.key] as string}</dd>
          </div>
        ))}
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[150px_1fr]">
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-bad">Common misconception</dt>
          <dd className="text-sm leading-relaxed text-muted">“{s.misconception}”</dd>
        </div>
      </dl>
    </div>
  );
}

export function SpecExplorer({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const [comp, setComp] = useState<string>("all");
  const [verdict, setVerdict] = useState<string>("all");
  const [selected, setSelected] = useState(compact ? "cuda-cores" : SPECS[0].id);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return SPECS.filter(
      (s) =>
        (comp === "all" || s.appliesTo.includes(comp as never)) &&
        (verdict === "all" || s.crossBrand.verdict === verdict) &&
        (!term || `${s.name} ${s.whatItIs}`.toLowerCase().includes(term)),
    );
  }, [q, comp, verdict]);

  const current = SPECS.find((s) => s.id === selected) ?? list[0];

  return (
    <Panel className="overflow-hidden">
      {!compact && (
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search specs — e.g. cache, TOPS, VRAM"
            className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-fg outline-none placeholder:text-dim focus:border-accent sm:w-72"
          />
          <div className="flex flex-wrap gap-1">
            {[{ id: "all", label: "All" }, ...SPEC_FILTERS].map((f) => (
              <button
                key={f.id}
                onClick={() => setComp(f.id)}
                className={clsx(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  comp === f.id ? "border-line-strong bg-panel-3 text-fg" : "border-line text-muted hover:text-fg",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {(["all", "yes", "partly", "no"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVerdict(v)}
                className={clsx(
                  "rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase transition-colors",
                  verdict === v ? "border-line-strong bg-panel-3 text-fg" : "border-line text-dim hover:text-fg",
                )}
                style={v !== "all" && verdict === v ? { color: VERDICT[v].color } : undefined}
              >
                {v === "all" ? "Any verdict" : `Cross-brand: ${v}`}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-[260px_minmax(0,1fr)]">
        <ul className="scroll-thin flex max-h-none gap-1 overflow-x-auto border-b border-line p-2 md:max-h-[640px] md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
          {(compact ? SPECS.filter((s) => ["cuda-cores", "stream-processors", "apple-gpu-cores", "clock-speed", "tops", "vram", "memory-bandwidth"].includes(s.id)) : list).map((s) => {
            const v = VERDICT[s.crossBrand.verdict];
            return (
              <li key={s.id} className="shrink-0">
                <button
                  onClick={() => setSelected(s.id)}
                  className={clsx(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    current?.id === s.id ? "bg-panel-3 text-fg" : "text-muted hover:bg-panel-2 hover:text-fg",
                  )}
                >
                  <span className="whitespace-nowrap md:whitespace-normal">{s.name}</span>
                  <span className="hidden font-mono text-[10px] md:inline" style={{ color: v.color }}>
                    {v.label}
                  </span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="p-3 text-sm text-dim">No specs match.</li>}
        </ul>
        <div className="min-w-0 p-5 sm:p-6">
          {current ? (
            <AnimatePresence mode="wait">
              <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <SpecDetail s={current} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <Kicker>Select a spec</Kicker>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function SpecExplorerCompact() {
  return <SpecExplorer compact />;
}

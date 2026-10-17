"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { COMPARE_PROFILES, PLATFORM_COMPARISON } from "@/data/comparisons";
import { COMPANY_VAR, Kicker, Panel } from "@/components/ui/primitives";
import { RichInline } from "@/components/ui/Rich";

/** Pick 2–3 platform profiles; every row explains what it means. */
export function PlatformCompare() {
  const [sel, setSel] = useState<string[]>(["mac", "amd-pc", "nvidia-pc"]);
  const [showMeaning, setShowMeaning] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSel((s) => {
      if (s.includes(id)) return s.length > 2 ? s.filter((x) => x !== id) : s;
      return s.length >= 3 ? [...s.slice(1), id] : [...s, id];
    });
  };

  const cols = PLATFORM_COMPARISON.columns.filter((c) => sel.includes(c.id));

  return (
    <div>
      <Panel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Kicker>Choose two or three to compare</Kicker>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={showMeaning} onChange={(e) => setShowMeaning(e.target.checked)} className="accent-[var(--accent)]" />
            Show “what this means” on every row
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {COMPARE_PROFILES.map((p) => {
            const on = sel.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                aria-pressed={on}
                className={clsx(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  on ? "border-line-strong bg-panel-3 text-fg" : "border-line text-dim hover:text-fg",
                )}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: on ? COMPANY_VAR[p.company] : "var(--line-strong)" }} />
                {p.short}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-dim">
          Profiles describe typical configurations, not specific products. A Mac is a complete platform; the PC profiles
          describe one choice within a modular system — e.g. an “NVIDIA GPU PC” still needs an AMD or Intel CPU.
        </p>
      </Panel>

      <div className="mt-4 space-y-2">
        {/* Column headers (desktop) */}
        <div
          className="sticky top-14 z-20 hidden gap-3 rounded-xl border border-line bg-[color-mix(in_oklab,var(--bg)_90%,transparent)] px-4 py-3 backdrop-blur md:grid"
          style={{ gridTemplateColumns: `180px repeat(${cols.length}, minmax(0, 1fr))` }}
        >
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-dim">Row</span>
          {cols.map((c) => (
            <span key={c.id} className="flex items-center gap-2 text-sm font-medium text-fg">
              <span className="h-2 w-2 rounded-full" style={{ background: COMPANY_VAR[c.company!] }} />
              {c.label}
            </span>
          ))}
        </div>

        {PLATFORM_COMPARISON.rows.map((row) => {
          const expanded = showMeaning || open === row.id;
          return (
            <Panel key={row.id} className="overflow-hidden">
              <div className="p-4">
                <div className="grid gap-3 md:[grid-template-columns:var(--cols)]" style={{ ["--cols" as string]: `180px repeat(${cols.length}, minmax(0, 1fr))` }}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-fg">{row.label}</span>
                    {!showMeaning && (
                      <button onClick={() => setOpen(open === row.id ? null : row.id)} className="shrink-0 text-xs text-accent md:hidden">
                        {open === row.id ? "Hide" : "What this means"}
                      </button>
                    )}
                  </div>
                  {cols.map((c) => (
                    <motion.div key={c.id} layout="position" className="text-sm leading-relaxed text-muted">
                      <span className="mb-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-dim md:hidden">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: COMPANY_VAR[c.company!] }} />
                        {COMPARE_PROFILES.find((p) => p.id === c.id)?.short}
                      </span>
                      {row.values[c.id]}
                    </motion.div>
                  ))}
                </div>
                {!showMeaning && (
                  <button onClick={() => setOpen(open === row.id ? null : row.id)} className="mt-2 hidden text-xs text-accent md:block">
                    {open === row.id ? "Hide explanation" : "What this means →"}
                  </button>
                )}
              </div>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-line bg-panel-2 px-4 py-3">
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-accent">What this means</span>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        <RichInline text={row.meaning} />
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

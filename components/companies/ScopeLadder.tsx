"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useState } from "react";
import { SCOPE_ITEMS, SCOPE_LEVELS, SCOPE_ROLES } from "@/data/comparisons";
import { COMPANY_VAR, Kicker, Panel, ScopeTag } from "@/components/ui/primitives";

const LEVEL_ORDER = ["platform", "system", "component", "chip"] as const;

/**
 * Nested Chip ⊂ Component ⊂ System ⊂ Platform diagram. Selecting a product shows
 * which level it lives at and which functions it actually contains.
 */
export function ScopeLadder() {
  const [sel, setSel] = useState(SCOPE_ITEMS[0].id);
  const item = SCOPE_ITEMS.find((i) => i.id === sel)!;
  const levelIdx = LEVEL_ORDER.indexOf(item.scope);
  const color = item.company === "mixed" ? "var(--accent)" : COMPANY_VAR[item.company];

  return (
    <Panel className="overflow-hidden">
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="border-b border-line p-4 lg:border-b-0 lg:border-r">
          <Kicker>Pick something people compare</Kicker>
          <div className="mt-3 flex flex-wrap gap-1.5 lg:flex-col">
            {SCOPE_ITEMS.map((i) => (
              <button
                key={i.id}
                onClick={() => setSel(i.id)}
                className={clsx(
                  "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-sm transition-colors",
                  sel === i.id ? "border-line-strong bg-panel-3 text-fg" : "border-line text-muted hover:text-fg",
                )}
              >
                <span>{i.name}</span>
                <span className="hidden font-mono text-[10px] uppercase text-dim lg:inline">{i.scope}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            {/* Nested boxes */}
            <div className="relative aspect-square w-full max-w-[420px] justify-self-center" aria-hidden>
              {LEVEL_ORDER.map((lvl, i) => {
                const inset = i * 12;
                const active = i === levelIdx;
                const within = i < levelIdx;
                return (
                  <motion.div
                    key={lvl}
                    className="absolute rounded-2xl border"
                    style={{ inset: `${inset}%` }}
                    animate={{
                      borderColor: active ? color : "var(--line-strong)",
                      backgroundColor: active
                        ? `color-mix(in oklab, ${color} 14%, transparent)`
                        : within
                          ? "transparent"
                          : "color-mix(in oklab, var(--panel-3) 50%, transparent)",
                    }}
                    transition={{ duration: 0.35 }}
                  >
                    <span
                      className="absolute left-3 top-2 font-mono text-[10px] uppercase tracking-[0.16em]"
                      style={{ color: active ? color : "var(--fg-dim)" }}
                    >
                      {lvl}
                    </span>
                  </motion.div>
                );
              })}
              <div className="absolute inset-x-0 flex justify-center" style={{ top: levelIdx === 3 ? "46%" : `${levelIdx * 12 + 4}%` }}>
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ background: color, color: "var(--bg)" }}
                >
                  {item.name}
                </motion.div>
              </div>
            </div>

            {/* Explanation */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <ScopeTag scope={item.scope} />
                <span className="text-sm font-medium text-fg">{item.name}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{SCOPE_LEVELS.find((l) => l.id === item.scope)!.explain}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.note}</p>

              <div className="mt-4">
                <Kicker>What it contains</Kicker>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {SCOPE_ROLES.map((r) => {
                    const on = item.covers.includes(r.id);
                    return (
                      <motion.div
                        key={r.id}
                        animate={{ opacity: on ? 1 : 0.45 }}
                        className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
                        style={{
                          borderColor: on ? `color-mix(in oklab, ${color} 45%, var(--line))` : "var(--line)",
                          color: on ? "var(--fg)" : "var(--fg-dim)",
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: on ? color : "var(--line-strong)" }} />
                        {r.label}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-line bg-panel-2 p-3">
                <div className="font-mono text-[10.5px] uppercase tracking-wider text-good">Fair comparison</div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.compareWith}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

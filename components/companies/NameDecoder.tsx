"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { GLOBAL_NAMING_WARNINGS, NAME_EXAMPLES, decodeName, roleLabel, type TokenRole } from "@/data/naming";
import { COMPANY_VAR, Callout, CompanyTag, Kicker, Panel, ScopeTag } from "@/components/ui/primitives";

const ROLE_COLOR: Record<TokenRole, string> = {
  brand: "var(--k-display)",
  tier: "var(--k-cpu)",
  generation: "var(--k-memory)",
  sku: "var(--k-storage)",
  suffix: "var(--k-accel)",
  variant: "var(--k-gpu)",
  form: "var(--k-power)",
};

/** Type or pick a product name; see each part decoded. */
export function NameDecoder() {
  const [input, setInput] = useState("RTX 5070 Ti");
  const result = useMemo(() => decodeName(input), [input]);
  const [focus, setFocus] = useState<number | null>(null);

  return (
    <Panel className="overflow-hidden">
      <div className="p-4 sm:p-6">
        <label htmlFor="name-input" className="block">
          <Kicker>Type a product name</Kicker>
        </label>
        <input
          id="name-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setFocus(null);
          }}
          spellCheck={false}
          autoComplete="off"
          placeholder="e.g. Ryzen 7 9800X3D"
          className="mt-2 w-full rounded-xl border border-line bg-panel-2 px-4 py-3 font-mono text-lg text-fg outline-none transition-colors placeholder:text-dim focus:border-line-strong"
        />
        <div className="mt-3 space-y-2">
          {NAME_EXAMPLES.map((g) => (
            <div key={g.company} className="flex flex-wrap items-center gap-1.5">
              <span className="w-14 font-mono text-[10px] uppercase tracking-wider" style={{ color: COMPANY_VAR[g.company] }}>
                {g.company}
              </span>
              {g.names.map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setInput(n);
                    setFocus(null);
                  }}
                  className={clsx(
                    "rounded-md border px-2 py-0.5 font-mono text-xs transition-colors",
                    input === n ? "border-line-strong bg-panel-3 text-fg" : "border-line text-dim hover:text-fg",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key={result.family + input} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-wrap items-center gap-2">
                <CompanyTag company={result.company} />
                <ScopeTag scope={result.scope} />
                <span className="text-sm text-muted">{result.family}</span>
              </div>

              {/* Token strip */}
              <div className="mt-5 flex flex-wrap items-end gap-2">
                {result.tokens.map((t, i) => (
                  <button
                    key={i}
                    onMouseEnter={() => setFocus(i)}
                    onFocus={() => setFocus(i)}
                    onClick={() => setFocus(i)}
                    className="group flex flex-col items-center gap-1.5"
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-lg border px-3 py-1.5 font-mono text-xl font-semibold sm:text-2xl"
                      style={{
                        color: ROLE_COLOR[t.role],
                        borderColor: `color-mix(in oklab, ${ROLE_COLOR[t.role]} ${focus === i ? 70 : 30}%, transparent)`,
                        background: `color-mix(in oklab, ${ROLE_COLOR[t.role]} ${focus === i ? 16 : 7}%, transparent)`,
                      }}
                    >
                      {t.text}
                    </motion.span>
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-dim">{roleLabel(t.role)}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {result.tokens.map((t, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setFocus(i)}
                    className={clsx("rounded-xl border p-3 transition-colors", focus === i ? "border-line-strong bg-panel-2" : "border-line")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold" style={{ color: ROLE_COLOR[t.role] }}>
                        {t.text}
                      </span>
                      <span className="text-xs text-dim">· {t.label}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{t.meaning}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {result.warnings.map((w) => (
                  <Callout key={w} tone="warn" title="Don't read too much into it">
                    {w}
                  </Callout>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-dim">
              {input.trim()
                ? "No decoding rule matches that name yet. Try one of the examples — rules exist for GeForce RTX, Radeon RX, Ryzen, Ryzen AI, Core Ultra, Core i-series, Apple M-series and Arc."
                : "Type a name to decode it."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-line bg-panel-2 p-4">
        <Kicker color="var(--warn)">Always true</Kicker>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          {GLOBAL_NAMING_WARNINGS.map((w) => (
            <li key={w} className="flex gap-2">
              <span className="text-warn">!</span>
              {w}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

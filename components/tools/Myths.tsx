"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { MISCONCEPTIONS, MISLEADING_COMPARISONS } from "@/data/misconceptions";
import type { Misconception } from "@/data/schema";
import { Badge, Kicker, Panel } from "@/components/ui/primitives";

const VERDICT: Record<Misconception["verdict"], { label: string; color: string }> = {
  false: { label: "False", color: "var(--bad)" },
  misleading: { label: "Misleading", color: "var(--warn)" },
  sometimes: { label: "Sometimes true", color: "var(--accent)" },
};

function MythCard({ m }: { m: Misconception }) {
  const [guess, setGuess] = useState<Misconception["verdict"] | "true" | null>(null);
  const [more, setMore] = useState(false);
  const v = VERDICT[m.verdict];
  const right = guess === m.verdict || (guess === "false" && m.verdict === "misleading") || (guess === "misleading" && m.verdict === "false");

  return (
    <motion.div layout className="flex flex-col rounded-2xl border border-line bg-panel p-5">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">Claim</div>
      <div className="mt-2 text-lg font-semibold leading-snug text-fg">“{m.claim}”</div>
      {!guess ? (
        <div className="mt-auto pt-5">
          <div className="mb-2 text-xs text-dim">What do you think?</div>
          <div className="flex flex-wrap gap-1.5">
            {(["true", "false", "misleading"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGuess(g)}
                className="rounded-full border border-line px-3 py-1 text-sm capitalize text-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={v.color}>{v.label}</Badge>
              <span className="text-xs text-dim">
                {guess === "true" ? "Not quite — it's a common belief." : right ? "Good instinct." : "Close — see why."}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{m.short}</p>
            {more && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="mt-3 text-sm leading-relaxed text-muted">{m.explanation}</p>
                <div className="mt-3 rounded-lg border border-line bg-panel-2 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-good">Look at this instead</div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{m.instead}</p>
                </div>
              </motion.div>
            )}
            <div className="mt-3 flex gap-4 text-xs">
              <button onClick={() => setMore((x) => !x)} className="text-accent">
                {more ? "Less" : "Why, and what to look at instead"}
              </button>
              <button onClick={() => { setGuess(null); setMore(false); }} className="text-dim hover:text-fg">
                Reset
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export function MythCards({ limit }: { limit?: number }) {
  const [filter, setFilter] = useState<"all" | Misconception["verdict"]>("all");
  const list = MISCONCEPTIONS.filter((m) => filter === "all" || m.verdict === filter).slice(0, limit);
  return (
    <div>
      {!limit && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {(["all", "false", "misleading"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "rounded-full border px-3 py-1 text-sm capitalize transition-colors",
                filter === f ? "border-line-strong bg-panel-3 text-fg" : "border-line text-muted hover:text-fg",
              )}
            >
              {f === "all" ? `All ${MISCONCEPTIONS.length}` : `${VERDICT[f].label} (${MISCONCEPTIONS.filter((m) => m.verdict === f).length})`}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <MythCard key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
}

export function MythCardsMini() {
  return <MythCards limit={3} />;
}

/** "Looks like vs Reality": shows why two headline numbers are not equivalent. */
export function MisleadingCompare() {
  const [id, setId] = useState(MISLEADING_COMPARISONS[0].id);
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const c = MISLEADING_COMPARISONS.find((x) => x.id === id)!;

  const pick = (nid: string) => {
    setId(nid);
    setRevealed(false);
    setChecked({});
  };

  return (
    <Panel className="overflow-hidden">
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="scroll-thin flex gap-1 overflow-x-auto border-b border-line p-2 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r">
          {MISLEADING_COMPARISONS.map((x) => (
            <button
              key={x.id}
              onClick={() => pick(x.id)}
              className={clsx(
                "shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                x.id === id ? "bg-panel-3 text-fg" : "text-muted hover:bg-panel-2 hover:text-fg",
              )}
            >
              {x.left} <span className="text-dim">vs</span> {x.right}
            </button>
          ))}
        </div>
        <div className="min-w-0 p-5 sm:p-7">
          <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-xl border border-line bg-panel-2 p-5 text-center text-lg font-semibold text-fg">{c.left}</div>
            <motion.div
              key={`${id}-${revealed}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center font-mono text-3xl"
              style={{ color: revealed ? "var(--bad)" : "var(--fg-dim)" }}
            >
              {revealed ? "≠" : "="}
            </motion.div>
            <div className="rounded-xl border border-line bg-panel-2 p-5 text-center text-lg font-semibold text-fg">{c.right}</div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-line p-4">
              <Kicker>Looks like</Kicker>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.looksLike}</p>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-line p-4">
              <Kicker color="var(--warn)">Reality</Kicker>
              {revealed ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm leading-relaxed text-muted">
                  {c.reality}
                </motion.p>
              ) : (
                <button onClick={() => setRevealed(true)} className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink">
                  Reveal what's really going on
                </button>
              )}
            </div>
          </div>
          <div className="mt-5">
            <Kicker>Questions to ask before trusting the comparison</Kicker>
            <ul className="mt-3 space-y-2">
              {c.questions.map((q) => (
                <li key={q}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={!!checked[q]}
                      onChange={(e) => setChecked((s) => ({ ...s, [q]: e.target.checked }))}
                      className="mt-0.5 accent-[var(--accent)]"
                    />
                    <span className={checked[q] ? "text-fg" : ""}>{q}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Panel>
  );
}

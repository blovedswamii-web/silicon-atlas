"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import { CATEGORY_LABEL, CONCEPTS, getConcept } from "@/data/glossary";
import type { CompanyId, Concept } from "@/data/schema";
import { LayeredText } from "@/components/ui/Depth";
import { COMPANY_NAME, COMPANY_VAR } from "@/components/ui/primitives";

const CATS = Object.keys(CATEGORY_LABEL).filter((c) => CONCEPTS.some((x) => x.category === c)) as Concept["category"][];

export function Glossary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Concept["category"] | "all">("all");

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return CONCEPTS.filter(
      (c) =>
        (cat === "all" || c.category === cat) &&
        (!t || [c.term, c.short, ...(c.aka ?? []), ...Object.values(c.vendorTerms ?? {})].join(" ").toLowerCase().includes(t)),
    ).sort((a, b) => a.term.localeCompare(b.term));
  }, [q, cat]);

  return (
    <div>
      <div className="sticky top-14 z-10 -mx-4 border-b border-line bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${CONCEPTS.length} terms — try "VRAM", "Tensor", "Quick Sync"`}
            className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-fg outline-none placeholder:text-dim focus:border-accent sm:w-80"
          />
          <div className="flex flex-wrap gap-1">
            {(["all", ...CATS] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={clsx(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  cat === c ? "border-line-strong bg-panel-3 text-fg" : "border-line text-muted hover:text-fg",
                )}
              >
                {c === "all" ? "All" : CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((c) => (
          <article
            key={c.id}
            id={c.id}
            className="scroll-mt-36 rounded-2xl border border-line bg-panel p-5 transition-colors target:border-accent target:bg-panel-2"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-semibold text-fg">
                <a href={`#${c.id}`} className="hover:underline">{c.term}</a>
              </h3>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">{CATEGORY_LABEL[c.category]}</span>
            </div>
            {c.aka && <div className="mt-0.5 text-xs text-dim">Also: {c.aka.join(", ")}</div>}
            <p className="mt-2 text-sm font-medium text-muted">{c.short}</p>
            <div className="mt-3 text-sm">
              <LayeredText text={c.body} />
            </div>
            {c.vendorTerms && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(Object.entries(c.vendorTerms) as [CompanyId, string][]).map(([co, term]) => (
                  <span
                    key={co}
                    className="rounded-md border px-2 py-0.5 text-xs"
                    style={{ borderColor: `color-mix(in oklab, ${COMPANY_VAR[co]} 35%, var(--line))`, color: "var(--fg-muted)" }}
                  >
                    <span style={{ color: COMPANY_VAR[co] }}>{COMPANY_NAME[co]}:</span> {term}
                  </span>
                ))}
              </div>
            )}
            {c.related && c.related.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="text-dim">Related:</span>
                {c.related.map((r) => {
                  const rc = getConcept(r);
                  return rc ? (
                    <a key={r} href={`#${r}`} onClick={() => { setQ(""); setCat("all"); }} className="text-accent hover:underline">
                      {rc.term}
                    </a>
                  ) : null;
                })}
              </div>
            )}
          </article>
        ))}
        {list.length === 0 && <p className="text-sm text-dim">No terms match “{q}”.</p>}
      </div>
    </div>
  );
}

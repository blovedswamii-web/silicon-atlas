"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { GENERATION_FAMILIES, getArchitecture } from "@/data/architectures";
import type { Architecture } from "@/data/schema";
import { Badge, COMPANY_VAR, Kicker, Panel } from "@/components/ui/primitives";

const AREA_ORDER = ["Architecture", "Process", "Cores", "Cache", "Memory", "GPU features", "AI hardware", "Media engines", "Efficiency", "Platform", "Features", "Software"];

/** Generation-by-generation view of WHAT CHANGED, with an area filter. */
export function GenerationTimeline({ initialFamily = "apple" }: { initialFamily?: string }) {
  const [famId, setFamId] = useState(initialFamily);
  const fam = GENERATION_FAMILIES.find((f) => f.id === famId)!;
  const gens = useMemo(() => fam.ids.map(getArchitecture).filter((a): a is Architecture => !!a), [fam]);
  const [selId, setSelId] = useState(gens[gens.length - 1].id);
  const sel = gens.find((g) => g.id === selId) ?? gens[gens.length - 1];
  const [area, setArea] = useState<string | null>(null);
  const color = COMPANY_VAR[fam.company];

  const areas = useMemo(() => {
    const set = new Set(gens.flatMap((g) => g.changes.map((c) => c.area)));
    return AREA_ORDER.filter((a) => set.has(a)).concat([...set].filter((a) => !AREA_ORDER.includes(a)));
  }, [gens]);

  const pickFamily = (id: string) => {
    const f = GENERATION_FAMILIES.find((x) => x.id === id)!;
    setFamId(id);
    setSelId(f.ids[f.ids.length - 1]);
    setArea(null);
  };

  const idx = gens.findIndex((g) => g.id === sel.id);
  const prev = gens[idx - 1];

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-line p-4">
        <div className="flex flex-wrap gap-1.5">
          {GENERATION_FAMILIES.map((f) => (
            <button
              key={f.id}
              onClick={() => pickFamily(f.id)}
              className={clsx(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                f.id === famId ? "border-line-strong bg-panel-3 text-fg" : "border-line text-dim hover:text-fg",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: COMPANY_VAR[f.company] }} />
              {f.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-dim">{fam.note}</p>
      </div>

      {/* Timeline */}
      <div className="scroll-thin overflow-x-auto px-4 pt-6">
        <div className="relative flex min-w-[560px] justify-between pb-4">
          <div className="absolute left-4 right-4 top-[15px] h-px bg-line-strong" />
          {gens.map((g) => {
            const active = g.id === sel.id;
            const touches = area ? g.changes.some((c) => c.area === area) : true;
            return (
              <button key={g.id} onClick={() => setSelId(g.id)} className="relative z-10 flex w-28 flex-col items-center text-center">
                <motion.span
                  className="grid h-[30px] w-[30px] place-items-center rounded-full border"
                  animate={{
                    borderColor: active ? color : "var(--line-strong)",
                    backgroundColor: active ? `color-mix(in oklab, ${color} 24%, var(--panel))` : "var(--panel)",
                    opacity: touches ? 1 : 0.35,
                    scale: active ? 1.1 : 1,
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: touches ? color : "var(--line-strong)" }} />
                </motion.span>
                <span className={clsx("mt-2 text-xs font-medium", active ? "text-fg" : "text-muted")}>{g.name}</span>
                <span className="font-mono text-[10.5px] text-dim">{g.year}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-y border-line px-4 py-3">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-dim">Highlight changes to</span>
        {areas.map((a) => (
          <button
            key={a}
            onClick={() => setArea(area === a ? null : a)}
            className={clsx(
              "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
              area === a ? "border-line-strong bg-panel-3 text-fg" : "border-line text-dim hover:text-fg",
            )}
          >
            {a}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={sel.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 sm:p-6"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-xl font-semibold text-fg">{sel.name}</h3>
            <span className="font-mono text-xs text-dim">
              {sel.year}
              {sel.processNode ? ` · ${sel.processNode}` : ""}
            </span>
          </div>
          <div className="mt-4">
            <Kicker>{prev ? `What changed since ${prev.name}` : "Starting point"}</Kicker>
          </div>
          <ul className="mt-3 space-y-2.5">
            {sel.changes.map((c, i) => (
              <li
                key={i}
                className={clsx(
                  "grid gap-1 rounded-xl border p-3 transition-opacity sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-3",
                  area && c.area !== area ? "border-line opacity-40" : "border-line",
                )}
              >
                <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color }}>
                  {c.area}
                </span>
                <span className="text-sm leading-relaxed text-muted">{c.what}</span>
              </li>
            ))}
          </ul>
          {sel.source && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-dim">
              <Badge color="var(--warn)">compiled — verify at source</Badge>
              <a href={sel.source.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg">
                {sel.source.label}
              </a>
              <span>· updated {sel.source.lastUpdated}</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Panel>
  );
}

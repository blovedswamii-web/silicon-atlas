"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { PRODUCTS, SPEC_KEYS } from "@/data/products";
import { getArchitecture } from "@/data/architectures";
import type { CompanyId, Product } from "@/data/schema";
import { Badge, COMPANY_NAME, COMPANY_VAR, CompanyTag, Panel, ScopeTag } from "@/components/ui/primitives";

const KINDS: { id: Product["kind"]; label: string }[] = [
  { id: "cpu", label: "CPUs" },
  { id: "gpu", label: "GPUs" },
  { id: "soc", label: "SoCs" },
  { id: "apu", label: "APUs" },
];

const FORM: Record<Product["formFactor"], string> = {
  desktop: "Desktop",
  laptop: "Laptop",
  both: "Laptop & desktop",
  workstation: "Workstation",
};

function Chip({ on, onClick, children, color }: { on: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={clsx(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
        on ? "border-line-strong bg-panel-3 text-fg" : "border-line text-dim hover:text-fg",
      )}
    >
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  );
}

function ProductCard({ p }: { p: Product }) {
  const arch = getArchitecture(p.architecture);
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <Panel className="flex h-full flex-col overflow-hidden">
        <div className="h-px" style={{ background: COMPANY_VAR[p.company], opacity: 0.7 }} />
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <CompanyTag company={p.company} />
            <ScopeTag scope={p.scope} />
            <Badge>{FORM[p.formFactor]}</Badge>
          </div>
          <h3 className="mt-2.5 text-base font-semibold text-fg">{p.name}</h3>
          <div className="font-mono text-[11px] text-dim">
            {arch ? arch.name : p.architecture} · {p.releaseYear}
          </div>
        </div>
        <dl className="border-t border-line px-4 py-2 text-sm">
          {p.specs.map((s) => {
            const def = SPEC_KEYS.find((k) => k.key === s.key);
            return (
              <div key={s.key} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 border-b border-line/60 py-1.5 last:border-0">
                <dt className="text-xs text-dim">
                  {def?.explainer ? (
                    <Link href={`/specs#${def.explainer}`} className="hover:text-fg hover:underline">
                      {def.label}
                    </Link>
                  ) : (
                    def?.label ?? s.key
                  )}
                  {def?.vendorSpecific && (
                    <span title="Vendor-specific unit — not comparable across brands" className="ml-1 text-warn">
                      ≠
                    </span>
                  )}
                </dt>
                <dd className="text-xs tabular-nums text-fg">
                  {s.value}
                  {s.unit ? ` ${s.unit}` : ""}
                </dd>
              </div>
            );
          })}
        </dl>
        {p.notes && <p className="border-t border-line px-4 py-3 text-xs leading-relaxed text-muted">{p.notes}</p>}
        <div className="mt-auto border-t border-line bg-panel-2 px-4 py-2.5">
          {p.sources.map((src) => (
            <div key={src.url} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-dim">
              <Badge color={src.status === "verified" ? "var(--good)" : "var(--warn)"}>
                {src.status === "verified" ? "verified" : "compiled — verify at source"}
              </Badge>
              <a href={src.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg">
                {src.label}
              </a>
              <span>· {src.lastUpdated}</span>
            </div>
          ))}
        </div>
      </Panel>
    </motion.div>
  );
}

/** Filterable product database. Every product shows its provenance. */
export function HardwareDatabase() {
  const [companies, setCompanies] = useState<CompanyId[]>([]);
  const [kinds, setKinds] = useState<Product["kind"][]>([]);
  const [q, setQ] = useState("");

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const list = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (companies.length === 0 || companies.includes(p.company)) &&
          (kinds.length === 0 || kinds.includes(p.kind)) &&
          (!q.trim() || `${p.name} ${p.family} ${p.architecture}`.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [companies, kinds, q],
  );

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["apple", "amd", "nvidia", "intel"] as CompanyId[]).map((c) => (
            <Chip key={c} on={companies.includes(c)} onClick={() => setCompanies(toggle(companies, c))} color={COMPANY_VAR[c]}>
              {COMPANY_NAME[c]}
            </Chip>
          ))}
          <span className="mx-1 hidden w-px bg-line sm:block" />
          {KINDS.map((k) => (
            <Chip key={k.id} on={kinds.includes(k.id)} onClick={() => setKinds(toggle(kinds, k.id))}>
              {k.label}
            </Chip>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-sm text-fg outline-none placeholder:text-dim focus:border-line-strong md:w-56"
        />
      </div>
      <div className="mt-2 px-1 font-mono text-[11px] text-dim">
        {list.length} of {PRODUCTS.length} products · <span className="text-warn">≠</span> marks vendor-specific units that cannot be compared across brands
      </div>
      <motion.div layout className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="mt-6 text-sm text-dim">No products match those filters.</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { CompanyId } from "@/data/schema";
import { GPU_ORGS, GPU_TERMS } from "@/data/gpu-architectures";
import { COMPANY_NAME, COMPANY_VAR, CompanyTag, Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";

const VENDORS: CompanyId[] = ["nvidia", "amd", "intel", "apple"];

export function GpuTerms() {
  const [focus, setFocus] = useState<string>("count");
  const row = GPU_TERMS.find((r) => r.id === focus)!;
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-line p-4 sm:p-6">
        <Kicker>Same idea, four vocabularies</Kicker>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Click a row to see what it means. The same physical idea gets a different name — and is counted differently — by each company.
        </p>
      </div>
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="text-left">
              <th className="w-[22%] px-4 py-3 font-mono text-[10.5px] font-normal uppercase tracking-wider text-dim sm:px-6">Concept</th>
              {VENDORS.map((v) => (
                <th key={v} className="px-3 py-3 font-normal">
                  <CompanyTag company={v} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GPU_TERMS.map((r) => {
              const active = r.id === focus;
              return (
                <tr
                  key={r.id}
                  onClick={() => setFocus(r.id)}
                  className="cursor-pointer border-t border-line transition-colors hover:bg-panel-2"
                  style={active ? { background: "var(--panel-2)" } : undefined}
                  aria-selected={active}
                >
                  <td className="px-4 py-3 text-fg sm:px-6">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-0.5 rounded-full" style={{ background: active ? "var(--accent)" : "transparent" }} />
                      {r.label}
                    </span>
                  </td>
                  {VENDORS.map((v) => (
                    <td key={v} className="px-3 py-3 text-muted">
                      {r.values[v]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-line bg-panel-2 p-4 sm:p-6">
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-accent">What this means · {row.label}</div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{row.meaning}</p>
      </div>
      <CountComparator />
    </Panel>
  );
}

function CountComparator() {
  const [a, setA] = useState<CompanyId>("nvidia");
  const [b, setB] = useState<CompanyId>("apple");
  const oa = GPU_ORGS.find((o) => o.company === a)!;
  const ob = GPU_ORGS.find((o) => o.company === b)!;
  const same = a === b;
  return (
    <div className="border-t border-line p-4 sm:p-6">
      <Kicker>Can I compare these core counts?</Kicker>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Segmented size="sm" ariaLabel="First vendor" value={a} onChange={setA} options={VENDORS.map((v) => ({ value: v, label: COMPANY_NAME[v], color: COMPANY_VAR[v] }))} />
        <span className="px-1 text-dim">vs</span>
        <Segmented size="sm" ariaLabel="Second vendor" value={b} onChange={setB} options={VENDORS.map((v) => ({ value: v, label: COMPANY_NAME[v], color: COMPANY_VAR[v] }))} />
      </div>
      <div className="mt-4 flex gap-4 rounded-xl border p-4" style={{ borderColor: same ? "color-mix(in oklab, var(--warn) 35%, var(--line))" : "color-mix(in oklab, var(--bad) 35%, var(--line))" }}>
        <div className="font-mono text-2xl font-semibold" style={{ color: same ? "var(--warn)" : "var(--bad)" }}>
          {same ? "Partly" : "No"}
        </div>
        <div className="text-sm leading-relaxed text-muted">
          {same ? (
            <>
              Within one vendor <strong className="text-fg">and one architecture generation</strong>, more {oa.laneName}s usually means more
              throughput — but clocks, memory bandwidth, cache and power limits still matter. Across generations the definition of a{" "}
              {oa.unit} changes, so even same-brand counts drift apart.
            </>
          ) : (
            <>
              A {COMPANY_NAME[a]} &ldquo;{oa.laneName}&rdquo; and a {COMPANY_NAME[b]} &ldquo;{ob.laneName}&rdquo; are not the same unit of work.{" "}
              {oa.lanesPerUnit}. {ob.lanesPerUnit}. Each design also differs in clock speed, instruction issue, cache, memory system, matrix
              hardware and drivers. Compare <strong className="text-fg">measured results for the workload you care about</strong> instead.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

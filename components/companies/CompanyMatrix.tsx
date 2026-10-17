"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { COMPANIES, MATRIX_CATEGORIES, PRODUCT_MATRIX } from "@/data/companies";
import { COMPANY_VAR, Kicker, Panel } from "@/components/ui/primitives";

/** Who builds what: a company × product-category matrix. */
export function CompanyMatrix() {
  const [col, setCol] = useState<string | null>(null);
  const cat = MATRIX_CATEGORIES.find((c) => c.id === col);

  return (
    <Panel className="overflow-hidden">
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="w-32 p-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-wider text-dim">Company</th>
              {MATRIX_CATEGORIES.map((c) => (
                <th key={c.id} className="p-0 text-left">
                  <button
                    onMouseEnter={() => setCol(c.id)}
                    onFocus={() => setCol(c.id)}
                    onClick={() => setCol(c.id)}
                    className={clsx(
                      "w-full p-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-wider transition-colors",
                      col === c.id ? "text-fg" : "text-dim hover:text-muted",
                    )}
                  >
                    {c.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPANIES.map((co) => (
              <tr key={co.id} className="border-b border-line last:border-0">
                <td className="p-3 align-top">
                  <Link href={`/companies/${co.id}`} className="flex items-center gap-2 font-medium text-fg hover:underline">
                    <span className="h-2 w-2 rounded-full" style={{ background: COMPANY_VAR[co.id] }} />
                    {co.name}
                  </Link>
                </td>
                {MATRIX_CATEGORIES.map((c) => {
                  const v = PRODUCT_MATRIX[co.id][c.id];
                  return (
                    <td
                      key={c.id}
                      onMouseEnter={() => setCol(c.id)}
                      className={clsx("p-3 align-top text-xs leading-snug transition-colors", col === c.id && "bg-panel-2")}
                    >
                      {v ? (
                        <span className="text-muted">{v}</span>
                      ) : (
                        <span className="text-dim/60">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex min-h-[3.25rem] items-center gap-3 border-t border-line bg-panel-2 px-4 py-3">
        <Kicker>{cat ? cat.label : "Hover a column"}</Kicker>
        <span className="text-sm text-muted">
          {cat ? cat.hint : "Only AMD and Intel make both standalone CPUs and discrete GPUs; NVIDIA makes GPUs (plus Arm CPUs for datacenters); Apple makes complete SoCs and the computers around them."}
        </span>
      </div>
    </Panel>
  );
}

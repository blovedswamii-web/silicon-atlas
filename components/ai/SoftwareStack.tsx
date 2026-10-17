"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { CompanyId, SoftwareLayer } from "@/data/schema";
import { SOFTWARE_STACKS } from "@/data/software-stacks";
import { COMPANY_NAME, COMPANY_VAR, Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";

const LAYER_LABEL: Record<SoftwareLayer["layer"], string> = {
  hardware: "Hardware",
  driver: "Driver",
  api: "Compute / graphics API",
  library: "Libraries",
  framework: "Framework / engine",
  application: "Application",
};

const LAYER_COLOR: Record<SoftwareLayer["layer"], string> = {
  hardware: "var(--k-gpu)",
  driver: "var(--k-interconnect)",
  api: "var(--k-accel)",
  library: "var(--k-cache)",
  framework: "var(--k-software)",
  application: "var(--k-display)",
};

const VENDORS: CompanyId[] = ["nvidia", "apple", "amd", "intel"];

export function SoftwareStackExplorer({ initialDomain = "ai" }: { initialDomain?: "ai" | "graphics" }) {
  const [company, setCompany] = useState<CompanyId>("nvidia");
  const [domain, setDomain] = useState<"ai" | "graphics">(initialDomain);
  const [open, setOpen] = useState<number>(2);
  const stack = SOFTWARE_STACKS.find((s) => s.company === company && s.domain === domain)!;
  const layers = [...stack.layers].reverse(); // application at the top

  return (
    <Panel className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>Software stack explorer</Kicker>
        <div className="flex flex-wrap gap-2">
          <Segmented
            size="sm"
            ariaLabel="Domain"
            value={domain}
            onChange={setDomain}
            options={[
              { value: "ai", label: "AI / compute" },
              { value: "graphics", label: "Graphics / games" },
            ]}
          />
          <Segmented
            size="sm"
            ariaLabel="Vendor"
            value={company}
            onChange={(c) => {
              setCompany(c);
              setOpen(2);
            }}
            options={VENDORS.map((v) => ({ value: v, label: COMPANY_NAME[v], color: COMPANY_VAR[v] }))}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ol className="relative space-y-2" aria-label={`${stack.name} layers`}>
          <div className="absolute bottom-6 left-[15px] top-6 w-px bg-line" aria-hidden />
          <AnimatePresence mode="popLayout" initial={false}>
            {layers.map((l, idx) => {
              const i = stack.layers.length - 1 - idx;
              const active = open === i;
              return (
                <motion.li
                  key={`${stack.id}-${l.layer}`}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <button
                    onClick={() => setOpen(i)}
                    aria-expanded={active}
                    className="relative flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors"
                    style={{
                      borderColor: active ? `color-mix(in oklab, ${LAYER_COLOR[l.layer]} 50%, var(--line))` : "var(--line)",
                      background: active ? `color-mix(in oklab, ${LAYER_COLOR[l.layer]} 8%, var(--panel))` : "var(--panel)",
                    }}
                  >
                    <span
                      className="relative z-10 mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border font-mono text-[10px]"
                      style={{ borderColor: LAYER_COLOR[l.layer], color: LAYER_COLOR[l.layer], background: "var(--panel)" }}
                    >
                      {stack.layers.length - idx}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[10px] uppercase tracking-wider" style={{ color: LAYER_COLOR[l.layer] }}>
                        {LAYER_LABEL[l.layer]}
                      </span>
                      <span className="mt-0.5 block text-sm font-medium text-fg">{l.name}</span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${stack.id}-${open}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="rounded-xl border border-line bg-panel-2 p-4"
            >
              <div className="font-mono text-[10.5px] uppercase tracking-wider" style={{ color: LAYER_COLOR[stack.layers[open].layer] }}>
                {LAYER_LABEL[stack.layers[open].layer]}
              </div>
              <div className="mt-1 font-medium text-fg">{stack.layers[open].name}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{stack.layers[open].detail}</p>
            </motion.div>
          </AnimatePresence>
          <div className="rounded-xl border border-line p-4">
            <div className="text-xs font-semibold text-fg">{stack.name} · maturity</div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{stack.maturity}</p>
            <ul className="mt-3 space-y-2">
              {stack.notes.map((n) => (
                <li key={n} className="flex gap-2 text-xs leading-relaxed text-dim">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--fg-dim)]" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-dim">
            Every layer has to exist and work for your exact hardware. A faster GPU is slower in practice if your framework, library or app
            doesn&apos;t support it — that&apos;s why software support can matter as much as the spec sheet.
          </p>
        </div>
      </div>
    </Panel>
  );
}

export function SoftwareStack() {
  return <SoftwareStackExplorer />;
}

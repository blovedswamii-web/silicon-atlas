"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useState } from "react";
import { ARM_BYTES, ISA_FACTORS, ISA_SCENARIOS, X86_BYTES } from "@/data/cpu-isa";
import { Segmented } from "@/components/ui/Segmented";
import { Btn, Frame } from "./Frame";

const PALETTE = ["var(--k-cpu)", "var(--k-accel)", "var(--k-memory)", "var(--k-gpu)"];

function ByteStream({ title, sub, insns, decoded }: { title: string; sub: string; insns: { asm: string; bytes: string[] }[]; decoded: boolean }) {
  const flat = insns.flatMap((ins, i) => ins.bytes.map((b, j) => ({ b, i, first: j === 0 })));
  return (
    <div className="rounded-xl border border-line bg-panel-2 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-medium text-fg">{title}</div>
        <div className="text-[11px] text-dim">{sub}</div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {flat.map((x, k) => (
          <motion.span
            key={k}
            initial={false}
            animate={{
              backgroundColor: decoded ? `color-mix(in oklab, ${PALETTE[x.i]} 28%, transparent)` : "var(--panel-3)",
              marginLeft: decoded && x.first && k > 0 ? 8 : 0,
            }}
            transition={{ delay: decoded ? k * 0.04 : 0 }}
            className="rounded px-1.5 py-1 font-mono text-[11px] text-fg"
          >
            {x.b}
          </motion.span>
        ))}
      </div>
      {!decoded && <div className="mt-2 text-[11px] text-dim">Where does each instruction start? Press Decode.</div>}
      <div className={clsx("mt-2 grid gap-0.5", !decoded && "hidden")}>
        {insns.map((ins, i) => (
          <div key={i} className="flex items-center gap-2 font-mono text-[11px]">
            <span className="h-2 w-2 rounded-sm" style={{ background: PALETTE[i] }} />
            <span className="text-muted">{ins.asm}</span>
            <span className="text-dim">{ins.bytes.length} byte{ins.bytes.length > 1 ? "s" : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArmVsX86() {
  const [decoded, setDecoded] = useState(false);
  const [scenario, setScenario] = useState(ISA_SCENARIOS[0].id);
  const [factor, setFactor] = useState<string | null>("isa");
  const sc = ISA_SCENARIOS.find((s) => s.id === scenario)!;
  const f = ISA_FACTORS.find((x) => x.id === factor);

  return (
    <Frame
      kicker="Interactive · ARM vs x86"
      title="The instruction set is one factor among many"
      footer="Byte encodings shown are real x86-64 and AArch64 machine code for those instructions. Which factors dominate in each scenario is a qualitative teaching judgement, not a measurement."
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted">Step 1 — what the decoder sees: a stream of bytes.</div>
        <Btn onClick={() => setDecoded((d) => !d)} active={decoded}>
          {decoded ? "Hide boundaries" : "Decode →"}
        </Btn>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <ByteStream title="x86-64" sub="variable length: 1–15 bytes" insns={X86_BYTES} decoded={decoded} />
        <ByteStream title="ARM64 (AArch64)" sub="fixed length: always 4 bytes" insns={ARM_BYTES} decoded={decoded} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        An x86 decoder can't know where instruction #2 starts until it has worked out the length of #1, which makes decoding many instructions per
        cycle harder. ARM64 instructions always start every 4 bytes, so a wide decoder is simpler. Real x86 cores answer this with predecoding and{" "}
        <strong className="text-fg">micro-op caches</strong> that store already-decoded instructions — and <em>both</em> kinds of core translate
        instructions into internal micro-operations before executing them. The ISA difference is real, but it is one cost among many.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Step 2 — what actually decides performance and efficiency for:</span>
        <Segmented size="sm" ariaLabel="Scenario" value={scenario} onChange={setScenario} options={ISA_SCENARIOS.map((s) => ({ value: s.id, label: s.label }))} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
        {ISA_FACTORS.map((x) => {
          const dom = sc.dominant.includes(x.id);
          return (
            <motion.button
              layout
              key={x.id}
              onClick={() => setFactor(x.id)}
              className={clsx(
                "rounded-lg border px-2.5 py-2 text-left text-xs transition-colors",
                factor === x.id && "ring-1 ring-[var(--fg-dim)]",
                dom ? "border-[color-mix(in_oklab,var(--accent)_55%,transparent)] bg-[color-mix(in_oklab,var(--accent)_10%,var(--panel-2))] text-fg" : "border-line bg-panel-2 text-dim",
              )}
            >
              <div className="font-medium">{x.name}</div>
              <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-wider opacity-80">
                {x.isaRelated === "yes" ? "the ISA" : x.isaRelated === "partly" ? "partly ISA-shaped" : "independent of ISA"}
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-panel-2 p-3 text-sm leading-relaxed text-muted">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-accent">Dominant for: {sc.label}</div>
          {sc.why}
        </div>
        {f && (
          <div className="rounded-xl border border-line bg-panel p-3 text-sm leading-relaxed text-muted">
            <div className="mb-1 font-medium text-fg">{f.name}</div>
            {f.what}
          </div>
        )}
      </div>
    </Frame>
  );
}

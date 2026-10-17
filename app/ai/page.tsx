import type { Metadata } from "next";
import Link from "next/link";
import { AI_ENGINES, TRAIN_VS_INFER } from "@/data/gpu-ai";
import { Callout, CompanyTag, Kicker, PageHeader, Panel, Section } from "@/components/ui/primitives";
import { MatrixTiles } from "@/components/ai/MatrixTiles";
import { SoftwareStackExplorer } from "@/components/ai/SoftwareStack";

export const metadata: Metadata = {
  title: "AI Compute & Software",
  description: "How NVIDIA, Apple, AMD and Intel accelerate AI — and why CUDA, ROCm, Metal/MLX and oneAPI matter as much as TFLOPS.",
};

export default function AiPage() {
  return (
    <>
      <PageHeader
        kicker="AI compute"
        title="AI hardware is half the story. Software is the other half."
        lede="Neural networks are mostly giant matrix multiplications, so every company has added matrix hardware. What differs is how much memory sits next to it, how fast that memory is, and — often decisive — which software can actually use it."
      />

      <Section kicker="01 · The core operation" title="Why GPUs (and NPUs) are good at AI">
        <MatrixTiles />
      </Section>

      <Section kicker="02 · The hardware" title="Where each company puts its AI compute" lede="Not a ranking. Each column describes what exists and what to check before relying on it.">
        <div className="grid gap-4 md:grid-cols-2">
          {AI_ENGINES.map((p) => (
            <Panel key={p.company} className="p-5">
              <CompanyTag company={p.company} />
              <div className="mt-4 space-y-2.5">
                {p.engines.map((e) => (
                  <div key={e.name}>
                    <div className="text-sm font-semibold text-fg">{e.name}</div>
                    <div className="text-sm leading-relaxed text-muted">{e.where}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <Kicker color="var(--good)">Why people choose it</Kicker>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
                    {p.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Kicker color="var(--warn)">Check before buying</Kicker>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
                    {p.watch.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </Section>

      <Section
        kicker="03 · The software"
        title="Hardware → driver → API → framework → application"
        lede="A model reaches the silicon through a chain of software. Every link must support your hardware — this is the single most underrated factor when buying for AI."
      >
        <SoftwareStackExplorer />
        <Callout tone="myth" className="mt-4" title="“NVIDIA wins AI purely because of hardware”">
          NVIDIA&apos;s hardware is strong, but a large part of its position comes from nearly two decades of CUDA software: libraries, tools, framework
          defaults and research code written for it. Competing hardware can match a spec sheet and still be less convenient if the software
          isn&apos;t there yet — which is exactly why ROCm, MLX and oneAPI investment matters.
        </Callout>
      </Section>

      <Section kicker="04 · Two different jobs" title="Training vs inference">
        <Panel className="overflow-hidden">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left">
                  <th className="w-[20%] px-4 py-3 font-mono text-[10.5px] font-normal uppercase tracking-wider text-dim sm:px-6" />
                  <th className="px-4 py-3 font-mono text-[10.5px] font-normal uppercase tracking-wider text-k-gpu">Training</th>
                  <th className="px-4 py-3 font-mono text-[10.5px] font-normal uppercase tracking-wider text-k-memory">Inference</th>
                </tr>
              </thead>
              <tbody>
                {TRAIN_VS_INFER.map((r) => (
                  <tr key={r.label} className="border-t border-line align-top">
                    <td className="px-4 py-3 font-medium text-fg sm:px-6">{r.label}</td>
                    <td className="px-4 py-3 leading-relaxed text-muted">{r.training}</td>
                    <td className="px-4 py-3 leading-relaxed text-muted">{r.inference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </Section>

      <Section kicker="05 · Reading spec sheets" title="Why TFLOPS and TOPS aren't enough">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Memory capacity", "Decides which models fit on the accelerator at all."],
            ["Memory bandwidth", "Usually limits how fast an LLM generates tokens."],
            ["Precision", "A TOPS figure at INT4 or with sparsity isn't comparable to one at FP16 dense."],
            ["Software support", "Determines whether the hardware is used at all — and how well."],
          ].map(([t, d]) => (
            <Panel key={t} className="p-4">
              <div className="text-sm font-semibold text-fg">{t}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{d}</p>
            </Panel>
          ))}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Try the <Link href="/llm" className="text-accent">LLM memory calculator</Link>, build a marketing number in{" "}
          <Link href="/parallel" className="text-accent">CPU vs GPU</Link>, or read{" "}
          <Link href="/learn/ai-hardware" className="text-accent">Lesson 14: AI hardware</Link>.
        </p>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Callout, PageHeader, Section } from "@/components/ui/primitives";
import { LlmCalculator } from "@/components/ai/LlmCalculator";

export const metadata: Metadata = {
  title: "LLM Memory Calculator",
  description: "Will a 7B, 14B, 32B or 70B model fit in 16 GB of VRAM or 64 GB of unified memory — and why fitting isn't the same as being fast.",
};

export default function LlmPage() {
  return (
    <>
      <PageHeader
        kicker="Local AI"
        title="Will this model fit — and how fast could it go?"
        lede="Running a large language model locally is mostly a memory problem. This calculator separates the four questions that people mix up: capacity, bandwidth, compute and software."
      />
      <Section className="pt-0">
        <LlmCalculator />
      </Section>
      <Section kicker="Read this before buying" title="Fitting is not the same as fast">
        <div className="grid gap-4 md:grid-cols-2">
          <Callout tone="info" title="Why a Mac can hold models a GPU can't">
            A Mac with 64 GB of unified memory may keep a 4-bit 70B model entirely in GPU-accessible memory, while a 16 GB graphics card cannot. That
            is a capacity fact. Speed is then decided by that Mac&apos;s memory bandwidth and GPU size — which vary a lot between chip tiers.
          </Callout>
          <Callout tone="warn" title="Why a GPU can be faster on models that fit">
            When a model fits in VRAM, a high-end discrete GPU&apos;s bandwidth and compute can make it generate and especially read prompts much faster.
            Once it doesn&apos;t fit, splitting it with system RAM can erase that advantage.
          </Callout>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Background: <Link href="/unified-memory" className="text-accent">unified memory</Link> ·{" "}
          <Link href="/ai" className="text-accent">AI software stacks</Link> ·{" "}
          <Link href="/learn/ai-hardware" className="text-accent">Lesson 14: AI hardware</Link> ·{" "}
          <Link href="/parallel" className="text-accent">number formats & TFLOPS</Link>
        </p>
      </Section>
    </>
  );
}

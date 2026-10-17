import type { Metadata } from "next";
import Link from "next/link";
import { BottleneckLab } from "@/components/tools/BottleneckLab";
import { Callout, PageHeader, Panel, Section } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Bottleneck Lab",
  description: "Build a system, choose a workload, and see which subsystem is most likely to limit performance — and why.",
};

const LESSONS = [
  {
    title: "The bottleneck moves with the workload",
    text: "The same PC can be CPU-limited at 1080p (the GPU finishes frames quickly and waits) and GPU-limited at 4K (four times the pixels per frame). Try switching between the two gaming workloads without changing the hardware.",
  },
  {
    title: "Capacity is a cliff, not a slope",
    text: "Memory capacity behaves differently from everything else. While data fits, extra GB do nothing. The moment it doesn’t fit, data spills to slower memory and performance collapses. Try a 70B model on a 16 GB GPU, then on a large unified-memory Mac.",
  },
  {
    title: "Fitting is not the same as fast",
    text: "A large unified-memory system can hold a model a 16 GB GPU cannot — but the speed of generating tokens is still governed by memory bandwidth and compute. Compare the tokens/s ceiling across platforms once the model fits on each.",
  },
  {
    title: "Software is a subsystem too",
    text: "If the framework you need is immature on a platform, that platform’s hardware can’t be fully used. AI training is where this shows most clearly.",
  },
];

export default function BottleneckLabPage() {
  return (
    <>
      <PageHeader
        kicker="Tools · Sandbox"
        title="Bottleneck Lab"
        lede="Every system has a slowest step. Pick a platform and a workload to see which subsystem is most likely to hold the rest back — and why. This is an educational model built on representative tiers, not a benchmark predictor."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <BottleneckLab />
      </div>
      <Section kicker="Things to try" title="Four ideas the lab is built to teach">
        <div className="grid gap-3 sm:grid-cols-2">
          {LESSONS.map((l, i) => (
            <Panel key={l.title} className="p-5">
              <div className="font-mono text-xs text-dim">0{i + 1}</div>
              <div className="mt-2 font-medium text-fg">{l.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{l.text}</p>
            </Panel>
          ))}
        </div>
        <Callout tone="warn" className="mt-6" title="Why this isn't a benchmark">
          Real performance depends on the exact product, driver version, game engine, settings, cooling and even background apps.
          Bottlenecks also shift within a single second of gameplay. Use this lab to understand <em>which questions to ask</em>,
          then look at independent benchmarks for the specific products you’re considering. Read the{" "}
          <Link href="/learn/bottlenecks" className="text-accent underline underline-offset-2">Bottlenecks lesson</Link> for the theory.
        </Callout>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Callout, PageHeader, Section } from "@/components/ui/primitives";
import { ParallelPixels, LatencyVsThroughput } from "@/components/gpu/ParallelPixels";
import { GpuTerms } from "@/components/gpu/GpuTerms";
import { RasterVsRT } from "@/components/gpu/RasterVsRT";
import { PrecisionFormats } from "@/components/gpu/PrecisionFormats";
import { TflopsReality } from "@/components/gpu/TflopsReality";

export const metadata: Metadata = {
  title: "CPU vs GPU",
  description: "Process 10,000 pixels with a few powerful workers or thousands of simple ones — and why GPU core counts don't compare across brands.",
};

export default function ParallelPage() {
  return (
    <>
      <PageHeader
        kicker="Parallel computing"
        title="A few brilliant workers, or thousands of simple ones?"
        lede="A CPU is built to finish one complicated task as quickly as possible. A GPU is built to finish an enormous number of simple, similar tasks at once. Same transistors, opposite priorities — and every company organises the GPU side differently."
      />

      <Section kicker="01 · Throughput" title="Process 10,000 pixels" lede="Every pixel runs the same small program. That is the perfect GPU job: thousands of independent pieces of work that can all happen at once.">
        <ParallelPixels />
      </Section>

      <Section kicker="02 · Latency" title="When the CPU wins" lede="Parallel hardware only helps when the work can be split. A long chain of steps that each depend on the previous one is a CPU job.">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <LatencyVsThroughput />
          <div className="space-y-3">
            <Callout tone="good" title="The core idea">
              CPUs minimise <strong>latency</strong> (time to finish one task). GPUs maximise <strong>throughput</strong> (tasks finished per second).
              Real programs mix both, which is why work is split between them.
            </Callout>
            <Callout tone="info" title="Why GPUs tolerate slow memory">
              A GPU keeps many groups of threads in flight. When one group waits for memory, the scheduler instantly switches to another. CPUs instead
              spend transistors on big caches, prediction and out-of-order execution to avoid waiting at all.
            </Callout>
          </div>
        </div>
      </Section>

      <Section
        kicker="03 · Vocabulary"
        title="CUDA cores, stream processors, Xe cores, GPU cores"
        lede="Four companies, four ways to name and count the same kinds of hardware. Counts are only meaningful within one vendor's architecture generation."
      >
        <GpuTerms />
      </Section>

      <Section kicker="04 · Graphics" title="Rasterization vs ray tracing" lede="Two fundamentally different questions a GPU can answer to draw an image.">
        <RasterVsRT />
      </Section>

      <Section kicker="05 · Precision" title="FP32, FP16, BF16, FP8, INT8, FP4" lede="The number format is part of the performance figure. Halve the bits and you roughly halve memory traffic and double peak math — if the hardware and software support it and the accuracy loss is acceptable.">
        <PrecisionFormats />
      </Section>

      <Section kicker="06 · Marketing math" title="What TFLOPS and TOPS actually measure" lede="Peak throughput is a multiplication of assumptions. Learn to read them.">
        <TflopsReality />
        <p className="mt-6 text-sm text-muted">
          Continue with <Link href="/ai" className="text-accent">AI compute & software</Link>, the{" "}
          <Link href="/llm" className="text-accent">LLM memory calculator</Link>, or the lessons on{" "}
          <Link href="/learn/gpu" className="text-accent">the GPU</Link> and <Link href="/learn/parallel-computing" className="text-accent">parallel computing</Link>.
        </p>
      </Section>
    </>
  );
}

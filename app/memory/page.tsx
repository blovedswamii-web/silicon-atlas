import type { Metadata } from "next";
import Link from "next/link";
import { Callout, PageHeader, Panel, Section } from "@/components/ui/primitives";
import { LatencyLadder } from "@/components/memory/LatencyLadder";
import { LatencyVsBandwidth } from "@/components/memory/LatencyVsBandwidth";
import { RamCalculator } from "@/components/memory/RamCalculator";
import { CacheSim } from "@/components/memory/CacheSim";

export const metadata: Metadata = {
  title: "Memory Hierarchy",
  description: "Registers, caches, RAM, VRAM, unified memory, SSDs and the network on one logarithmic scale — plus latency vs bandwidth and a RAM calculator.",
};

const PRINCIPLES = [
  {
    title: "Fast memory is small",
    text: "The faster a memory is, the closer to the core it must sit and the more silicon each byte costs. You can have a few KB that answer in one nanosecond, or many GB that take a hundred.",
  },
  {
    title: "Programs reuse things",
    text: "Code runs in loops and touches nearby data (locality). So keeping recently used data in a small fast memory answers most requests without the long trip.",
  },
  {
    title: "Latency ≠ bandwidth",
    text: "How long until the first byte arrives is a different question from how many bytes per second flow afterwards. GPUs pick bandwidth; CPUs fight for latency.",
  },
];

export default function MemoryPage() {
  return (
    <>
      <PageHeader
        kicker="Memory hierarchy"
        title="A computer is mostly waiting for data."
        lede="A modern core can finish an instruction in a fraction of a nanosecond, but fetching something from RAM takes around a hundred. Every layer between the core and your SSD exists to hide that gap. Here is the whole ladder — on a logarithmic scale, because nothing else fits."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <Panel key={p.title} className="p-4">
              <div className="text-sm font-semibold text-fg">{p.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.text}</p>
            </Panel>
          ))}
        </div>
      </PageHeader>

      <Section
        id="ladder"
        kicker="01 · The ladder"
        title="From registers to the other side of the planet"
        lede="Switch between a PC with a discrete graphics card and an Apple Silicon Mac. The PC has two memory systems — system RAM for the CPU, VRAM for the GPU — joined by PCIe. The Mac has one pool shared by every engine, fronted by a system-level cache."
      >
        <LatencyLadder />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Callout tone="good" title="Read it like this">
            Every bar to the right is roughly ten times slower than the one before. An L1 hit and a trip to DRAM differ by ~100×; RAM and an NVMe SSD
            differ by another ~1000×. That is why running out of RAM (and swapping to SSD) feels like the computer has frozen.
          </Callout>
          <Callout tone="warn" title="Where unified memory changes the picture">
            On Apple Silicon the GPU has no private VRAM tier and no PCIe hop: it reads the same pool as the CPU. That removes copies, but the pool is
            shared, so CPU, GPU and Neural Engine compete for capacity and bandwidth. See{" "}
            <Link href="/unified-memory" className="text-accent underline underline-offset-2">
              Unified memory
            </Link>
            .
          </Callout>
        </div>
      </Section>

      <Section
        id="latency-bandwidth"
        kicker="02 · Latency vs bandwidth"
        title="A wider highway doesn't make the on-ramp shorter"
        lede="Latency is how long you wait for the first byte. Bandwidth is how fast bytes flow once they start. GDDR7 graphics memory has far more bandwidth than desktop DDR5 — and higher latency. Which is 'faster' depends entirely on how much data you need at once."
      >
        <LatencyVsBandwidth />
      </Section>

      <Section
        id="caches"
        kicker="03 · Caches"
        title="Why a few megabytes of cache matter so much"
        lede="Caches work because programs are predictable: they reuse recent data (temporal locality) and touch data near what they just used (spatial locality). Step through different access patterns and watch the hit rate — and the average access time — change."
      >
        <CacheSim />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Panel className="p-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--k-cache)]">L1</div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Split into instruction and data caches, private to each core, tens of KB, answered in ~4–5 cycles. Its size is limited because making
              it bigger makes it slower.
            </p>
          </Panel>
          <Panel className="p-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--k-cache)]">L2</div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              ~1–3 MB per core on recent x86 designs; Apple instead shares a large L2 across each cluster of cores. Catches most L1 misses.
            </p>
          </Panel>
          <Panel className="p-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--k-cache)]">L3 / last level</div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Shared by many cores; tens of MB. AMD&apos;s X3D chips stack extra cache here (see the{" "}
              <Link href="/learn/cpu#vcache" className="text-accent underline underline-offset-2">
                V-Cache explainer
              </Link>
              ). Apple adds a System Level Cache shared with the GPU.
            </p>
          </Panel>
        </div>
      </Section>

      <Section
        id="ram"
        kicker="04 · RAM"
        title="Calculate what your memory spec actually means"
        lede="RAM is sold with a data rate (like DDR5-6000) and a CAS latency (like CL30). Neither number alone tells you latency or bandwidth — and bus width, which is rarely on the box, matters as much as either."
      >
        <RamCalculator />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Callout tone="myth" title="Myth: more RAM makes a computer faster">
            More RAM helps only if you were running out. If your apps fit, extra capacity sits idle; speed comes from latency and bandwidth. If they
            don&apos;t fit, the OS swaps to the SSD — ~1000× slower — and more RAM helps enormously.
          </Callout>
          <Callout tone="info" title="Why laptops and SoCs use LPDDR">
            Soldered LPDDR placed close to (or on) the processor package uses less power and can run very wide buses, giving high bandwidth. The
            tradeoff: it can't be upgraded later. Socketed DDR5 DIMMs and newer CAMM modules trade some of that for upgradeability.
          </Callout>
        </div>
      </Section>

      <Section kicker="Keep going" title="Related">
        <div className="flex flex-wrap gap-2">
          {[
            ["/learn/memory-hierarchy", "Lesson 3 · The memory hierarchy"],
            ["/learn/ram", "Lesson 4 · RAM"],
            ["/learn/storage", "Lesson 5 · Storage"],
            ["/unified-memory", "Unified memory"],
            ["/llm", "LLM memory calculator"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:border-line-strong hover:text-fg">
              {label}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

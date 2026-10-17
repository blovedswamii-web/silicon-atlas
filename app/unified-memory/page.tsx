import type { Metadata } from "next";
import Link from "next/link";
import { Callout, KIND_VAR, Kicker, PageHeader, Panel, Section } from "@/components/ui/primitives";
import { UnifiedMemoryViz } from "@/components/memory/UnifiedMemoryViz";
import { UnifiedPressure } from "@/components/memory/UnifiedPressure";

export const metadata: Metadata = {
  title: "Unified Memory",
  description: "What Apple's unified memory architecture is, what it isn't, and why 16 GB of unified memory is not the same as 16 GB of VRAM.",
};

const REALITY = [
  {
    title: "Bandwidth",
    kind: "cache" as const,
    text: "Unified memory doesn't make memory faster by itself. Bandwidth comes from bus width × data rate. Apple's larger chips use very wide buses (hundreds of GB/s); entry chips are closer to ordinary laptop memory. High-end discrete GPUs have even more bandwidth to their own VRAM.",
  },
  {
    title: "Allocation",
    kind: "memory" as const,
    text: "There is no fixed split between 'CPU memory' and 'GPU memory'. The OS hands out pages to whichever engine asks. By default macOS caps how much the GPU can wire for itself (a large fraction of RAM, adjustable by advanced users).",
  },
  {
    title: "Shared vs dedicated",
    kind: "vram" as const,
    text: "Dedicated VRAM is reserved for the GPU and never competes with your browser. Shared memory is flexible, but your apps, the OS and the GPU all draw from the same pool.",
  },
  {
    title: "Memory pressure",
    kind: "power" as const,
    text: "When the pool fills, macOS compresses memory and then swaps to the SSD. On a PC, a full VRAM spills over PCIe and a full RAM pages to disk. Both get slow — at different thresholds.",
  },
  {
    title: "Capacity",
    kind: "storage" as const,
    text: "Capacity is chosen at purchase and can't be upgraded: the memory sits on the chip package. A desktop PC can usually add RAM later; VRAM is fixed per graphics card, but the card can be replaced.",
  },
  {
    title: "Copies",
    kind: "interconnect" as const,
    text: "Avoiding CPU↔GPU copies helps most when work bounces between engines (video pipelines, ML pre/post-processing, large models). Workloads that load data once and stay on the GPU benefit less.",
  },
  {
    title: "Latency",
    kind: "cpu" as const,
    text: "Being 'on the package' shortens wires, but DRAM latency is dominated by how DRAM works, not distance. Don't expect dramatically lower latency — expect high bandwidth and fewer copies.",
  },
];

export default function UnifiedMemoryPage() {
  return (
    <>
      <PageHeader
        kicker="Memory architecture"
        title="Unified memory: one pool, every engine."
        lede="Apple calls it Unified Memory Architecture. It does not simply mean 'Mac RAM is faster'. It means the CPU, GPU, Neural Engine and media engines all read and write the same memory — so certain copies disappear, the GPU can use far more memory than a typical graphics card has, and the capacity you buy is the capacity you keep."
      />

      <Section kicker="01 · See the difference" title="Follow one piece of data through both systems">
        <UnifiedMemoryViz />
      </Section>

      <Section kicker="02 · Why Apple built it this way" title="Integration is the point">
        <div className="grid gap-4 md:grid-cols-3">
          <Panel className="p-5">
            <div className="text-sm font-semibold text-fg">Memory on the package</div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              LPDDR memory chips sit right next to the SoC on the same package. Short connections allow a very wide bus at low power — good for
              laptops, and the only way to feed a large integrated GPU.
            </p>
          </Panel>
          <Panel className="p-5">
            <div className="text-sm font-semibold text-fg">One address space</div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Apps can hand a buffer from CPU to GPU to Neural Engine without duplicating it. Frameworks like MLX are designed so arrays simply live in
              shared memory.
            </p>
          </Panel>
          <Panel className="p-5">
            <div className="text-sm font-semibold text-fg">Hardware + OS designed together</div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Apple controls the chip, the OS, the GPU driver and Metal. That lets the memory model be assumed everywhere — a software advantage as much
              as a hardware one.
            </p>
          </Panel>
        </div>
      </Section>

      <Section
        kicker="03 · Reality is more complex"
        title="What the simple diagram leaves out"
        lede="The two-box picture builds intuition. Here is what actually determines how a system behaves."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REALITY.map((r) => (
            <Panel key={r.title} className="relative overflow-hidden p-5">
              <div className="absolute inset-y-0 left-0 w-0.5" style={{ background: KIND_VAR[r.kind] }} />
              <div className="text-sm font-semibold text-fg">{r.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.text}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section
        kicker="04 · Try it"
        title="Fill the pool"
        lede="Slide your apps and the GPU's working set up and watch where each system runs out of room."
      >
        <UnifiedPressure />
      </Section>

      <Section kicker="05 · Not unique to Apple" title="Shared memory exists elsewhere too">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["PC integrated graphics", "Every Intel and AMD integrated GPU shares system RAM with the CPU. Usually with a narrower, slower memory bus than Apple's larger chips, so it's 'shared' but rarely used for big GPU workloads."],
            ["AMD Ryzen AI Max (\"Strix Halo\")", "A large integrated GPU with a wide LPDDR5X bus and configurations up to 128 GB that can be allocated largely to the GPU — the closest PC analogue to Apple's approach."],
            ["NVIDIA GB10-based systems", "Compact AI workstations pair an Arm CPU and a Blackwell GPU with a single large pool of LPDDR5X memory, so large models fit without a VRAM limit."],
            ["Game consoles", "PlayStation and Xbox consoles have long used one shared pool of fast GDDR memory for CPU and GPU."],
          ].map(([t, d]) => (
            <Panel key={t} className="p-5">
              <div className="text-sm font-semibold text-fg">{t}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </Panel>
          ))}
        </div>
        <Callout tone="good" className="mt-4" title="So what is Apple's distinction?">
          Scale (very wide buses and large capacities on the higher-end chips), integration (memory on the package, every engine on one chip) and a
          software model built around it from top to bottom.
        </Callout>
      </Section>

      <Section kicker="06 · Tradeoffs" title="Advantages and disadvantages">
        <div className="grid gap-4 md:grid-cols-2">
          <Panel className="p-5">
            <Kicker color="var(--good)">Advantages</Kicker>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
              <li>The GPU can use a large share of total memory — tens of GB on higher configurations, far beyond most graphics cards.</li>
              <li>Fewer CPU↔GPU copies; buffers can be shared between engines.</li>
              <li>Wide, low-power memory buses suit laptops and enable strong performance per watt.</li>
              <li>Memory not needed by the GPU is available to apps, and vice versa.</li>
            </ul>
          </Panel>
          <Panel className="p-5">
            <Kicker color="var(--bad)">Disadvantages</Kicker>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
              <li>Capacity is fixed at purchase; it cannot be upgraded later.</li>
              <li>Capacity upgrades are bought from Apple at configuration time and can be expensive per GB.</li>
              <li>Apps, OS and GPU compete for one pool; a big GPU job can squeeze everything else.</li>
              <li>Peak bandwidth on most configurations is below what high-end discrete GPUs have to their own VRAM.</li>
            </ul>
          </Panel>
        </div>
        <Callout tone="myth" className="mt-4" title="16 GB unified ≠ 16 GB VRAM">
          16 GB of unified memory is shared by the OS, your apps and the GPU — the GPU might comfortably use around 10 GB of it. 16 GB of VRAM is all
          for the GPU, on top of whatever system RAM the PC has, but it&apos;s a hard ceiling. Neither number alone tells you which is better for your
          workload. See it with real model sizes in the <Link href="/llm" className="text-accent">LLM memory calculator</Link>.
        </Callout>
      </Section>
    </>
  );
}

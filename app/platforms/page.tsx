import type { Metadata } from "next";
import Link from "next/link";
import { PlatformExplorer } from "@/components/architecture/PlatformExplorer";
import { SideBySide } from "@/components/architecture/SideBySide";
import { Callout, Kicker, PageHeader, Panel, Section } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Platform Architecture Explorer",
  description: "How a traditional PC, an Apple Silicon Mac and each AMD/Intel/NVIDIA combination move data differently.",
};

const UMA_POINTS = [
  {
    title: "What it means",
    tone: "var(--good)",
    items: [
      "CPU, GPU, Neural Engine and media engines all address one physical pool of memory.",
      "Bulk copies between “CPU RAM” and “GPU VRAM” can be avoided — there is only one pool.",
      "The memory sits inside the SoC package on a wide bus, so the GPU gets high bandwidth.",
    ],
  },
  {
    title: "What it does NOT mean",
    tone: "var(--bad)",
    items: [
      "It does not simply mean “Mac RAM is faster.” Bandwidth varies a lot by chip tier.",
      "It is not infinite GPU memory: CPU, apps and GPU all share the same capacity.",
      "It is not unique to Apple: PC integrated GPUs, consoles and some large APUs share memory too.",
    ],
  },
  {
    title: "What it costs",
    tone: "var(--warn)",
    items: [
      "Capacity is fixed at purchase — memory cannot be upgraded later.",
      "Every gigabyte the GPU uses is a gigabyte the CPU and apps can’t.",
      "A top desktop graphics card’s VRAM still has more raw bandwidth than most unified-memory chips.",
    ],
  },
];

export default function PlatformsPage() {
  return (
    <>
      <PageHeader
        kicker="Platform Architecture Explorer"
        title="Same job, different machines."
        lede="Pick a system to see how its compute, memory and data paths are arranged. Then animate a data path and watch where the bytes actually travel. A Mac with Apple Silicon is not a PC with different parts — its shape is different."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <PlatformExplorer />
      </div>

      <Section
        kicker="Unified Memory Architecture"
        title="Why Apple calls it “unified” memory"
        lede="On a traditional PC, the GPU works out of its own VRAM, so data the CPU prepared is moved across PCIe first. On Apple Silicon there is no second pool to move it into."
      >
        <SideBySide />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {UMA_POINTS.map((col) => (
            <Panel key={col.title} className="p-5">
              <Kicker color={col.tone}>{col.title}</Kicker>
              <ul className="mt-3 space-y-2.5">
                {col.items.map((t) => (
                  <li key={t} className="flex gap-2 text-sm leading-relaxed text-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: col.tone }} />
                    {t}
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
        <Callout tone="info" title="The diagram is simplified on purpose" className="mt-4">
          Real systems add caches, coherency protocols, Resizable BAR, pinned memory, driver-managed residency and more.
          The animation shows the <em>shape</em> of the data path, not its timing.{" "}
          <Link href="/unified-memory" className="text-accent underline underline-offset-4">
            Go deeper on unified memory →
          </Link>
        </Callout>
      </Section>

      <Section kicker="One vendor ≠ one memory pool" title="An all-AMD or all-Intel PC is still a discrete system">
        <SideBySide left="amd-amd" right="pc-integrated" />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
          Buying the CPU and graphics card from the same company does not merge their memory: a Ryzen + Radeon desktop has
          the same RAM-plus-VRAM shape as any other discrete PC. The shared-memory shape comes from <strong className="text-fg">integration</strong> —
          putting the GPU on the same chip or package as the CPU — which is what PC laptops with integrated graphics, AMD’s
          Ryzen AI Max parts and Apple Silicon all do, at very different scales of bandwidth and capacity.
        </p>
      </Section>
    </>
  );
}

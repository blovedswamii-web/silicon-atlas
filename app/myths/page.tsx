import type { Metadata } from "next";
import { MisleadingCompare, MythCards } from "@/components/tools/Myths";
import { PageHeader, Panel, Section } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Myths & Misleading Numbers",
  description: "Seventeen common hardware myths, and how to question marketing numbers like GHz, cores, TOPS and GB.",
};

const HABITS = [
  { q: "What exactly is being counted?", d: "Cores, 'GPU cores', CUDA cores and stream processors are different units. TOPS may be INT4 or INT8, sparse or dense." },
  { q: "Is it peak or sustained?", d: "Boost clocks, TFLOPS and SSD speeds are best-case. Sustained performance depends on power, cooling and workload." },
  { q: "Chip, component, system or platform?", d: "An Apple M-series chip is a whole SoC; a GeForce card is one component. Compare like with like." },
  { q: "Does my software use it?", d: "An NPU your apps don't call, or a GPU your framework doesn't support, contributes nothing." },
  { q: "Is capacity or speed the question?", d: "GB of memory decides what fits; bandwidth and compute decide how fast it runs once it fits." },
];

export default function MythsPage() {
  return (
    <>
      <PageHeader
        kicker="Tools · Critical thinking"
        title="Myths & misleading numbers"
        lede="Spec sheets are written to sell. The numbers are usually true — but they are often not comparable, not sustained, or not relevant to your work. Guess first, then reveal."
      />
      <Section kicker="17 myths" title="True, false, or misleading?">
        <MythCards />
      </Section>
      <Section
        kicker="Looks like vs reality"
        title="Same-looking numbers, different meanings"
        lede="Each pair below looks like an apples-to-apples comparison. Reveal why it isn't — and the questions that would have caught it."
      >
        <MisleadingCompare />
      </Section>
      <Section kicker="Habits" title="Five questions to ask of any marketing number">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {HABITS.map((h) => (
            <Panel key={h.q} className="p-4">
              <div className="text-sm font-medium text-fg">{h.q}</div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{h.d}</p>
            </Panel>
          ))}
        </div>
      </Section>
    </>
  );
}

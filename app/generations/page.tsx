import type { Metadata } from "next";
import { Callout, PageHeader, Section } from "@/components/ui/primitives";
import { GenerationTimeline } from "@/components/companies/GenerationTimeline";

export const metadata: Metadata = {
  title: "Architecture Generations",
  description: "What actually changed between Apple, AMD, NVIDIA and Intel architecture generations.",
};

const LESSONS_ = [
  { t: "Process isn't everything", d: "A new manufacturing node gives designers more transistors per watt. What they spend them on — cache, wider cores, AI units — is the architecture." },
  { t: "Some generations are refreshes", d: "A new name can mean the same core design at higher clocks. Read what changed, not the number." },
  { t: "Features matter more than you think", d: "Hardware ray tracing, AV1 encode, FP8/FP4 support or more cache can change what a chip is useful for, not just how fast it is." },
];

export default function GenerationsPage() {
  return (
    <>
      <PageHeader
        kicker="Generations"
        title="Don't memorise names. Learn what changed."
        lede="Each generation spends a new transistor budget differently: wider cores, more cache, new memory, AI hardware, media engines, efficiency. Pick a family and see what moved — or highlight one area to see when it changed."
      />
      <Section className="pt-0">
        <GenerationTimeline />
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {LESSONS_.map((l) => (
            <div key={l.t} className="rounded-xl border border-line p-4">
              <div className="font-medium text-fg">{l.t}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted">{l.d}</p>
            </div>
          ))}
        </div>
        <Callout tone="warn" className="mt-6" title="Sources">
          Generation details are compiled from manufacturer announcements and marked “compiled — verify at source”. Items
          are kept qualitative where exact figures vary by product.
        </Callout>
      </Section>
    </>
  );
}

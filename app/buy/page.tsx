import type { Metadata } from "next";
import Link from "next/link";
import { BuyingAssistant } from "@/components/buying/BuyingAssistant";
import { Callout, PageHeader, Panel, Section } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "What Should I Buy?",
  description: "Answer a few questions and learn which specifications to prioritise — with the tradeoffs of each platform family.",
};

const RULES = [
  { t: "Start from the workload, not the brand", d: "Write down the three things you'll do most. Every spec decision follows from that list." },
  { t: "Capacity first, then speed", d: "Make sure RAM, VRAM or unified memory and storage are big enough for your largest projects. Running out is the one problem no amount of speed fixes." },
  { t: "Buy fixed things generously", d: "Anything soldered — laptop RAM, all Apple Silicon memory and storage, VRAM on any GPU — can't be upgraded. Upgradeable parts can be bought later." },
  { t: "Check the software", d: "Confirm your critical apps, games and frameworks run well on the platform. Hardware your software can't use is wasted." },
  { t: "Read independent benchmarks of your workload", d: "Use spec sheets to shortlist and benchmarks to decide. A single synthetic score rarely represents your work." },
];

export default function BuyPage() {
  return (
    <>
      <PageHeader
        kicker="Tools · Buying assistant"
        title="What should I buy?"
        lede="This assistant won't tell you which brand to buy. It tells you which specifications matter most for the way you work, and when each platform family is attractive — so you can read any spec sheet with confidence."
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <BuyingAssistant />
      </div>
      <Section kicker="Principles" title="Five rules that survive every product generation">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RULES.map((r, i) => (
            <Panel key={r.t} className="p-5">
              <div className="font-mono text-xs text-dim">0{i + 1}</div>
              <div className="mt-2 font-medium text-fg">{r.t}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.d}</p>
            </Panel>
          ))}
        </div>
        <Callout className="mt-6" tone="info" title="Go deeper">
          See how a chosen configuration behaves in the <Link className="text-accent underline underline-offset-2" href="/bottleneck-lab">Bottleneck Lab</Link>, check
          whether a model fits with the <Link className="text-accent underline underline-offset-2" href="/llm">LLM calculator</Link>, or decode any number in the{" "}
          <Link className="text-accent underline underline-offset-2" href="/specs">Spec Decoder</Link>.
        </Callout>
      </Section>
    </>
  );
}

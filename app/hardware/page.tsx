import Link from "next/link";
import type { Metadata } from "next";
import { Callout, PageHeader, Section } from "@/components/ui/primitives";
import { HardwareDatabase } from "@/components/companies/HardwareDatabase";

export const metadata: Metadata = {
  title: "Hardware Database",
  description: "Representative CPUs, GPUs and SoCs with sources and last-updated dates.",
};

export default function HardwarePage() {
  return (
    <>
      <PageHeader
        kicker="Hardware database"
        title="Representative products, with receipts."
        lede="A small set of well-known chips and cards, stored as structured data separately from the lessons. Every figure lists where it came from and when it was last updated. Use it to read specs in context — not to rank products."
      />
      <Section className="pt-0">
        <Callout tone="warn" className="mb-6" title="Verify before you buy">
          Entries marked “compiled — verify at source” were entered from manufacturer announcements without a live re-check.
          Specs that vary by configuration (laptop power limits, binned Apple chips) are described as ranges or left out
          rather than guessed. Spec names link to the <Link href="/specs" className="text-accent underline underline-offset-2">Spec Decoder</Link>.
        </Callout>
        <HardwareDatabase />
      </Section>
    </>
  );
}

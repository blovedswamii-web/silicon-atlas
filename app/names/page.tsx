import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui/primitives";
import { NameDecoder } from "@/components/companies/NameDecoder";

export const metadata: Metadata = {
  title: "Name Decoder",
  description: "Decode RTX, Radeon, Ryzen, Core Ultra, Arc and Apple M-series names — and learn what they don't tell you.",
};

const TIERS = [
  { co: "NVIDIA", t: "RTX xx50 → 60 → 70 → 80 → 90", n: "Two digits after the generation. Ti and SUPER sit between tiers." },
  { co: "AMD CPU", t: "Ryzen 3 → 5 → 7 → 9", n: "Suffixes (X, X3D, G, HX, U) often matter more than the tier." },
  { co: "AMD GPU", t: "RX x600 → x700 → x800 → x900 (7000) · RX 9060 → 9070 (9000)", n: "The digit scheme changed with RX 9000." },
  { co: "Intel CPU", t: "Core Ultra 5 → 7 → 9", n: "The suffix (K, H, HX, U, V) can mean a different chip design entirely." },
  { co: "Intel GPU", t: "Arc A → B (→ C…)", n: "Letter = generation; first digit = tier." },
  { co: "Apple", t: "M → M Pro → M Max → M Ultra", n: "Each tier is a bigger chip with more memory bandwidth; configurations vary within a tier." },
];

export default function NamesPage() {
  return (
    <>
      <PageHeader
        kicker="Name decoder"
        title="What a product name tells you — and what it doesn't."
        lede="Hardware names encode brand, tier, generation and variant. They're useful for orientation and useless as a performance scale. Decode a name, then go read the actual specs and measurements."
      />
      <Section className="pt-0">
        <NameDecoder />
      </Section>
      <Section kicker="Tier ladders" title="How each company orders its line-up">
        <div className="grid gap-3 md:grid-cols-2">
          {TIERS.map((t) => (
            <div key={t.co} className="rounded-xl border border-line p-4">
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-dim">{t.co}</div>
              <div className="mt-1.5 font-mono text-sm text-fg">{t.t}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.n}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

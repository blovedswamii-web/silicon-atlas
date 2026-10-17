import Link from "next/link";
import type { Metadata } from "next";
import { COMPANIES } from "@/data/companies";
import { Badge, COMPANY_VAR, Kicker, PageHeader, Panel, ScopeTag, Section } from "@/components/ui/primitives";
import { ScopeLadder } from "@/components/companies/ScopeLadder";
import { CompanyMatrix } from "@/components/companies/CompanyMatrix";
import { ArchCompare } from "@/components/companies/ArchCompare";

export const metadata: Metadata = {
  title: "Apple vs AMD vs NVIDIA vs Intel",
  description: "What each company actually builds — and why comparing them is rarely apples to apples.",
};

const DIMENSIONS = [
  { id: "architecture", label: "Architecture", text: "How the chip is designed: cores, caches, execution units, memory system." },
  { id: "performance", label: "Performance", text: "Measured results in a specific workload — never inferred from specs alone." },
  { id: "software", label: "Software", text: "APIs, drivers, frameworks and apps that actually use the hardware." },
  { id: "power", label: "Power", text: "How much energy it uses and how much heat must be removed." },
  { id: "memory", label: "Memory", text: "Capacity, bandwidth and whether CPU and GPU share it." },
  { id: "price", label: "Price", text: "Of the whole system you need, not one chip." },
  { id: "compatibility", label: "Compatibility", text: "OS, games, plugins, anti-cheat, CUDA-only tools." },
  { id: "workload", label: "Workload", text: "What you do decides which of the above matters." },
];

export default function CompaniesPage() {
  return (
    <>
      <PageHeader
        kicker="Apple · AMD · NVIDIA · Intel"
        title="Four companies. Four different things they build."
        lede="This isn't a page about who's best. Apple ships whole computers built around one chip. AMD and Intel make CPUs and GPUs you combine with other parts. NVIDIA makes GPUs and the software that makes them useful. Before comparing them, you need to know what you're actually comparing."
      >
        <div className="flex flex-wrap gap-2">
          {COMPANIES.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: COMPANY_VAR[c.id] }} />
              {c.name}
            </Link>
          ))}
        </div>
      </PageHeader>

      <Section
        kicker="Chip · Component · System · Platform"
        title="Not an apples-to-apples comparison"
        lede="An Apple M-series chip contains what a PC splits across a CPU, a graphics card and memory. A GeForce RTX card is one component that needs a whole PC around it. Comparing a MacBook Pro to an RTX card compares a whole laptop to one part of a desktop."
      >
        <ScopeLadder />
      </Section>

      <Section kicker="Product lines" title="Who builds what" lede="Hover a column to see what the category means. Notice how few cells overlap.">
        <CompanyMatrix />
      </Section>

      <Section kicker="The companies" title="Four design philosophies">
        <div className="grid gap-4 md:grid-cols-2">
          {COMPANIES.map((c) => (
            <Link key={c.id} href={`/companies/${c.id}`} className="group min-w-0">
              <Panel className="relative h-full overflow-hidden p-5 transition-colors group-hover:border-line-strong">
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: COMPANY_VAR[c.id] }} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-lg font-semibold text-fg">{c.name}</span>
                  <span className="flex flex-wrap gap-1">
                    {c.isa.map((i) => (
                      <Badge key={i}>{i}</Badge>
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.tagline}</p>
                <ul className="mt-4 space-y-1.5">
                  {c.productLines.slice(0, 4).map((pl) => (
                    <li key={pl.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-fg">{pl.name}</span>
                      <ScopeTag scope={pl.scope} />
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-sm text-accent">Explore {c.name} →</div>
              </Panel>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        kicker="Architecture comparison"
        title="Apple M-series vs Ryzen + RTX vs Intel + RTX"
        lede="Pick one question at a time. The diagrams highlight the parts of each system that answer it."
      >
        <ArchCompare />
      </Section>

      <Section
        kicker="How to compare fairly"
        title="Separate the questions"
        lede="Most arguments about brands mix eight different questions into one. Keep them apart and the tradeoffs become clear."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DIMENSIONS.map((d, i) => (
            <Panel key={d.id} className="p-4">
              <Kicker>{String(i + 1).padStart(2, "0")}</Kicker>
              <div className="mt-2 font-medium text-fg">{d.label}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted">{d.text}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { href: "/compare", label: "Platform comparison table →" },
            { href: "/generations", label: "What changed between generations →" },
            { href: "/names", label: "Decode a product name →" },
            { href: "/hardware", label: "Hardware database →" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:border-line-strong hover:text-fg">
              {l.label}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

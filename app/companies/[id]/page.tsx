import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COMPANIES, getCompany } from "@/data/companies";
import { GENERATION_FAMILIES } from "@/data/architectures";
import { PRODUCTS } from "@/data/products";
import { LESSONS } from "@/data/lessons";
import { Badge, COMPANY_VAR, Kicker, Panel, ScopeTag, Section } from "@/components/ui/primitives";
import { DepthToggle, LayeredText } from "@/components/ui/Depth";
import { GenerationTimeline } from "@/components/companies/GenerationTimeline";

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = getCompany(id);
  return c ? { title: c.name, description: c.tagline } : {};
}

const STACK_LABEL: Record<string, string> = {
  "apple-ai": "Metal · MPS · MLX · Core ML",
  "apple-graphics": "Metal · MetalFX",
  "amd-ai": "ROCm · HIP · MIOpen",
  "amd-graphics": "DirectX / Vulkan · FSR",
  "nvidia-ai": "CUDA · cuDNN · TensorRT",
  "nvidia-graphics": "DirectX / Vulkan · DLSS",
  "intel-ai": "oneAPI · OpenVINO · PyTorch XPU",
  "intel-graphics": "DirectX / Vulkan · XeSS",
};

const LESSON_FOR: Record<string, string> = { apple: "apple-silicon", amd: "amd", nvidia: "nvidia", intel: "intel" };

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCompany(id);
  if (!c) notFound();
  const color = COMPANY_VAR[c.id];
  const families = GENERATION_FAMILIES.filter((f) => f.company === c.id);
  const products = PRODUCTS.filter((p) => p.company === c.id);
  const lesson = LESSONS.find((l) => l.slug === LESSON_FOR[c.id]);

  return (
    <>
      <header className="mx-auto max-w-6xl px-4 pb-4 pt-12 sm:px-6 sm:pt-16">
        <Link href="/companies" className="text-xs text-dim hover:text-fg">
          ← All companies
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ background: color }} />
          <Kicker color={color}>What {c.name} actually builds</Kicker>
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">{c.name}</h1>
        <p className="mt-4 max-w-3xl text-pretty text-lg leading-relaxed text-muted">{c.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {c.isa.map((i) => (
            <Badge key={i}>ISA · {i}</Badge>
          ))}
        </div>
      </header>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-xs text-dim">Explain at the level of</span>
              <DepthToggle />
            </div>
            <LayeredText text={c.summary} />
            {lesson && (
              <Link href={`/learn/${lesson.slug}`} className="mt-5 inline-block text-sm text-accent">
                Full lesson: {lesson.number}. {lesson.title} →
              </Link>
            )}
          </div>
          <Panel className="h-fit p-4">
            <Kicker>Software stacks</Kicker>
            <ul className="mt-2 space-y-1.5">
              {c.softwareStack.map((s) => (
                <li key={s} className="text-sm text-muted">
                  {STACK_LABEL[s] ?? s}
                </li>
              ))}
            </ul>
            <Link href="/ai" className="mt-3 inline-block text-xs text-accent">
              How software changes hardware usefulness →
            </Link>
          </Panel>
        </div>
      </Section>

      <Section kicker="Product lines" title="What they sell — and at what scope">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.productLines.map((pl) => (
            <Panel key={pl.name} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-fg">{pl.name}</span>
                <ScopeTag scope={pl.scope} />
              </div>
              <div className="mt-1 text-xs text-dim">{pl.market}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{pl.description}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section kicker="Key technologies" title="The vocabulary">
        <div className="grid gap-3 sm:grid-cols-2">
          {c.keyTech.map((k) => (
            <div key={k.term} className="rounded-xl border border-line p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-fg">{k.term}</span>
                {k.conceptId && (
                  <Link href={`/glossary#${k.conceptId}`} className="font-mono text-[10.5px] uppercase tracking-wider text-dim hover:text-fg">
                    glossary
                  </Link>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{k.explain}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="Tradeoffs" title="Where this approach shines — and what it costs">
        <div className="grid gap-4 md:grid-cols-2">
          <Panel className="p-5">
            <Kicker color="var(--good)">Strengths of the approach</Kicker>
            <ul className="mt-3 space-y-2.5">
              {c.strengths.map((s) => (
                <li key={s} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-good" />
                  {s}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel className="p-5">
            <Kicker color="var(--warn)">Limitations & tradeoffs</Kicker>
            <ul className="mt-3 space-y-2.5">
              {c.limitations.map((s) => (
                <li key={s} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-warn" />
                  {s}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </Section>

      {families.length > 0 && (
        <Section kicker="Generations" title="What changed, generation by generation">
          <GenerationTimeline initialFamily={families[0].id} />
        </Section>
      )}

      {products.length > 0 && (
        <Section kicker="Representative products" title="In the hardware database">
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <Link key={p.id} href="/hardware" className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:border-line-strong hover:text-fg">
                {p.name}
                <ScopeTag scope={p.scope} />
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <div className="grid gap-3 sm:grid-cols-3">
          {COMPANIES.filter((o) => o.id !== c.id).map((o) => (
            <Link key={o.id} href={`/companies/${o.id}`} className="rounded-xl border border-line p-4 transition-colors hover:border-line-strong">
              <div className="flex items-center gap-2 text-sm font-medium text-fg">
                <span className="h-2 w-2 rounded-full" style={{ background: COMPANY_VAR[o.id] }} />
                {o.name}
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-dim">{o.tagline}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

import Link from "next/link";
import { InteractiveComputer } from "@/components/computer/InteractiveComputer";
import { SideBySide } from "@/components/architecture/SideBySide";
import { WorkloadIcon } from "@/components/simulations/icons";
import { Kicker, Panel, Section } from "@/components/ui/primitives";
import { WORKLOADS } from "@/data/workloads";
import { NAV } from "@/lib/nav";

const SCOPES = [
  { scope: "Chip", text: "One piece of silicon (or a package of chiplets).", examples: "Ryzen 9 9950X · Core Ultra 9 285K · GB202 GPU die" },
  { scope: "Component", text: "A part you can buy and install on its own.", examples: "A GeForce RTX card · a Radeon RX card · a DDR5 kit" },
  { scope: "System", text: "A complete working computer made of components.", examples: "A Ryzen + RTX desktop · a gaming laptop" },
  { scope: "Platform", text: "Hardware + OS + software ecosystem designed together.", examples: "Apple Silicon + macOS + Metal · Windows PC + DirectX + CUDA" },
];

const OUTCOMES = [
  "What CPUs and GPUs actually do — and why GPUs are good at AI",
  "Why cache, RAM and VRAM all exist",
  "How Apple Silicon differs from a PC with a graphics card",
  "Why 16 GB unified memory ≠ 16 GB VRAM",
  "Why CUDA cores can't be compared with Apple GPU cores",
  "Why GHz can't be compared across architectures",
  "Why CUDA, ROCm, Metal and oneAPI change what hardware is useful for",
  "Why a laptop RTX 5090 is not a desktop RTX 5090",
  "Why no single company is best at everything",
];

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 sm:pt-20">
        <Kicker>An interactive guide to how computers work</Kicker>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-6xl">
          Stop reading specs as numbers. See the machine.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
          Every computer is compute, memory, data movement, software and power — arranged differently by Apple, AMD, NVIDIA and
          Intel. Click into the parts, run real workloads on different architectures, and learn what the numbers on a spec sheet
          actually mean.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/run" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90">
            Run a program on different computers
          </Link>
          <Link href="/platforms" className="rounded-xl border border-line-strong px-4 py-2.5 text-sm font-medium text-fg hover:bg-panel-2">
            Explore platform architectures
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <InteractiveComputer />
      </section>

      <Section
        kicker="Two shapes of computer"
        title="A Mac with Apple Silicon is not a PC with different parts."
        lede="A traditional PC keeps the CPU's memory and the GPU's memory apart, joined by PCIe. Apple Silicon puts CPU, GPU and accelerators on one chip that shares one memory pool. Watch the same hand-off — “the GPU needs data the CPU prepared” — on each."
      >
        <SideBySide />
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link href="/platforms" className="text-accent">
            Compare all seven platforms →
          </Link>
          <Link href="/unified-memory" className="text-accent">
            What “unified memory” really means →
          </Link>
        </div>
      </Section>

      <Section
        kicker="The defining experience"
        title="Run the same program on different computers."
        lede="Where do an LLM's weights live? Which memory does a game's textures use? Which engine decodes your video? Pick a workload and watch it flow through each architecture."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {WORKLOADS.map((w) => (
            <Link
              key={w.id}
              href={`/run?w=${w.id}`}
              className="group rounded-2xl border border-line bg-panel p-4 transition-colors hover:border-line-strong"
            >
              <span className="text-dim transition-colors group-hover:text-accent">
                <WorkloadIcon name={w.icon} size={22} />
              </span>
              <div className="mt-3 text-sm font-medium text-fg">{w.name}</div>
              <div className="mt-1 line-clamp-2 text-xs leading-snug text-dim">{w.summary}</div>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        kicker="Compare like with like"
        title="Chip · Component · System · Platform"
        lede="Apple sells whole platforms. AMD, NVIDIA and Intel mostly sell chips and components that become systems. A MacBook Pro shouldn't be compared with one graphics card — this distinction runs through the whole site."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SCOPES.map((s, i) => (
            <Panel key={s.scope} className="relative p-5">
              <div className="font-mono text-xs text-dim">0{i + 1}</div>
              <div className="mt-2 text-lg font-semibold text-fg">{s.scope}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-dim">{s.examples}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section kicker="Everything on the site" title="Pick a path.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {NAV.map((g) => (
            <div key={g.id}>
              <Kicker>{g.label}</Kicker>
              <div className="mt-2 space-y-1.5">
                {g.items.map((it) => (
                  <Link key={it.href} href={it.href} className="block rounded-xl border border-line bg-panel px-4 py-3 transition-colors hover:border-line-strong">
                    <div className="text-sm font-medium text-fg">{it.label}</div>
                    <div className="mt-0.5 text-xs text-dim">{it.blurb}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Panel className="p-5 lg:col-span-1">
            <Kicker>By the end you’ll understand</Kicker>
            <ul className="mt-3 space-y-2">
              {OUTCOMES.map((o) => (
                <li key={o} className="flex gap-2 text-sm leading-snug text-muted">
                  <span className="text-good">✓</span>
                  {o}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </Section>
    </>
  );
}

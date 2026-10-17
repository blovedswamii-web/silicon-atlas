import type { Metadata } from "next";
import Link from "next/link";
import { LaptopVsDesktop, PowerCurve, ThermalSim } from "@/components/tools/Efficiency";
import { Callout, KIND_VAR, PageHeader, Panel, Section } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Performance per Watt",
  description: "Why efficiency depends on architecture, process node, power budget, integration, cooling and workload — and why laptop and desktop parts with the same name differ.",
};

const FACTORS = [
  { t: "Microarchitecture", d: "How much work a design completes per clock, and how much energy each instruction costs: cache sizes, execution width, how often the core waits on memory." },
  { t: "Process node", d: "Newer manufacturing processes switch transistors with less energy. Comparing chips on different nodes mixes design skill with manufacturing advantage." },
  { t: "Operating point", d: "Where on its voltage–frequency curve a chip runs. The same silicon is far more efficient at moderate clocks than at maximum boost." },
  { t: "Integration", d: "Moving data costs energy. On-package memory and fewer chip-to-chip hops (SoC designs) save power; long PCIe trips and separate memory pools cost some." },
  { t: "Cooling & power budget", d: "A chip limited to 30 W behaves differently from the same chip allowed 120 W. Cooling decides what can be sustained." },
  { t: "Workload", d: "Efficiency is task-specific. Fixed-function engines (video, NPUs) can be dramatically more efficient than general cores — but only for the work they're built for." },
];

const BATTERY = [
  "Idle and light-load power (screen, Wi-Fi, background tasks) usually dominates real battery life — not peak performance.",
  "Display brightness and refresh rate are often among the largest single consumers.",
  "Discrete GPUs in laptops cost battery unless the system can power them down (switchable graphics).",
  "Hardware video decode for your codec keeps playback cheap; software decode drains quickly.",
  "Battery capacity (Wh) and OS power management matter as much as the chip.",
  "Manufacturer battery figures use their own light tests — look for independent tests under your kind of use.",
];

export default function EfficiencyPage() {
  return (
    <>
      <PageHeader
        kicker="Learn · Power"
        title="Performance per watt"
        lede="Performance is only half the story. How much power it takes decides heat, noise, battery life, electricity cost, and how long a chip can sustain its speed. Efficiency isn't a brand trait — it comes from a stack of decisions."
      />
      <Section kicker="Six factors" title="What actually decides efficiency">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FACTORS.map((f, i) => (
            <Panel key={f.t} className="relative overflow-hidden p-5">
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: KIND_VAR.power, opacity: 0.5 }} />
              <div className="font-mono text-xs text-dim">0{i + 1}</div>
              <div className="mt-2 font-medium text-fg">{f.t}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.d}</p>
            </Panel>
          ))}
        </div>
        <Callout tone="myth" className="mt-5" title="Avoid the shortcut">
          “Apple is always more efficient” and “ARM is efficient, x86 is powerful” are shortcuts that hide the real reasons. Apple
          Silicon’s strong laptop efficiency comes from design targets, leading-edge process nodes, large caches, on-package memory and
          moderate operating points. Recent x86 laptop chips built with similar priorities have narrowed the gap in many tasks, and
          any chip pushed to maximum boost becomes inefficient.
        </Callout>
      </Section>
      <Section kicker="Interactive" title="The voltage–frequency curve" lede="Drag the clock speed. Watch how power climbs faster than performance near the top — and how memory-bound work gains even less from extra clock.">
        <PowerCurve />
      </Section>
      <Section kicker="Interactive" title="Cooling decides sustained speed" lede="Choose a cooler and watch the same chip boost, heat up, and settle at the clock its cooling can sustain.">
        <ThermalSim />
      </Section>
      <Section id="laptop-vs-desktop" kicker="Naming" title="Same name ≠ same performance" lede="Laptop and desktop parts often share brand names while differing in silicon, memory and power limits.">
        <LaptopVsDesktop />
      </Section>
      <Section kicker="Battery" title="What actually drains a laptop battery">
        <Panel className="p-5">
          <ul className="grid gap-3 sm:grid-cols-2">
            {BATTERY.map((b) => (
              <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: KIND_VAR.power }} />
                {b}
              </li>
            ))}
          </ul>
        </Panel>
        <Callout tone="info" className="mt-5" title="And the power supply?">
          A desktop PSU’s wattage is its maximum capacity, not its consumption. A PC with a 1000 W PSU draws only what its parts need at
          that moment. See <Link className="text-accent underline underline-offset-2" href="/myths">Myths & Misleading Numbers</Link>.
        </Callout>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { SpecExplorer } from "@/components/tools/SpecExplorer";
import { SPECS } from "@/data/specs";
import { COMPANY_VAR, Callout, PageHeader, Panel, Section } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Spec Decoder",
  description: "What every specification means, when it matters, and whether you can compare it across Apple, AMD, NVIDIA and Intel.",
};

const UNITS = [
  { what: "Main GPU building block", nvidia: "Streaming Multiprocessor (SM)", amd: "Compute Unit (CU)", intel: "Xe core", apple: "GPU core" },
  { what: "Counted FP32 lanes", nvidia: "CUDA cores", amd: "Stream processors", intel: "Vector engines (inside Xe cores)", apple: "Not marketed" },
  { what: "Matrix / AI units", nvidia: "Tensor Cores", amd: "AI accelerators (RDNA) / Matrix Cores (Instinct)", intel: "XMX engines", apple: "Neural accelerators (newest GPUs) + Neural Engine" },
  { what: "Ray tracing hardware", nvidia: "RT Cores", amd: "Ray Accelerators", intel: "Ray Tracing Units", apple: "Hardware RT (M3 and later)" },
  { what: "Compute API", nvidia: "CUDA", amd: "ROCm / HIP", intel: "oneAPI / SYCL", apple: "Metal" },
];

const COLS = [
  { id: "nvidia", label: "NVIDIA" },
  { id: "amd", label: "AMD" },
  { id: "intel", label: "Intel" },
  { id: "apple", label: "Apple" },
] as const;

export default function SpecsPage() {
  const counts = { yes: 0, partly: 0, no: 0 };
  SPECS.forEach((s) => counts[s.crossBrand.verdict]++);
  return (
    <>
      <PageHeader
        kicker="Tools · Spec decoder"
        title="What does this number actually mean?"
        lede={`${SPECS.length} specifications, each broken down the same way: what it is, why it exists, when it matters, when it doesn't — and the most important question: can I compare this number across brands?`}
      >
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-line px-3 py-1 text-muted"><b className="text-good">{counts.yes}</b> comparable</span>
          <span className="rounded-full border border-line px-3 py-1 text-muted"><b className="text-warn">{counts.partly}</b> with caveats</span>
          <span className="rounded-full border border-line px-3 py-1 text-muted"><b className="text-bad">{counts.no}</b> not comparable</span>
        </div>
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SpecExplorer />
      </div>
      <Section
        kicker="Vendor vocabulary"
        title="Same idea, four names — and four different designs"
        lede="Each company names its GPU building blocks differently. The rows line up concepts, not equivalent amounts of hardware: one SM is not one CU is not one Xe core is not one Apple GPU core."
      >
        <Panel className="overflow-x-auto scroll-thin">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">Concept</th>
                {COLS.map((c) => (
                  <th key={c.id} className="px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: COMPANY_VAR[c.id] }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {UNITS.map((u) => (
                <tr key={u.what} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-medium text-fg">{u.what}</td>
                  {COLS.map((c) => (
                    <td key={c.id} className="px-4 py-3 text-muted">{u[c.id]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Callout tone="myth" className="mt-5" title="Why you can't divide one count by another">
          “21,760 CUDA cores ÷ 4,096 stream processors ≈ 5×” is meaningless. The units differ in width, scheduling, clocks, caches and
          what each lane can issue per cycle. Compare GPUs by measured results in the games and applications you actually use.
        </Callout>
      </Section>
    </>
  );
}

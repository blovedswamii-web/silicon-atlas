import type { Metadata } from "next";
import { UpscalingExplainer, WorkloadFitExplorer } from "@/components/tools/Workloads";
import { GAMING_FACTORS } from "@/data/workload-fit";
import { Callout, KIND_VAR, PageHeader, Panel, Section } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Workload Fit",
  description: "Why a platform may suit gaming, Blender, video editing, programming, AI, music, battery life or scientific computing — with the caveats.",
};

export default function WorkloadsPage() {
  return (
    <>
      <PageHeader
        kicker="Tools · Workload fit"
        title="Not “who wins” — why a platform fits a workload"
        lede="Each platform makes different tradeoffs in compute, memory, software and power. Pick a workload to see what it depends on, why each platform family may suit it, and what to watch out for."
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <WorkloadFitExplorer />
        <Callout tone="info" className="mt-6" title="Editable, data-driven">
          These descriptions are stored as structured data, separate from the page, so they can be reviewed and updated as drivers,
          frameworks and products change. They describe tendencies, not guarantees — always check the specific product.
        </Callout>
      </div>
      <Section id="gaming" kicker="Gaming deep-dive" title="What a game's frame rate actually depends on">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GAMING_FACTORS.map((f, i) => (
            <Panel key={f.t} className="p-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: KIND_VAR.gpu }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="font-medium text-fg">{f.t}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.d}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-8">
          <UpscalingExplainer />
        </div>
      </Section>
    </>
  );
}

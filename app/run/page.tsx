import type { Metadata } from "next";
import { RunProgram } from "@/components/simulations/RunProgram";
import { PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Run a Program",
  description: "Run the same workload on different computers and watch where data lives, how it moves and which engine does the work.",
};

export default function RunPage() {
  return (
    <>
      <PageHeader
        kicker="Run a Program"
        title="Run the same program on different computers."
        lede="Pick a workload, pick two machines, press play. Watch where the data lives, which paths it travels, and which engine does the work. Then read why the architectures behave differently. This is a model of architecture — it doesn't simulate speed."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <RunProgram />
      </div>
    </>
  );
}

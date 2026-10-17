import type { Metadata } from "next";
import { SystemMap } from "@/components/architecture/SystemMap";
import { Callout, PageHeader, Section } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "System Map",
  description: "Compute, memory, data movement, software and power — one map that restructures itself between a PC and Apple Silicon.",
};

export default function MapPage() {
  return (
    <>
      <PageHeader
        kicker="System Map"
        title="A computer is a system, not a list of parts."
        lede="Compute, memory, data movement, software and power — all on one map. Switch between a traditional PC and Apple Silicon and watch the map reorganise: the GPU moves into the SoC, VRAM merges into unified memory, and PCIe steps back to I/O duty. Filter by layer to see each concern on its own."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SystemMap />
      </div>
      <Section>
        <Callout tone="good" title="How to use this map when shopping">
          For any spec you are looking at, find its box on the map and ask: what feeds it, what does it feed, and which layer
          could limit it? A huge GPU behind a small VRAM pool, a fast CPU behind a slow memory bus, or great hardware with no
          software path are all the same problem — a system that is only as fast as its narrowest point.
        </Callout>
      </Section>
    </>
  );
}

"use client";

import { useMemo } from "react";
import type { NodeRole, StepKind } from "@/data/schema";
import { getPlatform } from "@/data/platforms";
import { ArchDiagram } from "./ArchDiagram";
import { Kicker, Panel } from "@/components/ui/primitives";
import { STEP_COLOR, resolveFlow } from "@/lib/flow";

/** Two compact diagrams animating the "GPU needs data the CPU prepared" path. */
export function SideBySide({
  left = "traditional-pc",
  right = "apple-silicon",
  from = "sysmem",
  kind = "copy",
}: {
  left?: string;
  right?: string;
  from?: NodeRole;
  kind?: StepKind;
}) {
  const items = useMemo(
    () =>
      [left, right].map((id) => {
        const p = getPlatform(id)!;
        const to: NodeRole = p.memoryModel === "discrete" ? "vram" : "gpu";
        return { p, flow: resolveFlow(p, from, to, STEP_COLOR[kind], `sbs-${id}`) };
      }),
    [left, right, from, kind],
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(({ p, flow }) => (
        <Panel key={p.id} className="p-3 sm:p-4">
          <div className="flex items-baseline justify-between px-1">
            <Kicker>{p.short}</Kicker>
            <span className="font-mono text-[10.5px] text-dim">
              {p.memoryModel === "discrete" ? "copy across PCIe → VRAM" : "GPU reads the same pool"}
            </span>
          </div>
          <ArchDiagram
            platform={p}
            compact
            activeNodes={flow.nodes}
            activeEdges={flow.edges}
            packets={flow.packet ? [flow.packet] : []}
            className="mt-1"
          />
        </Panel>
      ))}
    </div>
  );
}

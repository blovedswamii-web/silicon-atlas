import type { FlowStep, NodeRole, Platform, StepKind } from "@/data/schema";
import type { Packet } from "@/components/architecture/ArchDiagram";
import { findPath, pathPoints, polylineLength, resolveRole } from "./graph";

export const STEP_COLOR: Record<StepKind, string> = {
  load: "var(--k-storage)",
  copy: "var(--k-vram)",
  compute: "var(--k-gpu)",
  sync: "var(--k-cpu)",
  output: "var(--k-display)",
};

export const STEP_LABEL: Record<StepKind, string> = {
  load: "Load",
  copy: "Copy",
  compute: "Compute",
  sync: "Hand-off",
  output: "Output",
};

export interface ResolvedFlow {
  fromNode?: string;
  toNode?: string;
  nodes: string[];
  edges: string[];
  packet: Packet | null;
  pulse: string | null;
}

/** Turn a role-to-role movement into concrete nodes, edges and an animated packet on a platform. */
export function resolveFlow(p: Platform, from: NodeRole, to: NodeRole, color: string, key: string): ResolvedFlow {
  const a = resolveRole(p, from);
  const b = resolveRole(p, to);
  if (!a || !b) return { nodes: [], edges: [], packet: null, pulse: null };
  if (a === b) return { fromNode: a, toNode: b, nodes: [a], edges: [], packet: null, pulse: a };
  const path = findPath(p, a, b);
  const points = pathPoints(p, path);
  const len = polylineLength(points);
  return {
    fromNode: a,
    toNode: b,
    nodes: path.nodes,
    edges: path.edges.map((e) => e.id),
    packet: { key: `${key}-${p.id}`, points, color, duration: Math.min(3.2, Math.max(1.1, len / 260)) },
    pulse: b,
  };
}

/** Replace {gpu} {matrix} … tokens in workload text with this platform's engine names. */
export function fill(text: string, p: Platform): string {
  const engines: Record<string, string | undefined> = { ...p.engines, mem: p.engines.gpuMemory };
  return text.replace(/\{(\w+)\}/g, (m, k: string) => engines[k] ?? m);
}

export function stepsFor(steps: FlowStep[], p: Platform): FlowStep[] {
  return steps.filter((s) => !s.only || s.only.includes(p.memoryModel));
}

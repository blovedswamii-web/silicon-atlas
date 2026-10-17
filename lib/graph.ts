import type { ArchEdge, ArchNode, NodeRole, Platform } from "@/data/schema";

export type Pt = { x: number; y: number };

const cx = (n: ArchNode) => n.x + n.w / 2;
const cy = (n: ArchNode) => n.y + n.h / 2;

/**
 * Orthogonal routing between two boxes:
 *  - x ranges overlap → straight vertical segment
 *  - y ranges overlap → straight horizontal segment
 *  - otherwise        → one elbow
 */
export function edgePoints(a: ArchNode, b: ArchNode, at?: number): Pt[] {
  const xo = [Math.max(a.x, b.x), Math.min(a.x + a.w, b.x + b.w)];
  const yo = [Math.max(a.y, b.y), Math.min(a.y + a.h, b.y + b.h)];
  if (xo[1] - xo[0] > 8) {
    const x = at ?? (xo[0] + xo[1]) / 2;
    return a.y < b.y ? [{ x, y: a.y + a.h }, { x, y: b.y }] : [{ x, y: a.y }, { x, y: b.y + b.h }];
  }
  if (yo[1] - yo[0] > 8) {
    const y = at ?? (yo[0] + yo[1]) / 2;
    return a.x < b.x ? [{ x: a.x + a.w, y }, { x: b.x, y }] : [{ x: a.x, y }, { x: b.x + b.w, y }];
  }
  // Elbow: leave a horizontally, enter b vertically.
  const start = { x: a.x < b.x ? a.x + a.w : a.x, y: cy(a) };
  const end = { x: cx(b), y: a.y < b.y ? b.y : b.y + b.h };
  return [start, { x: end.x, y: start.y }, end];
}

export function nodeMap(p: Platform) {
  return new Map(p.nodes.map((n) => [n.id, n]));
}

/** Roles that a platform may not have, and what stands in for them. */
const ROLE_FALLBACK: Partial<Record<NodeRole, NodeRole[]>> = {
  vram: ["sysmem"], // unified / shared memory: the GPU's memory *is* main memory
  pcie: ["fabric"],
  npu: ["gpu"],
  media: ["gpu"],
  cache: ["cpu"],
  network: ["fabric"],
};

export function resolveRole(p: Platform, role: NodeRole): string | undefined {
  if (p.roles[role]) return p.roles[role];
  for (const r of ROLE_FALLBACK[role] ?? []) if (p.roles[r]) return p.roles[r];
  return undefined;
}

/** Breadth-first path between two nodes over the platform's edges. */
export function findPath(p: Platform, from: string, to: string): { nodes: string[]; edges: ArchEdge[] } {
  if (from === to) return { nodes: [from], edges: [] };
  const adj = new Map<string, { to: string; edge: ArchEdge }[]>();
  for (const e of p.edges) {
    adj.set(e.from, [...(adj.get(e.from) ?? []), { to: e.to, edge: e }]);
    adj.set(e.to, [...(adj.get(e.to) ?? []), { to: e.from, edge: e }]);
  }
  const prev = new Map<string, { node: string; edge: ArchEdge }>();
  const seen = new Set([from]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) break;
    for (const { to: nxt, edge } of adj.get(cur) ?? []) {
      if (seen.has(nxt)) continue;
      seen.add(nxt);
      prev.set(nxt, { node: cur, edge });
      queue.push(nxt);
    }
  }
  if (!prev.has(to)) return { nodes: [from], edges: [] };
  const nodes = [to];
  const edges: ArchEdge[] = [];
  let cur = to;
  while (cur !== from) {
    const step = prev.get(cur)!;
    edges.unshift(step.edge);
    nodes.unshift(step.node);
    cur = step.node;
  }
  return { nodes, edges };
}

/** The polyline a packet follows from the centre of one node to the centre of another. */
export function pathPoints(p: Platform, path: { nodes: string[]; edges: ArchEdge[] }): Pt[] {
  const nm = nodeMap(p);
  const first = nm.get(path.nodes[0]);
  if (!first) return [];
  const pts: Pt[] = [{ x: cx(first), y: cy(first) }];
  path.edges.forEach((e, i) => {
    const a = nm.get(path.nodes[i])!;
    const b = nm.get(path.nodes[i + 1])!;
    const forward = e.from === a.id;
    const ep = forward
      ? edgePoints(nm.get(e.from)!, nm.get(e.to)!, e.at)
      : [...edgePoints(nm.get(e.from)!, nm.get(e.to)!, e.at)].reverse();
    pts.push(...ep);
    pts.push({ x: cx(b), y: cy(b) });
  });
  // Drop consecutive duplicates.
  return pts.filter((pt, i) => i === 0 || pt.x !== pts[i - 1].x || pt.y !== pts[i - 1].y);
}

/** Cumulative-length keyframe times (0..1) for animating along a polyline at constant speed. */
export function keyTimes(pts: Pt[]): number[] {
  const seg = pts.slice(1).map((pt, i) => Math.hypot(pt.x - pts[i].x, pt.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return [0, ...seg.map((s) => (acc += s) / total)];
}

export function polylineLength(pts: Pt[]) {
  return pts.slice(1).reduce((a, pt, i) => a + Math.hypot(pt.x - pts[i].x, pt.y - pts[i].y), 0);
}

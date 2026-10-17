"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import type { ArchEdge, ArchNode, EdgeKind, Platform } from "@/data/schema";
import { KIND_VAR } from "@/components/ui/primitives";
import { edgePoints, keyTimes, nodeMap, type Pt } from "@/lib/graph";

export interface Packet {
  key: string;
  points: Pt[];
  color: string;
  duration: number;
  label?: string;
}

const EDGE_STYLE: Record<EdgeKind, { color: string; width: number; dash?: string }> = {
  "memory-bus": { color: "var(--k-memory)", width: 5 },
  pcie: { color: "var(--k-interconnect)", width: 5, dash: "1.5 3" },
  fabric: { color: "var(--line-strong)", width: 2 },
  "storage-bus": { color: "var(--k-storage)", width: 3 },
  display: { color: "var(--k-display)", width: 2 },
  network: { color: "var(--k-network)", width: 2 },
};

const toD = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function EdgeLine({ e, a, b, active }: { e: ArchEdge; a: ArchNode; b: ArchNode; active: boolean }) {
  const pts = edgePoints(a, b, e.at);
  const st = EDGE_STYLE[e.kind];
  const d = toD(pts);
  const lx = pts.length === 2 ? (pts[0].x + pts[1].x) / 2 : pts[1].x;
  const ly = pts.length === 2 ? (pts[0].y + pts[1].y) / 2 : pts[1].y;
  const vertical = pts.length === 2 && pts[0].x === pts[1].x;
  return (
    <g>
      <path d={d} fill="none" stroke={st.color} strokeOpacity={0.28} strokeWidth={st.width + 4} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={st.color}
        strokeOpacity={0.85}
        strokeWidth={st.width}
        strokeDasharray={st.dash}
        strokeLinecap={st.dash ? "butt" : "round"}
      />
      {active && (
        <path d={d} fill="none" stroke="var(--fg)" strokeOpacity={0.9} strokeWidth={1.6} className="flow-dash" />
      )}
      {e.label && (
        <text
          x={vertical ? lx + 10 : lx}
          y={vertical ? ly + 4 : ly - 9}
          textAnchor={vertical ? "start" : "middle"}
          className="diagram-mono"
          fontSize={10.5}
        >
          {e.label}
        </text>
      )}
    </g>
  );
}

function NodeBox({
  n,
  selected,
  active,
  dimmed,
  compact,
  onSelect,
}: {
  n: ArchNode;
  selected: boolean;
  active: boolean;
  dimmed: boolean;
  compact: boolean;
  onSelect?: (id: string) => void;
}) {
  const color = KIND_VAR[n.kind];
  const clickable = !!onSelect;
  if (n.container) {
    return (
      <g>
        <rect
          x={n.x}
          y={n.y}
          width={n.w}
          height={n.h}
          rx={18}
          fill={`color-mix(in oklab, ${color} 5%, transparent)`}
          stroke={`color-mix(in oklab, ${color} 40%, var(--line))`}
          strokeDasharray="5 5"
          strokeWidth={1.2}
        />
        <text x={n.x + 14} y={n.y + 20} fontSize={10.5} className="diagram-mono" letterSpacing="0.12em">
          {n.label.toUpperCase()}
        </text>
      </g>
    );
  }
  const big = n.w >= 150 && n.h >= 70;
  const fs = big ? 15 : 13;
  const subLines = !compact && n.sublabel ? wrap(n.sublabel, Math.max(8, Math.floor((n.w - 18) / 6.6))) : [];
  const labelLines = wrap(n.label, Math.max(8, Math.floor((n.w - 18) / (fs * 0.56))));
  const blockH = labelLines.length * (fs + 3) + subLines.length * 13;
  const startY = n.y + n.h / 2 - blockH / 2 + fs - 2;

  return (
    <g
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `${n.label}: open details` : undefined}
      onClick={() => onSelect?.(n.id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(n.id)}
      style={{ cursor: clickable ? "pointer" : "default", opacity: dimmed ? 0.35 : 1, transition: "opacity .3s" }}
      className="outline-none"
    >
      {(selected || active) && (
        <rect
          x={n.x - 5}
          y={n.y - 5}
          width={n.w + 10}
          height={n.h + 10}
          rx={14}
          fill="none"
          stroke={color}
          strokeOpacity={selected ? 0.9 : 0.5}
          strokeWidth={selected ? 2 : 1.5}
        />
      )}
      <rect
        x={n.x}
        y={n.y}
        width={n.w}
        height={n.h}
        rx={10}
        fill={`color-mix(in oklab, ${color} ${active ? 18 : 9}%, var(--panel-2))`}
        stroke={`color-mix(in oklab, ${color} ${active || selected ? 85 : 45}%, var(--line))`}
        strokeWidth={1.2}
        style={{ transition: "fill .3s, stroke .3s" }}
      />
      <rect x={n.x} y={n.y + 10} width={3} height={n.h - 20} rx={1.5} fill={color} />
      {labelLines.map((l, i) => (
        <text
          key={i}
          x={n.x + n.w / 2}
          y={startY + i * (fs + 3)}
          textAnchor="middle"
          fontSize={fs}
          fontWeight={600}
          className="diagram-text"
        >
          {l}
        </text>
      ))}
      {subLines.map((l, i) => (
        <text
          key={i}
          x={n.x + n.w / 2}
          y={startY + labelLines.length * (fs + 3) + 2 + i * 13}
          textAnchor="middle"
          fontSize={10.5}
          className="diagram-mono"
        >
          {l}
        </text>
      ))}
    </g>
  );
}

export function ArchDiagram({
  platform,
  selected,
  onSelect,
  activeNodes = [],
  activeEdges = [],
  packets = [],
  pulse,
  compact = false,
  className,
  title,
}: {
  platform: Platform;
  selected?: string | null;
  onSelect?: (id: string) => void;
  activeNodes?: string[];
  activeEdges?: string[];
  packets?: Packet[];
  pulse?: { node: string; color: string; key: string } | null;
  compact?: boolean;
  className?: string;
  title?: string;
}) {
  const reduce = useReducedMotion();
  const nm = useMemo(() => nodeMap(platform), [platform]);
  const containers = platform.nodes.filter((n) => n.container);
  const leaves = platform.nodes.filter((n) => !n.container);
  const focus = activeNodes.length > 0;

  return (
    <svg
      viewBox="0 0 1000 600"
      className={clsx("h-auto w-full select-none", className)}
      role="img"
      aria-label={title ?? `${platform.name} architecture diagram`}
    >
      {containers.map((n) => (
        <NodeBox key={n.id} n={n} selected={false} active={false} dimmed={false} compact={compact} />
      ))}
      {platform.edges.map((e) => {
        const a = nm.get(e.from);
        const b = nm.get(e.to);
        if (!a || !b) return null;
        return <EdgeLine key={e.id} e={e} a={a} b={b} active={activeEdges.includes(e.id)} />;
      })}
      {leaves.map((n) => (
        <NodeBox
          key={n.id}
          n={n}
          compact={compact}
          selected={selected === n.id}
          active={activeNodes.includes(n.id)}
          dimmed={focus && !activeNodes.includes(n.id) && selected !== n.id}
          onSelect={onSelect}
        />
      ))}
      {pulse &&
        (() => {
          const n = nm.get(pulse.node);
          if (!n) return null;
          return (
            <motion.rect
              key={pulse.key}
              x={n.x - 3}
              y={n.y - 3}
              width={n.w + 6}
              height={n.h + 6}
              rx={12}
              fill={pulse.color}
              initial={{ opacity: 0 }}
              animate={reduce ? { opacity: 0.18 } : { opacity: [0, 0.28, 0.06, 0.28, 0] }}
              transition={{ duration: 2.2, repeat: reduce ? 0 : Infinity }}
              pointerEvents="none"
            />
          );
        })()}
      {packets.map((p) => {
        if (p.points.length < 2) return null;
        const times = keyTimes(p.points);
        const xs = p.points.map((pt) => pt.x);
        const ys = p.points.map((pt) => pt.y);
        const end = p.points[p.points.length - 1];
        return (
          <g key={p.key} pointerEvents="none">
            <path d={toD(p.points)} fill="none" stroke={p.color} strokeOpacity={0.55} strokeWidth={2} className="flow-dash" />
            {reduce ? (
              <circle cx={end.x} cy={end.y} r={7} fill={p.color} />
            ) : (
              [0, 0.18, 0.36].map((delay, i) => (
                <motion.circle
                  key={i}
                  r={i === 0 ? 7 : 5 - i}
                  fill={p.color}
                  fillOpacity={i === 0 ? 1 : 0.6}
                  initial={{ cx: xs[0], cy: ys[0], opacity: 0 }}
                  animate={{ cx: xs, cy: ys, opacity: xs.map((_, k) => (k === 0 || k === xs.length - 1 ? 0.25 : 1)) }}
                  transition={{ duration: p.duration, times, ease: "linear", repeat: Infinity, repeatDelay: 0.5, delay: delay * p.duration * 0.4 }}
                  style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}
                />
              ))
            )}
            {p.label && (
              <text x={end.x} y={end.y - 14} textAnchor="middle" fontSize={11} className="diagram-mono" style={{ fill: p.color }}>
                {p.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const LEGEND: { kind: keyof typeof KIND_VAR; label: string }[] = [
  { kind: "cpu", label: "CPU" },
  { kind: "gpu", label: "GPU" },
  { kind: "accel", label: "Accelerators" },
  { kind: "cache", label: "Cache / fabric" },
  { kind: "memory", label: "System / unified memory" },
  { kind: "vram", label: "VRAM" },
  { kind: "storage", label: "Storage" },
  { kind: "interconnect", label: "PCIe / I/O" },
];

export function DiagramLegend({ className }: { className?: string }) {
  return (
    <div className={clsx("flex flex-wrap gap-x-4 gap-y-1.5", className)}>
      {LEGEND.map((l) => (
        <span key={l.kind} className="flex items-center gap-1.5 text-[11px] text-dim">
          <span className="h-2 w-2 rounded-sm" style={{ background: KIND_VAR[l.kind] }} />
          {l.label}
        </span>
      ))}
    </div>
  );
}

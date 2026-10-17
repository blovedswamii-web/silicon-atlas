"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useState } from "react";
import { ARCH_ROWS, ARCH_SYSTEMS, type ArchBlock, type ArchCompareSystem } from "@/data/comparisons";
import { CompanyTag, KIND_VAR, Kicker, Panel, ScopeTag } from "@/components/ui/primitives";
import { RichInline } from "@/components/ui/Rich";

const BLOCK_KIND: Record<ArchBlock, string> = {
  cpu: KIND_VAR.cpu,
  gpu: KIND_VAR.gpu,
  sysmem: KIND_VAR.memory,
  vram: KIND_VAR.vram,
  npu: KIND_VAR.accel,
  media: KIND_VAR.accel,
  pcie: KIND_VAR.interconnect,
  soc: KIND_VAR.interconnect,
};

function Block({
  x, y, w, h, block, label, active, dimmed, rx = 6,
}: {
  x: number; y: number; w: number; h: number; block: ArchBlock; label: string; active: boolean; dimmed: boolean; rx?: number;
}) {
  const c = BLOCK_KIND[block];
  return (
    <motion.g animate={{ opacity: dimmed ? 0.32 : 1 }} transition={{ duration: 0.3 }}>
      <motion.rect
        x={x} y={y} width={w} height={h} rx={rx}
        animate={{
          fill: active ? `color-mix(in oklab, ${c} 26%, var(--panel))` : `color-mix(in oklab, ${c} 9%, var(--panel))`,
          stroke: active ? c : `color-mix(in oklab, ${c} 45%, var(--line))`,
          strokeWidth: active ? 1.8 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
      <text x={x + w / 2} y={y + h / 2 + 3.5} textAnchor="middle" fontSize={10} className="diagram-text" style={{ fontWeight: 500 }}>
        {label}
      </text>
    </motion.g>
  );
}

function MiniDiagram({ sys, highlight }: { sys: ArchCompareSystem; highlight: ArchBlock[] }) {
  const on = (b: ArchBlock) => highlight.includes(b);
  const dim = (b: ArchBlock) => highlight.length > 0 && !highlight.includes(b);
  const b = sys.blocks;

  if (sys.layout === "soc") {
    const socActive = on("soc");
    return (
      <svg viewBox="0 0 260 210" className="w-full" role="img" aria-label={`${sys.label} block diagram`}>
        <motion.rect
          x={8} y={8} width={244} height={124} rx={12}
          animate={{ stroke: socActive ? KIND_VAR.cpu : "var(--line-strong)", strokeWidth: socActive ? 1.8 : 1 }}
          fill="color-mix(in oklab, var(--panel-3) 60%, transparent)"
          strokeDasharray="4 3"
        />
        <text x={18} y={24} fontSize={9} className="diagram-mono" style={{ letterSpacing: "0.12em" }}>
          {(b.soc ?? "SoC").toUpperCase()} · ONE DIE
        </text>
        <Block x={18} y={32} w={110} h={42} block="cpu" label={b.cpu ?? "CPU"} active={on("cpu")} dimmed={dim("cpu")} />
        <Block x={134} y={32} w={108} h={42} block="gpu" label={b.gpu ?? "GPU"} active={on("gpu")} dimmed={dim("gpu")} />
        <Block x={18} y={80} w={110} h={42} block="npu" label={b.npu ?? "NPU"} active={on("npu")} dimmed={dim("npu")} />
        <Block x={134} y={80} w={108} h={42} block="media" label={b.media ?? "Media"} active={on("media")} dimmed={dim("media")} />
        {[50, 105, 155, 210].map((x) => (
          <line key={x} x1={x} y1={132} x2={x} y2={156} stroke="var(--k-memory)" strokeWidth={1.4} className="flow-dash" opacity={dim("sysmem") ? 0.3 : 0.9} />
        ))}
        <Block x={8} y={156} w={244} h={44} block="sysmem" label={b.sysmem ?? "Unified memory"} active={on("sysmem")} dimmed={dim("sysmem")} rx={10} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 260 210" className="w-full" role="img" aria-label={`${sys.label} block diagram`}>
      <Block x={8} y={20} w={100} h={56} block="cpu" label={b.cpu ?? "CPU"} active={on("cpu")} dimmed={dim("cpu")} />
      <line x1={58} y1={76} x2={58} y2={150} stroke="var(--k-memory)" strokeWidth={1.4} className="flow-dash" opacity={dim("sysmem") ? 0.3 : 0.9} />
      <Block x={8} y={150} w={100} h={44} block="sysmem" label={b.sysmem ?? "RAM"} active={on("sysmem")} dimmed={dim("sysmem")} />
      {/* PCIe link */}
      <motion.g animate={{ opacity: dim("pcie") ? 0.3 : 1 }}>
        <line x1={108} y1={48} x2={146} y2={48} stroke="var(--k-interconnect)" strokeWidth={on("pcie") ? 3 : 2} className="flow-dash" />
        <text x={127} y={40} textAnchor="middle" fontSize={8.5} className="diagram-mono">
          {b.pcie ?? "PCIe"}
        </text>
      </motion.g>
      {/* Graphics card outline */}
      <rect x={146} y={10} width={106} height={190} rx={10} fill="none" stroke="var(--line-strong)" strokeDasharray="4 3" />
      <text x={154} y={24} fontSize={8.5} className="diagram-mono" style={{ letterSpacing: "0.12em" }}>
        GRAPHICS CARD
      </text>
      <Block x={154} y={30} w={90} h={46} block="gpu" label={b.gpu ?? "GPU"} active={on("gpu")} dimmed={dim("gpu")} />
      <Block x={154} y={82} w={90} h={24} block="npu" label={b.npu ?? "AI units"} active={on("npu")} dimmed={dim("npu")} rx={4} />
      <Block x={154} y={111} w={90} h={24} block="media" label={b.media ?? "Media"} active={on("media")} dimmed={dim("media")} rx={4} />
      <line x1={199} y1={135} x2={199} y2={150} stroke="var(--k-vram)" strokeWidth={1.4} className="flow-dash" opacity={dim("vram") ? 0.3 : 0.9} />
      <Block x={154} y={150} w={90} h={44} block="vram" label={b.vram ?? "VRAM"} active={on("vram")} dimmed={dim("vram")} />
    </svg>
  );
}

/** Apple M-series vs Ryzen + RTX vs Intel + RTX, one architectural question at a time. */
export function ArchCompare() {
  const [rowId, setRowId] = useState(ARCH_ROWS[2].id);
  const row = ARCH_ROWS.find((r) => r.id === rowId)!;

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-line p-4">
        <Kicker>Compare one thing at a time</Kicker>
        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist">
          {ARCH_ROWS.map((r) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={r.id === rowId}
              onClick={() => setRowId(r.id)}
              className={clsx(
                "rounded-lg border px-2.5 py-1 text-xs transition-colors",
                r.id === rowId ? "border-line-strong bg-panel-3 text-fg" : "border-line text-dim hover:text-fg",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-thin overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-3 divide-x divide-line">
          {ARCH_SYSTEMS.map((sys) => (
            <div key={sys.id} className="p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {sys.companies.map((c) => (
                  <CompanyTag key={c} company={c} />
                ))}
                <ScopeTag scope={sys.scope} />
              </div>
              <div className="mt-2 text-sm font-medium text-fg">{sys.label}</div>
              <div className="mt-3">
                <MiniDiagram sys={sys} highlight={row.highlight} />
              </div>
              <motion.p
                key={row.id + sys.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 min-h-[3.5rem] text-sm leading-relaxed text-muted"
              >
                {row.values[sys.id]}
              </motion.p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line bg-panel-2 p-4">
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-accent">What this means · {row.label}</div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          <RichInline text={row.meaning} />
        </p>
      </div>
    </Panel>
  );
}

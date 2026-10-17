"use client";

import clsx from "clsx";
import { useState } from "react";
import { PCIE_GENS, PCIE_WIDTHS } from "@/data/latency";
import { Frame } from "./Frame";

interface Dev {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  via: "cpu" | "chipset";
  lanes: number;
  gen: string;
  note: string;
}

// A representative modern desktop board. Exact lane counts differ by platform and motherboard.
const DEVICES: Dev[] = [
  { id: "gpu", label: "GPU slot", sub: "x16", x: 20, y: 36, w: 150, via: "cpu", lanes: 16, gen: "5.0", note: "The graphics card gets the widest link, wired straight to the CPU. Many GPUs lose only a few percent in games at x8 — but data-heavy compute (large AI models that don't fit in VRAM) can feel it." },
  { id: "m2a", label: "M.2 slot 1", sub: "x4", x: 470, y: 36, w: 150, via: "cpu", lanes: 4, gen: "5.0", note: "The primary NVMe slot usually connects directly to the CPU: lowest latency, nothing shared." },
  { id: "m2b", label: "M.2 slot 2", sub: "x4", x: 470, y: 112, w: 150, via: "cpu", lanes: 4, gen: "4.0", note: "Many boards wire a second M.2 slot to the CPU as well. On some, using it steals lanes from the GPU slot (x16 → x8) — check the manual." },
  { id: "m2c", label: "M.2 slot 3", sub: "x4", x: 20, y: 300, w: 120, via: "chipset", lanes: 4, gen: "4.0", note: "Behind the chipset. Fast on its own, but it shares the chipset's single uplink to the CPU with everything else below." },
  { id: "usb", label: "USB / Thunderbolt", sub: "ports", x: 152, y: 300, w: 120, via: "chipset", lanes: 2, gen: "4.0", note: "USB controllers usually hang off the chipset (some USB ports come from the CPU on recent platforms)." },
  { id: "net", label: "Ethernet / Wi-Fi", sub: "x1", x: 284, y: 300, w: 120, via: "chipset", lanes: 1, gen: "4.0", note: "Network adapters need little bandwidth — a single lane is plenty." },
  { id: "sata", label: "SATA ports", sub: "HDD / SSD", x: 416, y: 300, w: 100, via: "chipset", lanes: 1, gen: "—", note: "Legacy storage via the chipset's SATA controller (~550 MB/s per port ceiling)." },
  { id: "slot4", label: "x4 slot", sub: "x4 wired", x: 528, y: 300, w: 92, via: "chipset", lanes: 4, gen: "4.0", note: "Physically long, electrically x4, and behind the chipset — read the motherboard spec sheet, not the slot length." },
];

const CPU = { x: 245, y: 30, w: 150, h: 96 };
const CHIP = { x: 260, y: 196, w: 120, h: 50 };

function perLane(gen: string) {
  return PCIE_GENS.find((g) => g.gen === gen)?.perLaneGBs ?? 0.6;
}

export function PcieLanes() {
  const [gen, setGen] = useState("4.0");
  const [width, setWidth] = useState<number>(16);
  const [dev, setDev] = useState<string>("m2c");
  const d = DEVICES.find((x) => x.id === dev)!;
  const bw = perLane(gen) * width;
  const devBw = d.gen === "—" ? 0.6 : perLane(d.gen) * d.lanes;

  const pathColor = "var(--accent)";
  const on = (id: string) => id === dev;

  return (
    <Frame
      kicker="Interactive · PCIe"
      title="Lanes, generations, and what plugs in where"
      footer="Per-lane figures are approximate usable bandwidth in each direction after encoding overhead. The board diagram is a representative modern desktop layout: actual CPU lane counts (roughly 20–28 on current mainstream desktop CPUs) and slot wiring vary by platform and motherboard."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] [&>*]:min-w-0">
        <div>
          <div className="text-xs text-dim">Bandwidth per direction = per-lane speed × lanes. Click a cell.</div>
          <div className="scroll-thin mt-2 overflow-x-auto">
            <table className="w-full min-w-[22rem] border-separate border-spacing-1 text-right font-mono text-xs">
              <thead>
                <tr className="text-dim">
                  <th className="text-left font-normal">Gen</th>
                  {PCIE_WIDTHS.map((w) => (
                    <th key={w} className="font-normal">
                      x{w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PCIE_GENS.map((g) => (
                  <tr key={g.gen}>
                    <td className="text-left text-muted">
                      {g.gen} <span className="text-dim">’{String(g.year).slice(2)}</span>
                    </td>
                    {PCIE_WIDTHS.map((w) => {
                      const v = g.perLaneGBs * w;
                      const active = g.gen === gen && w === width;
                      const same = Math.abs(v - bw) / bw < 0.03 && !active;
                      return (
                        <td key={w} className="p-0">
                          <button
                            onClick={() => {
                              setGen(g.gen);
                              setWidth(w);
                            }}
                            className={clsx(
                              "w-full rounded-md px-1.5 py-1.5 tabular-nums transition-colors",
                              active
                                ? "bg-[var(--k-interconnect)] text-bg"
                                : same
                                  ? "bg-panel-3 text-fg ring-1 ring-[var(--k-interconnect)]"
                                  : "bg-panel-2 text-muted hover:text-fg",
                            )}
                          >
                            {v < 1 ? v.toFixed(2) : v < 10 ? v.toFixed(1) : Math.round(v)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 rounded-xl border border-line bg-panel-2 p-3 text-sm leading-relaxed text-muted">
            <span className="font-mono text-fg">
              PCIe {gen} x{width} ≈ {bw < 10 ? bw.toFixed(1) : Math.round(bw)} GB/s
            </span>{" "}
            each way. Outlined cells deliver the same bandwidth: each generation doubles per-lane speed, so <strong className="text-fg">Gen5 x8 ≈ Gen4 x16</strong>.
            Compare with VRAM on a modern GPU (hundreds of GB/s to ~1.8 TB/s): PCIe is a much narrower pipe, which is why data that a GPU needs
            repeatedly should live in VRAM.
          </div>
        </div>

        <div>
          <div className="text-xs text-dim">Click a device to trace its path to the CPU.</div>
          <div className="scroll-thin mt-2 overflow-x-auto">
            <svg viewBox="0 0 640 360" className="h-auto w-full min-w-[30rem]" role="img" aria-label="Motherboard PCIe topology">
              {/* edges */}
              {DEVICES.map((x) => {
                const cx = x.x + x.w / 2;
                const isOn = on(x.id);
                const stroke = isOn ? pathColor : "var(--line-strong)";
                if (x.via === "cpu") {
                  const fromX = x.x < CPU.x ? x.x + x.w : x.x;
                  const toX = x.x < CPU.x ? CPU.x : CPU.x + CPU.w;
                  const y = x.y + 20;
                  return (
                    <path
                      key={x.id}
                      d={`M${fromX} ${y} L${toX} ${Math.min(Math.max(y, CPU.y + 12), CPU.y + CPU.h - 12)}`}
                      stroke={stroke}
                      strokeWidth={Math.max(1.5, x.lanes / 3)}
                      className={isOn ? "flow-dash" : undefined}
                      fill="none"
                    />
                  );
                }
                return (
                  <path
                    key={x.id}
                    d={`M${cx} ${x.y} C${cx} ${x.y - 30} ${CHIP.x + CHIP.w / 2} ${CHIP.y + CHIP.h + 30} ${CHIP.x + CHIP.w / 2} ${CHIP.y + CHIP.h}`}
                    stroke={stroke}
                    strokeWidth={Math.max(1.5, x.lanes / 1.5)}
                    className={isOn ? "flow-dash" : undefined}
                    fill="none"
                  />
                );
              })}
              {/* chipset uplink */}
              <path
                d={`M${CHIP.x + CHIP.w / 2} ${CHIP.y} L${CPU.x + CPU.w / 2} ${CPU.y + CPU.h}`}
                stroke={d.via === "chipset" ? "var(--warn)" : "var(--line-strong)"}
                strokeWidth={4}
                className={d.via === "chipset" ? "flow-dash" : undefined}
              />
              <text x={CPU.x + CPU.w / 2 + 10} y={CHIP.y - 26} className="diagram-mono" fontSize="10">
                chipset uplink · ≈ x4–x8 Gen4
              </text>

              {/* CPU */}
              <rect x={CPU.x} y={CPU.y} width={CPU.w} height={CPU.h} rx="10" fill="color-mix(in oklab, var(--k-cpu) 12%, var(--panel))" stroke="var(--k-cpu)" />
              <text x={CPU.x + CPU.w / 2} y={CPU.y + 34} textAnchor="middle" className="diagram-text" fontSize="14" fontWeight="600">
                CPU
              </text>
              <text x={CPU.x + CPU.w / 2} y={CPU.y + 54} textAnchor="middle" className="diagram-mono" fontSize="10">
                PCIe root complex
              </text>
              <text x={CPU.x + CPU.w / 2} y={CPU.y + 70} textAnchor="middle" className="diagram-mono" fontSize="10">
                + memory controller
              </text>

              {/* Chipset */}
              <rect x={CHIP.x} y={CHIP.y} width={CHIP.w} height={CHIP.h} rx="10" fill="color-mix(in oklab, var(--k-interconnect) 14%, var(--panel))" stroke="var(--k-interconnect)" />
              <text x={CHIP.x + CHIP.w / 2} y={CHIP.y + 22} textAnchor="middle" className="diagram-text" fontSize="13" fontWeight="600">
                Chipset
              </text>
              <text x={CHIP.x + CHIP.w / 2} y={CHIP.y + 38} textAnchor="middle" className="diagram-mono" fontSize="10">
                I/O hub
              </text>

              {/* devices */}
              {DEVICES.map((x) => {
                const isOn = on(x.id);
                const color = x.id === "gpu" ? "var(--k-gpu)" : x.id.startsWith("m2") || x.id === "sata" ? "var(--k-storage)" : "var(--k-network)";
                return (
                  <g key={x.id} onClick={() => setDev(x.id)} className="cursor-pointer" role="button" aria-label={x.label}>
                    <rect
                      x={x.x}
                      y={x.y}
                      width={x.w}
                      height={40}
                      rx="8"
                      fill={isOn ? `color-mix(in oklab, ${color} 22%, var(--panel))` : "var(--panel-2)"}
                      stroke={isOn ? color : "var(--line-strong)"}
                      strokeWidth={isOn ? 1.6 : 1}
                    />
                    <text x={x.x + 10} y={x.y + 17} className="diagram-text" fontSize="12" fontWeight="500">
                      {x.label}
                    </text>
                    <text x={x.x + 10} y={x.y + 31} className="diagram-mono" fontSize="9.5">
                      {x.sub}{x.gen !== "—" && ` · ${x.gen}`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-2 rounded-xl border border-line bg-panel-2 p-3 text-sm leading-relaxed text-muted">
            <div className="font-medium text-fg">
              {d.label} → {d.via === "cpu" ? "CPU directly" : "chipset → shared uplink → CPU"}
              {d.gen !== "—" && <span className="ml-2 font-mono text-xs text-dim">≈ {devBw.toFixed(1)} GB/s link</span>}
            </div>
            <p className="mt-1">{d.note}</p>
            {d.via === "chipset" && (
              <p className="mt-1 text-xs text-[var(--warn)]">
                Everything behind the chipset shares one uplink (AMD uses a PCIe link; Intel calls its link DMI). Copying between two chipset SSDs
                while downloading over 10 GbE can saturate it.
              </p>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

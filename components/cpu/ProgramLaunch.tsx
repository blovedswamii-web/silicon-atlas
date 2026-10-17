"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { NodeKind } from "@/data/schema";
import { KIND_VAR } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";
import { Btn, Frame } from "./Frame";

type Mode = "pc" | "apple";
type NodeId = "user" | "os" | "ssd" | "ram" | "cpu" | "gpu" | "vram" | "display";

const NODES: Record<NodeId, { x: number; y: number; w: number; h: number; kind: NodeKind; label: string; sub: string; pcOnly?: boolean }> = {
  user: { x: 16, y: 16, w: 118, h: 50, kind: "display", label: "You", sub: "double-click" },
  os: { x: 170, y: 16, w: 380, h: 50, kind: "software", label: "Operating system", sub: "kernel · loader · scheduler · drivers" },
  cpu: { x: 170, y: 110, w: 170, h: 84, kind: "cpu", label: "CPU", sub: "cores · L1 · L2 · L3" },
  ssd: { x: 16, y: 232, w: 118, h: 56, kind: "storage", label: "SSD", sub: "the app's files" },
  ram: { x: 170, y: 232, w: 170, h: 56, kind: "memory", label: "RAM", sub: "running code + data" },
  gpu: { x: 400, y: 110, w: 150, h: 84, kind: "gpu", label: "GPU", sub: "draws pixels" },
  vram: { x: 400, y: 232, w: 150, h: 56, kind: "vram", label: "VRAM", sub: "textures, frame buffers", pcOnly: true },
  display: { x: 600, y: 110, w: 104, h: 84, kind: "display", label: "Display", sub: "60–240 Hz" },
};

interface Step {
  title: string;
  text: string;
  active: NodeId[];
  flows: [NodeId, NodeId][];
  appleText?: string;
  appleFlows?: [NodeId, NodeId][];
}

const STEPS: Step[] = [
  {
    title: "1 · The click",
    text: "Your mouse sends an input event. The hardware raises an interrupt, the OS's input driver handles it, and the desktop shell (Finder, Explorer, your launcher) works out that you double-clicked an app and asks the OS to start it.",
    active: ["user", "os"],
    flows: [["user", "os"]],
  },
  {
    title: "2 · A new process",
    text: "The kernel creates a process: an ID, a fresh virtual address space and page tables that will map the program's addresses onto physical RAM. Nothing has been loaded yet — the OS has only made a plan.",
    active: ["os", "cpu"],
    flows: [["os", "cpu"]],
  },
  {
    title: "3 · Map the executable",
    text: "The loader reads the program's header from the SSD and memory-maps the file: it records where each part of the app lives on disk instead of copying it all. If you ran the app recently, much of it may still be cached in RAM — which is why second launches are faster.",
    active: ["os", "ssd"],
    flows: [["ssd", "os"]],
  },
  {
    title: "4 · Page faults pull code in",
    text: "When the CPU first touches a page of code that isn't in RAM, it triggers a page fault. The OS asks the SSD controller to copy that page (typically 4–16 KB) into RAM using DMA — the SSD writes directly into memory without the CPU copying each byte.",
    active: ["ssd", "ram", "os"],
    flows: [["ssd", "ram"]],
  },
  {
    title: "5 · Fetch, decode, execute",
    text: "The CPU fetches instructions from RAM through L3 → L2 → L1 instruction cache, decodes them and executes them. At first the caches are cold and the branch predictor knows nothing about this program, so startup code runs slower than the same code will later.",
    active: ["ram", "cpu"],
    flows: [["ram", "cpu"]],
  },
  {
    title: "6 · Ask the OS for things",
    text: "The program can't touch hardware directly. To open files, allocate memory, create threads or use the network it makes system calls: the CPU switches into kernel mode, the OS does the work, and control returns. Shared libraries get loaded the same way.",
    active: ["cpu", "os"],
    flows: [
      ["cpu", "os"],
      ["os", "cpu"],
    ],
  },
  {
    title: "7 · Draw the window",
    text: "The app describes its window to a graphics framework. The CPU builds a list of GPU commands; the driver submits them. On a PC with a discrete GPU, icons, fonts and images must be uploaded across PCIe into the GPU's own VRAM before the GPU can use them.",
    appleText:
      "The app describes its window to a graphics framework. The CPU builds a list of GPU commands; the driver submits them. On Apple Silicon the GPU reads images and fonts directly from the same unified memory the CPU wrote them to — no upload into a separate VRAM pool.",
    active: ["cpu", "gpu", "ram", "vram"],
    flows: [
      ["cpu", "gpu"],
      ["gpu", "vram"],
    ],
    appleFlows: [
      ["cpu", "gpu"],
      ["ram", "gpu"],
    ],
  },
  {
    title: "8 · Pixels on screen",
    text: "The GPU renders the window into a buffer, the OS compositor combines it with every other window, and the display controller scans the finished frame out to your monitor — tens to hundreds of times a second.",
    active: ["gpu", "display"],
    flows: [["gpu", "display"]],
  },
  {
    title: "9 · Waiting",
    text: "Once drawn, the app mostly waits for events. The scheduler takes its thread off the CPU, and idle cores drop into low-power sleep states within microseconds. Most of a computer's life is spent like this — which is why idle efficiency matters so much for battery life.",
    active: ["os", "cpu"],
    flows: [],
  },
];

function center(id: NodeId) {
  const n = NODES[id];
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

export function ProgramLaunch() {
  const [mode, setMode] = useState<Mode>("pc");
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const s = STEPS[i];
  const flows = mode === "apple" && s.appleFlows ? s.appleFlows : s.flows;
  const text = mode === "apple" && s.appleText ? s.appleText : s.text;

  const visible = (Object.keys(NODES) as NodeId[]).filter((id) => !(mode === "apple" && NODES[id].pcOnly));
  const links: [NodeId, NodeId][] =
    mode === "pc"
      ? [
          ["user", "os"],
          ["ssd", "ram"],
          ["ram", "cpu"],
          ["cpu", "gpu"],
          ["gpu", "vram"],
          ["gpu", "display"],
        ]
      : [
          ["user", "os"],
          ["ssd", "ram"],
          ["ram", "cpu"],
          ["cpu", "gpu"],
          ["ram", "gpu"],
          ["gpu", "display"],
        ];

  return (
    <Frame
      kicker="Step through · launching an app"
      title="What happens when you double-click an app?"
      controls={
        <Segmented
          size="sm"
          ariaLabel="Platform"
          value={mode}
          onChange={setMode}
          options={[
            { value: "pc", label: "PC + discrete GPU" },
            { value: "apple", label: "Apple Silicon" },
          ]}
        />
      }
      footer="Simplified: a real launch involves thousands of page faults, many system calls, security checks (code signing, sandboxing) and several threads at once."
    >
      <div className="scroll-thin overflow-x-auto">
        <svg viewBox="0 0 720 300" className="h-auto w-full min-w-[36rem]" role="img" aria-label="Diagram of components involved in launching an app">
          {links.map(([a, b]) => {
            const p = center(a);
            const q = center(b);
            const label = a === "cpu" && b === "gpu" ? (mode === "pc" ? "PCIe" : "fabric") : "";
            return (
              <g key={`${a}-${b}`}>
                <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="var(--line-strong)" strokeWidth="1.5" />
                {label && (
                  <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 - 6} textAnchor="middle" className="diagram-mono" fontSize="10">
                    {label}
                  </text>
                )}
              </g>
            );
          })}
          {visible.map((id) => {
            const n = NODES[id];
            const on = s.active.includes(id);
            const color = KIND_VAR[n.kind];
            const label = mode === "apple" && id === "ram" ? "Unified memory" : n.label;
            const sub = mode === "apple" && id === "ram" ? "shared by CPU + GPU" : mode === "apple" && id === "cpu" ? "cores · L1 · L2 · SLC" : n.sub;
            return (
              <g key={id}>
                <motion.rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx="10"
                  initial={false}
                  animate={{
                    fill: on ? `color-mix(in oklab, ${color} 20%, var(--panel))` : "var(--panel-2)",
                    stroke: on ? color : "var(--line-strong)",
                  }}
                  strokeWidth={on ? 1.6 : 1}
                />
                <text x={n.x + 12} y={n.y + 22} className="diagram-text" fontSize="13" fontWeight="600" opacity={on ? 1 : 0.6}>
                  {label}
                </text>
                <text x={n.x + 12} y={n.y + 38} className="diagram-mono" fontSize="9.5" opacity={on ? 1 : 0.6}>
                  {sub}
                </text>
              </g>
            );
          })}
          <AnimatePresence>
            {flows.map(([a, b], k) => {
              const p = center(a);
              const q = center(b);
              return (
                <motion.circle
                  key={`${i}-${mode}-${a}-${b}-${k}`}
                  r="5"
                  fill="var(--accent)"
                  initial={{ cx: p.x, cy: p.y, opacity: 0 }}
                  animate={reduce ? { cx: q.x, cy: q.y, opacity: 1 } : { cx: [p.x, q.x], cy: [p.y, q.y], opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={reduce ? { duration: 0 } : { duration: 1.3, repeat: Infinity, delay: k * 0.65, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 0 6px var(--accent))" }}
                />
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <AnimatePresence mode="wait">
          <motion.div key={`${i}-${mode}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className="text-sm font-semibold text-fg">{s.title}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center gap-2">
          <Btn onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
            ← Back
          </Btn>
          <Btn onClick={() => setI((x) => Math.min(STEPS.length - 1, x + 1))} disabled={i === STEPS.length - 1}>
            Next →
          </Btn>
        </div>
      </div>
      <div className="mt-3 flex gap-1">
        {STEPS.map((_, k) => (
          <button
            key={k}
            onClick={() => setI(k)}
            aria-label={`Step ${k + 1}`}
            className={clsx("h-1.5 flex-1 rounded-full transition-colors", k === i ? "bg-accent" : k < i ? "bg-[var(--line-strong)]" : "bg-panel-3")}
          />
        ))}
      </div>
    </Frame>
  );
}

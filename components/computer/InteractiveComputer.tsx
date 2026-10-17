"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useState } from "react";
import { COMPUTER_PARTS, type ComputerMode, type ComputerPart } from "@/data/computer";
import { KIND_VAR, Kicker, Panel } from "@/components/ui/primitives";
import { LayeredText, DepthToggle } from "@/components/ui/Depth";
import { Segmented } from "@/components/ui/Segmented";

const FULL = "0 0 1200 760";

interface Ctx {
  mode: ComputerMode;
  selected: string | null;
  hovered: string | null;
  select: (id: string) => void;
  hover: (id: string | null) => void;
}
const PartCtx = createContext<Ctx | null>(null);

/** A clickable region of the artwork, bound to a ComputerPart by id. */
function Part({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const ctx = useContext(PartCtx)!;
  const part = COMPUTER_PARTS[ctx.mode].find((p) => p.id === id);
  if (!part) return <g>{children}</g>;
  const on = ctx.selected === id || ctx.hovered === id;
  const dim = ctx.selected && ctx.selected !== id && id !== "board" && id !== "logicboard";
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${part.label}: zoom in and explain`}
      className={clsx("cursor-pointer outline-none", className)}
      onClick={(e) => {
        e.stopPropagation();
        ctx.select(id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ctx.select(id);
        }
      }}
      onPointerEnter={() => ctx.hover(id)}
      onPointerLeave={() => ctx.hover(null)}
      onFocus={() => ctx.hover(id)}
      onBlur={() => ctx.hover(null)}
      style={{
        filter: on ? `drop-shadow(0 0 7px ${KIND_VAR[part.kind]})` : undefined,
        opacity: dim ? 0.45 : 1,
        transition: "opacity .35s, filter .2s",
      }}
    >
      {children}
    </g>
  );
}

const T = ({ x, y, children, size = 11, anchor = "middle", mono = true, color }: { x: number; y: number; children: React.ReactNode; size?: number; anchor?: "start" | "middle" | "end"; mono?: boolean; color?: string }) => (
  <text x={x} y={y} fontSize={size} textAnchor={anchor} className={mono ? "diagram-mono" : "diagram-text"} style={color ? { fill: color } : undefined} pointerEvents="none">
    {children}
  </text>
);

function Chip({ x, y, w, h, fill = "var(--panel-3)", stroke = "var(--line-strong)", r = 3 }: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string; r?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={1} />;
}

const tint = (v: string, pct: number) => `color-mix(in oklab, ${v} ${pct}%, var(--panel))`;

function Fan({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const reduce = useReducedMotion();
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={tint("var(--k-cooling)", 8)} stroke={tint("var(--k-cooling)", 55)} strokeWidth={1.4} />
      <motion.g
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        {[0, 72, 144, 216, 288].map((a) => (
          <path
            key={a}
            d={`M${cx} ${cy} q ${r * 0.5} ${-r * 0.2} ${r * 0.8} ${r * 0.15}`}
            transform={`rotate(${a} ${cx} ${cy})`}
            fill="none"
            stroke="var(--k-cooling)"
            strokeOpacity={0.7}
            strokeWidth={r * 0.18}
            strokeLinecap="round"
          />
        ))}
      </motion.g>
      <circle cx={cx} cy={cy} r={r * 0.16} fill="var(--panel-3)" stroke={tint("var(--k-cooling)", 55)} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop PC artwork                                                  */
/* ------------------------------------------------------------------ */
function PcArt() {
  const cpu = "var(--k-cpu)";
  const mem = "var(--k-memory)";
  const vram = "var(--k-vram)";
  const gpu = "var(--k-gpu)";
  const sto = "var(--k-storage)";
  const ic = "var(--k-interconnect)";
  const pwr = "var(--k-power)";
  return (
    <g>
      {/* case */}
      <rect x={20} y={20} width={1160} height={720} rx={26} fill="var(--bg-elev)" stroke="var(--line)" />
      <T x={40} y={44} anchor="start" size={10}>
        DESKTOP PC · SIDE PANEL OFF
      </T>

      {/* motherboard */}
      <Part id="board">
        <rect x={60} y={55} width={880} height={660} rx={10} fill={tint("var(--k-interconnect)", 7)} stroke={tint(ic, 35)} strokeWidth={1.4} />
        <pattern id="pcb" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0H0V22" fill="none" stroke="var(--line)" strokeWidth="0.6" />
        </pattern>
        <rect x={60} y={55} width={880} height={660} rx={10} fill="url(#pcb)" opacity={0.6} />
        {[
          [80, 75],
          [915, 75],
          [80, 690],
          [915, 690],
        ].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={6} fill="none" stroke="var(--line-strong)" />
        ))}
        {/* rear I/O, VRM heatsinks, chipset, 24-pin */}
        <rect x={75} y={95} width={70} height={190} rx={4} fill="var(--panel-3)" stroke="var(--line-strong)" />
        <T x={110} y={300} size={9}>
          REAR I/O
        </T>
        <rect x={410} y={78} width={240} height={26} rx={4} fill="var(--panel-2)" stroke="var(--line-strong)" />
        <rect x={370} y={112} width={26} height={220} rx={4} fill="var(--panel-2)" stroke="var(--line-strong)" />
        <T x={530} y={95} size={9}>
          VRM · CPU POWER STAGES
        </T>
        <rect x={810} y={560} width={100} height={70} rx={6} fill="var(--panel-2)" stroke="var(--line-strong)" />
        <T x={860} y={600} size={9}>
          CHIPSET
        </T>
        <rect x={905} y={300} width={20} height={130} rx={3} fill="var(--panel-3)" stroke="var(--line-strong)" />
        <T x={890} y={444} size={9}>
          24-PIN
        </T>
        <T x={500} y={705} size={10}>
          MOTHERBOARD
        </T>
      </Part>

      {/* memory bus traces */}
      <Part id="membus">
        <rect x={630} y={140} width={70} height={170} fill="transparent" />
        {Array.from({ length: 9 }).map((_, i) => {
          const y = 150 + i * 18;
          return (
            <g key={i}>
              <path d={`M630 ${y} H${690 + (i % 2) * 6}`} stroke={mem} strokeOpacity={0.55} strokeWidth={2} />
              <path d={`M630 ${y} H${690 + (i % 2) * 6}`} stroke={mem} strokeWidth={2} className="flow-dash" />
            </g>
          );
        })}
      </Part>

      {/* CPU */}
      <Part id="cpu">
        <rect x={430} y={120} width={200} height={200} rx={10} fill="var(--panel-2)" stroke={tint(cpu, 50)} strokeWidth={1.4} />
        <rect x={445} y={135} width={170} height={170} rx={8} fill={tint(cpu, 10)} stroke={tint(cpu, 60)} />
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <rect x={460 + (i % 4) * 36} y={150 + Math.floor(i / 4) * 40} width={30} height={34} rx={3} fill={tint(cpu, 26)} stroke={cpu} strokeOpacity={0.7} />
            <T x={475 + (i % 4) * 36} y={171 + Math.floor(i / 4) * 40} size={8}>
              C{i}
            </T>
          </g>
        ))}
        <rect x={460} y={278} width={140} height={18} rx={3} fill="var(--panel-3)" stroke={tint(ic, 70)} />
        <T x={530} y={290} size={8}>
          MEMORY CTRL · PCIe ROOT
        </T>
        <T x={458} y={338} size={11} mono={false}>
          CPU
        </T>
      </Part>
      <Part id="cache">
        <rect x={460} y={234} width={140} height={38} rx={3} fill={tint("var(--k-cache)", 22)} stroke="var(--k-cache)" />
        <T x={530} y={250} size={8.5} color="var(--k-cache)">
          L2 · L2 · L2 · L2
        </T>
        <T x={530} y={265} size={9} color="var(--k-cache)">
          SHARED L3 CACHE
        </T>
      </Part>

      {/* RAM */}
      <Part id="ram">
        {[700, 730, 760, 790].map((x, i) => (
          <g key={x}>
            <rect x={x} y={100} width={20} height={260} rx={3} fill="var(--panel-3)" stroke="var(--line-strong)" />
            {(i === 1 || i === 3) && (
              <g>
                <rect x={x + 2} y={104} width={16} height={252} rx={2} fill={tint(mem, 22)} stroke={mem} strokeOpacity={0.8} />
                {Array.from({ length: 8 }).map((_, k) => (
                  <rect key={k} x={x + 5} y={112 + k * 30} width={10} height={22} rx={1.5} fill={tint(mem, 45)} />
                ))}
              </g>
            )}
          </g>
        ))}
        <T x={752} y={378} size={10}>
          DDR5 DIMMs
        </T>
      </Part>

      {/* PCIe traces + slot */}
      <Part id="pcie">
        <rect x={490} y={320} width={80} height={100} fill="transparent" />
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i}>
            <path d={`M${500 + i * 12} 320 V418`} stroke={ic} strokeOpacity={0.6} strokeWidth={2} />
            <path d={`M${500 + i * 12} 320 V418`} stroke={gpu} strokeOpacity={0.9} strokeWidth={2} className="flow-dash" />
          </g>
        ))}
        <rect x={210} y={420} width={580} height={18} rx={3} fill="var(--panel-3)" stroke={tint(ic, 60)} />
        <T x={170} y={433} size={9} anchor="end">
          PCIe x16
        </T>
      </Part>

      {/* Storage bus */}
      <Part id="storagebus">
        <path d="M300 668 H180 V280 H430" fill="none" stroke="transparent" strokeWidth={18} />
        <path d="M300 668 H180 V280 H430" fill="none" stroke={sto} strokeOpacity={0.45} strokeWidth={3} />
        <path d="M300 668 H180 V280 H430" fill="none" stroke={sto} strokeWidth={2} className="flow-dash" />
        <T x={170} y={520} size={9} anchor="end">
          PCIe x4
        </T>
      </Part>

      {/* GPU card (cooler removed) */}
      <Part id="gpu">
        <rect x={200} y={445} width={610} height={180} rx={8} fill={tint(gpu, 8)} stroke={tint(gpu, 50)} strokeWidth={1.4} />
        {Array.from({ length: 22 }).map((_, i) => (
          <rect key={i} x={230 + i * 25} y={438} width={14} height={8} fill="var(--k-storage)" opacity={0.5} />
        ))}
        <rect x={760} y={452} width={40} height={18} rx={2} fill="var(--panel-3)" stroke={tint(pwr, 60)} />
        <rect x={450} y={490} width={100} height={92} rx={4} fill={tint(gpu, 30)} stroke={gpu} />
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x={457 + (i % 6) * 15} y={497 + Math.floor(i / 6) * 15} width={11} height={11} rx={1.5} fill={tint(gpu, 55)} />
        ))}
        <T x={500} y={600} size={9}>
          GPU DIE
        </T>
        <T x={260} y={612} size={9} anchor="start">
          GRAPHICS CARD · COOLER REMOVED
        </T>
      </Part>
      <Part id="vram">
        {[0, 1, 2, 3].flatMap((k) =>
          [404, 562].map((x) => (
            <rect key={`${x}-${k}`} x={x} y={484 + k * 30} width={34} height={24} rx={2} fill={tint(vram, 30)} stroke={vram} strokeOpacity={0.9} />
          )),
        )}
        {[0, 1, 2, 3].flatMap((k) =>
          [438, 550].map((x) => <path key={`t${x}-${k}`} d={`M${x} ${496 + k * 30} H${x === 438 ? 450 : 562}`} stroke={vram} strokeWidth={2} className="flow-dash" />),
        )}
        <T x={421} y={622} size={9} color={vram}>
          VRAM
        </T>
        <T x={579} y={622} size={9} color={vram}>
          VRAM
        </T>
      </Part>

      {/* SSD */}
      <Part id="ssd">
        <rect x={300} y={650} width={240} height={36} rx={4} fill={tint(sto, 14)} stroke={sto} strokeOpacity={0.8} />
        <Chip x={312} y={656} w={40} h={24} fill={tint(sto, 35)} />
        <Chip x={366} y={656} w={60} h={24} fill="var(--panel-3)" />
        <Chip x={436} y={656} w={60} h={24} fill="var(--panel-3)" />
        <circle cx={528} cy={668} r={5} fill="none" stroke="var(--line-strong)" />
        <T x={420} y={702} size={9}>
          M.2 NVMe SSD
        </T>
      </Part>

      {/* PSU and cables */}
      <Part id="psu">
        <path d="M985 600 C 960 560, 950 440, 925 380" fill="none" stroke={pwr} strokeOpacity={0.5} strokeWidth={4} />
        <path d="M985 640 C 900 640, 830 520, 790 470" fill="none" stroke={pwr} strokeOpacity={0.4} strokeWidth={3} />
        <rect x={960} y={560} width={200} height={150} rx={10} fill={tint(pwr, 8)} stroke={tint(pwr, 55)} strokeWidth={1.4} />
        <Fan cx={1060} cy={635} r={48} />
        <T x={1060} y={575} size={10}>
          POWER SUPPLY
        </T>
      </Part>

      {/* Cooling */}
      <Part id="cooling">
        <rect x={985} y={60} width={150} height={350} rx={12} fill="transparent" stroke="var(--line)" strokeDasharray="4 5" />
        <Fan cx={1060} cy={150} r={62} />
        <Fan cx={1060} cy={320} r={62} />
        <T x={1060} y={430} size={10}>
          CASE FANS
        </T>
      </Part>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Apple Silicon MacBook artwork                                       */
/* ------------------------------------------------------------------ */
function MacArt() {
  const cpu = "var(--k-cpu)";
  const mem = "var(--k-memory)";
  const gpu = "var(--k-gpu)";
  const acc = "var(--k-accel)";
  const sto = "var(--k-storage)";
  const ic = "var(--k-interconnect)";
  const pwr = "var(--k-power)";
  return (
    <g>
      <rect x={40} y={30} width={1120} height={700} rx={40} fill="var(--bg-elev)" stroke="var(--line)" />
      <T x={70} y={58} anchor="start" size={10}>
        APPLE SILICON LAPTOP · BOTTOM CASE OFF
      </T>

      <Part id="logicboard">
        <path
          d="M130 165 H1070 a14 14 0 0 1 14 14 V520 a14 14 0 0 1 -14 14 H130 a14 14 0 0 1 -14 -14 V179 a14 14 0 0 1 14 -14Z"
          fill={tint(ic, 7)}
          stroke={tint(ic, 35)}
          strokeWidth={1.4}
        />
        <rect x={560} y={172} width={80} height={14} rx={3} fill="var(--panel-3)" stroke="var(--line-strong)" />
        <T x={600} y={204} size={9}>
          DISPLAY CONN.
        </T>
        {[
          [880, 470],
          [940, 470],
          [300, 470],
        ].map(([x, y]) => (
          <Chip key={`${x}${y}`} x={x} y={y} w={44} h={34} />
        ))}
        <T x={330} y={522} size={9}>
          POWER MGMT
        </T>
        <T x={960} y={522} size={9}>
          WI-FI · AUDIO
        </T>
      </Part>

      <Part id="maccooling">
        <path d="M230 120 C 400 150, 800 150, 970 120" fill="none" stroke="var(--k-cooling)" strokeOpacity={0.55} strokeWidth={12} strokeLinecap="round" />
        <Fan cx={230} cy={110} r={52} />
        <Fan cx={970} cy={110} r={52} />
        <T x={600} y={132} size={9}>
          HEAT PIPE · FANS (FANLESS ON AIR)
        </T>
      </Part>

      <Part id="macio">
        {[240, 300, 360].map((y) => (
          <rect key={y} x={44} y={y} width={22} height={34} rx={6} fill="var(--panel-3)" stroke={tint(ic, 70)} />
        ))}
        <rect x={140} y={230} width={110} height={170} rx={6} fill="var(--panel-2)" stroke={tint(ic, 50)} />
        {[250, 300, 350].map((y) => (
          <path key={y} d={`M66 ${y + 7} H140`} stroke={ic} strokeWidth={2} className="flow-dash" />
        ))}
        <path d="M250 315 H400" stroke={ic} strokeOpacity={0.6} strokeWidth={3} />
        <T x={195} y={300} size={9}>
          THUNDERBOLT
        </T>
        <T x={195} y={315} size={9}>
          (PCIe tunnels)
        </T>
      </Part>

      {/* SoC package */}
      <rect x={400} y={190} width={400} height={320} rx={16} fill="var(--panel)" stroke="var(--line-strong)" strokeWidth={1.4} />
      <T x={600} y={530} size={10}>
        SoC PACKAGE
      </T>

      <Part id="um">
        {[412, 742].map((x) => (
          <g key={x}>
            <rect x={x} y={225} width={46} height={250} rx={6} fill={tint(mem, 22)} stroke={mem} />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={x + 7} y={237 + k * 58} width={32} height={48} rx={3} fill={tint(mem, 45)} />
            ))}
          </g>
        ))}
        <T x={435} y={490} size={8.5} color={mem}>
          MEMORY
        </T>
        <T x={765} y={490} size={8.5} color={mem}>
          MEMORY
        </T>
      </Part>
      <Part id="macfabric">
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <path d={`M458 ${245 + i * 28} H475`} stroke={mem} strokeWidth={2.5} className="flow-dash" />
            <path d={`M742 ${245 + i * 28} H725`} stroke={mem} strokeWidth={2.5} className="flow-dash" />
          </g>
        ))}
      </Part>

      {/* SoC die */}
      <rect x={475} y={215} width={250} height={270} rx={8} fill={tint(acc, 6)} stroke={tint(acc, 45)} />
      <Part id="soc">
        <rect x={488} y={228} width={92} height={62} rx={4} fill={tint(cpu, 22)} stroke={cpu} />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={494 + (i % 3) * 28} y={234 + Math.floor(i / 3) * 26} width={24} height={22} rx={2} fill={tint(cpu, 45)} />
        ))}
        <rect x={488} y={294} width={92} height={30} rx={4} fill={tint(cpu, 12)} stroke={cpu} strokeOpacity={0.6} />
        {Array.from({ length: 4 }).map((_, i) => (
          <rect key={i} x={493 + i * 22} y={299} width={18} height={20} rx={2} fill={tint(cpu, 30)} />
        ))}
        <T x={534} y={286} size={7.5}>
          P-CORES
        </T>
        <T x={534} y={334} size={7.5}>
          E-CORES
        </T>
      </Part>
      <Part id="macgpu">
        <rect x={588} y={228} width={124} height={96} rx={4} fill={tint(gpu, 22)} stroke={gpu} />
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={594 + (i % 5) * 23.5} y={234 + Math.floor(i / 5) * 21} width={19} height={17} rx={2} fill={tint(gpu, 48)} />
        ))}
        <T x={650} y={336} size={7.5}>
          GPU CORES
        </T>
      </Part>
      <Part id="slc">
        <rect x={488} y={342} width={224} height={26} rx={4} fill={tint("var(--k-cache)", 22)} stroke="var(--k-cache)" />
        <T x={600} y={359} size={8} color="var(--k-cache)">
          SYSTEM LEVEL CACHE · FABRIC
        </T>
      </Part>
      <Part id="ane">
        <rect x={488} y={376} width={104} height={56} rx={4} fill={tint(acc, 22)} stroke={acc} />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={494 + (i % 4) * 24} y={382 + Math.floor(i / 4) * 22} width={20} height={18} rx={2} fill={tint(acc, 45)} />
        ))}
        <T x={540} y={446} size={7.5}>
          NEURAL ENGINE
        </T>
      </Part>
      <Part id="media">
        <rect x={600} y={376} width={112} height={56} rx={4} fill={tint(acc, 14)} stroke={acc} strokeOpacity={0.8} />
        <T x={656} y={400} size={8}>
          ENCODE · DECODE
        </T>
        <T x={656} y={414} size={8}>
          ProRes · HEVC · AV1
        </T>
        <T x={656} y={446} size={7.5}>
          MEDIA ENGINES
        </T>
      </Part>
      <rect x={488} y={456} width={224} height={18} rx={3} fill="var(--panel-3)" stroke="var(--line-strong)" />
      <T x={600} y={468} size={7.5}>
        SSD CTRL · DISPLAY · SECURE ENCLAVE · I/O
      </T>

      <Part id="macssd">
        <path d="M800 320 H850" stroke={sto} strokeWidth={2.5} className="flow-dash" />
        <rect x={850} y={250} width={90} height={64} rx={4} fill={tint(sto, 18)} stroke={sto} />
        <rect x={850} y={330} width={90} height={64} rx={4} fill={tint(sto, 18)} stroke={sto} />
        <T x={895} y={286} size={9}>
          NAND
        </T>
        <T x={895} y={366} size={9}>
          NAND
        </T>
        <T x={895} y={416} size={9}>
          SSD FLASH
        </T>
      </Part>

      <Part id="novram">
        <rect x={830} y={430} width={190} height={30} rx={6} fill="transparent" stroke={tint("var(--k-vram)", 70)} strokeDasharray="4 4" />
        <T x={925} y={449} size={9} color="var(--k-vram)">
          VRAM? NONE — SHARED POOL
        </T>
      </Part>

      <Part id="macpower">
        {[120, 285, 450, 615, 780, 945].map((x) => (
          <rect key={x} x={x} y={565} width={140} height={140} rx={14} fill={tint(pwr, 7)} stroke={tint(pwr, 45)} />
        ))}
        <rect x={44} y={420} width={22} height={34} rx={6} fill="var(--panel-3)" stroke={tint(pwr, 60)} />
        <T x={600} y={642} size={10}>
          BATTERY CELLS
        </T>
      </Part>
    </g>
  );
}

function PartPanel({ part, onClose, onNext }: { part: ComputerPart | undefined; onClose: () => void; onNext: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {part ? (
        <motion.div key={part.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.22 }}>
          <Panel className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Kicker color={KIND_VAR[part.kind]}>{part.kind === "interconnect" ? "Connection" : part.kind}</Kicker>
                <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-fg">{part.label}</h3>
              </div>
              <button onClick={onClose} className="rounded-lg border border-line px-2 py-1 text-xs text-dim hover:text-fg">
                Zoom out
              </button>
            </div>
            <div className="mt-3">
              <DepthToggle />
            </div>
            <div className="mt-4">
              <LayeredText text={part.body} />
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <Kicker>When buying, look at</Kicker>
              <ul className="mt-2 space-y-1.5">
                {part.lookAt.map((l) => (
                  <li key={l} className="flex gap-2 text-sm text-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: KIND_VAR[part.kind] }} />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 flex items-center justify-between">
              {part.lesson ? (
                <Link href={part.lesson} className="text-sm font-medium text-accent">
                  Open the full module →
                </Link>
              ) : (
                <span />
              )}
              <button onClick={onNext} className="text-xs text-dim hover:text-fg">
                Next part ↷
              </button>
            </div>
          </Panel>
        </motion.div>
      ) : (
        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Panel className="p-5">
            <Kicker>How to use this</Kicker>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Click any part of the computer — or a chip below — to zoom in. Each part explains itself at three levels:
              <strong className="text-fg"> Simple</strong>, <strong className="text-fg">Technical</strong> and{" "}
              <strong className="text-fg">Deep Dive</strong>.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The moving dashes are data in motion: <span style={{ color: "var(--k-memory)" }}>memory traffic</span>,{" "}
              <span style={{ color: "var(--k-gpu)" }}>PCIe traffic</span> and <span style={{ color: "var(--k-storage)" }}>storage reads</span>.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Then switch to <strong className="text-fg">Apple Silicon</strong> and look for the graphics card. There isn&apos;t one.
            </p>
          </Panel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function InteractiveComputer() {
  const [mode, setMode] = useState<ComputerMode>("pc");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const parts = COMPUTER_PARTS[mode];
  const part = parts.find((p) => p.id === selected);
  const viewBox = part && part.id !== "board" && part.id !== "logicboard" ? part.zoom.join(" ") : FULL;
  const hoverPart = parts.find((p) => p.id === hovered);

  const select = (id: string) => setSelected((s) => (s === id ? null : id));
  const next = () => {
    const i = parts.findIndex((p) => p.id === selected);
    setSelected(parts[(i + 1) % parts.length].id);
  };

  return (
    <PartCtx.Provider value={{ mode, selected, hovered, select, hover: setHovered }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Computer type"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setSelected(null);
          }}
          options={[
            { value: "pc", label: "Desktop PC" },
            { value: "mac", label: "Apple Silicon Mac" },
          ]}
        />
        <div className="font-mono text-[11px] text-dim">
          {hoverPart ? (
            <span style={{ color: KIND_VAR[hoverPart.kind] }}>→ {hoverPart.label}</span>
          ) : mode === "pc" ? (
            "CPU + RAM | PCIe | GPU + VRAM — separate parts, separate memories"
          ) : (
            "One package: CPU, GPU, Neural Engine, media engines + unified memory"
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel className="relative overflow-hidden p-2 sm:p-3">
          <motion.svg
            viewBox={FULL}
            animate={{ viewBox }}
            transition={{ type: "spring", stiffness: 70, damping: 18 }}
            className="aspect-[1200/760] h-auto w-full"
            role="group"
            aria-label={mode === "pc" ? "Interactive desktop PC" : "Interactive Apple Silicon Mac"}
            onClick={() => setSelected(null)}
          >
            <AnimatePresence mode="wait">
              <motion.g key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {mode === "pc" ? <PcArt /> : <MacArt />}
              </motion.g>
            </AnimatePresence>
          </motion.svg>
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="absolute left-4 top-4 rounded-lg border border-line bg-panel/90 px-2.5 py-1 text-xs text-muted backdrop-blur hover:text-fg"
            >
              ← Full view
            </button>
          )}
        </Panel>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <PartPanel part={part} onClose={() => setSelected(null)} onNext={next} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {parts.map((p) => (
          <button
            key={p.id}
            onClick={() => select(p.id)}
            onPointerEnter={() => setHovered(p.id)}
            onPointerLeave={() => setHovered(null)}
            className={clsx(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
              selected === p.id ? "border-line-strong bg-panel-3 text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg",
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND_VAR[p.kind] }} />
            {p.label}
          </button>
        ))}
      </div>
    </PartCtx.Provider>
  );
}

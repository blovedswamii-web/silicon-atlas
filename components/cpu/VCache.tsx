"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { ApproxBadge } from "@/components/ui/primitives";
import { Frame, Slider, logPos } from "./Frame";

type Stack = "none" | "top" | "under";
type Work = "game" | "stream";

const BASE_L3 = 32; // MB on one compute die
const EXTRA = 64; // MB stacked

const W_MIN = 4;
const W_MAX = 1024;

/** Toy model: relative performance vs working-set size. */
function perf(ws: number, l3: number, work: Work, clock: number) {
  const L3_NS = 12;
  const DRAM_NS = 85;
  let hit: number;
  if (work === "game") {
    // random accesses with heavy re-use: hit rate collapses once the working set exceeds the cache
    hit = ws <= l3 ? 0.97 : 0.97 * Math.pow(l3 / ws, 0.9);
  } else {
    // streaming: data is touched roughly once in order; prefetchers keep hit rate steady regardless of cache size
    hit = 0.95;
  }
  const lat = hit * L3_NS + (1 - hit) * DRAM_NS;
  const intensity = work === "game" ? 0.015 : 0.004;
  return clock / (1 + intensity * lat);
}

export function VCache() {
  const [stack, setStack] = useState<Stack>("under");
  const [work, setWork] = useState<Work>("game");
  const [wsExp, setWsExp] = useState(Math.log2(64));
  const ws = Math.pow(2, wsExp);
  const x3dClock = stack === "top" ? 0.93 : 0.98;
  const showX3d = stack !== "none";

  const curve = useMemo(() => {
    const pts: { ws: number; std: number; x3d: number }[] = [];
    for (let e = Math.log2(W_MIN); e <= Math.log2(W_MAX) + 1e-9; e += 0.1) {
      const w = Math.pow(2, e);
      pts.push({ ws: w, std: perf(w, BASE_L3, work, 1), x3d: perf(w, BASE_L3 + EXTRA, work, x3dClock) });
    }
    return pts;
  }, [work, x3dClock]);
  const norm = perf(W_MIN, BASE_L3, work, 1);
  const yMax = 1.08;
  const yMin = work === "game" ? 0.4 : 0.8;

  const W = 560;
  const H = 230;
  const P = { l: 40, r: 12, t: 12, b: 30 };
  const px = (w: number) => P.l + logPos(w, W_MIN, W_MAX) * (W - P.l - P.r);
  const py = (v: number) => P.t + (1 - (v / norm - yMin) / (yMax - yMin)) * (H - P.t - P.b);
  const path = (k: "std" | "x3d") => curve.map((p, i) => `${i ? "L" : "M"}${px(p.ws).toFixed(1)} ${py(p[k]).toFixed(1)}`).join(" ");

  const sStd = perf(ws, BASE_L3, work, 1);
  const sX = perf(ws, BASE_L3 + EXTRA, work, x3dClock);
  const delta = (sX / sStd - 1) * 100;

  return (
    <Frame
      kicker="Interactive · AMD 3D V-Cache"
      title="What does stacking extra cache actually buy?"
      footer="Toy model with illustrative numbers. Real results depend on each game's engine, resolution (GPU-bound scenarios hide CPU differences entirely), the chip generation and its clocks. The cache sizes match the common single-die X3D layout: 32 MB on the compute die plus a 64 MB stacked die."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Segmented
            size="sm"
            ariaLabel="Cache configuration"
            value={stack}
            onChange={setStack}
            options={[
              { value: "none", label: "Standard" },
              { value: "top", label: "X3D · cache on top" },
              { value: "under", label: "X3D · cache underneath" },
            ]}
          />
          <svg viewBox="0 40 400 170" className="mt-4 h-auto w-full" role="img" aria-label="Side view of a CPU compute die with optional stacked cache">
            {/* heat spreader */}
            <rect x="30" y="58" width="340" height="14" rx="3" fill="var(--panel-3)" stroke="var(--line-strong)" />
            <text x="200" y="68.5" textAnchor="middle" className="diagram-mono" fontSize="9">
              heat spreader → cooler
            </text>
            {/* substrate */}
            <rect x="20" y="176" width="360" height="18" rx="3" fill="var(--panel-3)" stroke="var(--line-strong)" />
            <text x="200" y="188.5" textAnchor="middle" className="diagram-mono" fontSize="9">
              package substrate
            </text>
            <AnimatePresence initial={false}>
              {/* compute die position depends on stacking */}
              <motion.g key="ccd" initial={false} animate={{ y: stack === "under" ? -44 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 24 }}>
                <rect x="70" y="122" width="260" height="50" rx="5" fill="color-mix(in oklab, var(--k-cpu) 18%, var(--panel))" stroke="var(--k-cpu)" />
                {Array.from({ length: 8 }, (_, i) => (
                  <rect key={i} x={78 + i * 20} y="130" width="16" height="34" rx="2" fill="color-mix(in oklab, var(--k-cpu) 40%, transparent)" />
                ))}
                <rect x="244" y="130" width="78" height="34" rx="3" fill="color-mix(in oklab, var(--k-cache) 35%, transparent)" stroke="var(--k-cache)" />
                <text x="283" y="151" textAnchor="middle" className="diagram-text" fontSize="10.5" fontWeight="600">
                  L3 32 MB
                </text>
                <text x="64" y="144" textAnchor="end" className="diagram-mono" fontSize="9">
                  compute
                </text>
                <text x="64" y="155" textAnchor="end" className="diagram-mono" fontSize="9">
                  die
                </text>
              </motion.g>
              {showX3d && (
                <motion.g
                  key={`cache-${stack}`}
                  initial={{ opacity: 0, y: stack === "top" ? -16 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {stack === "top" ? (
                    <>
                      <rect x="230" y="80" width="100" height="38" rx="4" fill="color-mix(in oklab, var(--k-accel) 25%, var(--panel))" stroke="var(--k-accel)" />
                      <text x="280" y="103" textAnchor="middle" className="diagram-text" fontSize="10.5" fontWeight="600">
                        +64 MB SRAM
                      </text>
                      <rect x="70" y="80" width="156" height="38" rx="4" fill="var(--panel-2)" stroke="var(--line-strong)" strokeDasharray="3 3" />
                      <text x="148" y="103" textAnchor="middle" className="diagram-mono" fontSize="9">
                        silicon spacer over cores
                      </text>
                    </>
                  ) : (
                    <>
                      <rect x="70" y="132" width="260" height="40" rx="4" fill="color-mix(in oklab, var(--k-accel) 25%, var(--panel))" stroke="var(--k-accel)" />
                      <text x="200" y="156" textAnchor="middle" className="diagram-text" fontSize="10.5" fontWeight="600">
                        +64 MB SRAM cache die (below)
                      </text>
                    </>
                  )}
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {stack === "none" &&
              "A standard compute die: 8 cores sharing 32 MB of L3 cache. Anything the cores need that isn't in cache comes from DRAM, ~85 ns away."}
            {stack === "top" &&
              "Earlier X3D chips bonded a 64 MB cache die on top of the compute die. The extra layer sits between the cores and the cooler, so those chips ran at somewhat lower clocks and voltage limits — a small loss for workloads that don't need the cache."}
            {stack === "under" &&
              "Newer X3D chips put the cache die underneath, so the hot cores sit directly under the heat spreader. That lets them clock closer to the non-X3D parts, shrinking the downside."}
          </p>
          <div className="mt-3 font-mono text-xs text-dim">
            Total L3: <span className="text-fg">{showX3d ? BASE_L3 + EXTRA : BASE_L3} MB</span>
          </div>
        </div>

        <div>
          <Segmented
            size="sm"
            ariaLabel="Workload"
            value={work}
            onChange={setWork}
            options={[
              { value: "game", label: "Game-like: random re-use" },
              { value: "stream", label: "Streaming: render / encode" },
            ]}
          />
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label="Relative performance versus working-set size">
            <rect
              x={px(BASE_L3)}
              y={P.t}
              width={px(BASE_L3 + EXTRA) - px(BASE_L3)}
              height={H - P.t - P.b}
              fill="color-mix(in oklab, var(--k-accel) 8%, transparent)"
            />
            {[4, 16, 32, 96, 256, 1024].map((t) => (
              <g key={t}>
                <line x1={px(t)} x2={px(t)} y1={P.t} y2={H - P.b} stroke="var(--line)" />
                <text x={px(t)} y={H - P.b + 14} textAnchor="middle" className="diagram-mono" fontSize="10">
                  {t >= 1024 ? "1 GB" : `${t} MB`}
                </text>
              </g>
            ))}
            {[0.4, 0.6, 0.8, 1].filter((v) => v >= yMin).map((v) => (
              <g key={v}>
                <line x1={P.l} x2={W - P.r} y1={py(v * norm)} y2={py(v * norm)} stroke="var(--line)" strokeDasharray="2 4" />
                <text x={P.l - 6} y={py(v * norm) + 3} textAnchor="end" className="diagram-mono" fontSize="10">
                  {Math.round(v * 100)}%
                </text>
              </g>
            ))}
            <path d={path("std")} fill="none" stroke="var(--k-cpu)" strokeWidth="2.2" />
            {showX3d && <path d={path("x3d")} fill="none" stroke="var(--k-accel)" strokeWidth="2.2" />}
            <line x1={px(ws)} x2={px(ws)} y1={P.t} y2={H - P.b} stroke="var(--fg)" strokeDasharray="3 3" />
            <circle cx={px(ws)} cy={py(sStd)} r="4" fill="var(--k-cpu)" />
            {showX3d && <circle cx={px(ws)} cy={py(sX)} r="4" fill="var(--k-accel)" />}
          </svg>
          <Slider label="Working set size" value={wsExp} min={2} max={10} step={0.1} onChange={setWsExp} display={ws >= 1024 ? "1 GB" : `${Math.round(ws)} MB`} />
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-[var(--k-cpu)]" /> 32 MB L3
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-[var(--k-accel)]" /> 96 MB L3 (X3D)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-4 bg-[color-mix(in_oklab,var(--k-accel)_15%,transparent)]" /> fits only in X3D
            </span>
            <ApproxBadge />
          </div>
          <div className="mt-3 rounded-xl border border-line bg-panel-2 p-3 text-sm leading-relaxed text-muted">
            {!showX3d ? (
              "Pick an X3D configuration to compare."
            ) : (
              <>
                <strong className="text-fg">
                  X3D {delta >= 0 ? "+" : ""}
                  {delta.toFixed(0)}%
                </strong>{" "}
                at this working set.{" "}
                {work === "stream"
                  ? "Streaming work reads data roughly once, in order — prefetchers already hide memory latency, so extra cache has nothing to keep. The small clock difference is all that's left."
                  : ws <= BASE_L3
                    ? "The working set already fits in 32 MB, so extra cache sits mostly idle."
                    : ws <= BASE_L3 + EXTRA
                      ? "The sweet spot: the data fits in 96 MB but not in 32 MB. Misses that would have gone to DRAM now hit cache. Many games — with large, randomly accessed world state — live here."
                      : "The working set is too big even for 96 MB. X3D still catches more hits, but the advantage shrinks."}
              </>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

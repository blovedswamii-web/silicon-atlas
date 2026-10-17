"use client";

import clsx from "clsx";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { ApproxBadge } from "@/components/ui/primitives";
import { Btn, Frame } from "./Frame";

type Kind = "alu" | "load" | "mul" | "branch" | "store";
interface Op {
  text: string;
  kind: Kind;
  dst?: string;
  srcs: string[];
  run?: (r: Record<string, number>) => number;
}

const MEM: Record<string, number> = { a: 10, b: 3 };
const INIT: Record<string, number> = { r1: 0, r2: 0, r3: 0, r4: 0, r5: 0, r6: 4, r7: 0, r8: 2, r9: 8 };

const PROGRAM: Op[] = [
  { text: "ld   r1, [a]", kind: "load", dst: "r1", srcs: [], run: () => MEM.a },
  { text: "add  r2, r1, #4", kind: "alu", dst: "r2", srcs: ["r1"], run: (r) => r.r1 + 4 },
  { text: "ld   r3, [b]", kind: "load", dst: "r3", srcs: [], run: () => MEM.b },
  { text: "mul  r4, r3, r3", kind: "mul", dst: "r4", srcs: ["r3"], run: (r) => r.r3 * r.r3 },
  { text: "add  r5, r6, #1", kind: "alu", dst: "r5", srcs: ["r6"], run: (r) => r.r6 + 1 },
  { text: "sub  r7, r6, r8", kind: "alu", dst: "r7", srcs: ["r6", "r8"], run: (r) => r.r6 - r.r8 },
  { text: "cmp  r5, r9", kind: "alu", dst: "flags", srcs: ["r5", "r9"] },
  { text: "b.ge done", kind: "branch", srcs: ["flags"] },
  { text: "add  r2, r2, r4", kind: "alu", dst: "r2", srcs: ["r2", "r4"], run: (r) => r.r2 + r.r4 },
  { text: "str  r2, [c]", kind: "store", srcs: ["r2"] },
  { text: "add  r6, r6, #1", kind: "alu", dst: "r6", srcs: ["r6"], run: (r) => r.r6 + 1 },
  { text: "eor  r8, r8, r6", kind: "alu", dst: "r8", srcs: ["r8", "r6"], run: (r) => r.r8 ^ r.r6 },
];

const WRONG_PATH = ["done: mov r0, r2", "add  sp, sp, #16", "ldr  r9, [sp]", "ret", "nop", "mov  r1, #0", "ldr  r2, [r0]", "add  r3, r3, #1"];

type Stage = "F" | "D" | "·" | "E" | "M" | "W" | "r" | "x";
interface Row {
  label: string;
  wrong: boolean;
  idx: number;
  cells: Record<number, Stage>;
  e: number;
  w: number;
}

const LAT: Record<Kind, number> = { alu: 1, load: 1, mul: 3, branch: 1, store: 1 };
/** Cycle at which a dependent instruction may enter Execute (with forwarding). */
const READY_AFTER: Record<Kind, number> = { alu: 1, load: 2, mul: 3, branch: 1, store: 1 };

function schedule(wide: boolean, mispredict: boolean) {
  const width = wide ? 4 : 1;
  const rows: Row[] = [];
  const ready: Record<string, number> = {};
  const issued: Record<number, number> = {};
  let fc = 0;
  let slot = 0;
  let lastE = -1;
  let lastW = -1;
  let wrongFetched = 0;

  const place = (label: string, idx: number, kind: Kind, srcs: string[], wrong: boolean, flushAt?: number) => {
    if (slot >= width) {
      fc++;
      slot = 0;
    }
    const f = fc;
    slot++;
    let e = Math.max(f + 2, ...srcs.map((s) => ready[s] ?? 0));
    if (!wide) e = Math.max(e, lastE + 1);
    while ((issued[e] ?? 0) >= width) e++;
    const cells: Record<number, Stage> = { [f]: "F", [f + 1]: "D" };
    for (let c = f + 2; c < e; c++) cells[c] = "·";
    if (wrong && flushAt !== undefined && e >= flushAt) {
      for (const k of Object.keys(cells)) if (+k >= flushAt) delete cells[+k];
      cells[flushAt] = "x";
      rows.push({ label, wrong, idx, cells, e: -1, w: -1 });
      return { f, e: -1 };
    }
    issued[e] = (issued[e] ?? 0) + 1;
    const lat = LAT[kind];
    for (let c = e; c < e + lat; c++) cells[c] = "E";
    const m = e + lat;
    cells[m] = "M";
    let w = m + 1;
    if (wrong) {
      if (flushAt !== undefined) {
        for (const k of Object.keys(cells)) if (+k >= flushAt) delete cells[+k];
        cells[flushAt] = "x";
      }
      rows.push({ label, wrong, idx, cells, e, w: -1 });
      return { f, e };
    }
    if (wide) {
      w = Math.max(w, lastW);
      for (let c = m + 1; c < w; c++) cells[c] = "r";
    }
    cells[w] = "W";
    lastW = w;
    if (!wide) {
      lastE = e;
      // In-order: an instruction stalled in decode holds the one behind it in fetch,
      // so the next fetch lands at cycle e - 1.
      fc = e - 2;
      slot = width;
    }
    rows.push({ label, wrong, idx, cells, e, w });
    return { f, e };
  };

  PROGRAM.forEach((op, i) => {
    const { f, e } = place(op.text, i, op.kind, op.srcs, false);
    if (op.dst) ready[op.dst] = e + READY_AFTER[op.kind];
    if (op.kind === "branch" && mispredict) {
      // Wrong-path instructions are fetched until the branch resolves in Execute, then flushed.
      let k = 0;
      while (true) {
        if (slot >= width) {
          fc++;
          slot = 0;
        }
        if (fc > e) break;
        place(WRONG_PATH[k % WRONG_PATH.length], -1, "alu", [], true, e + 1);
        wrongFetched++;
        k++;
      }
      fc = e + 1;
      slot = 0;
    }
    void f;
  });

  const cycles = Math.max(...rows.flatMap((r) => Object.keys(r.cells).map(Number))) + 1;
  return { rows, cycles, wrongFetched };
}

function registerState(rows: Row[], cycle: number) {
  const regs = { ...INIT };
  let stored: number | null = null;
  const changed = new Set<string>();
  rows
    .filter((r) => !r.wrong && r.w >= 0 && r.w <= cycle)
    .forEach((r) => {
      const op = PROGRAM[r.idx];
      if (op.run && op.dst && op.dst !== "flags") {
        regs[op.dst] = op.run(regs);
        if (r.w === cycle) changed.add(op.dst);
      }
      if (op.kind === "store") stored = regs.r2;
    });
  return { regs, stored, changed };
}

const STAGE_STYLE: Record<Stage, { bg: string; fg: string; name: string }> = {
  F: { bg: "color-mix(in oklab, var(--k-cache) 30%, transparent)", fg: "var(--fg)", name: "Fetch" },
  D: { bg: "color-mix(in oklab, var(--k-gpu) 30%, transparent)", fg: "var(--fg)", name: "Decode" },
  "·": { bg: "transparent", fg: "var(--warn)", name: "Waiting (stall / in issue queue)" },
  E: { bg: "color-mix(in oklab, var(--k-cpu) 45%, transparent)", fg: "var(--fg)", name: "Execute (ALU)" },
  M: { bg: "color-mix(in oklab, var(--k-memory) 30%, transparent)", fg: "var(--fg)", name: "Memory access" },
  W: { bg: "color-mix(in oklab, var(--good) 35%, transparent)", fg: "var(--fg)", name: "Write back / retire" },
  r: { bg: "transparent", fg: "var(--fg-dim)", name: "Done, waiting to retire in order" },
  x: { bg: "color-mix(in oklab, var(--bad) 35%, transparent)", fg: "var(--fg)", name: "Flushed (wrong path)" },
};

export function Pipeline() {
  const [core, setCore] = useState<"narrow" | "wide">("narrow");
  const [branch, setBranch] = useState<"hit" | "miss">("hit");
  const [cycle, setCycle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { rows, cycles, wrongFetched } = useMemo(() => schedule(core === "wide", branch === "miss"), [core, branch]);

  useEffect(() => {
    setCycle(0);
    setPlaying(false);
  }, [core, branch]);

  useEffect(() => {
    if (!playing) return;
    if (cycle >= cycles - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setCycle((c) => c + 1), 550);
    return () => clearTimeout(t);
  }, [playing, cycle, cycles]);

  const { regs, stored, changed } = registerState(rows, cycle);
  const retired = rows.filter((r) => !r.wrong && r.w >= 0 && r.w <= cycle).length;
  const finalIpc = PROGRAM.length / cycles;
  const shownRows = rows.filter((r, i) => !r.wrong || rows.slice(0, i).filter((x) => x.wrong).length < 8);
  const hiddenWrong = rows.filter((r) => r.wrong).length - shownRows.filter((r) => r.wrong).length;
  const lastShownWrong = shownRows.map((r) => r.wrong).lastIndexOf(true);

  const inStage = (s: Stage) => rows.filter((r) => r.cells[cycle] === s);
  const executing = inStage("E");

  return (
    <Frame
      kicker="Step through · pipeline"
      title="Fetch → Decode → Execute → Memory → Write back"
      controls={
        <>
          <Btn onClick={() => setCycle((c) => Math.max(0, c - 1))} disabled={cycle === 0}>
            ←
          </Btn>
          <Btn onClick={() => setPlaying((p) => !p)} active={playing}>
            {playing ? "Pause" : "Play"}
          </Btn>
          <Btn onClick={() => setCycle((c) => Math.min(cycles - 1, c + 1))} disabled={cycle >= cycles - 1}>
            Tick →
          </Btn>
        </>
      }
      footer="A teaching model of a classic 5-stage pipeline. Real cores have 10–20+ stages, rename registers, split instructions into micro-ops and track hundreds of instructions in flight — but the ideas (overlap, stalls, flushes, width) are the same."
    >
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          size="sm"
          ariaLabel="Core design"
          value={core}
          onChange={setCore}
          options={[
            { value: "narrow", label: "Narrow, in-order (1-wide)" },
            { value: "wide", label: "Wide, out-of-order (4-wide)" },
          ]}
        />
        <Segmented
          size="sm"
          ariaLabel="Branch prediction"
          value={branch}
          onChange={setBranch}
          options={[
            { value: "hit", label: "Branch predicted ✓" },
            { value: "miss", label: "Branch mispredicted ✗" },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_15rem] [&>*]:min-w-0">
        <div className="scroll-thin overflow-x-auto rounded-xl border border-line bg-panel-2">
          <table className="border-separate border-spacing-0 font-mono text-[11px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-panel-2 px-2 py-1.5 text-left font-normal text-dim">cycle →</th>
                {Array.from({ length: cycles }, (_, c) => (
                  <th
                    key={c}
                    onClick={() => setCycle(c)}
                    className={clsx("w-6 min-w-6 cursor-pointer px-0 py-1.5 text-center font-normal", c === cycle ? "text-fg" : "text-dim")}
                  >
                    {c + 1}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="sticky left-0 z-10 bg-panel-2 px-2 pb-1 text-left font-normal text-dim">clock</th>
                {Array.from({ length: cycles }, (_, c) => (
                  <th key={c} className="p-0 pb-1">
                    <svg viewBox="0 0 24 10" className="block h-2.5 w-6" aria-hidden>
                      <path d="M0 9 H4 V1 H14 V9 H24" fill="none" stroke={c === cycle ? "var(--accent)" : "var(--line-strong)"} strokeWidth="1.2" />
                    </svg>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shownRows.map((r, ri) => (
                <Fragment key={ri}>
                <tr>
                  <td
                    className={clsx(
                      "sticky left-0 z-10 whitespace-pre bg-panel-2 px-2 py-[3px] pr-3",
                      r.wrong ? "text-[var(--bad)] line-through decoration-1 opacity-70" : "text-muted",
                    )}
                  >
                    {r.label}
                  </td>
                  {Array.from({ length: cycles }, (_, c) => {
                    const s = r.cells[c];
                    const st = s ? STAGE_STYLE[s] : null;
                    return (
                      <td key={c} className={clsx("p-[1.5px]", c === cycle && "bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]")}>
                        <div
                          className={clsx("grid h-5 w-[21px] place-items-center rounded-[4px]", c > cycle && "opacity-25")}
                          style={st ? { background: st.bg, color: st.fg } : undefined}
                        >
                          {s ?? ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {ri === lastShownWrong && hiddenWrong > 0 && (
                  <tr>
                    <td className="sticky left-0 bg-panel-2 px-2 py-0.5 text-[10px] text-[var(--bad)] opacity-70">+{hiddenWrong} more wrong-path, flushed…</td>
                  </tr>
                )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-line bg-panel-2 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-dim">Cycle {cycle + 1}</div>
            <div className="mt-1.5 text-xs leading-relaxed text-muted">
              {executing.length === 0 ? (
                <span>No instruction in the ALU this cycle{inStage("·").length ? " — waiting on a dependency." : "."}</span>
              ) : (
                <span>
                  ALU busy with{" "}
                  {executing.map((r, i) => (
                    <span key={i} className={r.wrong ? "text-[var(--bad)]" : "text-fg"}>
                      {i > 0 && ", "}
                      <code className="font-mono">{r.label.trim()}</code>
                    </span>
                  ))}
                </span>
              )}
              {inStage("x").length > 0 && (
                <div className="mt-1 text-[var(--bad)]">Branch resolved the other way: {inStage("x").length} wrong-path instruction(s) thrown away.</div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-panel-2 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-dim">Registers</div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {Object.entries(regs).map(([k, v]) => (
                <div
                  key={k}
                  className={clsx(
                    "rounded-md border px-1.5 py-1 font-mono text-[11px] transition-colors",
                    changed.has(k) ? "border-[var(--good)] text-fg" : "border-line text-muted",
                  )}
                >
                  <span className="text-dim">{k}</span> {v}
                </div>
              ))}
            </div>
            <div className="mt-1.5 font-mono text-[11px] text-dim">
              mem[c] = <span className="text-muted">{stored ?? "—"}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-panel-2 px-2.5 py-2">
              <div className="font-mono text-[9.5px] uppercase tracking-wider text-dim">Retired</div>
              <div className="font-mono text-sm text-fg">
                {retired}/{PROGRAM.length}
              </div>
            </div>
            <div className="rounded-lg border border-line bg-panel-2 px-2.5 py-2">
              <div className="font-mono text-[9.5px] uppercase tracking-wider text-dim">IPC (whole run)</div>
              <div className="font-mono text-sm text-fg">{finalIpc.toFixed(2)}</div>
            </div>
          </div>
          <div className="text-[11px] leading-relaxed text-dim">
            {cycles} cycles ≈ {(cycles / 4).toFixed(2)} ns at 4 GHz.
            {branch === "miss" && ` ${wrongFetched} instructions fetched down the wrong path were wasted.`}
          </div>
          <ApproxBadge label="Teaching model" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {(Object.keys(STAGE_STYLE) as Stage[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-[11px] text-dim">
            <span className="grid h-4 w-4 place-items-center rounded-[3px] font-mono text-[10px]" style={{ background: STAGE_STYLE[s].bg, color: STAGE_STYLE[s].fg }}>
              {s}
            </span>
            {STAGE_STYLE[s].name}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        {core === "narrow"
          ? "The in-order core can only start one instruction per cycle, and when an instruction needs a result that isn't ready (the add right after a load, or anything waiting on the 3-cycle multiply), everything behind it waits too. "
          : "The wide out-of-order core fetches four instructions per cycle and lets independent ones (the second load, the add/sub on r6) run ahead of stalled ones, then retires results in program order so software never notices. "}
        {branch === "miss"
          ? `A mispredicted branch means everything fetched after it was guesswork; it gets flushed and the pipeline refills. Wider, deeper cores waste more work per mispredict — which is why accurate branch prediction is one of the most important parts of a modern CPU.`
          : "With the branch predicted correctly, the front end never stops fetching."}
      </p>
    </Frame>
  );
}

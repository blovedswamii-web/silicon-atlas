"use client";

import clsx from "clsx";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { ApproxBadge } from "@/components/ui/primitives";
import { Btn, Frame } from "./Frame";

type Mode = "apple" | "intel" | "amd";
type TaskKind = "background" | "interactive" | "heavy";

interface CoreDef {
  id: string;
  type: "P" | "E" | "C";
  slots: number;
  speed: number; // work units per tick for one thread
  power: number; // illustrative power when busy
}
interface Task {
  id: number;
  kind: TaskKind;
  remaining: number;
  total: number;
  core?: string;
}

const MODES: Record<Mode, { label: string; config: string; cores: CoreDef[]; explain: string[] }> = {
  apple: {
    label: "Apple Silicon",
    config: "Example: 4 performance + 6 efficiency cores",
    cores: [
      ...Array.from({ length: 4 }, (_, i): CoreDef => ({ id: `P${i}`, type: "P", slots: 1, speed: 1, power: 4.5 })),
      ...Array.from({ length: 6 }, (_, i): CoreDef => ({ id: `E${i}`, type: "E", slots: 1, speed: 0.4, power: 0.5 })),
    ],
    explain: [
      "Apps tag their work with a **Quality of Service** class (user-interactive, user-initiated, utility, background). macOS uses it to decide where threads run.",
      "**Background** QoS work (Spotlight indexing, Time Machine, photo analysis) is kept on the efficiency cores — even when P-cores are idle — so it costs very little battery.",
      "Interactive and heavy work goes to P-cores first and spills onto E-cores when every P-core is busy. There is no SMT: one thread per core.",
    ],
  },
  intel: {
    label: "Intel hybrid",
    config: "Example: 8 P-cores + 16 E-cores (desktop Core Ultra class)",
    cores: [
      ...Array.from({ length: 8 }, (_, i): CoreDef => ({ id: `P${i}`, type: "P", slots: 1, speed: 1, power: 9 })),
      ...Array.from({ length: 16 }, (_, i): CoreDef => ({ id: `E${i}`, type: "E", slots: 1, speed: 0.6, power: 2.5 })),
    ],
    explain: [
      "The CPU's **Thread Director** watches what each thread is doing and gives the operating system hints about which core type suits it; Windows or Linux makes the final call.",
      "Foreground and demanding threads prefer P-cores; background work prefers E-cores. Big multithreaded jobs use **all** cores — E-cores add a lot of throughput per watt and per mm² of silicon.",
      "Recent Core Ultra desktop P-cores dropped Hyper-Threading, so here each core runs one thread. Earlier hybrid generations ran two threads on each P-core.",
    ],
  },
  amd: {
    label: "AMD desktop",
    config: "Example: 8 identical cores × 2 threads (SMT)",
    cores: Array.from({ length: 8 }, (_, i): CoreDef => ({ id: `C${i}`, type: "C", slots: 2, speed: 1, power: 7 })),
    explain: [
      "Typical Ryzen desktop chips use **one kind of core**. The scheduler's job is simpler: fill the fastest-boosting 'preferred' cores first, one thread per core, before doubling up.",
      "**SMT** lets each core run two threads by sharing its execution units. Two threads on one core each run slower, but together they usually get more done than one.",
      "Some AMD mobile chips mix full Zen cores with **compact 'c' cores** — same design and instructions, smaller and lower-clocked — a different way to get a hybrid chip.",
    ],
  },
};

const KIND_STYLE: Record<TaskKind, { color: string; label: string; work: number }> = {
  background: { color: "var(--fg-dim)", label: "Background", work: 7 },
  interactive: { color: "var(--accent)", label: "Interactive", work: 2 },
  heavy: { color: "var(--k-accel)", label: "Heavy", work: 16 },
};

const PRIORITY: TaskKind[] = ["interactive", "heavy", "background"];

function step(mode: Mode, tasks: Task[]): { tasks: Task[]; done: number; power: number; work: number } {
  const cores = MODES[mode].cores;
  const byId = Object.fromEntries(cores.map((c) => [c.id, c]));

  const next = tasks.map((t) => ({ ...t }));
  const occupancy = (id: string) => next.filter((t) => t.core === id).length;
  const pick = (kind: TaskKind): CoreDef | undefined => {
    const avail = (type?: CoreDef["type"]) => {
      const c = cores.filter((x) => (!type || x.type === type) && occupancy(x.id) < x.slots);
      c.sort((a, b) => occupancy(a.id) - occupancy(b.id));
      return c[0];
    };
    if (mode === "amd") return avail();
    if (kind === "background") return mode === "apple" ? avail("E") : avail("E") ?? avail("P");
    return avail("P") ?? avail("E");
  };

  // Migrate demanding work from E to P when a P-core frees up.
  if (mode !== "amd") {
    for (const t of next) {
      if (t.core && byId[t.core].type === "E" && t.kind !== "background") {
        const p = cores.find((c) => c.type === "P" && occupancy(c.id) === 0);
        if (p) t.core = p.id;
      }
    }
  }

  // Assign queued tasks.
  for (const kind of PRIORITY) {
    for (const t of next.filter((x) => !x.core && x.kind === kind)) {
      const c = pick(kind);
      if (c) t.core = c.id;
    }
  }

  // Run one tick.
  let power = 0;
  let work = 0;
  for (const c of cores) {
    const here = next.filter((t) => t.core === c.id);
    if (!here.length) continue;
    const smtFactor = here.length > 1 ? 0.62 : 1; // two SMT threads share one core
    power += c.power * (here.length > 1 ? 1.15 : 1);
    for (const t of here) {
      const w = c.speed * smtFactor;
      t.remaining -= w;
      work += w;
    }
  }
  const remaining = next.filter((t) => t.remaining > 0);
  return { tasks: remaining, done: next.length - remaining.length, power, work };
}

let NEXT_ID = 1;
const make = (kind: TaskKind): Task => ({ id: NEXT_ID++, kind, remaining: KIND_STYLE[kind].work, total: KIND_STYLE[kind].work });

export function HybridScheduler() {
  const [mode, setMode] = useState<Mode>("apple");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [running, setRunning] = useState(true);
  const [stats, setStats] = useState({ power: 0, work: 0, done: 0 });
  const [ambient, setAmbient] = useState(true);
  const tick = useRef(0);
  const reduce = useReducedMotion();

  const tasksRef = useRef<Task[]>([]);
  const commit = (ts: Task[]) => {
    tasksRef.current = ts;
    setTasks(ts);
  };

  useEffect(() => {
    commit([make("background"), make("background"), make("interactive")]);
    setStats({ power: 0, work: 0, done: 0 });
  }, [mode]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      tick.current++;
      let ts = tasksRef.current;
      if (ambient) {
        if (tick.current % 4 === 0 && ts.filter((t) => t.kind === "background").length < 6) ts = [...ts, make("background")];
        if (tick.current % 5 === 2) ts = [...ts, make("interactive")];
      }
      const r = step(mode, ts);
      commit(r.tasks);
      setStats((s) => ({ power: s.power * 0.6 + r.power * 0.4, work: s.work * 0.6 + r.work * 0.4, done: s.done + r.done }));
    }, 600);
    return () => clearInterval(iv);
  }, [running, mode, ambient]);

  const add = (kind: TaskKind, n = 1) => commit([...tasksRef.current, ...Array.from({ length: n }, () => make(kind))]);
  const M = MODES[mode];
  const queued = tasks.filter((t) => !t.core);
  const groups = mode === "amd" ? [{ type: "C" as const, label: "Cores (identical)" }] : [
    { type: "P" as const, label: "Performance cores" },
    { type: "E" as const, label: "Efficiency cores" },
  ];

  const chip = (t: Task) => (
    <motion.div
      key={t.id}
      layoutId={`task-${t.id}`}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
      className="relative h-3.5 w-full overflow-hidden rounded-[4px]"
      style={{ background: `color-mix(in oklab, ${KIND_STYLE[t.kind].color} 30%, var(--panel-3))` }}
      title={KIND_STYLE[t.kind].label}
    >
      <div className="absolute inset-y-0 left-0" style={{ width: `${(t.remaining / t.total) * 100}%`, background: KIND_STYLE[t.kind].color }} />
    </motion.div>
  );

  return (
    <Frame
      kicker="Animated · scheduling"
      title="Who runs where? Performance cores, efficiency cores, and the scheduler"
      controls={
        <>
          <Btn onClick={() => setRunning((r) => !r)} active={!running}>
            {running ? "Pause" : "Resume"}
          </Btn>
        </>
      }
      footer="Core counts, speeds and power are illustrative, chosen to show scheduling behaviour — not measurements of any chip. Real schedulers also weigh temperature, power limits, cache locality and the OS power mode."
    >
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          size="sm"
          ariaLabel="CPU design"
          value={mode}
          onChange={setMode}
          options={[
            { value: "apple", label: "Apple Silicon", color: "var(--c-apple)" },
            { value: "intel", label: "Intel hybrid", color: "var(--c-intel)" },
            { value: "amd", label: "AMD desktop", color: "var(--c-amd)" },
          ]}
        />
        <span className="text-xs text-dim">{M.config}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Btn onClick={() => add("heavy", 12)}>
          <span className="h-2 w-2 rounded-full bg-[var(--k-accel)]" /> Compile code (12 heavy threads)
        </Btn>
        <Btn onClick={() => add("heavy", 1)}>
          <span className="h-2 w-2 rounded-full bg-[var(--k-accel)]" /> Game main thread
        </Btn>
        <Btn onClick={() => add("interactive", 3)}>
          <span className="h-2 w-2 rounded-full bg-accent" /> Click around the UI
        </Btn>
        <Btn onClick={() => add("background", 4)}>
          <span className="h-2 w-2 rounded-full bg-[var(--fg-dim)]" /> Backup + indexing
        </Btn>
        <Btn active={ambient} onClick={() => setAmbient((a) => !a)}>
          Ambient tasks {ambient ? "on" : "off"}
        </Btn>
      </div>

      <LayoutGroup id={`sched-${mode}`}>
        <div className="mt-5 grid gap-5 lg:grid-cols-[10rem_minmax(0,1fr)]">
          <div className="rounded-xl border border-dashed border-line p-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-dim">Run queue · {queued.length}</div>
            <div className="mt-2 grid max-h-48 grid-cols-4 gap-1 overflow-hidden lg:grid-cols-2">
              {queued.slice(0, 24).map(chip)}
            </div>
            {queued.length > 24 && <div className="mt-1 text-[10px] text-dim">+{queued.length - 24} waiting</div>}
          </div>

          <div className="space-y-4">
            {groups.map((g) => {
              const cs = M.cores.filter((c) => c.type === g.type);
              return (
                <div key={g.type}>
                  <div className="mb-1.5 flex items-center gap-2 text-xs text-muted">
                    <span className={clsx("font-mono", g.type === "P" ? "text-[var(--k-cpu)]" : g.type === "E" ? "text-[var(--k-memory)]" : "text-[var(--k-cpu)]")}>
                      {g.label}
                    </span>
                    <span className="text-dim">· {cs.length}</span>
                  </div>
                  <div
                    className={clsx(
                      "grid gap-1.5",
                      cs.length > 10 ? "grid-cols-4 sm:grid-cols-8" : cs.length > 6 ? "grid-cols-4 sm:grid-cols-8" : "grid-cols-3 sm:grid-cols-6",
                    )}
                  >
                    {cs.map((c) => {
                      const here = tasks.filter((t) => t.core === c.id);
                      const busy = here.length > 0;
                      const color = c.type === "E" ? "var(--k-memory)" : "var(--k-cpu)";
                      return (
                        <div
                          key={c.id}
                          className={clsx(
                            "rounded-lg border p-1.5 transition-colors",
                            c.type === "E" ? "min-h-[2.75rem]" : "min-h-[3.25rem]",
                          )}
                          style={{
                            borderColor: busy ? `color-mix(in oklab, ${color} 55%, transparent)` : "var(--line)",
                            background: busy ? `color-mix(in oklab, ${color} 8%, var(--panel-2))` : "var(--panel-2)",
                          }}
                        >
                          <div className="mb-1 flex items-center justify-between font-mono text-[9.5px] text-dim">
                            <span>{c.id}</span>
                            {c.slots > 1 && <span>{here.length}/2</span>}
                          </div>
                          <div className="space-y-0.5">{here.map(chip)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </LayoutGroup>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_15rem]">
        <ul className="space-y-1.5 text-sm leading-relaxed text-muted">
          {M.explain.map((e, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--fg-dim)]" />
              <span dangerouslySetInnerHTML={{ __html: e.replace(/\*\*(.+?)\*\*/g, '<strong class="text-fg font-medium">$1</strong>') }} />
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-panel-2 px-2.5 py-2">
              <div className="font-mono text-[9.5px] uppercase tracking-wider text-dim">Package power</div>
              <div className="font-mono text-sm text-fg">{stats.power.toFixed(0)} u</div>
            </div>
            <div className="rounded-lg border border-line bg-panel-2 px-2.5 py-2">
              <div className="font-mono text-[9.5px] uppercase tracking-wider text-dim">Work / tick</div>
              <div className="font-mono text-sm text-fg">{stats.work.toFixed(1)}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-dim">
            {(Object.keys(KIND_STYLE) as TaskKind[]).map((k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: KIND_STYLE[k].color }} />
                {KIND_STYLE[k].label}
              </span>
            ))}
          </div>
          <ApproxBadge label="Illustrative units" />
        </div>
      </div>
    </Frame>
  );
}

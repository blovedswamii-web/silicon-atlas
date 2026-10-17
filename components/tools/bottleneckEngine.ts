import {
  APPLE_GPU_SHARE,
  APPLE_TIERS,
  CPU_TIERS,
  GPU_TIERS,
  LAB_PLATFORMS,
  LAB_WORKLOADS,
  LLM_SIZES,
  PC_SYSTEM_BANDWIDTH,
  STORAGE_OPTIONS,
  type LabPlatformId,
  type LabWorkloadId,
  type Subsystem,
} from "@/data/bottleneck";

export interface LabConfig {
  platform: LabPlatformId;
  formFactor: "desktop" | "laptop";
  cpuTier: string;
  gpuTier: string;
  ramGB: number;
  storage: string;
  appleTier: string;
  appleMemGB: number;
  workload: LabWorkloadId;
  llmSize: string;
}

export interface LabResult {
  pressure: Record<Subsystem, number>;
  limiter: Subsystem;
  coLimiter?: Subsystem;
  fits: boolean;
  gpuMemNeedGB: number;
  gpuMemHaveGB: number;
  effectiveBandwidth: number;
  tokensCeiling?: number;
  notes: string[];
}

/** demand 0–10 against capability 0–10 → pressure 0–10. Equal demand and capability ≈ 6 ("working"). */
const press = (demand: number, cap: number) => Math.max(0, Math.min(10, (demand * 6) / Math.max(cap, 0.5)));

/** Log-scaled bandwidth score: ~30 GB/s → 0, ~2 TB/s → 10. */
export const bandwidthScore = (gbs: number) =>
  Math.max(0, Math.min(10, (10 * Math.log10(gbs / 30)) / Math.log10(2000 / 30)));

export function evaluate(cfg: LabConfig): LabResult {
  const platform = LAB_PLATFORMS.find((p) => p.id === cfg.platform)!;
  const wl = LAB_WORKLOADS.find((w) => w.id === cfg.workload)!;
  const storage = platform.unified ? 8.5 : STORAGE_OPTIONS.find((s) => s.id === cfg.storage)!.score;
  const laptop = cfg.formFactor === "laptop";
  const notes: string[] = [];

  let single: number, multi: number, gpu: number, gpuMemHave: number, gpuBw: number, sysBw: number;
  let bigCache = false;
  let watts = 0;

  if (platform.unified) {
    const t = APPLE_TIERS.find((a) => a.id === cfg.appleTier)!;
    const sustained = laptop && t.id !== "ultra" ? 0.92 : 1;
    single = t.single;
    multi = t.multi * sustained;
    gpu = t.gpu * sustained;
    gpuMemHave = cfg.appleMemGB * APPLE_GPU_SHARE;
    gpuBw = sysBw = t.bandwidthGBs;
    watts = t.watts;
  } else {
    const c = CPU_TIERS.find((x) => x.id === cfg.cpuTier)!;
    const g = GPU_TIERS.find((x) => x.id === cfg.gpuTier)!;
    single = c.single * (laptop ? 0.92 : 1);
    multi = c.multi * (laptop ? 0.7 : 1);
    gpu = g.compute * (laptop ? 0.65 : 1);
    gpuMemHave = g.vramGB;
    gpuBw = g.bandwidthGBs * (laptop ? 0.75 : 1);
    sysBw = PC_SYSTEM_BANDWIDTH;
    bigCache = !!c.bigCache;
    watts = c.watts + g.watts;
  }

  // GPU-accessible memory needed
  const llm = LLM_SIZES.find((s) => s.id === cfg.llmSize)!;
  const gpuMemNeed = wl.id === "llm" ? llm.gb + 2 : wl.gpuMemGB;
  const fits = gpuMemNeed === 0 || gpuMemNeed <= gpuMemHave;

  // Capacity pressure
  let capRatio: number;
  if (platform.unified) {
    const totalNeed = wl.ramGB * 0.5 + gpuMemNeed;
    capRatio = Math.max(totalNeed / cfg.appleMemGB, gpuMemNeed / gpuMemHave);
  } else {
    capRatio = Math.max(gpuMemNeed / gpuMemHave, wl.ramGB / cfg.ramGB);
  }
  let memCapacity = Math.min(10, capRatio * 7);
  if (!fits) memCapacity = 10;

  // Effective bandwidth
  let effBw = wl.gpuMemGB === 0 ? sysBw : gpuBw;
  if (!fits && !platform.unified && gpuMemNeed > 0) {
    // Part of the data lives in system RAM — every pass mixes fast and slow memory.
    const f = gpuMemHave / gpuMemNeed;
    effBw = 1 / (f / gpuBw + (1 - f) / sysBw);
    notes.push(
      `Only ~${Math.round(f * 100)}% fits in VRAM. The rest is served from system RAM (≈${sysBw} GB/s), so effective bandwidth drops to ≈${Math.round(effBw)} GB/s.`,
    );
  }
  if (!fits && platform.unified) {
    notes.push(
      "The model exceeds the share of unified memory macOS lets the GPU use by default. It may not load, or the system will swap heavily.",
    );
  }

  let cpuSingleCap = single;
  if (wl.cacheSensitive && bigCache) {
    cpuSingleCap += 1.3;
    notes.push("The stacked L3 cache keeps more of the game's working set on-chip, reducing trips to RAM.");
  }

  const sw = wl.software[platform.gpuVendor];

  // Power & thermals
  const intensity = Math.max(wl.demand.gpu, wl.demand.cpuMulti) / 10;
  let power: number;
  if (!laptop) power = platform.unified ? 1.5 + intensity * 1.5 : Math.min(10, 1 + (watts * intensity) / 120);
  else power = platform.unified ? 3 + intensity * 3.5 : 5 + intensity * 4;
  if (laptop && !platform.unified) notes.push("Laptop GPUs and CPUs run at much lower power limits than desktop parts with similar names.");

  const pressure: Record<Subsystem, number> = {
    cpuSingle: press(wl.demand.cpuSingle, cpuSingleCap),
    cpuMulti: press(wl.demand.cpuMulti, multi),
    gpu: press(wl.demand.gpu, gpu),
    memCapacity,
    bandwidth: press(wl.demand.bandwidth, bandwidthScore(effBw)),
    storage: press(wl.demand.storage, storage),
    software: press(wl.demand.software, sw.score),
    power,
  };

  const ranked = (Object.keys(pressure) as Subsystem[]).sort((a, b) => pressure[b] - pressure[a]);
  const limiter = ranked[0];
  const coLimiter = pressure[ranked[0]] - pressure[ranked[1]] < 0.6 ? ranked[1] : undefined;

  return {
    pressure,
    limiter,
    coLimiter,
    fits,
    gpuMemNeedGB: gpuMemNeed,
    gpuMemHaveGB: gpuMemHave,
    effectiveBandwidth: effBw,
    tokensCeiling: wl.id === "llm" ? effBw / llm.gb : undefined,
    notes,
  };
}

export function severity(p: number): { label: string; color: string } {
  if (p >= 9) return { label: "Likely limiter", color: "var(--bad)" };
  if (p >= 7) return { label: "Strained", color: "var(--warn)" };
  if (p >= 4) return { label: "Working", color: "var(--accent)" };
  return { label: "Headroom", color: "var(--good)" };
}

import type { NodeKind } from "@/data/schema";

/**
 * Representative latency and bandwidth figures for the memory hierarchy.
 * These are deliberately ranges: real values depend on the specific chip, clock,
 * memory configuration, access pattern and how the measurement is made.
 * They are educational orders of magnitude, not specifications of any product.
 */

export interface LatencyTier {
  id: string;
  label: string;
  sub: string;
  kind: NodeKind;
  /** Representative range in nanoseconds. */
  minNs: number;
  maxNs: number;
  /** Rough capacity at this level, for context. */
  capacity: string;
  /** "gpu" = belongs to the discrete-GPU branch reached over PCIe. */
  branch?: "gpu";
  note: string;
}

const NS = 1;
const US = 1_000;
const MS = 1_000_000;

export const PC_HIERARCHY: LatencyTier[] = [
  { id: "reg", label: "Registers", sub: "inside each core", kind: "cpu", minNs: 0.2 * NS, maxNs: 0.3 * NS, capacity: "a few hundred bytes visible (hundreds of physical registers)", note: "Operands the execution units are working on right now. About one clock cycle." },
  { id: "l1", label: "L1 cache", sub: "per core", kind: "cache", minNs: 0.8 * NS, maxNs: 1.2 * NS, capacity: "~32–64 KB data + instructions per core", note: "Roughly 4–5 cycles. Tiny, so it can be extremely fast and sit right next to the execution units." },
  { id: "l2", label: "L2 cache", sub: "per core (PC)", kind: "cache", minNs: 2.5 * NS, maxNs: 5 * NS, capacity: "~1–3 MB per core", note: "Roughly 12–20 cycles. Catches most L1 misses." },
  { id: "l3", label: "L3 cache", sub: "shared by cores", kind: "cache", minNs: 8 * NS, maxNs: 16 * NS, capacity: "~16–128 MB per chip", note: "Shared last-level cache. Big L3 (e.g. stacked 3D V-Cache) helps workloads that re-use a large working set." },
  { id: "dram", label: "System RAM", sub: "DDR4 / DDR5 DIMMs", kind: "memory", minNs: 60 * NS, maxNs: 110 * NS, capacity: "8–192 GB typical desktop", note: "A full trip to DRAM costs hundreds of cycles. This is why caches exist." },
  { id: "pcie", label: "PCIe hop CPU ↔ GPU", sub: "crossing the expansion bus", kind: "interconnect", minNs: 800 * NS, maxNs: 3 * US, capacity: "~32–64 GB/s per direction (x16 Gen4/Gen5)", branch: "gpu", note: "Moving data between system RAM and VRAM crosses PCIe. Its bandwidth is far below VRAM bandwidth, and each transfer has setup cost." },
  { id: "gpu-cache", label: "GPU L2 / last-level cache", sub: "on the GPU die", kind: "cache", minNs: 100 * NS, maxNs: 250 * NS, capacity: "~4–100+ MB depending on GPU", branch: "gpu", note: "GPUs hide latency with thousands of threads rather than minimising it, so even their caches have high latency compared with a CPU's." },
  { id: "vram", label: "VRAM (as seen by the GPU)", sub: "GDDR6 / GDDR7 / HBM", kind: "vram", minNs: 300 * NS, maxNs: 600 * NS, capacity: "8–32 GB consumer, 80–192+ GB datacenter", branch: "gpu", note: "Enormous bandwidth, but each individual access is slow. The GPU keeps thousands of threads in flight so some always have data ready." },
  { id: "nvme", label: "NVMe SSD", sub: "PCIe flash storage", kind: "storage", minNs: 40 * US, maxNs: 100 * US, capacity: "0.5–8 TB", note: "A 4 KB random read at queue depth 1 typically takes tens of microseconds — about a thousand times slower than RAM." },
  { id: "sata", label: "SATA SSD", sub: "older flash interface", kind: "storage", minNs: 80 * US, maxNs: 200 * US, capacity: "0.25–4 TB", note: "Same kind of flash, slower interface and protocol (AHCI)." },
  { id: "hdd", label: "Hard disk", sub: "spinning platters", kind: "storage", minNs: 3 * MS, maxNs: 12 * MS, capacity: "1–24+ TB", note: "A mechanical arm must seek and the platter must rotate into place. Fine for sequential bulk data, painful for random access." },
  { id: "lan", label: "Local network", sub: "same building / datacenter", kind: "network", minNs: 100 * US, maxNs: 1 * MS, capacity: "—", note: "Round trip to another machine nearby, including the network stack." },
  { id: "net", label: "Internet round trip", sub: "across a country or ocean", kind: "network", minNs: 10 * MS, maxNs: 150 * MS, capacity: "—", note: "Bounded by distance and the speed of light in fibre, plus routing. No hardware upgrade on your desk fixes this." },
];

export const APPLE_HIERARCHY: LatencyTier[] = [
  { id: "reg", label: "Registers", sub: "inside each core", kind: "cpu", minNs: 0.2 * NS, maxNs: 0.3 * NS, capacity: "hundreds of physical registers", note: "Same idea on any CPU: the operands being worked on right now." },
  { id: "l1", label: "L1 cache", sub: "per core — unusually large", kind: "cache", minNs: 0.7 * NS, maxNs: 1.1 * NS, capacity: "~128–192 KB per performance core", note: "Apple's performance cores have notably large L1 caches compared with typical x86 designs." },
  { id: "l2", label: "Shared L2 cache", sub: "per CPU cluster", kind: "cache", minNs: 4 * NS, maxNs: 8 * NS, capacity: "~4–16+ MB per cluster", note: "Apple shares a large L2 between the cores of a cluster instead of giving each core a private L2 plus a big L3." },
  { id: "slc", label: "System Level Cache", sub: "shared by CPU, GPU, Neural Engine", kind: "cache", minNs: 15 * NS, maxNs: 35 * NS, capacity: "tens of MB depending on chip", note: "Sits in front of unified memory and is shared by every engine on the SoC — a different structure from a PC's CPU-only L3." },
  { id: "dram", label: "Unified memory", sub: "LPDDR on the SoC package", kind: "memory", minNs: 90 * NS, maxNs: 130 * NS, capacity: "8–512 GB depending on chip (fixed at purchase)", note: "One pool used by the CPU, GPU, Neural Engine and media engines. There is no separate VRAM tier and no PCIe hop to reach the GPU's data." },
  { id: "nvme", label: "Internal SSD", sub: "Apple controller in the SoC", kind: "storage", minNs: 30 * US, maxNs: 100 * US, capacity: "256 GB–8 TB+", note: "The SSD controller is part of the SoC; flash chips sit on the logic board." },
  { id: "lan", label: "Local network", sub: "same building / datacenter", kind: "network", minNs: 100 * US, maxNs: 1 * MS, capacity: "—", note: "Same physics as any other computer." },
  { id: "net", label: "Internet round trip", sub: "across a country or ocean", kind: "network", minNs: 10 * MS, maxNs: 150 * MS, capacity: "—", note: "Same physics as any other computer." },
];

// ---------------------------------------------------------------------------
// Latency vs bandwidth links
// ---------------------------------------------------------------------------

export interface DataLink {
  id: string;
  label: string;
  sub: string;
  kind: NodeKind;
  /** Time until the first byte arrives, ns (representative). */
  latencyNs: number;
  /** Sustained peak bandwidth, GB/s (representative). */
  bandwidthGBs: number;
  analogy: string;
}

export const DATA_LINKS: DataLink[] = [
  { id: "ddr5", label: "DDR5 desktop RAM", sub: "dual channel, ~6000 MT/s", kind: "memory", latencyNs: 80, bandwidthGBs: 90, analogy: "A short, two-lane road right next to the factory." },
  { id: "lpddr", label: "LPDDR5X, 512-bit bus", sub: "high-end laptop SoC class", kind: "memory", latencyNs: 110, bandwidthGBs: 540, analogy: "A wider road — many more lanes, slightly longer on-ramp." },
  { id: "gddr7", label: "GDDR7, 512-bit bus", sub: "flagship consumer GPU class", kind: "vram", latencyNs: 450, bandwidthGBs: 1790, analogy: "A huge highway with a long on-ramp: slow to start, enormous once flowing." },
  { id: "hbm", label: "HBM3e stacks", sub: "datacenter accelerator class", kind: "vram", latencyNs: 500, bandwidthGBs: 8000, analogy: "Dozens of highways stacked on top of each other." },
  { id: "pcie5", label: "PCIe 5.0 x16", sub: "CPU ↔ discrete GPU", kind: "interconnect", latencyNs: 1500, bandwidthGBs: 63, analogy: "A bridge between two cities — fine traffic, but it's a bridge." },
  { id: "nvme", label: "NVMe SSD (PCIe 4.0 x4)", sub: "fast consumer drive", kind: "storage", latencyNs: 60_000, bandwidthGBs: 7, analogy: "A warehouse across town: a long wait, then trucks arrive steadily." },
  { id: "gbe", label: "Gigabit Ethernet", sub: "local network", kind: "network", latencyNs: 300_000, bandwidthGBs: 0.125, analogy: "A courier service." },
];

export const TRANSFER_SIZES: { label: string; bytes: number; example: string }[] = [
  { label: "64 B", bytes: 64, example: "one cache line — a pointer chase in a game's entity list" },
  { label: "4 KB", bytes: 4096, example: "one memory page or a small file block" },
  { label: "1 MB", bytes: 1_048_576, example: "a texture mip level or a chunk of audio" },
  { label: "100 MB", bytes: 104_857_600, example: "a batch of textures or a layer of a neural network" },
  { label: "8 GB", bytes: 8_589_934_592, example: "every weight of a 4-bit ~14B-parameter language model, read once per token" },
];

// ---------------------------------------------------------------------------
// RAM calculator presets
// ---------------------------------------------------------------------------

export interface RamPreset {
  id: string;
  label: string;
  type: "DDR4" | "DDR5" | "LPDDR5X" | "GDDR7";
  mts: number;
  /** CAS latency in clock cycles, when meaningful/published for this memory type. */
  cl?: number;
  busBits: number;
  context: string;
}

export const RAM_PRESETS: RamPreset[] = [
  { id: "ddr4-3200", label: "DDR4-3200 CL16", type: "DDR4", mts: 3200, cl: 16, busBits: 128, context: "Two DIMMs in dual channel — a common desktop configuration from the DDR4 era." },
  { id: "ddr5-6000", label: "DDR5-6000 CL30", type: "DDR5", mts: 6000, cl: 30, busBits: 128, context: "Two DIMMs in dual channel — a popular current desktop configuration." },
  { id: "ddr5-6400", label: "DDR5-6400 CL32", type: "DDR5", mts: 6400, cl: 32, busBits: 128, context: "Two DIMMs in dual channel." },
  { id: "lp-128", label: "LPDDR5X-8533 · 128-bit", type: "LPDDR5X", mts: 8533, busBits: 128, context: "Soldered memory on a mainstream laptop chip or base Apple M-series class bus width." },
  { id: "lp-256", label: "LPDDR5X-8533 · 256-bit", type: "LPDDR5X", mts: 8533, busBits: 256, context: "A wider bus as used by 'Pro'-class SoCs and some large APUs." },
  { id: "lp-512", label: "LPDDR5X-8533 · 512-bit", type: "LPDDR5X", mts: 8533, busBits: 512, context: "A very wide on-package bus as used by 'Max'-class SoCs." },
  { id: "gddr7-256", label: "GDDR7 28 Gbps · 256-bit", type: "GDDR7", mts: 28000, busBits: 256, context: "Graphics memory on an upper-mid-range discrete GPU class." },
];

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

export interface StorageDevice {
  id: string;
  label: string;
  iface: string;
  /** Representative sequential read, MB/s */
  seqMBs: number;
  /** Representative 4K random read at queue depth 1, MB/s */
  rand4kMBs: number;
  /** Representative access latency, µs */
  latencyUs: number;
  /** Representative throughput for mixed small (~64 KB) reads with some parallelism, MB/s — used by the load-time model. */
  mixedMBs: number;
}

export const STORAGE_DEVICES: StorageDevice[] = [
  { id: "hdd", label: "Hard disk (7200 rpm)", iface: "SATA", seqMBs: 220, rand4kMBs: 0.8, latencyUs: 8000, mixedMBs: 8 },
  { id: "sata", label: "SATA SSD", iface: "SATA III (6 Gb/s)", seqMBs: 550, rand4kMBs: 35, latencyUs: 100, mixedMBs: 400 },
  { id: "gen3", label: "NVMe PCIe 3.0", iface: "PCIe 3.0 x4", seqMBs: 3500, rand4kMBs: 55, latencyUs: 70, mixedMBs: 1200 },
  { id: "gen4", label: "NVMe PCIe 4.0", iface: "PCIe 4.0 x4", seqMBs: 7000, rand4kMBs: 75, latencyUs: 55, mixedMBs: 1800 },
  { id: "gen5", label: "NVMe PCIe 5.0", iface: "PCIe 5.0 x4", seqMBs: 14000, rand4kMBs: 85, latencyUs: 50, mixedMBs: 2200 },
];

// ---------------------------------------------------------------------------
// PCIe
// ---------------------------------------------------------------------------

/** Approximate usable bandwidth per lane, per direction, GB/s (after encoding overhead). */
export const PCIE_GENS: { gen: string; year: number; perLaneGBs: number; encoding: string }[] = [
  { gen: "1.0", year: 2003, perLaneGBs: 0.25, encoding: "8b/10b" },
  { gen: "2.0", year: 2007, perLaneGBs: 0.5, encoding: "8b/10b" },
  { gen: "3.0", year: 2010, perLaneGBs: 0.985, encoding: "128b/130b" },
  { gen: "4.0", year: 2017, perLaneGBs: 1.97, encoding: "128b/130b" },
  { gen: "5.0", year: 2019, perLaneGBs: 3.94, encoding: "128b/130b" },
  { gen: "6.0", year: 2022, perLaneGBs: 7.5, encoding: "PAM4 + FLIT" },
];

export const PCIE_WIDTHS = [1, 4, 8, 16] as const;

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatNs(ns: number): string {
  if (ns < 1) return `${ns.toFixed(1)} ns`;
  if (ns < 1_000) return `${+ns.toPrecision(3)} ns`;
  if (ns < 1_000_000) return `${+(ns / 1_000).toPrecision(3)} µs`;
  if (ns < 1_000_000_000) return `${+(ns / 1_000_000).toPrecision(3)} ms`;
  return `${+(ns / 1_000_000_000).toPrecision(3)} s`;
}

/** Human scale: one ~0.25 ns clock cycle (4 GHz) stretched to one second. */
export function humanScale(ns: number): string {
  const s = ns * 4;
  if (s < 60) return `${+s.toPrecision(2)} s`;
  if (s < 3600) return `${+(s / 60).toPrecision(2)} min`;
  if (s < 86_400) return `${+(s / 3600).toPrecision(2)} hours`;
  if (s < 86_400 * 60) return `${+(s / 86_400).toPrecision(2)} days`;
  if (s < 86_400 * 365 * 2) return `${+(s / (86_400 * 30.4)).toPrecision(2)} months`;
  return `${+(s / (86_400 * 365)).toPrecision(2)} years`;
}

export function formatBytesPerSec(gbs: number): string {
  if (gbs >= 1000) return `${+(gbs / 1000).toPrecision(3)} TB/s`;
  if (gbs >= 1) return `${+gbs.toPrecision(3)} GB/s`;
  return `${+(gbs * 1000).toPrecision(3)} MB/s`;
}

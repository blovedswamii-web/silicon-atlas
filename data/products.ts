import type { Product, Source } from "@/data/schema";

/**
 * Representative hardware database.
 *
 * - Hardware facts live here, separate from educational content.
 * - Every product carries sources with a last-updated date and a status.
 *   "compiled" = entered from manufacturer announcements without a live re-check;
 *   the UI labels these "verify at source". Do not invent values: leave a spec out
 *   rather than guess.
 * - Specs are referenced by key so the UI renders labels/explanations generically.
 */

const UPDATED = "2026-10-17";
const s = (label: string, url: string): Source => ({ label, url, lastUpdated: UPDATED, status: "compiled" });

export interface SpecKeyDef {
  key: string;
  label: string;
  /** Spec Decoder anchor that explains it (see /specs). */
  explainer?: string;
  /** Vendor-specific unit names cannot be compared across brands. */
  vendorSpecific?: boolean;
}

export const SPEC_KEYS: SpecKeyDef[] = [
  { key: "cpu-cores", label: "CPU cores", explainer: "cpu-cores" },
  { key: "core-mix", label: "Core mix", explainer: "hybrid-cores" },
  { key: "threads", label: "Threads", explainer: "threads" },
  { key: "boost-clock", label: "Max boost clock", explainer: "clock-speed" },
  { key: "l3-cache", label: "L3 / last-level cache", explainer: "cache" },
  { key: "gpu-units", label: "GPU execution units", explainer: "gpu-cores", vendorSpecific: true },
  { key: "gpu-units-secondary", label: "Shader lanes", explainer: "cuda-cores", vendorSpecific: true },
  { key: "npu", label: "Neural engine / NPU", explainer: "tops" },
  { key: "memory", label: "Memory capacity", explainer: "vram" },
  { key: "memory-type", label: "Memory type", explainer: "memory-type" },
  { key: "memory-bus", label: "Memory bus width", explainer: "memory-bus" },
  { key: "memory-bandwidth", label: "Memory bandwidth", explainer: "memory-bandwidth" },
  { key: "power", label: "Rated power", explainer: "tdp" },
  { key: "interface", label: "Host interface", explainer: "pcie" },
  { key: "socket", label: "Socket / platform" },
];

export const specLabel = (key: string) => SPEC_KEYS.find((k) => k.key === key)?.label ?? key;

const NV_5090 = s("NVIDIA — GeForce RTX 5090", "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/");
const NV_5080 = s("NVIDIA — GeForce RTX 5080", "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/");
const NV_5070 = s("NVIDIA — GeForce RTX 5070 family", "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/");
const NV_LAPTOP = s("NVIDIA — GeForce RTX 50 Series laptops", "https://www.nvidia.com/en-us/geforce/laptops/50-series/");
const AMD_9070 = s("AMD — Radeon RX 9000 series", "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series.html");
const AMD_9000 = s("AMD — Ryzen 9000 series desktop processors", "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series.html");
const AMD_AIMAX = s("AMD — Ryzen AI Max series", "https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series.html");
const INTEL_CU = s("Intel — Core Ultra processors", "https://www.intel.com/content/www/us/en/products/details/processors/core-ultra.html");
const INTEL_ARC = s("Intel — Arc B-series graphics", "https://www.intel.com/content/www/us/en/products/details/discrete-gpus/arc.html");
const APPLE_M4 = s("Apple Newsroom — Apple introduces M4", "https://www.apple.com/newsroom/2024/05/apple-introduces-m4-chip/");
const APPLE_M4PM = s("Apple Newsroom — M4 Pro and M4 Max", "https://www.apple.com/newsroom/2024/10/apple-introduces-m4-pro-and-m4-max/");
const APPLE_M3U = s("Apple Newsroom — M3 Ultra", "https://www.apple.com/newsroom/2025/03/apple-reveals-m3-ultra-taking-apple-silicon-to-a-new-extreme/");
const APPLE_M5 = s("Apple Newsroom — M5", "https://www.apple.com/newsroom/2025/10/apple-unleashes-m5-the-next-big-leap-in-ai-performance-for-apple-silicon/");

export const PRODUCTS: Product[] = [
  // ---------------- NVIDIA GPUs ----------------
  {
    id: "rtx-5090", company: "nvidia", name: "GeForce RTX 5090", family: "GeForce RTX 50", scope: "component", kind: "gpu",
    architecture: "blackwell", formFactor: "desktop", releaseYear: 2025,
    specs: [
      { key: "gpu-units-secondary", value: "21,760 CUDA cores" },
      { key: "memory", value: 32, unit: "GB" },
      { key: "memory-type", value: "GDDR7" },
      { key: "memory-bus", value: 512, unit: "bit" },
      { key: "memory-bandwidth", value: "1,792", unit: "GB/s" },
      { key: "power", value: 575, unit: "W (total graphics power)" },
      { key: "interface", value: "PCIe 5.0 x16" },
    ],
    sources: [NV_5090],
  },
  {
    id: "rtx-5080", company: "nvidia", name: "GeForce RTX 5080", family: "GeForce RTX 50", scope: "component", kind: "gpu",
    architecture: "blackwell", formFactor: "desktop", releaseYear: 2025,
    specs: [
      { key: "gpu-units-secondary", value: "10,752 CUDA cores" },
      { key: "memory", value: 16, unit: "GB" },
      { key: "memory-type", value: "GDDR7" },
      { key: "memory-bus", value: 256, unit: "bit" },
      { key: "memory-bandwidth", value: 960, unit: "GB/s" },
      { key: "power", value: 360, unit: "W (total graphics power)" },
      { key: "interface", value: "PCIe 5.0 x16" },
    ],
    sources: [NV_5080],
  },
  {
    id: "rtx-5070-ti", company: "nvidia", name: "GeForce RTX 5070 Ti", family: "GeForce RTX 50", scope: "component", kind: "gpu",
    architecture: "blackwell", formFactor: "desktop", releaseYear: 2025,
    specs: [
      { key: "gpu-units-secondary", value: "8,960 CUDA cores" },
      { key: "memory", value: 16, unit: "GB" },
      { key: "memory-type", value: "GDDR7" },
      { key: "memory-bus", value: 256, unit: "bit" },
      { key: "memory-bandwidth", value: 896, unit: "GB/s" },
      { key: "power", value: 300, unit: "W (total graphics power)" },
    ],
    sources: [NV_5070],
  },
  {
    id: "rtx-5070", company: "nvidia", name: "GeForce RTX 5070", family: "GeForce RTX 50", scope: "component", kind: "gpu",
    architecture: "blackwell", formFactor: "desktop", releaseYear: 2025,
    specs: [
      { key: "gpu-units-secondary", value: "6,144 CUDA cores" },
      { key: "memory", value: 12, unit: "GB" },
      { key: "memory-type", value: "GDDR7" },
      { key: "memory-bus", value: 192, unit: "bit" },
      { key: "memory-bandwidth", value: 672, unit: "GB/s" },
      { key: "power", value: 250, unit: "W (total graphics power)" },
    ],
    sources: [NV_5070],
  },
  {
    id: "rtx-5090-laptop", company: "nvidia", name: "GeForce RTX 5090 Laptop GPU", family: "GeForce RTX 50 (laptop)", scope: "component", kind: "gpu",
    architecture: "blackwell", formFactor: "laptop", releaseYear: 2025,
    specs: [
      { key: "gpu-units-secondary", value: "10,496 CUDA cores" },
      { key: "memory", value: 24, unit: "GB" },
      { key: "memory-type", value: "GDDR7" },
      { key: "power", value: "Set by the laptop maker", unit: "(roughly 95–150 W + boost range)" },
    ],
    sources: [NV_LAPTOP],
    notes: "Shares a name with the desktop RTX 5090 but uses a different, smaller configuration (about half the CUDA cores, 24 GB vs 32 GB) at a fraction of the power. Real performance varies by the power limit and cooling each laptop maker chooses.",
  },

  // ---------------- AMD GPUs ----------------
  {
    id: "rx-9070-xt", company: "amd", name: "Radeon RX 9070 XT", family: "Radeon RX 9000", scope: "component", kind: "gpu",
    architecture: "rdna4", formFactor: "desktop", releaseYear: 2025,
    specs: [
      { key: "gpu-units", value: "64 compute units" },
      { key: "gpu-units-secondary", value: "4,096 stream processors" },
      { key: "memory", value: 16, unit: "GB" },
      { key: "memory-type", value: "GDDR6" },
      { key: "memory-bus", value: 256, unit: "bit" },
      { key: "memory-bandwidth", value: 640, unit: "GB/s" },
      { key: "l3-cache", value: "64 MB Infinity Cache" },
      { key: "power", value: 304, unit: "W (total board power)" },
    ],
    sources: [AMD_9070],
  },
  {
    id: "rx-9070", company: "amd", name: "Radeon RX 9070", family: "Radeon RX 9000", scope: "component", kind: "gpu",
    architecture: "rdna4", formFactor: "desktop", releaseYear: 2025,
    specs: [
      { key: "gpu-units", value: "56 compute units" },
      { key: "gpu-units-secondary", value: "3,584 stream processors" },
      { key: "memory", value: 16, unit: "GB" },
      { key: "memory-type", value: "GDDR6" },
      { key: "memory-bus", value: 256, unit: "bit" },
      { key: "memory-bandwidth", value: 640, unit: "GB/s" },
      { key: "power", value: 220, unit: "W (total board power)" },
    ],
    sources: [AMD_9070],
  },

  // ---------------- Intel GPU ----------------
  {
    id: "arc-b580", company: "intel", name: "Arc B580", family: "Arc B-series", scope: "component", kind: "gpu",
    architecture: "battlemage", formFactor: "desktop", releaseYear: 2024,
    specs: [
      { key: "gpu-units", value: "20 Xe cores" },
      { key: "memory", value: 12, unit: "GB" },
      { key: "memory-type", value: "GDDR6" },
      { key: "memory-bus", value: 192, unit: "bit" },
      { key: "memory-bandwidth", value: 456, unit: "GB/s" },
      { key: "power", value: 190, unit: "W (total board power)" },
    ],
    sources: [INTEL_ARC],
  },

  // ---------------- CPUs ----------------
  {
    id: "ryzen-9-9950x", company: "amd", name: "Ryzen 9 9950X", family: "Ryzen 9000", scope: "chip", kind: "cpu",
    architecture: "zen5", formFactor: "desktop", releaseYear: 2024,
    specs: [
      { key: "cpu-cores", value: 16 },
      { key: "threads", value: 32 },
      { key: "boost-clock", value: 5.7, unit: "GHz" },
      { key: "l3-cache", value: 64, unit: "MB" },
      { key: "power", value: 170, unit: "W (default TDP)" },
      { key: "socket", value: "AM5" },
    ],
    sources: [AMD_9000],
  },
  {
    id: "ryzen-7-9800x3d", company: "amd", name: "Ryzen 7 9800X3D", family: "Ryzen 9000 X3D", scope: "chip", kind: "cpu",
    architecture: "zen5", formFactor: "desktop", releaseYear: 2024,
    specs: [
      { key: "cpu-cores", value: 8 },
      { key: "threads", value: 16 },
      { key: "boost-clock", value: 5.2, unit: "GHz" },
      { key: "l3-cache", value: "96 MB (incl. 3D V-Cache)" },
      { key: "power", value: 120, unit: "W (default TDP)" },
      { key: "socket", value: "AM5" },
    ],
    sources: [AMD_9000],
    notes: "Fewer cores and a lower boost clock than the 9950X, yet often faster in games — the stacked cache keeps more of a game's working set close to the cores. A clear example of why one number never tells the whole story.",
  },
  {
    id: "core-ultra-9-285k", company: "intel", name: "Core Ultra 9 285K", family: "Core Ultra 200S", scope: "chip", kind: "cpu",
    architecture: "arrow-lake", formFactor: "desktop", releaseYear: 2024,
    specs: [
      { key: "cpu-cores", value: 24 },
      { key: "core-mix", value: "8 P-cores + 16 E-cores" },
      { key: "threads", value: 24 },
      { key: "boost-clock", value: 5.7, unit: "GHz" },
      { key: "l3-cache", value: 36, unit: "MB" },
      { key: "power", value: "125 W base / 250 W max turbo" },
      { key: "socket", value: "LGA 1851" },
    ],
    sources: [INTEL_CU],
  },

  // ---------------- APU ----------------
  {
    id: "ryzen-ai-max-395", company: "amd", name: "Ryzen AI Max+ 395", family: "Ryzen AI Max", scope: "chip", kind: "apu",
    architecture: "zen5", formFactor: "laptop", releaseYear: 2025,
    specs: [
      { key: "cpu-cores", value: 16 },
      { key: "threads", value: 32 },
      { key: "gpu-units", value: "40 RDNA 3.5 compute units (Radeon 8060S)" },
      { key: "memory", value: "Up to 128", unit: "GB shared (soldered LPDDR5X)" },
      { key: "memory-bus", value: 256, unit: "bit" },
      { key: "memory-bandwidth", value: "≈256", unit: "GB/s" },
    ],
    sources: [AMD_AIMAX],
    notes: "A PC chip with a large shared CPU/GPU memory pool — conceptually similar to Apple's unified memory, which shows that 'unified memory' is a design choice, not one company's trick.",
  },

  // ---------------- Apple SoCs ----------------
  {
    id: "apple-m4", company: "apple", name: "Apple M4", family: "M4", scope: "platform", kind: "soc",
    architecture: "m4", formFactor: "both", releaseYear: 2024,
    specs: [
      { key: "cpu-cores", value: "Up to 10" },
      { key: "core-mix", value: "Up to 4 P-cores + 6 E-cores" },
      { key: "gpu-units", value: "Up to 10 GPU cores" },
      { key: "npu", value: "16-core Neural Engine (38 TOPS, Apple-rated)" },
      { key: "memory", value: "Up to 32", unit: "GB unified" },
      { key: "memory-type", value: "LPDDR5X" },
      { key: "memory-bandwidth", value: 120, unit: "GB/s" },
    ],
    sources: [APPLE_M4],
  },
  {
    id: "apple-m4-pro", company: "apple", name: "Apple M4 Pro", family: "M4", scope: "platform", kind: "soc",
    architecture: "m4", formFactor: "both", releaseYear: 2024,
    specs: [
      { key: "cpu-cores", value: "Up to 14" },
      { key: "core-mix", value: "Up to 10 P-cores + 4 E-cores" },
      { key: "gpu-units", value: "Up to 20 GPU cores" },
      { key: "memory", value: "Up to 64", unit: "GB unified" },
      { key: "memory-bandwidth", value: 273, unit: "GB/s" },
    ],
    sources: [APPLE_M4PM],
  },
  {
    id: "apple-m4-max", company: "apple", name: "Apple M4 Max", family: "M4", scope: "platform", kind: "soc",
    architecture: "m4", formFactor: "both", releaseYear: 2024,
    specs: [
      { key: "cpu-cores", value: "Up to 16" },
      { key: "core-mix", value: "Up to 12 P-cores + 4 E-cores" },
      { key: "gpu-units", value: "Up to 40 GPU cores" },
      { key: "memory", value: "Up to 128", unit: "GB unified" },
      { key: "memory-bandwidth", value: "Up to 546", unit: "GB/s" },
    ],
    sources: [APPLE_M4PM],
    notes: "Bandwidth depends on the configuration: lower-binned M4 Max versions have a narrower memory interface.",
  },
  {
    id: "apple-m3-ultra", company: "apple", name: "Apple M3 Ultra", family: "M3", scope: "platform", kind: "soc",
    architecture: "m3", formFactor: "desktop", releaseYear: 2025,
    specs: [
      { key: "cpu-cores", value: "Up to 32" },
      { key: "core-mix", value: "Up to 24 P-cores + 8 E-cores" },
      { key: "gpu-units", value: "Up to 80 GPU cores" },
      { key: "npu", value: "32-core Neural Engine" },
      { key: "memory", value: "Up to 512", unit: "GB unified" },
      { key: "memory-bandwidth", value: 819, unit: "GB/s" },
    ],
    sources: [APPLE_M3U],
    notes: "Two M3 Max dies joined by UltraFusion. Very large memory capacity, but GPU compute throughput is a separate question from capacity.",
  },
  {
    id: "apple-m5", company: "apple", name: "Apple M5", family: "M5", scope: "platform", kind: "soc",
    architecture: "m5", formFactor: "both", releaseYear: 2025,
    specs: [
      { key: "cpu-cores", value: "Up to 10" },
      { key: "core-mix", value: "Up to 4 P-cores + 6 E-cores" },
      { key: "gpu-units", value: "Up to 10 GPU cores (each with a neural accelerator)" },
      { key: "npu", value: "16-core Neural Engine" },
      { key: "memory", value: "Up to 32", unit: "GB unified" },
      { key: "memory-bandwidth", value: "≈153", unit: "GB/s" },
    ],
    sources: [APPLE_M5],
  },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

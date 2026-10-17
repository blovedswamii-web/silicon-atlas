import type { Architecture, CompanyId, Source } from "@/data/schema";

/**
 * Architecture generations — focused on WHAT CHANGED, not on memorising names.
 * Figures are compiled from manufacturer announcements; status "compiled" means
 * re-verify against the linked source before relying on them.
 */

const UPDATED = "2026-10-17";
const src = (label: string, url: string): Source => ({ label, url, lastUpdated: UPDATED, status: "compiled" });

const APPLE_NEWS = "https://www.apple.com/newsroom/";
const AMD_PROC = "https://www.amd.com/en/products/processors/desktops/ryzen.html";
const AMD_GPU = "https://www.amd.com/en/products/graphics/desktops/radeon.html";
const NV_ARCH = "https://www.nvidia.com/en-us/technologies/";
const INTEL_CORE = "https://www.intel.com/content/www/us/en/products/details/processors/core-ultra.html";
const INTEL_ARC = "https://www.intel.com/content/www/us/en/products/details/discrete-gpus/arc.html";

export const ARCHITECTURES: Architecture[] = [
  // ---------------- Apple Silicon (base chips) ----------------
  {
    id: "m1", company: "apple", name: "M1", family: "Apple Silicon", kind: "soc", year: 2020, processNode: "TSMC 5 nm",
    changes: [
      { area: "Architecture", what: "First Apple Silicon Mac chip; Macs move from Intel x86 to Apple's own ARM64 SoCs, with Rosetta 2 translating x86 apps." },
      { area: "Cores", what: "4 performance + 4 efficiency CPU cores; up to 8 GPU cores." },
      { area: "Memory", what: "Unified LPDDR4X memory on the package, up to 16 GB." },
      { area: "AI hardware", what: "16-core Neural Engine." },
      { area: "Efficiency", what: "Fanless MacBook Air becomes viable at this performance level." },
    ],
    source: src("Apple Newsroom — M1", APPLE_NEWS),
  },
  {
    id: "m2", company: "apple", name: "M2", family: "Apple Silicon", kind: "soc", year: 2022, processNode: "TSMC 5 nm (2nd gen)",
    changes: [
      { area: "Cores", what: "Still 4P + 4E CPU; GPU grows to up to 10 cores." },
      { area: "Memory", what: "Moves to LPDDR5 with roughly 50% more bandwidth (100 GB/s); up to 24 GB." },
      { area: "Media engines", what: "ProRes encode/decode engine added to the base chip." },
      { area: "AI hardware", what: "Faster 16-core Neural Engine." },
    ],
    source: src("Apple Newsroom — M2", APPLE_NEWS),
  },
  {
    id: "m3", company: "apple", name: "M3", family: "Apple Silicon", kind: "soc", year: 2023, processNode: "TSMC 3 nm",
    changes: [
      { area: "Process", what: "First 3 nm Apple Mac chip." },
      { area: "GPU features", what: "Hardware ray tracing, mesh shading and Dynamic Caching (GPU on-chip memory allocated at run time)." },
      { area: "Media engines", what: "AV1 hardware decode added." },
      { area: "Memory", what: "Up to 24 GB on the base chip; bandwidth similar to M2." },
    ],
    source: src("Apple Newsroom — M3 family", APPLE_NEWS),
  },
  {
    id: "m4", company: "apple", name: "M4", family: "Apple Silicon", kind: "soc", year: 2024, processNode: "TSMC 3 nm (2nd gen)",
    changes: [
      { area: "Cores", what: "Up to 4P + 6E CPU cores (10 total); 10-core GPU." },
      { area: "Memory", what: "LPDDR5X at 120 GB/s; up to 32 GB." },
      { area: "AI hardware", what: "Neural Engine rated by Apple at 38 TOPS (Apple's own measurement and precision)." },
      { area: "Features", what: "Debuted in iPad Pro before Macs." },
    ],
    source: src("Apple Newsroom — M4", APPLE_NEWS),
  },
  {
    id: "m5", company: "apple", name: "M5", family: "Apple Silicon", kind: "soc", year: 2025, processNode: "TSMC 3 nm (3rd gen)",
    changes: [
      { area: "AI hardware", what: "A neural accelerator added inside each GPU core, alongside a faster Neural Engine — ML now has dedicated hardware in two places." },
      { area: "Memory", what: "Unified memory bandwidth raised to about 153 GB/s on the base chip." },
      { area: "Cores", what: "10-core CPU (4P + 6E) and 10-core GPU on the base chip." },
    ],
    source: src("Apple Newsroom — M5", APPLE_NEWS),
  },

  // ---------------- AMD Zen ----------------
  {
    id: "zen2", company: "amd", name: "Zen 2", family: "Zen (CPU)", kind: "cpu", year: 2019, processNode: "TSMC 7 nm CCD + 12 nm I/O die",
    changes: [
      { area: "Architecture", what: "Desktop Ryzen 3000 moves to chiplets: up to two 8-core CCDs plus a separate I/O die." },
      { area: "Cache", what: "L3 shared per 4-core cluster (CCX), 16 MB per CCX." },
      { area: "Features", what: "PCIe 4.0 on desktop." },
    ],
    source: src("AMD Ryzen processors", AMD_PROC),
  },
  {
    id: "zen3", company: "amd", name: "Zen 3", family: "Zen (CPU)", kind: "cpu", year: 2020, processNode: "TSMC 7 nm",
    changes: [
      { area: "Cache", what: "All 8 cores on a CCD now share one 32 MB L3, reducing cross-cluster latency." },
      { area: "Architecture", what: "Large IPC (instructions-per-clock) improvement over Zen 2." },
      { area: "Cache", what: "First 3D V-Cache desktop CPU (Ryzen 7 5800X3D, 2022): 96 MB L3 via a stacked SRAM die." },
    ],
    source: src("AMD Ryzen processors", AMD_PROC),
  },
  {
    id: "zen4", company: "amd", name: "Zen 4", family: "Zen (CPU)", kind: "cpu", year: 2022, processNode: "TSMC 5 nm CCD + 6 nm I/O die",
    changes: [
      { area: "Platform", what: "New AM5 socket, DDR5-only, PCIe 5.0." },
      { area: "Cache", what: "L2 doubled to 1 MB per core." },
      { area: "Features", what: "AVX-512 support; a small RDNA 2 iGPU in the I/O die on most desktop parts." },
    ],
    source: src("AMD Ryzen processors", AMD_PROC),
  },
  {
    id: "zen5", company: "amd", name: "Zen 5", family: "Zen (CPU)", kind: "cpu", year: 2024, processNode: "TSMC 4 nm (desktop CCD)",
    changes: [
      { area: "Architecture", what: "Wider front end and execution engine; full 512-bit AVX-512 datapath on desktop parts." },
      { area: "Cache", what: "Second-gen 3D V-Cache on X3D parts places the cache die beneath the cores, easing thermals and clock limits." },
      { area: "AI hardware", what: "Ryzen AI 300 laptop chips pair Zen 5 with an XDNA 2 NPU." },
    ],
    source: src("AMD Ryzen processors", AMD_PROC),
  },

  // ---------------- AMD RDNA ----------------
  {
    id: "rdna2", company: "amd", name: "RDNA 2", family: "RDNA (GPU)", kind: "gpu", year: 2020, processNode: "TSMC 7 nm",
    changes: [
      { area: "Features", what: "First AMD hardware ray tracing (Ray Accelerators); DirectX 12 Ultimate." },
      { area: "Cache", what: "Infinity Cache — a large last-level cache that reduces trips to VRAM." },
      { area: "Platform", what: "Same architecture family powers PlayStation 5 and Xbox Series X|S." },
    ],
    source: src("AMD Radeon graphics", AMD_GPU),
  },
  {
    id: "rdna3", company: "amd", name: "RDNA 3", family: "RDNA (GPU)", kind: "gpu", year: 2022, processNode: "TSMC 5 nm GCD + 6 nm MCDs",
    changes: [
      { area: "Architecture", what: "First chiplet gaming GPUs on the high end: a graphics die plus memory-cache dies." },
      { area: "AI hardware", what: "AI accelerator instructions (WMMA) added to compute units." },
      { area: "Media engines", what: "AV1 hardware encode." },
    ],
    source: src("AMD Radeon graphics", AMD_GPU),
  },
  {
    id: "rdna4", company: "amd", name: "RDNA 4", family: "RDNA (GPU)", kind: "gpu", year: 2025, processNode: "TSMC 4 nm",
    changes: [
      { area: "Architecture", what: "Back to monolithic dies; launched with mainstream/upper-mid cards (RX 9070 series) rather than a flagship." },
      { area: "Features", what: "Substantially redesigned ray tracing hardware." },
      { area: "AI hardware", what: "Much higher AI throughput with FP8 support; enables ML-based FSR 4 upscaling." },
    ],
    source: src("AMD Radeon graphics", AMD_GPU),
  },

  // ---------------- NVIDIA ----------------
  {
    id: "turing", company: "nvidia", name: "Turing", family: "GeForce RTX", kind: "gpu", year: 2018, processNode: "TSMC 12 nm",
    changes: [
      { area: "Features", what: "First RT Cores: hardware ray tracing in consumer GPUs (RTX 20 series)." },
      { area: "AI hardware", what: "Tensor Cores arrive in GeForce; DLSS introduced." },
    ],
    source: src("NVIDIA technologies", NV_ARCH),
  },
  {
    id: "ampere", company: "nvidia", name: "Ampere", family: "GeForce RTX", kind: "gpu", year: 2020, processNode: "Samsung 8 nm (GeForce)",
    changes: [
      { area: "Architecture", what: "FP32 throughput per SM doubled — CUDA core counts jump, but per-'core' performance is not the same as before." },
      { area: "AI hardware", what: "3rd-gen Tensor Cores with structured sparsity support." },
      { area: "Memory", what: "GDDR6X on higher-end cards (RTX 30 series)." },
    ],
    source: src("NVIDIA technologies", NV_ARCH),
  },
  {
    id: "ada", company: "nvidia", name: "Ada Lovelace", family: "GeForce RTX", kind: "gpu", year: 2022, processNode: "TSMC 4N",
    changes: [
      { area: "Cache", what: "Much larger L2 cache than Ampere, reducing VRAM traffic." },
      { area: "AI hardware", what: "4th-gen Tensor Cores with FP8; DLSS 3 frame generation." },
      { area: "Media engines", what: "AV1 hardware encode (NVENC)." },
    ],
    source: src("NVIDIA technologies", NV_ARCH),
  },
  {
    id: "blackwell", company: "nvidia", name: "Blackwell", family: "GeForce RTX", kind: "gpu", year: 2025, processNode: "TSMC 4N-class",
    changes: [
      { area: "Memory", what: "GDDR7 VRAM on the RTX 50 series; PCIe 5.0 interface." },
      { area: "AI hardware", what: "5th-gen Tensor Cores with FP4 support." },
      { area: "Features", what: "DLSS 4 with multi-frame generation and transformer-based models." },
    ],
    source: src("NVIDIA technologies", NV_ARCH),
  },

  // ---------------- Intel CPUs ----------------
  {
    id: "alder-lake", company: "intel", name: "Alder Lake (12th gen)", family: "Core", kind: "cpu", year: 2021, processNode: "Intel 7",
    changes: [
      { area: "Architecture", what: "First hybrid x86 desktop CPUs: P-cores + E-cores, with Thread Director scheduling hints." },
      { area: "Memory", what: "DDR5 and DDR4 support; PCIe 5.0 for graphics." },
    ],
    source: src("Intel Core processors", INTEL_CORE),
  },
  {
    id: "raptor-lake", company: "intel", name: "Raptor Lake (13th/14th gen)", family: "Core", kind: "cpu", year: 2022, processNode: "Intel 7",
    changes: [
      { area: "Cores", what: "More E-cores (up to 8P + 16E) and larger L2 caches; higher clocks." },
      { area: "Efficiency", what: "Top desktop parts run at high power limits; Intel issued microcode updates in 2024 for an instability issue in affected desktop parts." },
    ],
    source: src("Intel Core processors", INTEL_CORE),
  },
  {
    id: "meteor-lake", company: "intel", name: "Meteor Lake (Core Ultra Series 1)", family: "Core Ultra", kind: "cpu", year: 2023, processNode: "Intel 4 compute tile",
    changes: [
      { area: "Architecture", what: "First tile-based client CPU using Foveros 3D packaging (compute, graphics, SoC and I/O tiles)." },
      { area: "AI hardware", what: "First Intel client NPU." },
      { area: "Efficiency", what: "Low-power E-cores on the SoC tile handle light background work." },
    ],
    source: src("Intel Core Ultra", INTEL_CORE),
  },
  {
    id: "lunar-lake", company: "intel", name: "Lunar Lake (Core Ultra 200V)", family: "Core Ultra", kind: "cpu", year: 2024, processNode: "TSMC N3B compute tile",
    changes: [
      { area: "Memory", what: "LPDDR5X memory on the package (laptops only) — closer to an SoC-style design; capacity fixed at purchase." },
      { area: "Cores", what: "4 P-cores + 4 low-power E-cores; no Hyper-Threading." },
      { area: "AI hardware", what: "Larger NPU and Xe2 graphics with XMX engines." },
    ],
    source: src("Intel Core Ultra", INTEL_CORE),
  },
  {
    id: "arrow-lake", company: "intel", name: "Arrow Lake (Core Ultra 200S/HX)", family: "Core Ultra", kind: "cpu", year: 2024, processNode: "TSMC N3B compute tile",
    changes: [
      { area: "Platform", what: "Desktop moves to the LGA 1851 socket with tiles; standard DDR5 DIMMs." },
      { area: "Cores", what: "Up to 8P + 16E; Hyper-Threading removed from P-cores." },
      { area: "Efficiency", what: "Lower power than the previous desktop generation at similar performance targets." },
    ],
    source: src("Intel Core Ultra", INTEL_CORE),
  },
  {
    id: "panther-lake", company: "intel", name: "Panther Lake (Core Ultra Series 3)", family: "Core Ultra", kind: "cpu", year: 2026, processNode: "Intel 18A compute tile",
    changes: [
      { area: "Process", what: "First client CPU on Intel's 18A process (RibbonFET transistors, PowerVia backside power)." },
      { area: "GPU features", what: "Xe3-generation integrated graphics." },
      { area: "Architecture", what: "Laptop-focused, combining Lunar Lake-style efficiency with higher core counts." },
    ],
    source: src("Intel Core Ultra", INTEL_CORE),
  },

  // ---------------- Intel Arc ----------------
  {
    id: "alchemist", company: "intel", name: "Alchemist (Arc A-series)", family: "Arc (GPU)", kind: "gpu", year: 2022, processNode: "TSMC 6 nm",
    changes: [
      { area: "Architecture", what: "Intel's first modern discrete gaming GPUs (Xe-HPG)." },
      { area: "Features", what: "Hardware ray tracing and XMX matrix engines powering XeSS upscaling." },
      { area: "Media engines", what: "AV1 hardware encode — among the first consumer GPUs to offer it." },
      { area: "Software", what: "Older DirectX 9/11 games initially ran poorly; driver updates improved this considerably." },
    ],
    source: src("Intel Arc graphics", INTEL_ARC),
  },
  {
    id: "battlemage", company: "intel", name: "Battlemage (Arc B-series)", family: "Arc (GPU)", kind: "gpu", year: 2024, processNode: "TSMC 5 nm",
    changes: [
      { area: "Architecture", what: "Xe2 cores with better per-core performance and utilisation than Alchemist." },
      { area: "Efficiency", what: "Improved performance per watt." },
      { area: "Features", what: "XeSS 2 adds frame generation and latency reduction." },
    ],
    source: src("Intel Arc graphics", INTEL_ARC),
  },
];

export interface GenerationFamily {
  id: string;
  label: string;
  company: CompanyId;
  kind: "cpu" | "gpu" | "soc";
  ids: string[];
  note: string;
}

export const GENERATION_FAMILIES: GenerationFamily[] = [
  { id: "apple", label: "Apple Silicon (M-series)", company: "apple", kind: "soc", ids: ["m1", "m2", "m3", "m4", "m5"], note: "Each generation also ships Pro, Max and (for some) Ultra versions with more cores, wider memory buses and more media engines. Shown here: the base chip." },
  { id: "zen", label: "AMD Zen (CPU)", company: "amd", kind: "cpu", ids: ["zen2", "zen3", "zen4", "zen5"], note: "Zen generations map loosely to Ryzen 3000 → 5000 → 7000 → 9000 on desktop. Laptop numbering follows a different scheme." },
  { id: "rdna", label: "AMD RDNA (GPU)", company: "amd", kind: "gpu", ids: ["rdna2", "rdna3", "rdna4"], note: "RDNA powers Radeon cards, Ryzen integrated graphics and current game consoles. CDNA (Instinct) is the separate datacenter branch." },
  { id: "nvidia", label: "NVIDIA GeForce RTX", company: "nvidia", kind: "gpu", ids: ["turing", "ampere", "ada", "blackwell"], note: "RTX 20 → 30 → 40 → 50. Datacenter products of the same name can differ substantially from GeForce parts." },
  { id: "intel-cpu", label: "Intel Core (CPU)", company: "intel", kind: "cpu", ids: ["alder-lake", "raptor-lake", "meteor-lake", "lunar-lake", "arrow-lake", "panther-lake"], note: "Desktop and laptop lines diverged after Raptor Lake: Meteor and Lunar Lake are laptop-only; Arrow Lake covers desktop and high-end laptops." },
  { id: "intel-arc", label: "Intel Arc (GPU)", company: "intel", kind: "gpu", ids: ["alchemist", "battlemage"], note: "Arc generations are named alphabetically: Alchemist, Battlemage, then Celestial and Druid on Intel's published roadmap." },
];

export const getArchitecture = (id: string) => ARCHITECTURES.find((a) => a.id === id);

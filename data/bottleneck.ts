import type { CompanyId } from "@/data/schema";

/**
 * Bottleneck Lab tables. All values are REPRESENTATIVE tiers for teaching —
 * not measurements of specific products. Scores are 0–10 on a relative scale.
 */

export type Subsystem =
  | "cpuSingle"
  | "cpuMulti"
  | "gpu"
  | "memCapacity"
  | "bandwidth"
  | "storage"
  | "software"
  | "power";

export const SUBSYSTEM_LABEL: Record<Subsystem, string> = {
  cpuSingle: "CPU single-thread",
  cpuMulti: "CPU multi-thread",
  gpu: "GPU compute",
  memCapacity: "Memory / VRAM capacity",
  bandwidth: "Memory bandwidth",
  storage: "Storage",
  software: "Software support",
  power: "Power & thermals",
};

export const SUBSYSTEM_FIX: Record<Subsystem, string> = {
  cpuSingle: "A newer-generation CPU with higher single-thread performance (or one with extra cache for cache-sensitive games).",
  cpuMulti: "More performance cores, or a higher sustained power limit.",
  gpu: "A higher-tier GPU, a lower resolution/quality setting, or upscaling.",
  memCapacity: "More VRAM / unified memory, a smaller or more-quantised model, or lower texture/scene settings.",
  bandwidth: "A GPU or SoC tier with a wider/faster memory bus — or a smaller model so fewer bytes are read per step.",
  storage: "A faster NVMe SSD, or keeping working files on internal NVMe rather than external/SATA storage.",
  software: "A platform whose drivers, APIs and frameworks are first-class for this workload — or tools that support your hardware.",
  power: "Better cooling, a higher power limit, or a desktop form factor for sustained loads.",
};

export type LabPlatformId = "amd-nvidia" | "amd-amd" | "intel-nvidia" | "intel-intel" | "apple";

export interface LabPlatform {
  id: LabPlatformId;
  label: string;
  cpuVendor: CompanyId;
  gpuVendor: CompanyId;
  unified: boolean;
}

export const LAB_PLATFORMS: LabPlatform[] = [
  { id: "amd-nvidia", label: "AMD CPU + NVIDIA GPU", cpuVendor: "amd", gpuVendor: "nvidia", unified: false },
  { id: "amd-amd", label: "AMD CPU + AMD GPU", cpuVendor: "amd", gpuVendor: "amd", unified: false },
  { id: "intel-nvidia", label: "Intel CPU + NVIDIA GPU", cpuVendor: "intel", gpuVendor: "nvidia", unified: false },
  { id: "intel-intel", label: "Intel CPU + Intel Arc GPU", cpuVendor: "intel", gpuVendor: "intel", unified: false },
  { id: "apple", label: "Apple Silicon Mac", cpuVendor: "apple", gpuVendor: "apple", unified: true },
];

export interface CpuTier {
  id: string;
  label: string;
  vendors: CompanyId[];
  single: number;
  multi: number;
  /** Extra large cache (X3D-style) that helps cache-sensitive games. */
  bigCache?: boolean;
  watts: number;
}

export const CPU_TIERS: CpuTier[] = [
  { id: "entry", label: "Entry · 6 cores", vendors: ["amd", "intel"], single: 6.5, multi: 4, watts: 65 },
  { id: "mid", label: "Mainstream · 8 cores", vendors: ["amd", "intel"], single: 7.5, multi: 5.5, watts: 105 },
  { id: "x3d", label: "8 cores + stacked cache (X3D)", vendors: ["amd"], single: 7.5, multi: 5.5, bigCache: true, watts: 120 },
  { id: "high", label: "High-end · 16–24 cores", vendors: ["amd", "intel"], single: 8.5, multi: 9, watts: 200 },
];

export interface GpuTier {
  id: string;
  label: string;
  vendors: CompanyId[];
  compute: number;
  vramGB: number;
  bandwidthGBs: number;
  watts: number;
}

export const GPU_TIERS: GpuTier[] = [
  { id: "entry", label: "Entry · 8 GB", vendors: ["nvidia", "amd", "intel"], compute: 4, vramGB: 8, bandwidthGBs: 280, watts: 130 },
  { id: "mid12", label: "Mainstream · 12 GB", vendors: ["nvidia", "intel"], compute: 5.5, vramGB: 12, bandwidthGBs: 460, watts: 200 },
  { id: "upper16", label: "Upper · 16 GB", vendors: ["nvidia", "amd"], compute: 7, vramGB: 16, bandwidthGBs: 650, watts: 280 },
  { id: "high16", label: "High-end · 16 GB", vendors: ["nvidia"], compute: 8.2, vramGB: 16, bandwidthGBs: 950, watts: 360 },
  { id: "flag24", label: "Previous-gen flagship class · 24 GB", vendors: ["nvidia", "amd"], compute: 8, vramGB: 24, bandwidthGBs: 960, watts: 400 },
  { id: "flag32", label: "Flagship class · 32 GB", vendors: ["nvidia"], compute: 10, vramGB: 32, bandwidthGBs: 1790, watts: 575 },
];

export interface AppleTier {
  id: string;
  label: string;
  single: number;
  multi: number;
  gpu: number;
  bandwidthGBs: number;
  memoryOptions: number[];
  watts: number;
}

export const APPLE_TIERS: AppleTier[] = [
  { id: "base", label: "Base M-series", single: 8.5, multi: 5.5, gpu: 3, bandwidthGBs: 130, memoryOptions: [16, 24, 32], watts: 25 },
  { id: "pro", label: "M-series Pro", single: 8.5, multi: 7.5, gpu: 4.5, bandwidthGBs: 273, memoryOptions: [24, 48, 64], watts: 45 },
  { id: "max", label: "M-series Max", single: 8.5, multi: 8.5, gpu: 6.5, bandwidthGBs: 500, memoryOptions: [36, 64, 128], watts: 80 },
  { id: "ultra", label: "M-series Ultra (desktop)", single: 8.5, multi: 9.5, gpu: 8, bandwidthGBs: 800, memoryOptions: [96, 256, 512], watts: 160 },
];

export const RAM_OPTIONS = [16, 32, 64, 128];

export const STORAGE_OPTIONS: { id: string; label: string; score: number }[] = [
  { id: "sata", label: "SATA SSD", score: 4 },
  { id: "nvme4", label: "NVMe PCIe 4.0", score: 8 },
  { id: "nvme5", label: "NVMe PCIe 5.0", score: 9 },
];

/** Dual-channel DDR5 desktop memory, representative. */
export const PC_SYSTEM_BANDWIDTH = 90;

/** Share of unified memory the GPU can use by default on macOS (approximate; adjustable by advanced users). */
export const APPLE_GPU_SHARE = 0.75;

export type LabWorkloadId = "gaming1080" | "gaming4k" | "blender" | "video" | "compile" | "llm" | "training";

export interface LabWorkload {
  id: LabWorkloadId;
  label: string;
  /** Demand per subsystem, 0–10. memCapacity/bandwidth are computed from needGB where relevant. */
  demand: Record<Exclude<Subsystem, "memCapacity" | "power">, number>;
  /** GB of GPU-accessible memory needed (VRAM or unified). 0 = not GPU-memory-bound. */
  gpuMemGB: number;
  /** GB of system RAM needed. */
  ramGB: number;
  /** Benefits from very large CPU cache. */
  cacheSensitive?: boolean;
  /** Uses media engines heavily. */
  media?: boolean;
  /** Software maturity per GPU vendor for this workload, 0–10, with the reason. */
  software: Record<CompanyId, { score: number; why: string }>;
  why: Partial<Record<Subsystem, string>>;
}

export const LAB_WORKLOADS: LabWorkload[] = [
  {
    id: "gaming1080",
    label: "1080p high-refresh gaming",
    demand: { cpuSingle: 9, cpuMulti: 4, gpu: 5.5, bandwidth: 4, storage: 3, software: 8 },
    gpuMemGB: 6,
    ramGB: 16,
    cacheSensitive: true,
    software: {
      nvidia: { score: 9, why: "Mature Windows drivers and broad game support." },
      amd: { score: 9, why: "Mature Windows drivers and broad game support." },
      intel: { score: 7, why: "Modern DX12/Vulkan titles run well; older or less-common titles have historically been less consistent." },
      apple: { score: 4, why: "A smaller share of games ship native macOS/Metal versions; others need translation layers or don't run." },
    },
    why: {
      cpuSingle:
        "At 1080p the GPU renders each frame quickly, so the CPU's main game thread (simulation, draw calls) often decides the frame rate.",
      gpu: "Lower resolution means fewer pixels per frame, so the GPU has headroom.",
      memCapacity: "Textures at 1080p usually fit in 8 GB, though some recent games push beyond it at high settings.",
    },
  },
  {
    id: "gaming4k",
    label: "4K gaming",
    demand: { cpuSingle: 5, cpuMulti: 3, gpu: 10, bandwidth: 8, storage: 3, software: 8 },
    gpuMemGB: 12,
    ramGB: 16,
    software: {
      nvidia: { score: 9, why: "Mature drivers; DLSS widely integrated." },
      amd: { score: 9, why: "Mature drivers; FSR widely integrated." },
      intel: { score: 7, why: "Good in modern APIs; XeSS supported in many titles; fewer high-end GPU options." },
      apple: { score: 4, why: "Limited native game catalogue; MetalFX available where developers integrate it." },
    },
    why: {
      gpu: "4K is ~8.3 million pixels per frame — four times 1080p. The GPU usually becomes the limit.",
      memCapacity: "4K render targets and high-resolution textures need more VRAM.",
      bandwidth: "More pixels means more memory traffic per frame.",
      cpuSingle: "The CPU's work per frame doesn't grow with resolution, so it's rarely the limiter at 4K.",
    },
  },
  {
    id: "blender",
    label: "Blender (GPU path tracing)",
    demand: { cpuSingle: 3, cpuMulti: 4, gpu: 10, bandwidth: 6, storage: 2, software: 9 },
    gpuMemGB: 10,
    ramGB: 32,
    software: {
      nvidia: { score: 10, why: "Cycles supports CUDA and OptiX (with RT-core acceleration); the most mature path." },
      amd: { score: 8, why: "Cycles supports HIP (and HIP RT) on supported Radeon GPUs." },
      intel: { score: 7, why: "Cycles supports Arc via oneAPI." },
      apple: { score: 8, why: "Cycles supports Metal, including hardware ray tracing on newer M-series GPUs." },
    },
    why: {
      gpu: "Path tracing is massively parallel ray and shading work — the GPU is doing almost everything.",
      memCapacity: "The whole scene (geometry + textures) must fit in GPU-accessible memory, or rendering fails or falls back.",
      software: "Which GPU backend Cycles uses (OptiX, HIP, oneAPI, Metal) affects speed and feature support.",
    },
  },
  {
    id: "video",
    label: "4K video editing",
    demand: { cpuSingle: 5, cpuMulti: 7, gpu: 6, bandwidth: 5, storage: 7, software: 8 },
    gpuMemGB: 8,
    ramGB: 32,
    media: true,
    software: {
      nvidia: { score: 8, why: "NVENC/NVDEC and CUDA effects are well supported by major editors." },
      amd: { score: 7, why: "Hardware encode/decode supported by major editors; effect acceleration varies by app." },
      intel: { score: 8, why: "Quick Sync is widely supported for decode/encode of common codecs." },
      apple: { score: 9, why: "Media engines with ProRes hardware support are tightly integrated with Final Cut Pro, DaVinci Resolve and Premiere." },
    },
    why: {
      cpuMulti: "Effects, exports and software decoding of unsupported codecs lean on CPU cores.",
      storage: "Multi-stream 4K footage needs sustained read speed; slow or external drives stutter.",
      gpu: "Colour grading and effects run on the GPU.",
      software: "Whether your camera's codec is hardware-decoded on this platform often decides timeline smoothness.",
    },
  },
  {
    id: "compile",
    label: "Large software compilation",
    demand: { cpuSingle: 6, cpuMulti: 10, gpu: 0, bandwidth: 3, storage: 6, software: 6 },
    gpuMemGB: 0,
    ramGB: 32,
    software: {
      nvidia: { score: 9, why: "Toolchains are CPU-side; any OS works. (GPU irrelevant here.)" },
      amd: { score: 9, why: "Toolchains are CPU-side; any OS works." },
      intel: { score: 9, why: "Toolchains are CPU-side; any OS works." },
      apple: { score: 9, why: "Native ARM64 toolchains are mature; cross-compiling for x86 targets may need extra setup." },
    },
    why: {
      cpuMulti: "Build systems compile many files in parallel — more fast cores means shorter builds.",
      cpuSingle: "Linking and some serial steps still depend on one fast core.",
      storage: "Thousands of small file reads and writes reward low-latency NVMe.",
      memCapacity: "Parallel compiler processes each need RAM; too little forces swapping.",
    },
  },
  {
    id: "llm",
    label: "Local LLM inference",
    demand: { cpuSingle: 2, cpuMulti: 3, gpu: 5, bandwidth: 10, storage: 3, software: 8 },
    gpuMemGB: 20, // overridden by model size selection
    ramGB: 16,
    software: {
      nvidia: { score: 10, why: "CUDA is the first target for nearly every inference engine (llama.cpp, vLLM, TensorRT-LLM, PyTorch)." },
      amd: { score: 7, why: "ROCm and Vulkan backends work on supported Radeon GPUs; coverage is narrower than CUDA." },
      intel: { score: 6, why: "Supported via oneAPI/SYCL, OpenVINO and Vulkan backends; fewer tools target it first." },
      apple: { score: 8, why: "MLX and llama.cpp's Metal backend are well optimised for Apple Silicon." },
    },
    why: {
      memCapacity: "The model weights must fit in GPU-accessible memory. If they don't, layers spill to slower memory and speed collapses.",
      bandwidth: "Generating each token reads (roughly) every weight once, so tokens/s is capped near bandwidth ÷ model size.",
      gpu: "Prompt processing is compute-heavy, but token generation is usually bandwidth-bound.",
    },
  },
  {
    id: "training",
    label: "AI model training",
    demand: { cpuSingle: 3, cpuMulti: 4, gpu: 10, bandwidth: 8, storage: 5, software: 10 },
    gpuMemGB: 16,
    ramGB: 64,
    software: {
      nvidia: { score: 10, why: "CUDA, cuDNN and NCCL are the default targets for PyTorch, JAX and research code." },
      amd: { score: 6, why: "PyTorch on ROCm works on supported GPUs (mainly on Linux); some libraries and custom kernels are CUDA-only." },
      intel: { score: 4, why: "PyTorch XPU backend exists; ecosystem is younger and fewer projects test on it." },
      apple: { score: 5, why: "PyTorch MPS and MLX support training; many CUDA-specific kernels and multi-GPU tools aren't available." },
    },
    why: {
      gpu: "Training is dominated by matrix multiplication on the GPU's matrix units.",
      memCapacity: "Weights, gradients, optimiser state and activations all need memory — several times the model's inference size.",
      software: "Research code frequently assumes CUDA. Unsupported ops fall back to slow paths or fail.",
    },
  },
];

export const LLM_SIZES: { id: string; label: string; gb: number }[] = [
  { id: "8b", label: "8B · 4-bit", gb: 5 },
  { id: "14b", label: "14B · 4-bit", gb: 9 },
  { id: "32b", label: "32B · 4-bit", gb: 19 },
  { id: "70b", label: "70B · 4-bit", gb: 40 },
];

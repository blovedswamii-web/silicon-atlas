import type { CompanyId } from "@/data/schema";

/**
 * How each vendor organises a GPU. These describe *organisation and vocabulary*,
 * not speed. Lane counts per unit are the commonly published figures for recent
 * generations and vary between generations — treat them as illustrative.
 */
export interface GpuOrg {
  company: CompanyId;
  family: string; // "GeForce RTX (Blackwell-era)"
  unit: string; // name of the replicated building block
  unitPlural: string;
  hierarchy: string[]; // top → bottom
  groupName: string; // warp / wavefront / sub-group / SIMD-group
  groupSizes: number[]; // possible thread-group widths
  laneName: string; // what the marketing count calls one FP32 lane
  lanesPerUnit: string; // illustrative, e.g. "128 FP32 lanes per SM"
  matrix: string;
  rayTracing: string;
  extras: string[];
  traversal: "raster" | "tiled";
  howItWorks: string;
  computeApi: string;
}

export const GPU_ORGS: GpuOrg[] = [
  {
    company: "nvidia",
    family: "GeForce RTX",
    unit: "SM",
    unitPlural: "Streaming Multiprocessors (SMs)",
    hierarchy: ["GPU", "GPC (Graphics Processing Cluster)", "SM (Streaming Multiprocessor)", "4 processing blocks, each with a warp scheduler", "FP32 / INT32 lanes ('CUDA cores')"],
    groupName: "warp",
    groupSizes: [32],
    laneName: "CUDA core",
    lanesPerUnit: "Recent GeForce SMs have 128 FP32 lanes",
    matrix: "Tensor Cores — one per processing block (4 per SM in recent generations)",
    rayTracing: "One RT core per SM (BVH traversal and ray–triangle tests)",
    extras: ["NVENC / NVDEC video engines", "Large L2 cache on recent generations"],
    traversal: "raster",
    howItWorks:
      "Threads are scheduled in **warps of 32** that execute the same instruction together (SIMT). Each SM juggles many warps at once and switches to a ready warp whenever another is waiting on memory — that is how a GPU hides latency without big caches per thread.",
    computeApi: "CUDA",
  },
  {
    company: "amd",
    family: "Radeon (RDNA)",
    unit: "CU",
    unitPlural: "Compute Units (CUs)",
    hierarchy: ["GPU", "Shader Engine", "WGP (Work-Group Processor = 2 CUs)", "CU (Compute Unit): 2 × SIMD32", "Stream processors (FP32 lanes)"],
    groupName: "wavefront",
    groupSizes: [32, 64],
    laneName: "stream processor",
    lanesPerUnit: "RDNA Compute Units have 64 stream processors (RDNA 3/4 can dual-issue some FP32 ops)",
    matrix: "AI accelerators (WMMA instructions) on RDNA 3 and RDNA 4; data-center CDNA uses separate Matrix Cores",
    rayTracing: "One Ray Accelerator per CU",
    extras: ["VCN video engine", "Infinity Cache (large last-level cache) on many models"],
    traversal: "raster",
    howItWorks:
      "RDNA runs **wavefronts of 32 or 64** threads (wave32 / wave64). Two CUs share resources as a Work-Group Processor. AMD's data-center line (CDNA) is a different architecture tuned for compute rather than graphics — so 'an AMD GPU' can mean two quite different designs.",
    computeApi: "HIP / ROCm",
  },
  {
    company: "intel",
    family: "Arc (Xe)",
    unit: "Xe core",
    unitPlural: "Xe cores",
    hierarchy: ["GPU", "Render slice", "Xe core", "Vector engines (XVE) + XMX matrix engines", "SIMD lanes"],
    groupName: "sub-group",
    groupSizes: [8, 16, 32],
    laneName: "vector-engine lane",
    lanesPerUnit: "Recent Xe cores have 128 FP32 lanes across their vector engines",
    matrix: "XMX (Xe Matrix eXtensions) engines inside every Xe core",
    rayTracing: "One Ray Tracing Unit per Xe core",
    extras: ["Xe media engine (Quick Sync)", "Same Xe architecture family also used for integrated graphics"],
    traversal: "raster",
    howItWorks:
      "Intel's compiler chooses a **SIMD width per shader (8, 16 or 32)**, trading parallelism against register pressure. Each Xe core pairs vector engines for general math with XMX engines for matrix math.",
    computeApi: "oneAPI / SYCL",
  },
  {
    company: "apple",
    family: "Apple GPU (M-series)",
    unit: "GPU core",
    unitPlural: "GPU cores",
    hierarchy: ["SoC", "GPU (one block inside the SoC)", "GPU core", "SIMD groups of 32 threads", "ALUs"],
    groupName: "SIMD-group",
    groupSizes: [32],
    laneName: "ALU (not marketed as a count)",
    lanesPerUnit: "Apple markets GPU cores, not lanes; each core contains many ALUs (commonly cited as 128)",
    matrix: "SIMD-group matrix instructions; M5-generation GPU cores add neural accelerators. The Neural Engine is a separate block outside the GPU.",
    rayTracing: "Hardware ray tracing from M3 onward",
    extras: ["Tile-based deferred rendering with on-chip tile memory", "Dynamic Caching (M3 onward) allocates GPU on-chip memory at run time", "Shares unified memory with CPU and Neural Engine"],
    traversal: "tiled",
    howItWorks:
      "Apple GPUs descend from mobile designs: they are **tile-based deferred renderers**. The screen is split into small tiles that are shaded in fast on-chip tile memory, reducing trips to main memory — important when memory is shared with the CPU. Threads run in **SIMD-groups of 32**.",
    computeApi: "Metal",
  },
];

export interface TermRow {
  id: string;
  label: string;
  values: Record<CompanyId, string>;
  meaning: string;
}

export const GPU_TERMS: TermRow[] = [
  {
    id: "unit",
    label: "Repeated building block",
    values: { nvidia: "SM", amd: "Compute Unit (CU)", intel: "Xe core", apple: "GPU core" },
    meaning:
      "Every GPU is built by copying one block many times. The blocks differ in size and capability, so '40 of these' vs '60 of those' tells you little until you know what's inside each.",
  },
  {
    id: "count",
    label: "Number usually marketed",
    values: { nvidia: "CUDA cores (FP32 lanes)", amd: "Stream processors or CUs", intel: "Xe cores", apple: "GPU cores" },
    meaning:
      "NVIDIA and AMD typically advertise lanes (thousands); Intel and Apple typically advertise blocks (tens). Comparing 10,000 'cores' with 40 'cores' compares different things.",
  },
  {
    id: "group",
    label: "Threads that move in lockstep",
    values: { nvidia: "Warp (32)", amd: "Wavefront (32 or 64)", intel: "Sub-group (8 / 16 / 32)", apple: "SIMD-group (32)" },
    meaning:
      "All GPUs run threads in groups that share one instruction stream. If threads in a group take different branches, the group runs both paths — so branchy code wastes lanes on every vendor.",
  },
  {
    id: "matrix",
    label: "Matrix / AI hardware",
    values: {
      nvidia: "Tensor Cores",
      amd: "AI accelerators (RDNA), Matrix Cores (CDNA)",
      intel: "XMX engines",
      apple: "GPU neural accelerators (M5+), Neural Engine (separate)",
    },
    meaning: "Dedicated units that multiply small matrix tiles per instruction. Their throughput depends heavily on number precision (FP16, FP8, INT8, FP4…).",
  },
  {
    id: "rt",
    label: "Ray-tracing hardware",
    values: { nvidia: "RT cores", amd: "Ray Accelerators", intel: "Ray Tracing Units", apple: "Hardware RT (M3+)" },
    meaning: "Accelerate finding what a ray hits. How much work is done in fixed-function hardware vs shaders differs between designs.",
  },
  {
    id: "api",
    label: "Native compute API",
    values: { nvidia: "CUDA", amd: "HIP / ROCm", intel: "oneAPI / SYCL", apple: "Metal" },
    meaning: "Determines which software runs. Hardware that your software doesn't support is effectively slower than its spec sheet.",
  },
  {
    id: "upscale",
    label: "Upscaler",
    values: { nvidia: "DLSS", amd: "FSR", intel: "XeSS", apple: "MetalFX" },
    meaning: "Render fewer pixels, reconstruct a sharper image. Each requires game integration; image quality differs and is judged per game.",
  },
  {
    id: "media",
    label: "Video engine",
    values: { nvidia: "NVENC / NVDEC", amd: "VCN (via AMF)", intel: "Quick Sync", apple: "Media engines (incl. ProRes)" },
    meaning: "Fixed-function encode/decode blocks — separate from shader cores — that make video editing and streaming far more efficient when apps use them.",
  },
];

/** Precision formats used in graphics and AI. */
export interface PrecisionFormat {
  id: string;
  name: string;
  sign: number;
  exponent: number;
  mantissa: number;
  /** Integer formats have no exponent: `mantissa` holds value bits. */
  integer?: boolean;
  maxFinite: number;
  bytes: number;
  usedFor: string;
  note: string;
}

export const PRECISION_FORMATS: PrecisionFormat[] = [
  { id: "fp32", name: "FP32", sign: 1, exponent: 8, mantissa: 23, maxFinite: 3.4028235e38, bytes: 4, usedFor: "Graphics shading, scientific code, master copy of weights in training", note: "The 'TFLOPS' on most GPU spec sheets is FP32 unless stated otherwise." },
  { id: "fp16", name: "FP16", sign: 1, exponent: 5, mantissa: 10, maxFinite: 65504, bytes: 2, usedFor: "Mixed-precision training, inference, some graphics", note: "Only 5 exponent bits: overflows above 65,504, so training needs loss scaling." },
  { id: "bf16", name: "BF16", sign: 1, exponent: 8, mantissa: 7, maxFinite: 3.3895314e38, bytes: 2, usedFor: "Training and inference of large models", note: "Same range as FP32 with less precision — a popular default for training today." },
  { id: "fp8", name: "FP8 (E4M3)", sign: 1, exponent: 4, mantissa: 3, maxFinite: 448, bytes: 1, usedFor: "Training and inference on recent accelerators", note: "Needs scaling factors per tensor/block; hardware support varies by generation." },
  { id: "int8", name: "INT8", sign: 1, exponent: 0, mantissa: 7, integer: true, maxFinite: 127, bytes: 1, usedFor: "Quantised inference, NPU 'TOPS' figures", note: "Integers −128…127 plus a scale factor that maps them back to real values." },
  { id: "fp4", name: "FP4 (E2M1)", sign: 1, exponent: 2, mantissa: 1, maxFinite: 6, bytes: 0.5, usedFor: "Aggressively quantised inference on the newest hardware", note: "Only 16 possible values — usable only with fine-grained block scaling." },
];

/**
 * Inputs for the LLM memory calculator. Every figure here is a modelling
 * assumption chosen to build intuition — not a measurement of a product.
 */

export interface ModelPreset {
  id: string;
  params: number; // billions
  /** Representative transformer shape (grouped-query attention), used for the KV-cache estimate. */
  layers: number;
  kvHeads: number;
  headDim: number;
  example: string;
}

export const MODEL_PRESETS: ModelPreset[] = [
  { id: "7b", params: 7, layers: 32, kvHeads: 8, headDim: 128, example: "7–8B class" },
  { id: "14b", params: 14, layers: 48, kvHeads: 8, headDim: 128, example: "13–14B class" },
  { id: "32b", params: 32, layers: 64, kvHeads: 8, headDim: 128, example: "30–34B class" },
  { id: "70b", params: 70, layers: 80, kvHeads: 8, headDim: 128, example: "70B class" },
];

/** Shape for a custom size: layer count grows roughly with params^0.4 across common dense models. */
export function shapeFor(params: number): Omit<ModelPreset, "id" | "example"> {
  const preset = MODEL_PRESETS.find((p) => p.params === params);
  if (preset) return preset;
  return { params, layers: Math.max(16, Math.round(32 * Math.pow(params / 7, 0.4))), kvHeads: 8, headDim: 128 };
}

export interface WeightPrecision {
  id: string;
  label: string;
  /** Effective bits per weight including quantisation scales/metadata. */
  bits: number;
  note: string;
}

export const WEIGHT_PRECISIONS: WeightPrecision[] = [
  { id: "fp16", label: "FP16 / BF16", bits: 16, note: "Unquantised. 2 bytes per parameter." },
  { id: "int8", label: "INT8 / FP8", bits: 8, note: "1 byte per parameter for the weights themselves." },
  { id: "q8", label: "8-bit (GGUF Q8_0-style)", bits: 8.5, note: "8-bit values plus a scale per block of weights ≈ 8.5 bits." },
  { id: "q4", label: "4-bit (Q4 / MLX 4-bit)", bits: 4.5, note: "4-bit values plus per-group scales ≈ 4.5–4.9 bits effective. Some quality loss, usually modest for larger models." },
];

export const KV_PRECISIONS = [
  { id: "fp16", label: "FP16 cache", bytes: 2 },
  { id: "q8", label: "8-bit cache", bytes: 1 },
] as const;

export const CONTEXT_OPTIONS = [2048, 8192, 32768, 131072];

/** Runtime overhead: compute buffers, activations, framework. Approximation. */
export const overheadGB = (weightsGB: number) => 0.8 + weightsGB * 0.05;

export interface MemoryTarget {
  id: string;
  label: string;
  kind: "vram" | "unified";
  capacityGB: number;
  /** Portion realistically available to the model on the GPU. */
  usableGB: number;
  usableNote: string;
}

const vram = (gb: number): MemoryTarget => ({
  id: `vram-${gb}`,
  label: `${gb} GB VRAM`,
  kind: "vram",
  capacityGB: gb,
  usableGB: gb - 0.8,
  usableNote: "Roughly 0.5–1 GB is typically taken by the driver, display output and the runtime context.",
});

const unified = (gb: number): MemoryTarget => ({
  id: `um-${gb}`,
  label: `${gb} GB unified`,
  kind: "unified",
  capacityGB: gb,
  usableGB: Math.round(gb * (gb >= 48 ? 0.75 : 0.67) * 10) / 10,
  usableNote:
    "By default macOS limits how much memory the GPU may wire for itself — commonly observed at around two-thirds of RAM on smaller configurations and three-quarters on larger ones. Advanced users can raise it, but the OS and your other apps still need memory.",
});

export const MEMORY_TARGETS: MemoryTarget[] = [vram(8), vram(12), vram(16), vram(24), vram(32), unified(16), unified(32), unified(64), unified(128)];

/** Representative memory-bandwidth classes (not specific products). */
export interface BandwidthClass {
  id: string;
  label: string;
  gbps: number;
  range: string;
  kind: "sysram" | "unified" | "vram";
}

export const BANDWIDTH_CLASSES: BandwidthClass[] = [
  { id: "ddr5", label: "Desktop DDR5, dual channel", gbps: 80, range: "~60–100 GB/s", kind: "sysram" },
  { id: "um-entry", label: "Entry unified memory (laptop)", gbps: 120, range: "~100–150 GB/s", kind: "unified" },
  { id: "um-mid", label: "Mid-tier unified memory", gbps: 270, range: "~200–300 GB/s", kind: "unified" },
  { id: "um-high", label: "High-end laptop unified memory", gbps: 500, range: "~400–550 GB/s", kind: "unified" },
  { id: "um-ws", label: "Desktop workstation unified memory", gbps: 800, range: "~800 GB/s", kind: "unified" },
  { id: "vram-mid", label: "Mid-range discrete GPU (GDDR)", gbps: 500, range: "~300–700 GB/s", kind: "vram" },
  { id: "vram-high", label: "High-end discrete GPU (GDDR)", gbps: 1300, range: "~900–1800 GB/s", kind: "vram" },
];

/** Representative *effective* compute classes for the prefill estimate. */
export const COMPUTE_CLASSES = [
  { id: "cpu", label: "CPU cores", tflops: 1.5 },
  { id: "igpu", label: "Laptop integrated GPU", tflops: 8 },
  { id: "mid", label: "Mid-range GPU / large SoC GPU", tflops: 40 },
  { id: "high", label: "High-end discrete GPU", tflops: 150 },
];

export type Support = "first" | "yes" | "partial" | "no";

export interface Runtime {
  name: string;
  what: string;
  support: Record<"nvidia" | "apple" | "amd" | "intel", Support>;
}

export const RUNTIMES: Runtime[] = [
  { name: "llama.cpp", what: "C/C++ inference engine with GGUF quantised models; backends for CUDA, Metal, HIP, Vulkan, SYCL and CPU.", support: { nvidia: "first", apple: "first", amd: "yes", intel: "yes" } },
  { name: "Ollama", what: "Friendly local runner built on llama.cpp.", support: { nvidia: "first", apple: "first", amd: "yes", intel: "partial" } },
  { name: "LM Studio", what: "Desktop app; uses llama.cpp, and MLX on Apple Silicon.", support: { nvidia: "first", apple: "first", amd: "yes", intel: "partial" } },
  { name: "MLX / mlx-lm", what: "Apple's array framework designed for unified memory.", support: { nvidia: "partial", apple: "first", amd: "no", intel: "no" } },
  { name: "vLLM", what: "High-throughput serving engine (batching, paged KV cache).", support: { nvidia: "first", apple: "partial", amd: "yes", intel: "partial" } },
  { name: "TensorRT-LLM", what: "NVIDIA's optimised inference library.", support: { nvidia: "first", apple: "no", amd: "no", intel: "no" } },
  { name: "OpenVINO GenAI", what: "Intel's inference toolkit across CPU, GPU and NPU.", support: { nvidia: "no", apple: "no", amd: "no", intel: "first" } },
];

export const SUPPORT_LABEL: Record<Support, string> = {
  first: "Primary target",
  yes: "Supported",
  partial: "Limited / experimental",
  no: "Not supported",
};

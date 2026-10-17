import type { CompanyId } from "@/data/schema";

/** Where each company's AI compute lives, and what to watch for. Neutral summaries, not rankings. */
export interface AiEngineProfile {
  company: CompanyId;
  engines: { name: string; where: string }[];
  strengths: string[];
  watch: string[];
}

export const AI_ENGINES: AiEngineProfile[] = [
  {
    company: "nvidia",
    engines: [
      { name: "Tensor Cores", where: "In every RTX GPU, from laptops to data centers — matrix math at FP16/BF16/FP8/INT8 and, on the newest generation, FP4." },
      { name: "CUDA cores", where: "General parallel math for everything that isn't a matrix multiply." },
      { name: "Data-center GPUs", where: "HBM memory and NVLink interconnect for training across many GPUs." },
    ],
    strengths: [
      "CUDA is the default target of most AI frameworks, libraries and research code.",
      "One programming model from a laptop GPU to a data-center cluster.",
      "Very high memory bandwidth on discrete cards.",
    ],
    watch: [
      "Consumer VRAM capacity caps the model size that fits at full speed.",
      "Laptop GPUs share a name with desktop GPUs but have less power, and often less VRAM.",
      "Proprietary: CUDA code doesn't run natively on other vendors' GPUs.",
    ],
  },
  {
    company: "apple",
    engines: [
      { name: "GPU", where: "Programmed through Metal; used by MLX and PyTorch's MPS backend. M5-generation GPU cores add neural accelerators." },
      { name: "Neural Engine", where: "Efficient inference engine reached through Core ML; used heavily by macOS/iOS features and apps." },
      { name: "CPU", where: "Matrix extensions used via the Accelerate framework." },
    ],
    strengths: [
      "Large unified memory configurations let big models load without a separate VRAM limit.",
      "Strong performance per watt — local inference on a quiet, battery-powered laptop.",
      "MLX is designed specifically around unified memory.",
    ],
    watch: [
      "No CUDA: CUDA-only projects need ports or alternatives.",
      "Smaller ecosystem for large-scale training.",
      "Bandwidth and compute vary a lot between base, Pro, Max and Ultra tiers; memory can't be upgraded later.",
    ],
  },
  {
    company: "amd",
    engines: [
      { name: "Instinct (CDNA)", where: "Data-center accelerators with Matrix Cores and large HBM capacity." },
      { name: "Radeon (RDNA)", where: "Gaming GPUs with AI accelerators since RDNA 3, enhanced in RDNA 4." },
      { name: "Ryzen AI (XDNA NPU)", where: "Laptop NPU for efficient on-device inference; Ryzen AI Max chips add a large GPU with big shared memory." },
    ],
    strengths: [
      "Open-source ROCm stack; HIP makes porting CUDA code comparatively straightforward.",
      "Competitive memory capacity on data-center parts and some consumer configurations.",
      "PyTorch publishes official ROCm builds.",
    ],
    watch: [
      "Support depends on the exact GPU and OS — check the ROCm compatibility matrix.",
      "Projects with custom CUDA kernels may lack AMD versions or get them later.",
      "Consumer Radeon support has historically trailed Instinct support.",
    ],
  },
  {
    company: "intel",
    engines: [
      { name: "Arc / Xe GPUs (XMX)", where: "Matrix engines in every Xe core of Arc discrete and recent integrated GPUs." },
      { name: "NPU", where: "In Core Ultra laptop chips, for low-power background AI features." },
      { name: "Xeon (AMX)", where: "Matrix extensions that make CPU-only server inference practical for some models." },
    ],
    strengths: [
      "OpenVINO deploys one model across CPU, GPU and NPU.",
      "Huge installed base of Intel CPUs that can run inference without any GPU.",
      "Standards-based oneAPI/SYCL programming model.",
    ],
    watch: [
      "Smaller ecosystem for research and training.",
      "NPU TOPS only help software that actually targets the NPU.",
      "Framework support for Arc GPUs is newer than CUDA's.",
    ],
  },
];

export interface TrainInferRow {
  label: string;
  training: string;
  inference: string;
}

export const TRAIN_VS_INFER: TrainInferRow[] = [
  { label: "What happens", training: "Run data forward, measure the error, run backward to compute gradients, update every weight. Repeat millions of times.", inference: "Run data forward once per request (or once per token for an LLM)." },
  { label: "Memory per parameter", training: "Weights + gradients + optimiser state: a common rule of thumb for mixed-precision Adam is ~16 bytes per parameter, before activations.", inference: "Just the weights: ~2 bytes (FP16) down to ~0.5 bytes (4-bit), plus a cache that grows with context." },
  { label: "Typical precision", training: "BF16/FP16 with FP32 master weights; FP8 on recent accelerators.", inference: "FP16, FP8, INT8 or 4-bit quantised." },
  { label: "Usually limited by", training: "Compute, memory capacity and multi-GPU communication.", inference: "Memory bandwidth (generating tokens) and compute (reading prompts, batching many users)." },
  { label: "Where it usually runs", training: "Data-center GPU clusters; small fine-tunes on a single large-memory GPU or Mac.", inference: "Anywhere: data centers, desktop GPUs, Macs, laptop NPUs, phones." },
  { label: "Software sensitivity", training: "Very high — custom kernels, distributed training libraries and research code often assume CUDA.", inference: "High but more portable — many runtimes support several vendors." },
];

import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "ai-hardware",
  number: 14,
  title: "AI hardware",
  subtitle: "Matrix units, memory capacity, memory bandwidth and software stacks — the four things that decide how well a computer runs AI.",
  kind: "accel",
  minutes: 16,
  sections: [
    {
      id: "matmul",
      title: "AI is mostly matrix multiplication",
      body: {
        simple: `A neural network is a long list of numbers (called **weights**) arranged in grids. Running it mostly means multiplying grids of numbers together, billions of times.

That's why GPUs are good at AI: multiplying grids is exactly the kind of "same simple step, enormous amount of data" work they were built for. Newer chips go further and add special **matrix units** that multiply a whole small grid in one go.`,
        technical: `Transformer layers are dominated by **GEMMs** (general matrix multiplies): the attention projections and the feed-forward network multiply activations by weight matrices. Each multiply-add is two FLOPs, so a forward pass costs roughly **2 × parameters FLOPs per token**.

Dedicated matrix hardware — NVIDIA **Tensor Cores**, Intel **XMX**, AMD **AI accelerators** (RDNA) and **Matrix Cores** (CDNA), Apple's GPU **neural accelerators** (M5 generation) and the separate **Neural Engine**, plus the NPUs in laptop chips — computes a small tile product per instruction, delivering several times the throughput of ordinary shader lanes at reduced precision.`,
        deep: `Matrix units win twice: more MACs per instruction, and **operand reuse** — each value loaded into the unit participates in many products, raising arithmetic intensity and reducing pressure on registers and caches. Performance therefore depends on keeping them fed: tiling strategies, shared-memory staging, and libraries (cuBLAS, hipBLASLt, oneDNN, MPS) tuned per architecture. A framework op that falls back to non-matrix code paths can run an order of magnitude slower on the same chip.`,
      },
      interactive: "matrix-tiles",
    },
    {
      id: "four-limits",
      title: "Four limits: capacity, bandwidth, compute, software",
      body: {
        simple: `When you run AI on your own computer, four different things can hold you back:

- **Capacity** — is there enough fast memory to hold the model? If not, it may not run at all.
- **Bandwidth** — how fast can the model's numbers be pulled from memory? This usually decides how quickly a chatbot types.
- **Compute** — how much math per second? This decides how fast long prompts or images are processed.
- **Software** — does the AI program you want even support your chip?`,
        technical: `For LLM inference specifically:

- **Weights** ≈ parameters × bytes per parameter (2 for FP16, ~1 for 8-bit, ~0.55–0.6 for 4-bit including scales).
- **KV cache** grows linearly with context length and layer count.
- **Token generation** (decode) reads all weights per token → **bandwidth-bound**; ceiling ≈ bandwidth ÷ model bytes.
- **Prompt processing** (prefill) handles many tokens at once → **compute-bound**.
- **Runtime support** (CUDA, ROCm, Metal/MLX, SYCL/OpenVINO, Vulkan) decides which kernels exist for your hardware.`,
        deep: `These limits shift with batch size. Serving many users at once batches their tokens together, multiplying arithmetic intensity so decode moves from bandwidth-bound toward compute-bound — which is why data-center inference values FLOPS and interconnect while single-user local inference values bandwidth and capacity. Speculative decoding, mixture-of-experts models (which read only some weights per token) and KV-cache quantisation all change the balance again. No single spec captures it.`,
      },
      interactive: "llm-calculator",
    },
    {
      id: "vendors",
      title: "How each company approaches AI",
      body: {
        simple: `- **NVIDIA** builds GPUs with Tensor Cores and, crucially, the **CUDA** software that most AI tools were written for first.

- **Apple** builds chips where the GPU, the Neural Engine and the CPU share a big pool of memory, with software like **MLX** and **Core ML**.
- **AMD** builds GPUs for gaming (Radeon) and for data centers (Instinct), with open-source **ROCm** software.
- **Intel** spreads AI across CPUs, Arc GPUs and NPUs, with **oneAPI** and **OpenVINO** software.

None of them is best at everything. The right choice depends on what you want to run.`,
        technical: `- **NVIDIA**: Tensor Cores from laptops to data centers; one programming model (CUDA) with deep libraries (cuDNN, cuBLAS, TensorRT, NCCL). Consumer VRAM capacity is the usual constraint.

- **Apple**: GPU via Metal/MPS/MLX, Neural Engine via Core ML, CPU via Accelerate — all on unified memory. Large memory configurations hold big models; bandwidth and compute scale with chip tier.
- **AMD**: CDNA/Instinct for data centers (HBM, Matrix Cores), RDNA/Radeon for consumers (AI accelerators), XDNA NPUs in Ryzen AI. ROCm + HIP; support varies by GPU and OS.
- **Intel**: XMX in Arc/Xe GPUs, NPUs in Core Ultra, AMX in Xeon. oneAPI/SYCL and OpenVINO, inference-focused.`,
        deep: `The strategic split is **vertical integration vs portability**. NVIDIA and Apple each own a full stack (hardware → driver → API → libraries) and optimise across it, at the price of lock-in. AMD and Intel lean on open stacks and portability layers (HIP's CUDA-like API, SYCL, Triton, ONNX, Vulkan compute) to lower switching costs. For a buyer this means: hardware specs set the ceiling, but the maturity of the specific path from *your* framework to *that* chip decides how close you get to it.`,
      },
      interactive: "software-stack",
      callout: {
        tone: "myth",
        title: "Common misconception",
        text: "“Macs can't do AI.” Macs run local inference well and are used for ML development; their weak spots are CUDA-only code and large-scale training, not AI in general.",
      },
    },
    {
      id: "npu",
      title: "NPUs and TOPS",
      body: {
        simple: `Many new laptops advertise an **NPU** (neural processing unit) with a number of **TOPS** (trillions of operations per second). NPUs are small, very efficient AI engines — great for background features like blurring your webcam background or live captions without draining the battery.

They're usually not what runs big chatbots or image generators; those still lean on the GPU. And an NPU only helps if the app is written to use it.`,
        technical: `NPUs (Apple Neural Engine, Intel NPU, AMD XDNA, Qualcomm Hexagon) are fixed-function-leaning matrix engines optimised for low-precision inference at a few watts. They are reached through OS-level frameworks (Core ML, Windows ML / ONNX Runtime, OpenVINO) rather than general-purpose GPU APIs, and support a narrower set of operators.

TOPS figures are typically INT8 (sometimes INT4 or sparse) and sometimes summed across NPU + GPU + CPU as "platform TOPS".`,
        deep: `NPU efficiency comes from dataflow architectures that keep weights and activations in local SRAM and minimise DRAM traffic — ideal for small, always-on models, less suitable for multi-gigabyte LLMs whose weights can't stay on-chip. Model compilers must partition graphs, falling back to GPU/CPU for unsupported operators; the fraction that actually lands on the NPU varies by model, so TOPS rarely translate linearly into application speed.`,
      },
      interactive: "tflops-reality",
    },
    {
      id: "train-vs-infer",
      title: "Training vs inference",
      body: {
        simple: `**Training** is teaching a model — it needs huge amounts of memory and math, and is mostly done in data centers. **Inference** is using a finished model — much lighter, and something your own computer can often do.

When you buy a computer "for AI", you're almost always buying it for inference, maybe light fine-tuning. That shifts priorities toward memory capacity, bandwidth and software support rather than raw peak TFLOPS.`,
        technical: `Training stores weights, gradients and optimiser states — a common rule of thumb for mixed-precision Adam is ~16 bytes per parameter before activations, so even a 7B model needs over 100 GB. Techniques like LoRA/QLoRA fine-tune small adapter matrices on a frozen (often quantised) base model, bringing fine-tuning within reach of single GPUs or large-memory Macs. Inference needs only weights plus KV cache.`,
        deep: `Training at scale is communication-bound: gradients must be synchronised across GPUs every step, so interconnect (NVLink, Infinity Fabric, InfiniBand/Ethernet) and collective libraries (NCCL, RCCL) matter as much as per-GPU FLOPS. That's why data-center AI is bought as systems and racks. For individuals, the relevant decisions are VRAM or unified-memory capacity, bandwidth, and whether the training code you want to use runs on the platform without modification.`,
      },
    },
  ],
  quiz: {
    id: "ai-quiz",
    questions: [
      {
        id: "q1",
        prompt: "Generating tokens one at a time from a local LLM is usually limited by…",
        choices: ["CPU clock speed", "Memory bandwidth", "SSD speed", "The number of Tensor Cores"],
        answer: 1,
        explain: "Each token requires reading essentially all weights, so the rate is capped by bandwidth ÷ model size.",
      },
      {
        id: "q2",
        prompt: "Roughly how much memory do the weights of a 14B model need at 4-bit?",
        choices: ["~3.5 GB", "~8 GB", "~28 GB", "~56 GB"],
        answer: 1,
        explain: "14B × ~0.56 bytes ≈ 7.9 GB, plus KV cache and runtime overhead.",
      },
      {
        id: "q3",
        prompt: "Why can software support matter as much as hardware for AI?",
        choices: ["Software makes chips run hotter", "Without optimised kernels and framework support, the hardware's matrix units may not be used at all", "Software determines VRAM size", "It doesn't — only TFLOPS matter"],
        answer: 1,
        explain: "Frameworks reach the hardware through drivers, APIs and libraries. A missing link means slow fallbacks or no support.",
      },
      {
        id: "q4",
        prompt: "An 'AI PC' advertises 50 NPU TOPS. What should you check?",
        choices: ["Nothing, higher TOPS is always better", "The precision, whether the number is sparse, and whether your apps actually use the NPU", "Only the CPU clock", "The SSD size"],
        answer: 1,
        explain: "TOPS figures depend on precision and sparsity, and an NPU helps only software that targets it.",
      },
    ],
  },
  misconceptions: ["nvidia-ai-hardware-only", "macs-no-ai", "more-vram-faster", "unified-infinite", "more-cuda-better"],
  related: ["/ai", "/llm", "/unified-memory", "parallel-computing", "gpu"],
};

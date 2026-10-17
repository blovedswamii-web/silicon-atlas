import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "nvidia",
  number: 11,
  title: "NVIDIA architecture",
  subtitle: "Parallel GPUs, specialised AI and ray tracing units, and the CUDA software platform that made them the default for AI.",
  kind: "gpu",
  minutes: 13,
  sections: [
    {
      id: "what",
      title: "What NVIDIA builds",
      body: {
        simple:
          "NVIDIA is mainly a **graphics card** company. A GeForce RTX card is a part you put into a PC that already has a CPU (from AMD or Intel), memory and storage.\n\nNVIDIA also writes **CUDA**, the software that lets programs use its GPUs for things other than graphics — especially AI. That software is a big part of why NVIDIA matters so much in AI.",
        technical:
          "NVIDIA's products span:\n\n- **GeForce RTX** — consumer desktop cards and laptop GPUs\n- **RTX PRO / workstation** — the same architectures with more VRAM and certified drivers\n- **Datacenter GPUs** (Hopper, Blackwell) with HBM memory and NVLink\n- **Grace** Arm CPUs and Grace-GPU superchips for datacenters\n- complete systems (DGX, and GB10-based DGX Spark)\n- the **CUDA** platform and libraries\n\nOn a desktop PC, an RTX card is a **component**: its scope is the GPU plus its VRAM. Compare it with other graphics cards, not with an entire Mac.",
        deep:
          "NVIDIA's strategy since 2007 has been to make every GPU it sells — from a laptop GeForce to a datacenter accelerator — run the same programming model. That decision created a pipeline: students learned CUDA on gaming cards, researchers wrote papers in CUDA, frameworks optimised for CUDA first, and companies deployed on CUDA hardware. Hardware specs are only half the story; the other half is two decades of libraries, tools, profilers and developer familiarity.",
      },
      interactive: "scope-ladder",
    },
    {
      id: "inside",
      title: "Inside an RTX GPU",
      body: {
        simple:
          "An RTX GPU contains thousands of small math units called **CUDA cores** that work in parallel on pixels or numbers. It also has two kinds of specialist units:\n\n- **Tensor Cores** — very fast at the grid-of-numbers maths (matrix multiplication) that AI uses, and used for DLSS\n- **RT Cores** — speed up ray tracing, which simulates how light bounces\n\nPlus **NVENC/NVDEC** engines for recording and streaming video.",
        technical:
          "The GPU is organised into **Streaming Multiprocessors (SMs)**. Each SM contains FP32/INT32 lanes (marketed as \"CUDA cores\"), **Tensor Cores** for matrix multiply-accumulate, an **RT Core** for BVH traversal and ray-triangle tests, register files, shared memory/L1, and warp schedulers that issue instructions for groups of 32 threads (**warps**).\n\nAll SMs share a large **L2 cache** and the **GDDR memory controllers**. VRAM bandwidth comes from bus width × memory data rate — e.g. a 512-bit GDDR7 bus on the RTX 5090 gives ≈1.8 TB/s.\n\nTensor Cores support progressively lower precisions: FP16/BF16, INT8, FP8 (Ada) and FP4 (Blackwell). Lower precision means more operations per second — and different accuracy tradeoffs.",
        deep:
          "\"CUDA core\" is a marketing unit: one FP32 lane. Its meaning has shifted — Ampere doubled FP32 lanes per SM, so CUDA core counts jumped ~2× while gaming performance rose much less. Never compare CUDA core counts across generations naïvely, let alone with AMD stream processors or Apple GPU cores.\n\nPeak Tensor throughput figures (\"AI TOPS\") are typically quoted at the lowest supported precision and often with **2:4 structured sparsity**, doubling the number. Real throughput depends on whether your model and kernels use that precision and sparsity, and on whether you're compute-bound at all — LLM token generation is usually limited by VRAM bandwidth, not Tensor throughput.\n\nGPUs hide memory latency with massive parallelism: while one warp waits for VRAM, the scheduler runs others. That's the opposite strategy from a CPU, which hides latency with caches, prediction and out-of-order execution. See [CPU vs GPU](/parallel).",
      },
      callout: { tone: "myth", title: "More CUDA cores ≠ automatically better", text: "Within one generation, more CUDA cores generally means a bigger GPU. Across generations or brands, the count tells you little — memory bandwidth, clocks, cache, VRAM and software all matter." },
    },
    {
      id: "vram",
      title: "VRAM and PCIe",
      body: {
        simple:
          "A graphics card has its own memory, **VRAM**, that only the GPU uses. It's extremely fast. Data the GPU needs — textures, 3D scenes, AI models — has to be **loaded into VRAM** first, travelling from the PC's main memory over a connection called **PCIe**.\n\nIf something doesn't fit in VRAM, performance can drop sharply, or the program may refuse to run.",
        technical:
          "The CPU and GPU have separate memories. Data moves CPU RAM → PCIe → VRAM, usually via DMA. PCIe 5.0 x16 offers ≈64 GB/s each way — fast, but an order of magnitude below VRAM bandwidth on high-end cards.\n\nThat makes **VRAM capacity** a hard boundary for many workloads: an LLM's weights, a renderer's scene, or a game's textures at high settings. Spilling over PCIe to system RAM works (e.g. partial offload in llama.cpp) but is much slower. Consumer capacities: typically 8–16 GB mainstream, 24 GB on a 5090 Laptop GPU, 32 GB on a desktop RTX 5090.",
        deep:
          "Discrete VRAM is a deliberate tradeoff: GDDR on a wide bus right next to the GPU gives enormous bandwidth at the cost of capacity, power and price. Unified-memory designs (Apple, AMD Ryzen AI Max, NVIDIA's own GB10) make the opposite trade.\n\nNVIDIA also offers **unified virtual addressing** and managed memory in CUDA, which let software treat CPU and GPU memory as one address space — but physical data still migrates over PCIe, so it's a programming convenience, not the same thing as physically shared memory. On datacenter parts, **NVLink** and Grace's coherent CPU-GPU link narrow the gap considerably.",
      },
      callout: { tone: "warn", title: "16 GB VRAM vs 16 GB unified memory", text: "16 GB of VRAM is dedicated to the GPU, at very high bandwidth, on top of system RAM. 16 GB of unified memory is everything the system has, shared by CPU and GPU." },
    },
    {
      id: "cuda",
      title: "CUDA: why the software matters",
      body: {
        simple:
          "Most AI tools — like PyTorch, which many AI models are built with — were made to work best with CUDA first. When you install a popular AI project, CUDA support is usually the smoothest path.\n\nThat's why people say NVIDIA has an AI advantage: it's not only the chips, it's that **so much software already works** with them.",
        technical:
          "The CUDA stack: driver → CUDA runtime and compiler (NVCC, PTX) → libraries (**cuBLAS** for linear algebra, **cuDNN** for neural-network primitives, **TensorRT** for optimised inference, **NCCL** for multi-GPU communication, **cuSPARSE**, **Thrust**, …) → frameworks (PyTorch, JAX, TensorFlow) → applications.\n\nNew research — attention kernels, quantisation formats, training tricks — is usually released with CUDA kernels first. Ports to ROCm, Metal or oneAPI may follow later. That lag is the practical meaning of \"ecosystem advantage\".",
        deep:
          "CUDA's moat is partly technical (mature compilers, profilers like Nsight, deep library optimisation per architecture) and partly social (developer familiarity, existing codebases, tutorials, hiring). Competitors attack it by translation (HIP, SYCLomatic), by targeting higher-level layers (PyTorch backends, Triton, ONNX, MLX), and by making their own hardware cheaper or larger in memory.\n\nFor a buyer the question isn't \"is NVIDIA hardware better\" but \"does the software I need run well on this hardware?\" For mainstream PyTorch inference that question increasingly has multiple good answers; for custom CUDA research code, multi-GPU training at scale, or CUDA-only pro applications, NVIDIA is often the path of least resistance. See the [software stack explorer](/ai).",
      },
    },
    {
      id: "laptop",
      title: "Desktop vs laptop GPUs with the same name",
      body: {
        simple:
          "An \"RTX 5090 Laptop GPU\" is **not** a desktop RTX 5090 squeezed into a laptop. It's a smaller chip with less memory, running on a fraction of the power, and its speed depends on how much power and cooling the laptop maker gives it.",
        technical:
          "The desktop RTX 5090 has 21,760 CUDA cores, 32 GB of GDDR7 and a 575 W power rating. The RTX 5090 Laptop GPU has 10,496 CUDA cores, 24 GB of GDDR7, and a laptop-maker-configured power limit around 95–150 W plus boost. Two laptops with the same GPU name can differ substantially because of their **TGP** and cooling.\n\nThe decoder below shows how names encode tier and form factor — and why they're not performance scales.",
        deep:
          "Power is the dominant constraint in laptops: performance scales sub-linearly with power, so a laptop GPU at 150 W retains much more than 150/575 of a desktop card's performance, but it cannot match it. Laptop GPUs also often drop power on battery. When comparing laptops, look for the configured TGP and for reviews of that exact model.",
      },
      interactive: "name-decoder",
    },
    {
      id: "gens",
      title: "Generations: what changed",
      body: {
        simple:
          "Each RTX generation (20, 30, 40, 50) has added faster AI units, better ray tracing and new features like frame generation. Instead of memorising names, look at **what changed**.",
        technical:
          "Turing (RTX 20) introduced RT and Tensor Cores; Ampere (RTX 30) doubled FP32 per SM; Ada (RTX 40) added a much larger L2, FP8 and DLSS 3 frame generation; Blackwell (RTX 50) brought GDDR7, FP4 and DLSS 4 multi-frame generation.",
        deep:
          "Many generation-to-generation gains come from **features** that only help when software uses them — DLSS frame generation, FP8/FP4 inference, AV1 encode. Judge a new generation by whether your workloads use the new features, not by headline TOPS.",
      },
      interactive: "generation-timeline-nvidia",
    },
  ],
  quiz: {
    id: "nvidia-quiz",
    questions: [
      {
        id: "q1",
        prompt: "What do Tensor Cores accelerate?",
        choices: ["Ray-triangle intersection", "Matrix multiplication for AI (and DLSS)", "Video encoding", "SSD access"],
        answer: 1,
        explain: "Tensor Cores perform matrix multiply-accumulate at reduced precision — the core operation of neural networks.",
      },
      {
        id: "q2",
        prompt: "Why is NVIDIA often the default for AI research?",
        choices: ["Its GPUs are the only ones that can multiply matrices", "CUDA's software ecosystem — most frameworks and research code target it first", "It has the most VRAM of any computer", "Apple and AMD GPUs can't run neural networks"],
        answer: 1,
        explain: "Hardware matters, but the deciding factor is often that software already works and is optimised on CUDA.",
      },
      {
        id: "q3",
        prompt: "An LLM's weights don't fit in your 12 GB of VRAM. What happens?",
        choices: ["It runs exactly as fast", "It may run with partial offload over PCIe to system RAM, much more slowly — or not at all", "The GPU automatically grows its VRAM", "It runs faster because RAM is bigger"],
        answer: 1,
        explain: "VRAM capacity is a hard boundary. Offloading layers to system RAM is possible in some tools but much slower.",
      },
      {
        id: "q4",
        prompt: "An 'RTX 5090 Laptop GPU' compared with a desktop RTX 5090 is…",
        choices: ["Identical", "A different, smaller configuration at much lower power", "Faster because laptops are newer", "The same chip with a different cooler"],
        answer: 1,
        explain: "Same name, different product: fewer CUDA cores, less VRAM, and a power limit set by the laptop maker.",
      },
    ],
  },
  misconceptions: ["more-cuda-better", "nvidia-ai-hardware-only", "more-vram-faster", "stream-vs-cuda"],
  related: ["/companies/nvidia", "/ai", "/llm", "gpu", "parallel-computing"],
};

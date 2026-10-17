import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "unified-memory",
  number: 13,
  title: "Unified memory",
  subtitle: "Why Apple Silicon's CPU and GPU share one pool of memory — what that changes, what it doesn't, and why 16 GB unified ≠ 16 GB VRAM.",
  kind: "memory",
  minutes: 12,
  sections: [
    {
      id: "two-models",
      title: "Two ways to give a GPU memory",
      body: {
        simple: `In a typical gaming PC, the CPU and the graphics card each have their **own** memory. The CPU uses system RAM; the graphics card uses its VRAM. When the GPU needs something the CPU prepared, it has to be **copied** across a connection called PCIe.

In an Apple Silicon Mac, there is only **one** pool of memory, and the CPU, GPU, Neural Engine and video engines all use it. Apple calls this **Unified Memory Architecture**. Nothing needs to be copied between "CPU memory" and "GPU memory", because there's only one.`,
        technical: `**Discrete model**: system DRAM (DDR5, ~60–100 GB/s on a dual-channel desktop) attached to the CPU's memory controller; GDDR VRAM (hundreds of GB/s to well over 1 TB/s) attached to the GPU; a PCIe link between them (~32 GB/s per direction for PCIe 4.0 ×16, ~64 GB/s for PCIe 5.0). Data the GPU needs must be resident in VRAM, so drivers and applications **stage** it across PCIe.

**Unified model**: LPDDR memory packaged next to the SoC, reached by every on-chip engine through a shared memory controller and a large system-level cache. One physical address space; buffers can be shared between CPU and GPU without duplication. Bandwidth scales with the chip tier because higher tiers get wider memory buses.`,
        deep: `"Unified" describes topology and addressing, not speed. What it removes is the **PCIe hop and the duplicate copy**; what it keeps is ordinary DRAM physics (latency on the order of 100 ns), plus the need for **coherence and synchronisation** — CPU and GPU still have private caches and must agree on when a buffer is safe to read.

PCs have converged partly toward the same place in software: CUDA Unified Memory, Resizable BAR, and DirectX/Vulkan host-visible heaps let programs *address* memory across devices. But on a discrete system those accesses still physically travel across PCIe, so the performance model differs even when the programming model looks similar.`,
      },
      interactive: "unified-memory-viz",
    },
    {
      id: "what-it-means",
      title: "What it actually changes",
      body: {
        simple: `Three practical effects:

- **The GPU can use lots of memory.** On a Mac with 64 GB, the GPU can use a large share of it — much more than most graphics cards have. That's why Macs can load surprisingly large AI models.
- **Less copying.** Apps that pass data back and forth between CPU, GPU and video engines waste less time and energy.
- **One budget.** Your browser, your apps and the GPU all share the same memory. Fill it up and everything slows down together.`,
        technical: `Benefits are largest for workloads that (a) need more GPU-visible memory than a typical card provides — large ML models, huge 3D scenes, long video timelines — or (b) bounce data between engines, such as video pipelines (decode on the media engine → effects on the GPU → encode) and ML pre/post-processing on the CPU.

Workloads that upload data once and then run entirely on the GPU (most games, many render jobs) benefit less from avoiding copies; for them, GPU compute and memory **bandwidth** dominate.`,
        deep: `macOS doesn't let the GPU take everything: Metal reports a recommended maximum working-set size, commonly observed at roughly two-thirds to three-quarters of physical RAM depending on configuration, and advanced users can raise the wired limit. Everything above that competes with the OS's file cache, compressed memory and application memory. Under pressure macOS compresses pages, then swaps to the SSD — viable for apps, disastrous for a GPU working set that's touched every frame or every token.`,
      },
      interactive: "memory-pressure",
    },
    {
      id: "not-the-same",
      title: "16 GB unified is not 16 GB VRAM",
      body: {
        simple: `These two numbers look identical, but they describe different things.

16 GB of **VRAM** belongs entirely to the graphics card, and the PC has its own separate RAM for everything else. 16 GB of **unified memory** is shared by the whole computer — the operating system and apps take their share first, so the GPU might comfortably use around 10 GB.

On the other hand, a Mac with 64 GB of unified memory can give its GPU far more than a 16 GB graphics card ever could. Neither is simply "better" — it depends on what you're doing.`,
        technical: `Compare like with like:

- **GPU-usable capacity**: VRAM minus a small driver/display reservation, versus unified memory minus OS + apps, subject to the GPU working-set limit.
- **Bandwidth**: VRAM bandwidth of the card, versus the unified-memory bandwidth of the specific chip tier (which varies several-fold between base and Max/Ultra chips).
- **Compute**: the GPU's throughput, which is independent of how much memory it has.
- **Upgradeability**: desktop system RAM is often upgradeable and the whole graphics card can be replaced; unified memory is fixed for the life of the machine.`,
        deep: `A useful mental model is **two thresholds**. On a discrete system there's a hard cliff at VRAM capacity — beyond it the working set spills over PCIe — and a separate, softer cliff at system RAM. On a unified system there's a single, softer cliff where the whole machine runs out. Discrete systems give predictable isolation; unified systems give flexibility. For [LLM inference](/llm), capacity determines *whether* a model fits on the accelerator, while bandwidth sets the ceiling on tokens per second — so "fits on a Mac" and "runs faster on a GPU" can both be true for different models.`,
      },
      callout: {
        tone: "myth",
        title: "Common misconception",
        text: "“Unified memory means infinite GPU memory.” It is one finite pool, shared with the OS and apps, capped by default for the GPU, and impossible to upgrade later.",
      },
    },
    {
      id: "elsewhere",
      title: "Not just Apple",
      body: {
        simple: `Sharing memory between CPU and GPU isn't new. Every laptop with integrated graphics does it, and game consoles have done it for years. What Apple did was make it big and fast: wide memory connections and large capacities, with the whole operating system designed around it.

Some newer PC chips — like AMD's Ryzen AI Max and NVIDIA's GB10-based mini workstations — follow a similar recipe.`,
        technical: `Shared memory exists on: every Intel and AMD integrated GPU (usually on a narrower, slower bus); AMD Ryzen AI Max ("Strix Halo") with a wide LPDDR5X bus and up to 128 GB; NVIDIA's GB10-based systems with a single large LPDDR5X pool; PlayStation and Xbox consoles with shared GDDR. Apple's distinction is **scale** (bandwidth and capacity on higher tiers), **integration** (memory on the package, every engine on one die or tightly packaged dies) and a **software model** — Metal, MLX, Core ML — that assumes it everywhere.`,
        deep: `The convergence is driven by AI: large models need more accelerator-visible memory than discrete consumer cards ship with, and putting a big GPU next to a big LPDDR pool is cheaper per GB than HBM or GDDR. The tradeoff is bandwidth per GB: LPDDR buses deliver hundreds of GB/s, while HBM-based data-center accelerators deliver several TB/s. Expect both topologies to coexist, each serving the workloads whose bottleneck it relieves.`,
      },
    },
  ],
  quiz: {
    id: "um-quiz",
    questions: [
      {
        id: "q1",
        prompt: "What does unified memory primarily remove compared with a discrete-GPU PC?",
        choices: ["DRAM latency", "The separate GPU memory pool and the PCIe copies between pools", "The need for caches", "The CPU's memory controller"],
        answer: 1,
        explain: "One pool means no duplicate copy in VRAM and no PCIe hop. DRAM latency and caches are still there.",
      },
      {
        id: "q2",
        prompt: "Why might a 64 GB Mac load a model that a 16 GB graphics card can't?",
        choices: ["Apple GPUs are always faster", "The GPU can use a large share of the 64 GB pool, far exceeding 16 GB", "Macs compress models automatically", "Unified memory has no limits"],
        answer: 1,
        explain: "It's a capacity advantage. Whether it then runs faster depends on bandwidth, compute and software.",
      },
      {
        id: "q3",
        prompt: "Which statement about unified memory is true?",
        choices: ["It can be upgraded later", "It is exclusive to Apple", "Apps, the OS and the GPU compete for the same pool", "It doubles memory bandwidth"],
        answer: 2,
        explain: "One pool means one budget. It's fixed at purchase, exists elsewhere too, and bandwidth depends on the chip.",
      },
    ],
  },
  misconceptions: ["unified-same-as-ram", "unified-infinite", "more-ram-faster", "igpu-weak"],
  related: ["/unified-memory", "/llm", "apple-silicon", "memory-hierarchy", "/platforms"],
};

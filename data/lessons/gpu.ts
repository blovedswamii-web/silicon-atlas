import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "gpu",
  number: 6,
  title: "The GPU",
  subtitle: "A processor built for doing the same simple thing to millions of pieces of data at once — first for pixels, now for AI.",
  kind: "gpu",
  minutes: 14,
  sections: [
    {
      id: "what",
      title: "What a GPU is for",
      body: {
        simple: `A **GPU** (graphics processing unit) is a second kind of processor. Where a CPU is a small team of very clever workers, a GPU is a stadium full of simpler workers who all follow the same instructions at the same time.

That is perfect for graphics: a 4K screen has about 8.3 million pixels, and each one needs roughly the same small calculation, dozens or hundreds of times per second. It turned out to be perfect for AI too, because neural networks are mostly huge grids of multiplications.`,
        technical: `A GPU is a **throughput-oriented** processor. It devotes most of its transistors to arithmetic units and to keeping many threads in flight, and comparatively few to the features that make a single thread fast (big caches per thread, aggressive branch prediction, deep out-of-order execution).

Work is expressed as a **kernel** or **shader**: a small program run over a large grid of data elements — pixels, vertices, matrix entries, particles. The hardware groups threads into bundles that share an instruction stream (NVIDIA *warps*, AMD *wavefronts*, Intel *sub-groups*, Apple *SIMD-groups*) and executes them in lockstep across many lanes.

GPUs come in two physical forms: **integrated** (on the same chip as the CPU, sharing memory — every Apple Silicon Mac, most laptops) and **discrete** (a separate chip with its own VRAM, connected over [PCIe](/learn/motherboard-pcie)).`,
        deep: `The defining design choice is **latency hiding through parallelism**. A CPU core tries hard never to stall: caches, prefetchers and out-of-order windows exist to avoid waiting ~100 ns for DRAM. A GPU instead *expects* to wait — global-memory accesses can take several hundred cycles — and keeps enough independent thread bundles resident that a scheduler can issue from a ready one every cycle. That is why GPUs have enormous register files (tens of thousands of registers per compute unit) and why **occupancy** — how many bundles fit at once — is a core performance concept.

The execution model is usually called **SIMT** (single instruction, multiple threads): code is written per thread, but hardware runs bundles of 32 (or 64, or 8–32 on Intel) threads with one instruction stream and a per-lane mask. When threads in a bundle take different branches, the bundle executes both paths with lanes masked off — **divergence**. Memory accesses from a bundle are **coalesced** when adjacent lanes touch adjacent addresses.

Modern GPUs also contain specialised blocks beside the general lanes: **matrix units** (Tensor Cores, XMX, AI/Matrix accelerators), **ray-tracing units**, **texture units**, **rasterisers**, and separate **video encode/decode engines**. Peak figures for each block differ wildly, which is why a single "TFLOPS" number is never the full story.`,
      },
      interactive: "parallel-pixels",
    },
    {
      id: "inside",
      title: "Inside a GPU: same idea, four vocabularies",
      body: {
        simple: `Every GPU is built by copying one building block many times. NVIDIA calls it an **SM**, AMD a **Compute Unit**, Intel an **Xe core** and Apple a **GPU core**.

The tricky part: companies *count* differently. NVIDIA advertises thousands of "CUDA cores" (tiny math lanes), while Apple advertises tens of "GPU cores" (whole building blocks). Comparing those two numbers is like comparing the number of seats on a bus with the number of buses in a fleet.`,
        technical: `The hierarchy, vendor by vendor:

- NVIDIA: GPU → GPCs → **SMs** → processing blocks → FP32 lanes marketed as **CUDA cores**, plus **Tensor Cores** and an **RT core** per SM.
- AMD (RDNA): GPU → Shader Engines → **WGPs** (pairs of CUs) → **Compute Units** with two SIMD32 units → lanes marketed as **stream processors**, plus a **Ray Accelerator** per CU and AI accelerators since RDNA 3.
- Intel (Xe): GPU → render slices → **Xe cores** with **vector engines** and **XMX** matrix engines, plus a **Ray Tracing Unit** per Xe core.
- Apple: SoC → GPU → **GPU cores** (each with many ALUs, not marketed as a count) running **SIMD-groups of 32**; hardware ray tracing from M3; neural accelerators in M5-generation GPU cores; the Neural Engine is a separate block.

Counts are meaningful only *within* one vendor's architecture generation, and even then clock speed, memory bandwidth and power limits change the result.`,
        deep: `Even within one company, "a core" is redefined over time. NVIDIA doubled FP32 lanes per SM in one generation by letting a datapath execute either FP32 or INT32, which doubled the marketed CUDA-core count without doubling real-world performance. AMD's RDNA 3 introduced **dual-issue** for some FP32 operations, doubling peak FP32 on paper when the compiler can pair independent instructions. Intel's compiler picks SIMD8/16/32 per shader, trading parallelism for register space. Apple's GPUs are **tile-based deferred renderers** descended from mobile designs, which changes how much memory bandwidth a given frame consumes — a property no lane count captures.

So the only honest way to compare across vendors is to measure the workload you care about, at the power level you'll actually run, with the software you'll actually use.`,
      },
      interactive: "gpu-terms",
      callout: {
        tone: "myth",
        title: "Common misconception",
        text: "“10,000 CUDA cores beats 40 GPU cores.” These numbers count different things. Neither tells you which GPU is faster for your work.",
      },
    },
    {
      id: "graphics",
      title: "How a GPU draws a frame",
      body: {
        simple: `To draw a 3D game, the GPU takes millions of tiny triangles, works out where they land on your screen, and colours in every pixel they cover. That's called **rasterization**.

**Ray tracing** works the other way round: for each pixel, it follows a ray of light into the scene to see what it hits and whether that spot is in shadow. It looks more realistic but costs far more work, so modern GPUs include special ray-tracing hardware.`,
        technical: `A raster pipeline runs roughly: **vertex shading** (transform each vertex into screen space) → **rasterisation** (find covered pixels; fixed-function hardware) → **pixel/fragment shading** (compute colour, often sampling textures) → **depth test and blending** → write to the frame buffer in VRAM.

Ray tracing replaces or augments parts of this with ray queries against a **BVH** (bounding volume hierarchy) — a tree of boxes around the scene's triangles. RT hardware accelerates BVH traversal and ray–triangle intersection. Games typically trace only a few rays per pixel for specific effects (reflections, shadows, global illumination) and use **denoisers** and **upscalers** (DLSS, FSR, XeSS, MetalFX) to rebuild a clean full-resolution image.`,
        deep: `Two architectural families exist. **Immediate-mode** renderers (traditional desktop GPUs) process triangles in submission order and rely on large caches and high VRAM bandwidth for the frame buffer. **Tile-based deferred renderers** (Apple, and most mobile GPUs) first bin triangles into screen tiles, then shade each tile entirely in on-chip tile memory, writing the finished tile to DRAM once. TBDR saves a large amount of memory traffic — valuable when memory is shared with the CPU — but behaves differently with certain techniques, which is one reason ports from PC to Mac need real engineering.

Ray tracing stresses GPUs differently from rasterisation: rays scatter, so memory access is incoherent and threads in a bundle diverge. Hardware differs in how much of traversal is fixed-function versus shader code, and in features like ray reordering that regroup similar rays to restore coherence.`,
      },
      interactive: "raster-vs-rt",
    },
    {
      id: "vram",
      title: "VRAM: the GPU's own memory",
      body: {
        simple: `A graphics card has its own memory called **VRAM**. It holds textures, 3D models, the image being drawn and — for AI — the model's weights.

VRAM is very fast, but there's a fixed amount. If a game or AI model needs more than the card has, the extra has to come from the computer's normal RAM over a much slower connection, and things slow down sharply.`,
        technical: `Discrete GPUs use **GDDR** memory (GDDR6, GDDR7) on a wide bus, or **HBM** stacked memory on data-center parts. Bandwidth = bus width × data rate: a 256-bit bus at an effective ~30 Gbps per pin gives roughly 960 GB/s — about ten times a dual-channel DDR5 desktop.

**Capacity** and **bandwidth** are separate properties. Capacity decides whether the working set fits; bandwidth decides how fast the GPU can stream it. More VRAM does not make a GPU faster when the workload already fits. Integrated GPUs, including Apple's, have no VRAM: they use system or [unified memory](/unified-memory).`,
        deep: `When a working set exceeds VRAM, drivers and APIs evict resources to system memory and fetch them back over PCIe on demand. A PCIe 4.0 ×16 link moves roughly 32 GB/s per direction (PCIe 5.0 about 64 GB/s) — an order of magnitude below VRAM — so oversubscription shows up as stutter in games and as dramatic slowdowns in compute. Large on-die caches (AMD's Infinity Cache, NVIDIA's enlarged L2) reduce how often the GPU must go to VRAM at all, which is why bus width alone no longer predicts effective bandwidth.

For AI, VRAM capacity is frequently the deciding spec: see the [LLM memory calculator](/llm).`,
      },
      callout: {
        tone: "myth",
        title: "Common misconception",
        text: "“More VRAM = faster GPU.” Extra VRAM only helps if your workload needs it. A GPU with more VRAM but less compute and bandwidth can be slower on everything that fits.",
      },
    },
    {
      id: "integrated",
      title: "Integrated vs discrete",
      body: {
        simple: `An **integrated** GPU lives on the same chip as the CPU and shares its memory. A **discrete** GPU is a separate chip — usually a graphics card — with its own memory and its own power budget.

Integrated used to mean "weak". That's no longer automatically true: Apple's Max-tier chips and AMD's Ryzen AI Max contain large integrated GPUs. But the biggest discrete GPUs still have far more power, cooling and memory bandwidth to work with.`,
        technical: `Discrete GPUs can draw hundreds of watts on their own and have dedicated high-bandwidth VRAM; integrated GPUs share a power and thermal budget with the CPU and use the system's memory bus. That makes integrated designs efficient (no PCIe hop, no duplicate memory, lower idle power) but bounded by the memory bus they share.

How strong an integrated GPU is depends almost entirely on how much silicon and memory bandwidth the chip designer gave it — which ranges from basic display output to workstation class.`,
        deep: `The integrated/discrete line is really about **packaging and memory topology**, not capability. Large SoCs pair big GPUs with wide LPDDR buses on-package (hundreds of GB/s) and gain the ability to address tens or hundreds of GB from the GPU. Discrete cards win on peak bandwidth per GPU, sustained power, and upgradeability of the GPU itself, and lose on capacity per dollar and on CPU↔GPU transfer costs. Which matters more depends on the workload — exactly the tradeoff explored in [Run a Program](/run) and the [Bottleneck Lab](/bottleneck-lab).`,
      },
    },
  ],
  quiz: {
    id: "gpu-quiz",
    questions: [
      {
        id: "q1",
        prompt: "Why is a GPU good at shading pixels?",
        choices: ["Each core is faster than a CPU core", "Millions of pixels need the same small calculation, which can run in parallel", "It has more cache per thread", "It runs at a higher clock speed"],
        answer: 1,
        explain: "GPUs win on throughput: lots of independent, similar work. Individual GPU lanes are simpler and usually clocked lower than CPU cores.",
      },
      {
        id: "q2",
        prompt: "An NVIDIA GPU lists 10,000 CUDA cores; an Apple chip lists 40 GPU cores. What can you conclude?",
        choices: ["NVIDIA is 250× faster", "Apple is faster per core", "Nothing about relative speed — they count different things", "They are equivalent"],
        answer: 2,
        explain: "CUDA cores are FP32 lanes; Apple GPU cores are whole building blocks with many ALUs each. Measure the workload instead.",
      },
      {
        id: "q3",
        prompt: "What happens when a game needs more texture data than the card's VRAM holds?",
        choices: ["The GPU compresses it with no cost", "Data spills to system RAM and is fetched over PCIe, causing slowdowns", "The CPU renders the frame instead", "Nothing — VRAM is virtual"],
        answer: 1,
        explain: "PCIe is roughly an order of magnitude slower than VRAM, so oversubscription shows up as stutter.",
      },
      {
        id: "q4",
        prompt: "What does divergence mean on a GPU?",
        choices: ["Threads in one warp/wave take different branches, so the group runs both paths", "Two GPUs disagree on a result", "The GPU clock speeds up and slows down", "Data is split across VRAM and RAM"],
        answer: 0,
        explain: "Lanes in a bundle share one instruction stream; different branches are executed one after another with lanes masked off.",
      },
    ],
  },
  misconceptions: ["more-cuda-better", "stream-vs-cuda", "apple-cores-vs-cuda", "more-vram-faster", "igpu-weak", "dgpu-better"],
  related: ["/parallel", "parallel-computing", "/unified-memory", "/llm", "/specs"],
};

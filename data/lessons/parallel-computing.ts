import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "parallel-computing",
  number: 7,
  title: "Parallel computing",
  subtitle: "Why splitting work across many workers is powerful, when it fails, and how to read the throughput numbers on a spec sheet.",
  kind: "gpu",
  minutes: 13,
  sections: [
    {
      id: "latency-throughput",
      title: "Latency vs throughput",
      body: {
        simple: `There are two ways to be "fast". **Latency** is how quickly one job gets done. **Throughput** is how many jobs get done per second.

A sports car has low latency: it gets one person across town quickly. A bus has high throughput: it moves fifty people at once, more slowly. CPUs are sports cars. GPUs are a fleet of buses.

Which one is "faster" depends entirely on whether you need to move one person or a crowd.`,
        technical: `CPU cores optimise **single-thread latency**: high clocks (often 5 GHz+ on desktops), wide out-of-order execution, accurate branch prediction and multi-megabyte caches. GPUs optimise **aggregate throughput**: thousands of simpler lanes at lower clocks (roughly 1.5–3 GHz), with latency hidden by switching between many resident thread bundles.

Most real applications contain both kinds of work. A game's simulation, AI and draw-call submission are latency-bound CPU work; its pixel shading is throughput-bound GPU work. Neither processor replaces the other.`,
        deep: `**Amdahl's law** bounds the speed-up from parallel hardware: if a fraction *p* of a program can be parallelised, the best possible speed-up with *N* workers is 1 / ((1 − p) + p / N). With p = 0.9, even infinite workers give at most 10×. That serial 10% is why single-thread CPU performance still matters in "GPU" workloads such as games and data pipelines.

**Gustafson's law** offers the optimistic counterpart: as hardware grows, people grow the problem (higher resolution, bigger models), so the parallel fraction rises. GPUs thrive precisely because graphics and AI scale this way.`,
      },
      interactive: "parallel-pixels",
    },
    {
      id: "simt",
      title: "Lockstep: warps, wavefronts and SIMD",
      body: {
        simple: `GPU workers march in squads. Everyone in a squad does the same step at the same time. If half the squad needs to turn left and half right, the squad does the left turn first (while the others wait), then the right turn.

So GPUs love work where everyone does the same thing, and they waste effort when the work is full of "if this, do that" decisions.`,
        technical: `Every GPU vendor executes threads in fixed-width groups: **warps** of 32 (NVIDIA), **wavefronts** of 32 or 64 (AMD RDNA), **sub-groups** of 8/16/32 chosen by the compiler (Intel), **SIMD-groups** of 32 (Apple). CPUs use the same principle in their vector units (SSE/AVX on x86, NEON/SVE on ARM), just narrower and explicitly programmed.

When threads in a group branch differently, the hardware masks off lanes and runs each path in turn — **branch divergence**. When neighbouring threads read neighbouring memory addresses, accesses merge into a few wide transactions — **coalescing**. Divergence and uncoalesced memory access are the two classic reasons GPU code underperforms its peak.`,
        deep: `Group width is a tradeoff. Wider groups amortise instruction fetch and scheduling over more lanes but suffer more from divergence and partial groups at the edges of data. Narrower groups waste less but need more scheduling hardware. AMD exposes both wave32 and wave64 on RDNA; Intel lets the compiler choose per kernel, trading SIMD width against register-file pressure.

Modern NVIDIA GPUs give each thread its own program counter (independent thread scheduling), which makes certain synchronisation patterns legal, but execution is still most efficient when a warp stays converged. In the visualisation above, turn on the branchy shader and compare wave32 with wave64 to see utilisation drop as groups straddle the sphere's edge.`,
      },
      callout: {
        tone: "info",
        title: "Try it",
        text: "Switch to Radeon, pick wave64, and enable the branchy shader. Watch the 'lanes doing useful work' figure fall.",
      },
    },
    {
      id: "precision",
      title: "Number formats: FP32 down to FP4",
      body: {
        simple: `Computers store numbers with a fixed number of bits. More bits means more precise numbers; fewer bits means smaller, faster math.

Graphics usually uses 32-bit numbers. AI has discovered that neural networks still work well with 16, 8 or even 4 bits per number — which means less memory and much more math per second. That's why AI spec sheets quote so many different numbers.`,
        technical: `A floating-point number has a **sign**, an **exponent** (range) and a **mantissa** (precision). FP32 is 1+8+23 bits. FP16 keeps 10 mantissa bits but only 5 exponent bits, so it overflows above 65,504. **BF16** keeps FP32's 8-bit exponent with only 7 mantissa bits — same range, less precision — which made it the default for training. **FP8** (E4M3/E5M2) and **FP4** need per-block scale factors. **INT8** and **INT4** are integers plus a scale, used for quantised inference.

Halving the bits roughly halves memory and bandwidth needs and roughly doubles peak matrix throughput — on hardware that supports the format.`,
        deep: `Low-precision formats work because neural networks are tolerant of noise and because modern schemes scale small blocks of values independently (micro-scaling formats such as MXFP8/MXFP4, or the per-group scales used by GGUF and MLX quantisation). The engineering problem is keeping **outliers** representable: a single large activation can force a coarse scale that crushes everything else in its block.

Support is generation-specific. A GPU without native FP8 or FP4 paths may still *run* such models by converting to FP16 on the fly — saving memory and bandwidth but not gaining the doubled math rate. That nuance is invisible in a single TOPS figure.`,
      },
      interactive: "precision-formats",
    },
    {
      id: "tflops",
      title: "What TFLOPS and TOPS really measure",
      body: {
        simple: `**TFLOPS** means trillions of floating-point operations per second. It's calculated, not measured: number of math units × operations each can do per tick × ticks per second.

That makes it a ceiling, not a promise. Real programs spend lots of time waiting for data, and marketing numbers often use the most flattering assumptions — lowest precision, highest clock, special tricks — to make the number bigger.`,
        technical: `Peak FLOPS = lanes × ops per lane per clock × clock. A fused multiply-add counts as 2 operations, so a GPU with 10,000 FP32 lanes at 2.5 GHz is quoted at 50 TFLOPS FP32. Matrix units are quoted separately and per precision; numbers with **2:4 structured sparsity** are doubled relative to dense math. NPU and "AI PC" figures are usually **INT8 TOPS**, sometimes summed across CPU, GPU and NPU.

Always ask: which precision, dense or sparse, which unit, at what clock and power?`,
        deep: `The **roofline model** explains why peak compute often doesn't matter. Each kernel has an **arithmetic intensity** — operations per byte moved from memory. Attainable performance is min(peak compute, bandwidth × intensity). Large matrix multiplies have high intensity and approach the compute roof. LLM token generation at batch size 1 has intensity of roughly 1–2 operations per byte of weights, so it sits far under the bandwidth roof — which is why [memory bandwidth predicts tokens per second](/llm) much better than TFLOPS does.`,
      },
      interactive: "tflops-reality",
      callout: {
        tone: "warn",
        title: "Careful",
        text: "Two TOPS numbers are only comparable if they use the same precision, the same sparsity assumption and the same set of engines.",
      },
    },
    {
      id: "beyond-gpus",
      title: "Parallelism everywhere",
      body: {
        simple: `GPUs aren't the only parallel hardware. CPUs have several cores and each core can do several numbers at once. NPUs (neural processing units) are small, efficient engines built only for AI math. And whole data centers connect thousands of GPUs together.

Each level of parallelism has the same catch: it only helps if the work can be split up and the data can get to the workers fast enough.`,
        technical: `Levels of parallelism, from smallest to largest:

- **Instruction-level**: a CPU core executes several independent instructions per clock.
- **Data-level (SIMD)**: one instruction processes a vector of values (AVX, NEON, GPU lanes).
- **Thread-level**: multiple cores, SMT threads, GPU thread bundles.
- **Accelerator-level**: dedicated matrix units, NPUs, media engines.
- **System-level**: multiple GPUs or machines linked by NVLink, Infinity Fabric, Ethernet or InfiniBand.`,
        deep: `As you move up the levels, **communication** dominates. Within a core, operands move through registers in a cycle. Across cores, through caches in tens of cycles. Across a PCIe bus, microseconds. Across machines, many microseconds to milliseconds. Large-scale AI training is therefore as much a networking and memory problem as a compute problem — which is why data-center platforms are sold as integrated systems of GPUs, high-bandwidth memory and interconnect rather than as individual chips.`,
      },
    },
  ],
  quiz: {
    id: "parallel-quiz",
    questions: [
      {
        id: "q1",
        prompt: "90% of a program can run in parallel. What's the maximum speed-up with unlimited workers?",
        choices: ["Unlimited", "90×", "10×", "2×"],
        answer: 2,
        explain: "Amdahl's law: the serial 10% always remains, so the speed-up can never exceed 1 / 0.1 = 10×.",
      },
      {
        id: "q2",
        prompt: "Why does BF16 suit training better than FP16?",
        choices: ["It's more precise", "It has the same exponent range as FP32, so values rarely overflow", "It uses fewer bits", "It's an integer format"],
        answer: 1,
        explain: "BF16 trades mantissa bits for FP32's 8-bit exponent, avoiding the overflow problems of FP16's 5-bit exponent.",
      },
      {
        id: "q3",
        prompt: "A spec sheet quotes '400 TOPS (INT4, sparse)'. Another quotes '100 TOPS (INT8, dense)'. Which is faster?",
        choices: ["The 400 TOPS chip, 4×", "The 100 TOPS chip", "Can't tell — the two numbers use different precision and sparsity assumptions", "They're identical"],
        answer: 2,
        explain: "INT4 and sparsity can each double the headline. Normalised, these could be the same hardware. Real speed depends on your model and software.",
      },
    ],
  },
  misconceptions: ["more-cores-faster", "more-cuda-better", "stream-vs-cuda"],
  related: ["/parallel", "gpu", "ai-hardware", "/llm"],
};

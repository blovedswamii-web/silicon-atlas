import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "memory-hierarchy",
  number: 3,
  title: "The memory hierarchy",
  subtitle: "Registers, caches, RAM, VRAM, unified memory and storage — why computers need all of them, and why latency and bandwidth are different things.",
  kind: "cache",
  minutes: 13,
  sections: [
    {
      id: "why",
      title: "Why there isn't just one memory",
      body: {
        simple: `Imagine a chef. Ingredients in hand are instant (**registers**). The counter holds a few more (**L1 cache**). The fridge is a few steps away (**L2/L3 cache**). The pantry down the hall takes a while (**RAM**). The supermarket across town is a real trip (**SSD**).

You can't build a counter the size of a supermarket — and if you did, it would take just as long to walk across. So computers stack many memories: tiny and instant at the top, huge and slow at the bottom. The trick is keeping what you need right now near the top.`,
        technical: `Memory technologies trade **speed, capacity, cost and power**. SRAM (used for registers and caches) is fast but takes six transistors per bit; DRAM uses one transistor and a capacitor per bit — dense and cheap, but slower and needs refreshing; NAND flash (SSDs) is denser still and keeps data without power, but is orders of magnitude slower again.

Physical distance matters too: signals take time to cross a chip, and larger arrays need more decoding. That's why L1 caches stay at tens of KB even as transistor budgets grow — a bigger L1 would be a slower L1.`,
        deep: `The hierarchy works because of **locality**: programs reuse recently used data (temporal locality) and access data near recently used data (spatial locality). Caches move data in **lines** (typically 64 bytes on CPUs; Apple uses 128-byte lines) to exploit spatial locality, and keep recently used lines to exploit temporal locality.

When locality is poor — random access over a large data set, pointer chasing, hash tables much bigger than cache — the hierarchy degrades towards raw DRAM latency, and no amount of extra core width helps. Much of performance engineering is restructuring data so it fits the hierarchy: arrays instead of linked lists, struct-of-arrays layouts, blocking/tiling loops so a working set stays in cache.`,
      },
    },
    {
      id: "ladder",
      title: "The ladder, on a log scale",
      body: {
        simple: `Here's every level, from registers to the internet. Each step to the right is **ten times slower**. Try the "1 cycle = 1 s" view: if reading a register took one second, a trip to RAM would take a few minutes, reading an SSD would take days, and a hard-disk seek would take months.

Switch to **Apple Silicon** to see how the ladder changes shape: there's no separate graphics-memory branch.`,
        technical: `Representative latencies: register ~1 cycle; L1 ~4–5 cycles; L2 ~12–20 cycles; L3 ~40–70 cycles; DRAM ~60–110 ns (hundreds of cycles); NVMe 4K read tens of µs; HDD several ms. Each level up is roughly 10× larger and 3–10× slower.

A discrete-GPU PC has a **second hierarchy** on the graphics card: GPU L1/shared memory, a large L2 (or AMD's Infinity Cache), and VRAM — connected to the CPU's hierarchy only through PCIe. An Apple Silicon Mac has one hierarchy: per-cluster L2 caches, a **System Level Cache** shared by CPU, GPU and Neural Engine, then unified memory.`,
        deep: `Note the GPU rows: a GPU's memory latency, even to its own caches, is higher than a CPU's DRAM latency. GPUs don't try to minimise latency; they **hide** it by keeping tens of thousands of threads resident and switching to whichever group has its data ready (latency hiding through parallelism). CPUs attack latency directly with large caches, prefetchers and out-of-order execution.

Unified memory on Apple Silicon doesn't make DRAM faster — LPDDR latency is similar to or a bit higher than desktop DDR5. What changes is topology: no PCIe hop, no duplicate copies, and a shared last-level cache. See [unified memory](/unified-memory).`,
      },
      interactive: "latency-ladder",
    },
    {
      id: "locality",
      title: "Locality: why caches usually work",
      body: {
        simple: `Caches work because programs are predictable. They use the same things over and over (like a loop), and they use things that sit next to each other (like reading a list in order).

Try the patterns below. A **small loop** almost always hits the cache. **Reading in order** hits 3 out of 4 times — and a **prefetcher** that guesses what you'll need next fixes the rest. **Random** access and **linked lists** keep missing, and every miss costs a long trip to RAM.`,
        technical: `Average memory access time ≈ **hit time + miss rate × miss penalty**. With a 1 ns hit and 80 ns miss, even 90% hits average ~9 ns; 99% hits average ~1.8 ns. Small changes in miss rate cause large changes in performance.

Hardware **prefetchers** detect sequential and strided patterns and fetch lines before they're requested. They can't predict data-dependent addresses — which is why linked structures are slow, and why "cache-friendly" data layouts matter so much in games, databases and high-performance code.`,
        deep: `Real caches are **set-associative**: each address can live in only a few slots (ways) of a set, chosen by address bits. That creates **conflict misses** when hot data maps to the same sets, alongside **compulsory** (first touch) and **capacity** (working set too big) misses — the "three Cs".

Multi-core chips add **coherence**: when one core writes a line, other cores' copies must be invalidated or updated. Coherence traffic, false sharing (two cores writing different variables on the same line) and cross-die latency on chiplet designs all show up as performance effects that have nothing to do with clock speed.`,
      },
      interactive: "cache-sim",
    },
    {
      id: "bandwidth",
      title: "Latency vs bandwidth",
      body: {
        simple: `Two different questions: **how long until the first piece arrives?** (latency) and **how much arrives per second once it's flowing?** (bandwidth).

A huge highway carries enormous traffic, but if the on-ramp is long, a single car still takes a while. Graphics memory is a huge highway with a long on-ramp. Desktop RAM is a smaller road with a short on-ramp. For tiny requests, the short on-ramp wins; for huge transfers, the huge highway wins.`,
        technical: `Transfer time ≈ **latency + size ÷ bandwidth**. CPU workloads are often latency-bound: many small, dependent accesses. GPU and AI workloads are usually bandwidth-bound: large, predictable streams (textures, frame buffers, model weights).

That's why GPUs use GDDR or HBM — very wide, very fast interfaces with higher latency — while CPUs use DDR/LPDDR with lower latency and far less bandwidth. A useful rule for running language models: generating each token reads (roughly) all the model's weights, so **tokens per second is capped by memory bandwidth ÷ model size**. See the [LLM calculator](/llm).`,
        deep: `**Little's law** connects them: to sustain bandwidth B with latency L, you need B × L bytes in flight. A GPU sustaining ~1 TB/s with ~500 ns latency needs ~500 KB of outstanding requests — achievable only with thousands of concurrent threads. A CPU core with ~80 ns latency and a few dozen outstanding cache-line misses can sustain only a few tens of GB/s per core, which is why single-threaded code rarely saturates DRAM bandwidth.

Interconnects follow the same logic: PCIe 5.0 x16 offers ~63 GB/s per direction — generous for a link, but far below a high-end GPU's VRAM bandwidth. Workloads that must repeatedly cross PCIe (models that don't fit in VRAM, CPU-GPU ping-pong) slow down dramatically.`,
      },
      interactive: "latency-vs-bandwidth",
      callout: {
        tone: "good",
        title: "Key idea",
        text: "High bandwidth ≠ low latency. Ask which one your workload needs before comparing memory specs.",
      },
    },
    {
      id: "gpu-unified",
      title: "VRAM, shared memory and unified memory",
      body: {
        simple: `A graphics card has its own memory, **VRAM**, sitting right next to the GPU. It's extremely fast for the GPU, but it's separate from the computer's main RAM — data has to be copied across.

Apple Silicon and many laptop chips use **one shared memory** for both CPU and GPU. Nothing needs copying between them, but they share the same capacity and speed. Neither design is simply better; they're different tradeoffs.`,
        technical: `Three models appear on this site:

- **Discrete**: CPU uses system DDR5; GPU uses dedicated GDDR/HBM VRAM; data crosses PCIe.
- **Integrated-shared**: an integrated GPU (most Intel and AMD laptop chips) uses a portion of ordinary system RAM — usually with modest bandwidth from a 128-bit bus.
- **Unified**: a large, high-bandwidth pool on or beside the package, shared by every engine — Apple's M-series, and also designs like AMD's large "Strix Halo" APUs and NVIDIA's GB10-based systems.

16 GB of VRAM and 16 GB of unified memory are not equivalent: the first is all GPU-only and very high bandwidth; the second is shared with the OS and apps, and its bandwidth depends on the chip.`,
        deep: `On unified designs the OS still manages how much memory the GPU may "wire" (pin) at once — macOS, for instance, sets a default ceiling below total RAM for GPU working sets, which advanced users can adjust. Capacity available to the GPU is therefore large but not infinite, and heavy GPU use creates **memory pressure** for everything else.

On discrete systems, drivers can also let a GPU spill into system RAM over PCIe ("shared GPU memory" in Windows Task Manager), but performance drops sharply when hot data lives there. Full treatment: [Unified memory](/unified-memory).`,
      },
    },
  ],
  quiz: {
    id: "q-mem",
    questions: [
      {
        id: "q1",
        prompt: "Roughly how much slower is a trip to DRAM than an L1 cache hit?",
        choices: ["About the same", "~2×", "~100×", "~1,000,000×"],
        answer: 2,
        explain: "L1 is ~1 ns; DRAM is ~60–110 ns. That gap is the reason caches exist.",
      },
      {
        id: "q2",
        prompt: "Which access pattern can a hardware prefetcher NOT help with?",
        choices: ["Reading an array in order", "Strided access with a fixed step", "Walking a linked list", "Repeating a small loop"],
        answer: 2,
        explain: "Each linked-list address is only known after the previous load returns, so it can't be predicted — the CPU waits on full memory latency each time.",
      },
      {
        id: "q3",
        prompt: "GDDR7 graphics memory vs DDR5 system RAM: which statement is right?",
        choices: ["GDDR7 is better at everything", "GDDR7 has much higher bandwidth but higher latency", "DDR5 has more bandwidth", "They are identical except for price"],
        answer: 1,
        explain: "GPU memory is built for huge throughput; CPU memory for lower latency. High bandwidth ≠ low latency.",
      },
      {
        id: "q4",
        prompt: "What does unified memory remove on Apple Silicon?",
        choices: ["Memory latency", "The separate VRAM pool and the PCIe hop between CPU and GPU memory", "The need for caches", "Capacity limits"],
        answer: 1,
        explain: "CPU and GPU share one pool. Latency, caches and capacity limits all still exist.",
      },
    ],
  },
  misconceptions: ["unified-same-as-ram", "unified-infinite", "more-vram-faster", "more-ram-faster"],
  related: ["/memory", "/unified-memory", "ram", "storage", "/llm"],
};

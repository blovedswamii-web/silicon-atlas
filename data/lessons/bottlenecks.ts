import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "bottlenecks",
  number: 15,
  title: "Bottlenecks",
  subtitle: "A computer is only as fast as the step everything else is waiting on — and that step changes with every workload.",
  kind: "interconnect",
  minutes: 14,
  sections: [
    {
      id: "slowest-step",
      title: "The slowest step sets the pace",
      body: {
        simple:
          "Imagine a kitchen where one chef chops, one cooks and one plates. If the cook takes twice as long as everyone else, adding a faster chopper changes nothing — dishes still leave at the cook's pace. That cook is the **bottleneck**.\n\nComputers work the same way. Storage feeds memory, memory feeds the processor, the CPU feeds the GPU, and software coordinates all of it. Whichever part is slowest for the job at hand decides how fast the whole thing feels.",
        technical:
          "Any workload is a chain of stages: load data from storage, stage it in RAM (or VRAM / unified memory), move it to caches and registers, compute on CPU or GPU, and output results. Each stage has a **throughput** (work per second) and a **latency** (time to start). The system's overall rate is bounded by the stage with the lowest effective throughput for that workload.\n\nTwo consequences follow. First, upgrading a non-bottleneck component produces little or no improvement. Second, removing one bottleneck reveals the next: speed up the GPU and the CPU may become the limit.",
        deep:
          "Formally, if a task is split into parts that each take a fraction of total time, speeding up one part by a factor s only reduces that part's share — this is **Amdahl's law**. If 70% of a frame's time is GPU work and you double GPU speed, the frame gets ~1.5× faster, not 2×, because the other 30% is untouched.\n\nReal systems overlap stages (the CPU prepares frame n+1 while the GPU renders frame n), so the bottleneck is better described as the stage whose queue keeps filling up. Pipelined systems run at the rate of their slowest stage; the faster stages simply spend part of their time idle, waiting.\n\nBottlenecks also shift within a workload — a game can be CPU-bound in a crowded city and GPU-bound in an open field a few seconds later — so 'the bottleneck' is a distribution over time, not a single label.",
      },
    },
    {
      id: "every-workload",
      title: "Every workload stresses a different subsystem",
      body: {
        simple:
          "A video game, a compile job and an AI model all push on different parts of the computer. That's why the same machine can feel blazing fast for one job and sluggish for another.\n\nTry the lab below: keep the hardware the same and switch workloads. Watch which bar turns red.",
        technical:
          "Useful subsystems to reason about separately:\n\n- **CPU single-thread** — game logic, UI, scripts, serial build steps.\n- **CPU multi-thread** — compiling, encoding, CPU rendering.\n- **GPU compute** — rendering pixels, path tracing, matrix maths.\n- **Memory capacity** — does the working set fit in RAM / VRAM / unified memory?\n- **Memory bandwidth** — can data reach the compute units fast enough?\n- **Storage** — loading assets, footage, datasets.\n- **Software** — do drivers, APIs and frameworks use the hardware well?\n- **Power & thermals** — can the chip sustain its clocks?\n\nThe [Bottleneck Lab](/bottleneck-lab) estimates pressure on each for a configuration and workload.",
        deep:
          "A useful mental tool is the **roofline model**: plot achievable performance against arithmetic intensity (operations per byte moved from memory). Low-intensity work (LLM token generation, many image filters) sits under the sloped 'bandwidth roof' — performance rises with bandwidth, not compute. High-intensity work (large matrix multiplies during training, path tracing with good cache locality) reaches the flat 'compute roof'.\n\nThis is why vendor TFLOPS figures predict training throughput better than inference speed, and why memory bandwidth figures predict LLM generation speed better than TFLOPS. The model in the lab is a coarse, qualitative version of this reasoning.",
      },
      interactive: "bottleneck-mini",
      callout: {
        tone: "warn",
        title: "Educational approximation",
        text: "The lab uses representative tiers to build intuition. Real results depend on exact products, drivers, settings and cooling — check benchmarks of your workload.",
      },
    },
    {
      id: "cliffs",
      title: "Capacity cliffs vs throughput slopes",
      body: {
        simple:
          "Some limits are **slopes**: a faster GPU gives a bit more speed, a slower one a bit less. Others are **cliffs**: memory capacity is fine, fine, fine… until your data doesn't fit, and then performance falls off a cliff.\n\nThat's why buying 'enough' memory matters so much, and why buying far more than enough does almost nothing.",
        technical:
          "When a working set exceeds a memory level, the system pulls data from the next, much slower level:\n\n- VRAM overflow on a discrete GPU → data streamed from system RAM across **PCIe** (tens of GB/s instead of hundreds or more than a thousand).\n- RAM overflow → the OS compresses memory and swaps to the **SSD** (microseconds instead of nanoseconds per access).\n- Unified memory overflow → same as RAM overflow, and the GPU competes with the CPU for the pool.\n\nFor an LLM, the effect is dramatic: if only half the weights fit in VRAM, every generated token must read the other half over a far slower path, and generation speed drops toward the slow path's rate.",
        deep:
          "The effective bandwidth of a split working set behaves like a harmonic mean: if a fraction f lives in fast memory with bandwidth B₁ and the rest in slow memory with B₂, time per pass is `f/B₁ + (1−f)/B₂`. With B₁ = 900 GB/s, B₂ = 90 GB/s and f = 0.5, effective bandwidth is ~164 GB/s — less than a fifth of the fast tier, even though half the data is there.\n\nThis is the quantitative reason why a large unified-memory system can beat a faster discrete GPU on a model that doesn't fit in the GPU's VRAM, and lose to it on a model that does. It's also why [quantisation](/llm) is so effective: shrinking the model moves it back above the cliff.",
      },
      callout: {
        tone: "good",
        title: "Key idea",
        text: "Capacity decides whether a workload runs well at all. Bandwidth and compute decide how fast it runs once it fits.",
      },
    },
    {
      id: "cpu-gpu-bound",
      title: "CPU-bound or GPU-bound? Resolution changes the answer",
      body: {
        simple:
          "In a game, the CPU decides what happens in each frame and the GPU draws it. At low resolution the GPU draws quickly and waits for the CPU. At 4K the GPU has four times as many pixels to draw, so now the CPU waits for the GPU.\n\nSo 'Is my CPU bottlenecking my GPU?' depends on the game, the resolution and the settings.",
        technical:
          "Per-frame CPU work (simulation, AI, physics, draw-call submission) is roughly independent of resolution; per-frame GPU work scales with pixel count, effects and ray tracing. Frame time ≈ max(CPU time, GPU time) when the two are pipelined.\n\nSigns of each:\n\n- **GPU-bound** — GPU utilisation near 100%, frame rate rises when you lower resolution.\n- **CPU-bound** — GPU utilisation well below 100%, frame rate barely changes with resolution, one CPU thread is pegged.\n\nCache-sensitive games can gain substantially from CPUs with very large L3 caches (such as AMD's X3D parts) in CPU-bound scenarios.",
        deep:
          "Online 'bottleneck calculators' that output a single percentage for a CPU+GPU pair are misleading: the balance point is workload-, engine-, resolution- and settings-specific, and modern engines spread work across threads differently. Upscaling moves the balance too — rendering internally at 1080p for a 4K output shifts work back toward the CPU.\n\nFrame generation complicates measurement: displayed frame rate rises, but the CPU-side simulation rate — and input responsiveness — do not. Look at rendered frame times and 1% lows, not only average FPS.",
      },
      interactive: "upscaling",
    },
    {
      id: "data-movement",
      title: "Data movement is often the real bottleneck",
      body: {
        simple:
          "Modern processors can calculate much faster than memory can feed them. A lot of hardware design — caches, wide memory buses, unified memory, stacked cache — exists to move data faster or less often.",
        technical:
          "Arithmetic has become cheap; moving data is expensive in both time and energy. Key data paths and their typical order of magnitude:\n\n- Register/L1: around a nanosecond, extremely high bandwidth.\n- DRAM: ~60–120 ns latency; ~90 GB/s for dual-channel DDR5, hundreds of GB/s for wide LPDDR, up to ~1.8 TB/s for top GDDR7 cards.\n- PCIe 5.0 x16: ~64 GB/s each way.\n- NVMe SSD: tens of microseconds; ~7–14 GB/s sequential.\n\nSee the [Memory Hierarchy](/memory) for the full picture on a log scale.",
        deep:
          "Architectural differences between platforms are largely differences in data-movement strategy. Discrete-GPU PCs give the GPU a private, very high-bandwidth VRAM pool and accept a PCIe hop for data that originates on the CPU side. Apple Silicon and large APUs use one shared pool on a wide bus, avoiding copies but sharing capacity and bandwidth between engines. AMD X3D stacks extra SRAM to keep more data on-chip. Datacenter accelerators use HBM to push bandwidth into the multi-TB/s range.\n\nWhen comparing platforms for a workload, ask where the data lives, how often it must move, and over which link.",
      },
    },
    {
      id: "software-power",
      title: "Software and power are bottlenecks too",
      body: {
        simple:
          "Two more limits are easy to forget. **Software:** if your app or framework doesn't support a chip well, its speed is wasted. **Power and heat:** a chip that gets too hot slows itself down. A thin laptop and a desktop with the 'same' chip can perform very differently.",
        technical:
          "Software bottlenecks show up as unsupported features (no GPU backend), slow fallback paths (an operation not implemented on a GPU backend runs on the CPU), or immature drivers. In AI this is decisive: CUDA's ecosystem, ROCm's supported-GPU list, MLX/MPS coverage on Apple Silicon and oneAPI/OpenVINO on Intel all shape what you can run.\n\nPower bottlenecks show up as clocks that start high and settle lower as the chip reaches its temperature or power limit. The simulation below shows the same chip with different coolers.",
        deep:
          "Power limits are layered: a chip has instantaneous current limits, short-term and long-term power limits, and temperature limits; laptops add chassis skin-temperature targets and fan-noise profiles. Benchmarks run on a cold machine for a few seconds can overstate sustained performance considerably.\n\nOn the software side, the effective bottleneck may be single-threaded driver overhead, a framework's kernel-launch overhead for small batch sizes, or synchronisation between CPU and GPU. Profilers (Nsight, Radeon GPU Profiler, Instruments, VTune) reveal these; utilisation percentages alone often don't.",
      },
      interactive: "thermal-sim",
    },
    {
      id: "find-yours",
      title: "How to find your real bottleneck",
      body: {
        simple:
          "Watch your computer while it does the slow task. If the GPU is at 100%, it's probably the limit. If one CPU core is maxed out and the GPU isn't, it's the CPU. If memory is full and the disk is busy, you need more memory.",
        technical:
          "A practical checklist:\n\n- Open a monitor: Task Manager / Resource Monitor (Windows), Activity Monitor (macOS), `htop`/`nvtop` (Linux), `nvidia-smi` for NVIDIA GPUs.\n- Check **memory pressure** first — swapping or VRAM overflow masks everything else.\n- Check **GPU utilisation** — sustained near 100% means GPU-bound.\n- Check **per-core CPU usage** — one core pegged suggests a single-thread bottleneck even if total CPU is low.\n- Check **clocks and temperature** over several minutes for throttling.\n- Change one variable (resolution, model size, batch size, number of threads) and see what moves.",
        deep:
          "Experimental thinking beats intuition: a bottleneck is confirmed when relieving it improves performance. Lowering resolution tests GPU-boundness; reducing model size tests capacity; setting a lower power limit tests power sensitivity; moving files to a faster drive tests storage.\n\nBe wary of single averaged metrics. A GPU at '60% utilisation' may be alternating between fully busy and idle while waiting on the CPU; frame-time graphs and profilers expose the pattern. And remember that utilisation counts time the engine is active, not how efficiently it's using its execution units — a memory-bound kernel can show 100% utilisation while its ALUs are mostly idle.",
      },
    },
  ],
  quiz: {
    id: "bottlenecks-quiz",
    questions: [
      {
        id: "q1",
        prompt: "A game runs at the same frame rate at 1080p and 1440p, and GPU utilisation is around 60%. What's the most likely limiter?",
        choices: ["The GPU", "The CPU (game logic / draw calls)", "SSD speed", "VRAM capacity"],
        answer: 1,
        explain: "Frame rate not changing with resolution and a partly idle GPU point to the CPU side preparing frames.",
      },
      {
        id: "q2",
        prompt: "A 40 GB model on a 16 GB GPU. What happens to generation speed?",
        choices: [
          "Unchanged — the GPU is fast",
          "It drops sharply, because part of the weights must be read from much slower memory every token",
          "It doubles",
          "The model automatically shrinks to fit",
        ],
        answer: 1,
        explain: "Capacity is a cliff: data that doesn't fit is served over a slower path, and effective bandwidth falls toward that path's speed.",
      },
      {
        id: "q3",
        prompt: "Why might a thin laptop be slower than a desktop using a chip with the same name?",
        choices: [
          "Laptops use a different instruction set",
          "Lower power limits and less cooling force lower sustained clocks (and often a different chip configuration)",
          "Laptops can't use caches",
          "Desktop chips always have more VRAM",
        ],
        answer: 1,
        explain: "Power and thermals are a bottleneck; same-name laptop parts frequently have different silicon and power budgets too.",
      },
      {
        id: "q4",
        prompt: "You double a component's speed but the task only gets 10% faster. What does that suggest?",
        choices: [
          "The component wasn't the main bottleneck",
          "The upgrade is defective",
          "Benchmarks are always wrong",
          "More cores are needed",
        ],
        answer: 0,
        explain: "By Amdahl's law, speeding up a part that takes a small share of the time barely changes the total.",
      },
    ],
  },
  misconceptions: ["more-ram-faster", "more-vram-faster", "more-cores-faster", "pcie5-ssd-doubles"],
  related: ["/bottleneck-lab", "/memory", "memory-hierarchy", "/efficiency", "/llm", "choosing-hardware"],
};

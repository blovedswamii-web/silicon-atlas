import type { MisleadingComparison, Misconception } from "@/data/schema";

export const MISCONCEPTIONS: Misconception[] = [
  {
    id: "ghz-faster",
    claim: "More GHz = faster CPU",
    verdict: "misleading",
    short:
      "Clock speed is how often the CPU ticks, not how much work it does per tick. Work per second ≈ clock × instructions per clock (IPC).",
    explanation:
      "A 5 GHz core that completes 4 instructions per cycle does more work than a 5.5 GHz core that completes 3. IPC depends on the microarchitecture: how wide the core is, how good its branch predictor is, how big its caches are, and how often it waits on memory. GHz is only comparable between chips of the same architecture — for example two Zen 5 parts, or two clock bins of the same Intel generation. Across brands or generations it says very little on its own.",
    instead:
      "Look at independent benchmarks of the workloads you actually run, and treat clock speed as one input alongside architecture generation, cache size and sustained (not peak) power.",
    related: ["clock-speed", "ipc"],
  },
  {
    id: "more-cores-faster",
    claim: "More CPU cores = always faster",
    verdict: "misleading",
    short:
      "Extra cores only help when software can split work across them. Many tasks — lots of games, single-threaded scripts, UI work — lean on one or a few fast cores.",
    explanation:
      "Compiling a large codebase, rendering on the CPU or encoding video can use 16+ cores well. A game's main thread, a spreadsheet macro or a Python script mostly can't. Amdahl's law sets the ceiling: if 30% of a job is serial, infinite cores still can't make it more than ~3.3× faster. Hybrid designs add another wrinkle: a '24-core' chip may be 8 performance cores plus 16 efficiency cores, which is not the same as 24 identical cores.",
    instead:
      "Ask how parallel your workload is. Weigh single-thread performance for responsiveness and games, and core count for rendering, compiling and encoding.",
    related: ["core", "thread", "p-cores", "e-cores"],
  },
  {
    id: "more-ram-faster",
    claim: "More RAM = faster",
    verdict: "misleading",
    short:
      "RAM capacity is a threshold, not a speed dial. Having enough prevents slowdowns; having more than you use does almost nothing.",
    explanation:
      "When your working set (open apps, browser tabs, project files, model weights) exceeds RAM, the OS starts compressing memory and swapping to the SSD, and everything slows dramatically. Below that point, extra capacity mostly sits idle as file cache. Speed (bandwidth and latency) is a separate property from capacity: 64 GB of slow memory is not 'faster' than 32 GB of fast memory for a job that fits in 32 GB.",
    instead:
      "Estimate your peak working set, add headroom, and buy enough. On non-upgradeable machines (most laptops, every Apple Silicon Mac) err on the generous side because you can't add more later.",
    related: ["ddr5", "memory-bandwidth"],
  },
  {
    id: "more-vram-faster",
    claim: "More VRAM = faster GPU",
    verdict: "misleading",
    short:
      "VRAM is capacity. It lets bigger textures, scenes or AI models fit; it does not add compute. Two cards with the same chip and different VRAM run at the same speed until the smaller one runs out.",
    explanation:
      "When a game or model fits in VRAM, performance is set by the GPU's compute units and memory bandwidth. When it doesn't fit, data spills into system RAM across PCIe, which is far slower — then the card with more VRAM pulls ahead dramatically. That's why VRAM matters a lot for 4K textures and local LLMs and very little for an esports title at 1080p.",
    instead:
      "Check whether your workload exceeds the VRAM. If it fits, compare GPU throughput and bandwidth; if it doesn't, capacity dominates.",
    related: ["vram", "memory-bandwidth"],
  },
  {
    id: "unified-same-as-ram",
    claim: "Apple unified memory is exactly the same as normal RAM",
    verdict: "false",
    short:
      "It is DRAM (LPDDR), but organised differently: one pool shared by CPU, GPU and Neural Engine, on the chip package, on a very wide bus.",
    explanation:
      "In a typical PC, system RAM serves the CPU and a discrete GPU has its own VRAM; data the GPU needs is placed or copied across PCIe. On Apple Silicon, all engines address one pool, so the GPU can work on data the CPU just wrote without a copy over a slot. Higher-end M-series chips use much wider memory buses than a dual-channel desktop, giving more bandwidth. The tradeoffs: the memory is soldered into the package, so capacity is fixed at purchase, and the CPU and GPU compete for the same capacity and bandwidth.",
    instead:
      "Treat unified memory capacity as both 'RAM' and 'VRAM' at once, and compare bandwidth figures separately from capacity.",
    related: ["unified-memory", "lpddr", "soc"],
  },
  {
    id: "unified-infinite",
    claim: "Unified memory means infinite GPU memory",
    verdict: "false",
    short:
      "The GPU can use a large share of the pool — but it's still a fixed pool, shared with the OS and every app, and macOS reserves part of it.",
    explanation:
      "A 64 GB Mac can let the GPU address far more than a 16 GB graphics card, which is why it can hold bigger models. But the CPU side (OS, browser, your IDE) also needs memory from the same 64 GB, and by default macOS limits how much the GPU may wire for itself (a large fraction of total, adjustable by advanced users). If you exceed the pool, the system compresses and swaps like any other computer.",
    instead:
      "Budget unified memory as one shared total: model or scene size + OS and apps + headroom.",
    related: ["unified-memory"],
  },
  {
    id: "nvidia-ai-hardware-only",
    claim: "NVIDIA always wins AI purely because of hardware",
    verdict: "misleading",
    short:
      "NVIDIA's hardware is strong, but much of its AI lead comes from software: CUDA, cuDNN, TensorRT and a decade of libraries written for it first.",
    explanation:
      "Researchers write and optimise for CUDA first, so new techniques usually appear there before anywhere else. That ecosystem — not just Tensor Core TFLOPS — is why NVIDIA is the default for training. 'Always wins' is also wrong: a GPU with too little VRAM can't load a model a large-memory Mac or APU can; AMD Instinct accelerators are competitive in some datacenter deployments; and for some inference tasks, capacity or bandwidth matters more than raw compute.",
    instead:
      "Ask: does my framework and model run well on this platform's software stack, does it fit in memory, and what bandwidth will it get?",
    related: ["cuda", "rocm", "mlx", "oneapi"],
  },
  {
    id: "more-cuda-better",
    claim: "More CUDA cores automatically means better",
    verdict: "misleading",
    short:
      "Within one NVIDIA generation, more CUDA cores usually means faster. Across generations, clocks, cache, bandwidth and per-core design change what each 'core' delivers.",
    explanation:
      "NVIDIA has changed what a 'CUDA core' does several times (for example, Ampere doubled FP32 lanes per SM, which doubled the count overnight without doubling game performance). Performance also depends on memory bandwidth, cache size, clock speed, power limit and whether the workload uses Tensor or RT cores at all. A laptop GPU with the same name as a desktop one can have far fewer cores and a much lower power limit.",
    instead:
      "Compare CUDA cores only within the same generation and form factor, and confirm with benchmarks of your workload.",
    related: ["cuda-cores", "tensor-cores"],
  },
  {
    id: "stream-vs-cuda",
    claim: "AMD stream processors can be directly compared to CUDA cores",
    verdict: "false",
    short:
      "Both are vendor counts of FP32 lanes, but they're grouped, scheduled and fed differently. 4,096 stream processors vs 8,960 CUDA cores does not mean one GPU is ~2× faster.",
    explanation:
      "AMD organises its GPUs into Compute Units (each with 64 stream processors in recent RDNA designs, with dual-issue capability), while NVIDIA uses Streaming Multiprocessors containing 128 CUDA cores. Clock speeds, cache hierarchies (e.g. AMD's Infinity Cache), memory bandwidth and how often lanes are actually busy all differ. The counts are marketing-level unit tallies, not a common currency.",
    instead: "Compare benchmarks of the games or applications you care about, at the resolution and settings you'll use.",
    related: ["stream-processors", "cuda-cores", "compute-units"],
  },
  {
    id: "apple-cores-vs-cuda",
    claim: "Apple GPU cores can be directly compared to CUDA cores",
    verdict: "false",
    short:
      "An Apple 'GPU core' is a large block containing many ALUs — closer to an NVIDIA SM than to a single CUDA core. '40 cores vs 10,000 cores' compares different units.",
    explanation:
      "Apple counts GPU cores as whole clusters, each with its own execution units, scheduling and cache; NVIDIA counts individual FP32 lanes. Comparing the two numbers is like comparing 'number of kitchens' with 'number of chefs'. Even after converting to lanes, clocks, memory architecture, drivers and API support (Metal vs CUDA/DirectX/Vulkan) all shape real performance.",
    instead: "Compare by workload benchmarks, and consider memory capacity and software support separately.",
    related: ["cuda-cores", "metal"],
  },
  {
    id: "arm-slower",
    claim: "ARM is always slower than x86",
    verdict: "false",
    short:
      "The instruction set doesn't decide speed; the microarchitecture, process node, cache and power budget do. ARM-based chips such as Apple's M-series are competitive with or faster than many x86 chips in many tasks.",
    explanation:
      "ARM and x86 are instruction set architectures — contracts that describe what instructions exist. Performance comes from how a particular design implements them: decode width, out-of-order window, branch prediction, cache sizes, memory subsystem, clocks and power limits. High-performance ARM designs exist (Apple M-series, server chips), and so do low-power ones. Software matters too: native code runs at full speed; translated x86 code (e.g. via Rosetta 2 or Windows' Prism) has some overhead.",
    instead: "Compare the specific chips on your workloads, and check that your key software runs natively.",
    related: ["arm", "x86", "isa"],
  },
  {
    id: "arm-efficient",
    claim: "ARM is always more efficient than x86",
    verdict: "misleading",
    short:
      "Efficiency comes mostly from design goals, process node and power budget — not the instruction set. Efficient x86 chips and power-hungry ARM chips both exist.",
    explanation:
      "Apple's ARM chips are very efficient largely because they're designed for laptop power budgets, built on leading-edge process nodes, have large caches, and integrate memory and accelerators into one package. Low-power x86 designs (such as recent Intel and AMD laptop chips) have narrowed the gap considerably in many tasks. x86 decoding does cost some power, but at modern core sizes it's a small part of the total.",
    instead:
      "Look at measured performance per watt and battery-life tests for the specific laptop under your type of workload.",
    related: ["arm", "x86", "process-node"],
  },
  {
    id: "macs-no-ai",
    claim: "Macs cannot perform AI workloads",
    verdict: "false",
    short:
      "Apple Silicon runs AI workloads through Metal, PyTorch's MPS backend, MLX and Core ML — and large unified memory lets it hold sizable models locally.",
    explanation:
      "Local LLM inference, image generation and fine-tuning of smaller models are practical on Apple Silicon. Limitations are real too: there's no CUDA, so some research code and CUDA-only libraries won't run or need porting; peak training throughput is generally below high-end NVIDIA GPUs; and the Neural Engine is only reachable through Core ML for certain model types.",
    instead: "Check that your framework and models support MPS/MLX/Core ML, and size unified memory for your models.",
    related: ["mlx", "core-ml", "metal", "neural-engine"],
  },
  {
    id: "igpu-weak",
    claim: "Integrated graphics are always weak",
    verdict: "misleading",
    short:
      "Older or budget integrated GPUs are modest, but modern ones range from 'fine for light gaming' to large SoC GPUs (Apple M-series Max, AMD Strix Halo) that rival mid-range discrete cards in some tasks.",
    explanation:
      "'Integrated' describes where the GPU sits (on the same chip/package as the CPU, sharing memory), not how strong it is. Small iGPUs share narrow dual-channel memory and a tight power budget, so they're limited. Larger SoC GPUs get wide memory buses, many more execution units and more power. They still typically trail high-end discrete GPUs in raw throughput, and their gaming experience depends on drivers and game support.",
    instead: "Look at the specific GPU's execution resources, memory bandwidth and benchmarks — not the word 'integrated'.",
    related: ["igpu", "apu", "soc"],
  },
  {
    id: "dgpu-better",
    claim: "Discrete GPUs are always better",
    verdict: "misleading",
    short:
      "A discrete GPU usually has more compute and bandwidth, but it adds power, heat, cost, and a separate (often smaller) memory pool across PCIe.",
    explanation:
      "For high-end gaming, 3D rendering and CUDA-based AI, a strong discrete GPU is often the right tool. But a low-end discrete GPU can be slower than a good integrated one, and in a laptop it costs battery life. Discrete VRAM is also a hard limit: a 12 GB card cannot hold a model that needs 30 GB, while a large unified-memory system can (more slowly).",
    instead: "Match the GPU to the workload: throughput, VRAM capacity, power budget and software support.",
    related: ["vram", "igpu", "pcie"],
  },
  {
    id: "pcie5-ssd-doubles",
    claim: "PCIe 5 SSD doubles performance everywhere",
    verdict: "false",
    short:
      "PCIe 5.0 doubles the link's peak bandwidth, which helps big sequential transfers. Most everyday work — booting, launching apps, loading games — is limited by small random reads and CPU work, where the gain is small.",
    explanation:
      "Sequential speed figures (e.g. 14 GB/s vs 7 GB/s) measure large, contiguous reads with deep queues. App launches and game loads issue many small reads and spend lots of time decompressing and initialising on the CPU. Real-world load-time differences between good PCIe 4 and PCIe 5 drives are often small. PCIe 5 drives can also run hotter and need heatsinks.",
    instead:
      "For most people, look at random read performance (4K QD1), sustained write behaviour, endurance and price per GB. PCIe 5 helps for very large file copies and some professional workflows.",
    related: ["pcie", "nvme"],
  },
  {
    id: "psu-consumes",
    claim: "A 1000W PSU always consumes 1000W",
    verdict: "false",
    short:
      "A PSU's rating is its maximum safe output. The computer draws only what its components need at that moment, plus conversion losses.",
    explanation:
      "A desktop idling at the desktop might draw well under 100 W from the wall, and a gaming load maybe a few hundred watts, regardless of whether the PSU is rated 650 W or 1000 W. Efficiency (80 Plus rating) determines how much extra is lost as heat during conversion. Oversizing gives headroom for transient spikes and future upgrades; undersizing can cause shutdowns under load.",
    instead:
      "Size the PSU for your components' peak draw plus headroom (and the GPU maker's recommendation); check efficiency and quality, not just wattage.",
    related: ["tdp", "tgp"],
  },
];

export const MISLEADING_COMPARISONS: MisleadingComparison[] = [
  {
    id: "ghz-intel-amd",
    left: "5 GHz Intel CPU",
    right: "5 GHz AMD CPU",
    looksLike: "Same clock speed, so the same performance.",
    reality:
      "Each design completes a different amount of work per clock (IPC), has different cache sizes and different sustained power behaviour. Two chips at identical GHz can differ significantly in real workloads — in either direction, depending on the task.",
    questions: [
      "What architecture generation is each core?",
      "Is 5 GHz the single-core peak boost or the sustained all-core clock?",
      "How much cache does each chip have, and does my workload care?",
      "What do independent benchmarks of my workload show?",
    ],
  },
  {
    id: "vram-vs-unified",
    left: "16 GB NVIDIA VRAM",
    right: "16 GB Apple unified memory",
    looksLike: "Same 16 GB of memory for graphics or AI.",
    reality:
      "The 16 GB of VRAM is dedicated to the GPU (on top of the PC's separate system RAM). The 16 GB of unified memory is everything — the OS, apps and GPU all share it, and macOS keeps part of it from the GPU. Bandwidth also differs: high-end GDDR7 cards have far more bandwidth than a base M-series chip.",
    questions: [
      "How much of this memory can the GPU actually use?",
      "How much system RAM does the PC have in addition to VRAM?",
      "What is the memory bandwidth of each?",
      "Does my software support each platform's GPU API?",
    ],
  },
  {
    id: "apple-cores-cuda",
    left: "32 Apple GPU cores",
    right: "Thousands of NVIDIA CUDA cores",
    looksLike: "NVIDIA has ~100× more cores.",
    reality:
      "Apple counts whole GPU clusters; NVIDIA counts individual FP32 lanes inside its SMs. The units are not the same thing, so the ratio is meaningless. Performance depends on total execution resources, clocks, memory, drivers and API support.",
    questions: [
      "What unit is each vendor counting?",
      "What are measured results in my application on each?",
      "Is the comparison chip-to-chip, or a whole laptop vs one graphics card?",
    ],
  },
  {
    id: "tops",
    left: "200 TOPS",
    right: "100 TOPS",
    looksLike: "The first chip is twice as fast at AI.",
    reality:
      "TOPS figures may use different precisions (INT8 vs INT4 vs FP8), may assume sparsity (counting skipped zeros as 'operations'), may combine CPU+GPU+NPU into one 'platform TOPS', and are peak numbers that real models rarely reach because they're limited by memory bandwidth and software support.",
    questions: [
      "At what precision (INT8? INT4? FP8? FP16?)",
      "With or without sparsity?",
      "From which engine — NPU, GPU, or everything summed?",
      "Which frameworks can actually use that engine?",
      "What is the memory bandwidth feeding it?",
    ],
  },
  {
    id: "laptop-desktop-5090",
    left: "RTX 5090 Laptop GPU",
    right: "RTX 5090 (desktop)",
    looksLike: "The same GPU in a different box.",
    reality:
      "The laptop part uses a different, smaller GPU configuration with far fewer CUDA cores, less VRAM on a narrower bus, and a power limit that is a fraction of the desktop card's (and that varies between laptops). Performance can be dramatically lower — and two laptops with the 'same' GPU can differ depending on cooling and the manufacturer's power setting.",
    questions: [
      "How many cores and how much VRAM does the laptop version have?",
      "What total graphics power (TGP) has this laptop maker configured?",
      "How well does this specific chassis cool under sustained load?",
    ],
  },
  {
    id: "pcie5-vs-pcie4",
    left: "PCIe 5.0 SSD (14 GB/s)",
    right: "PCIe 4.0 SSD (7 GB/s)",
    looksLike: "Everything loads twice as fast.",
    reality:
      "Headline numbers are peak sequential speeds. Booting, launching apps and loading games mostly involve small random reads and CPU-side decompression, where the two are often close. The faster link matters for huge file copies and some pro workflows.",
    questions: [
      "What's the random 4K read performance at low queue depth?",
      "Does my workload move large sequential files?",
      "Does the drive throttle without a heatsink?",
    ],
  },
  {
    id: "hybrid-cores",
    left: "'24-core' hybrid CPU",
    right: "16 identical cores",
    looksLike: "24 > 16, so the first CPU is 50% more powerful.",
    reality:
      "Hybrid CPUs mix performance cores (P-cores) and smaller efficiency cores (E-cores). A 24-core chip might be 8 P + 16 E. E-cores add meaningful multi-threaded throughput but are individually slower, and threads-per-core can differ too (SMT on some cores, none on others). The 16 identical cores might each be full-size performance cores.",
    questions: [
      "How many are performance cores vs efficiency cores?",
      "How many threads in total?",
      "Is my workload limited by one fast thread or by total throughput?",
    ],
  },
];

export const getMisconception = (id: string) => MISCONCEPTIONS.find((m) => m.id === id);

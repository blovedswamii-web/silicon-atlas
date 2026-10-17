import type { SpecDefinition } from "@/data/schema";

/**
 * Spec Decoder content. One record per specification commonly found on spec sheets.
 * The crossBrand verdict is the most important field: can you compare this number
 * between Apple, AMD, NVIDIA and Intel?
 */
export const SPECS: SpecDefinition[] = [
  // ---------------------------------------------------------------- CPU
  {
    id: "clock-speed",
    name: "Clock speed (base clock)",
    appliesTo: ["cpu", "gpu"],
    whatItIs:
      "How many cycles per second the core's clock runs, in gigahertz (GHz). 5 GHz = 5 billion cycles per second. The base clock is the frequency the vendor guarantees under its rated power and cooling.",
    whyItExists:
      "Every step of a processor's pipeline advances once per clock tick, so the clock sets the pace at which the core can move work along.",
    whyItMatters:
      "Within the same architecture, a higher clock means proportionally more work per second (until memory becomes the bottleneck).",
    whenItMatters: "Comparing two chips of the same family and generation, or overclocking one chip.",
    whenItDoesnt:
      "Comparing different architectures, brands or generations — work per clock (IPC) differs. Base clock also rarely reflects what a modern chip actually runs at; it boosts above it.",
    crossBrand: {
      verdict: "no",
      explain:
        "A clock tick on one microarchitecture does a different amount of work than on another. 5 GHz on one CPU is not equal to 5 GHz on another.",
    },
    misconception: "Higher GHz always means a faster processor.",
  },
  {
    id: "boost-clock",
    name: "Boost clock (max turbo)",
    appliesTo: ["cpu", "gpu"],
    whatItIs:
      "The highest frequency the chip may reach opportunistically, usually on one or two cores, when temperature, power and current allow.",
    whyItExists:
      "Most moments only need one or two fast cores. Boosting lets a chip sprint for responsiveness while staying within its overall power budget.",
    whyItMatters: "Strongly affects single-threaded snappiness: app launches, UI, many games' main threads.",
    whenItMatters: "Short, lightly-threaded bursts on a well-cooled system.",
    whenItDoesnt:
      "Sustained all-core loads (rendering, compiling), where chips run well below max boost. Thin laptops may only hold it for seconds.",
    crossBrand: {
      verdict: "no",
      explain:
        "Vendors define boost behaviour differently (how many cores, for how long, at what power), and IPC differs between architectures.",
    },
    misconception: "The boost clock is the speed the CPU runs at all the time.",
  },
  {
    id: "core-count",
    name: "Core count",
    appliesTo: ["cpu"],
    whatItIs:
      "The number of independent processors on the chip. Each core can run its own stream of instructions. Hybrid chips list performance cores and efficiency cores together.",
    whyItExists:
      "Clock speeds stopped rising quickly in the mid-2000s because of power and heat. Adding cores was the way to keep increasing total throughput.",
    whyItMatters: "Sets how many tasks can truly run at once — essential for rendering, compiling, encoding, VMs and heavy multitasking.",
    whenItMatters: "Workloads that split well across threads.",
    whenItDoesnt: "Lightly-threaded tasks, many games, single-threaded scripts — beyond a handful of cores they mostly sit idle.",
    crossBrand: {
      verdict: "partly",
      explain:
        "A core is a real, countable thing, but core sizes differ wildly: a P-core and an E-core are not equal, and one vendor's core may be much faster than another's. Compare 'P + E' breakdowns, not totals.",
    },
    misconception: "A 24-core CPU is always 50% faster than a 16-core CPU.",
  },
  {
    id: "threads",
    name: "Threads (SMT / Hyper-Threading)",
    appliesTo: ["cpu"],
    whatItIs:
      "The number of instruction streams the CPU can track at once. With SMT, one physical core presents two hardware threads that share its execution units.",
    whyItExists:
      "Cores often stall waiting for memory. A second thread can use the idle execution units during those stalls.",
    whyItMatters: "SMT typically adds a modest boost (often in the ~10–30% range) in throughput workloads — far less than a second core.",
    whenItMatters: "Heavily multi-threaded server, compile and render work.",
    whenItDoesnt: "Single-threaded or latency-sensitive tasks; some security-sensitive environments disable it.",
    crossBrand: {
      verdict: "partly",
      explain:
        "Thread count is countable, but some designs have SMT on every core, some only on P-cores, and some (like recent Intel Core Ultra desktop chips and Apple's cores) have none. 2 threads ≠ 2 cores.",
    },
    misconception: "A 16-thread CPU has 16 cores.",
  },
  {
    id: "ipc",
    name: "IPC (instructions per clock)",
    appliesTo: ["cpu"],
    whatItIs:
      "The average number of instructions a core completes each clock cycle on a given workload. Rarely printed on spec sheets; vendors quote generation-over-generation IPC gains instead.",
    whyItExists:
      "It captures how 'smart' and wide a core is: decode width, out-of-order window, branch prediction, cache behaviour.",
    whyItMatters: "Performance ≈ clock × IPC. Most modern performance gains come from IPC, not GHz.",
    whenItMatters: "Always — it's the hidden half of the clock-speed story.",
    whenItDoesnt:
      "It's not a fixed number: IPC varies by workload, so a quoted '+16% IPC' is an average over the vendor's chosen tests.",
    crossBrand: {
      verdict: "partly",
      explain:
        "Instructions aren't identical units across ARM and x86, and vendors pick their own test suites. Treat vendor IPC claims as direction, not measurement.",
    },
    misconception: "IPC is a single fixed property of a chip.",
  },
  {
    id: "cache",
    name: "Cache (L2 / L3)",
    appliesTo: ["cpu", "gpu"],
    whatItIs:
      "Small, very fast memory on the chip that keeps recently or frequently used data close to the cores. L1 is tiny and fastest, L2 larger, L3 larger still and usually shared.",
    whyItExists:
      "Main memory takes on the order of 100 ns to respond — hundreds of clock cycles. Cache hides that delay when data is reused.",
    whyItMatters:
      "Workloads with a large, frequently reused working set (many games, some simulations, databases) can gain significantly from more cache — that's the idea behind AMD's X3D chips.",
    whenItMatters: "When the hot data set is just larger than a normal cache but fits in a bigger one.",
    whenItDoesnt:
      "Streaming workloads that read data once (video encode, many renders) or tiny working sets that already fit.",
    crossBrand: {
      verdict: "partly",
      explain:
        "Megabytes are megabytes, but cache levels are organised differently (shared vs per-core, per-chiplet vs whole-chip, Apple's system-level cache), with different latencies.",
    },
    misconception: "More cache speeds up every application equally.",
  },
  {
    id: "power-limits",
    name: "TDP / PPT / PL1 / PL2 (CPU power)",
    appliesTo: ["cpu", "soc"],
    whatItIs:
      "Vendor-defined power figures. TDP is a thermal design target; AMD's PPT is the actual socket power limit; Intel's PL1 (base power) and PL2 (turbo power) define sustained and short-term limits. Apple doesn't publish equivalent figures.",
    whyItExists: "Coolers, motherboards and laptops need a target to be designed around.",
    whyItMatters:
      "Power limits decide how long and how high a chip can boost. The same chip at 65 W and 125 W can perform quite differently in multi-threaded work.",
    whenItMatters: "Choosing coolers and PSUs; comparing laptops that use the same chip at different power settings.",
    whenItDoesnt: "As a measure of efficiency or performance on its own.",
    crossBrand: {
      verdict: "no",
      explain:
        "AMD and Intel define these numbers differently, motherboards often override them, and 'TDP' is not equal to actual power draw.",
    },
    misconception: "A 125 W TDP CPU draws exactly 125 W.",
  },
  // ---------------------------------------------------------------- GPU units
  {
    id: "cuda-cores",
    name: "CUDA cores",
    appliesTo: ["gpu"],
    vendorSpecific: "nvidia",
    whatItIs:
      "NVIDIA's name for the FP32 arithmetic lanes inside its Streaming Multiprocessors (SMs). Recent GeForce SMs contain 128 of them.",
    whyItExists: "GPUs run thousands of similar calculations in parallel — one lane per pixel, vertex or matrix element.",
    whyItMatters: "Within one NVIDIA generation, more CUDA cores generally means more shader throughput.",
    whenItMatters: "Comparing NVIDIA GPUs of the same architecture and form factor.",
    whenItDoesnt:
      "Across generations (NVIDIA has changed what a 'core' does), or vs laptop parts with the same name and lower power limits.",
    crossBrand: {
      verdict: "no",
      explain:
        "It is an NVIDIA-specific architectural measurement and should not be directly compared numerically with AMD stream processors, Intel Xe units, or Apple GPU cores.",
    },
    misconception: "A GPU with twice the CUDA cores is twice as fast.",
  },
  {
    id: "stream-processors",
    name: "Stream processors",
    appliesTo: ["gpu"],
    vendorSpecific: "amd",
    whatItIs:
      "AMD's name for the FP32 lanes inside its Compute Units. In recent RDNA GPUs, each Compute Unit contains 64 stream processors.",
    whyItExists: "Same reason as CUDA cores: massive parallel arithmetic.",
    whyItMatters: "Within one RDNA generation, more stream processors usually means more throughput.",
    whenItMatters: "Comparing AMD GPUs of the same generation.",
    whenItDoesnt: "Comparing with NVIDIA, Intel or Apple — or across RDNA generations with different features (e.g. dual-issue).",
    crossBrand: {
      verdict: "no",
      explain:
        "Stream processors are grouped, scheduled and fed differently from CUDA cores. 4,096 SPs vs 8,960 CUDA cores doesn't mean the NVIDIA card is twice as fast.",
    },
    misconception: "Stream processors and CUDA cores are the same unit with different names.",
  },
  {
    id: "compute-units",
    name: "Compute Units (CU) / Streaming Multiprocessors (SM)",
    appliesTo: ["gpu"],
    whatItIs:
      "The GPU's main building block: a cluster of arithmetic lanes, schedulers, registers, cache and special units. AMD calls them Compute Units, NVIDIA calls them SMs.",
    whyItExists: "Grouping lanes lets them share instruction scheduling and fast local memory.",
    whyItMatters: "Roughly sets the scale of the GPU within a generation; ray-tracing and AI units are often counted per CU/SM.",
    whenItMatters: "Comparing GPUs from the same vendor and generation.",
    whenItDoesnt: "Across vendors — a CU and an SM have different contents and widths.",
    crossBrand: {
      verdict: "no",
      explain: "Each vendor's block contains a different mix of hardware. Count only within one architecture.",
    },
    misconception: "64 CUs and 64 SMs are equal amounts of GPU.",
  },
  {
    id: "xe-cores",
    name: "Xe cores",
    appliesTo: ["gpu"],
    vendorSpecific: "intel",
    whatItIs:
      "Intel's GPU building block (Arc discrete and Core Ultra integrated graphics). Each Xe core contains vector engines for shading and, on many parts, XMX matrix engines for AI.",
    whyItExists: "Intel's equivalent of a CU or SM.",
    whyItMatters: "Within one Intel Xe generation, more Xe cores means more GPU throughput.",
    whenItMatters: "Comparing Intel GPUs of the same generation.",
    whenItDoesnt: "Against other vendors' units.",
    crossBrand: { verdict: "no", explain: "An Xe core is a different-sized block from a CU, SM or Apple GPU core." },
    misconception: "20 Xe cores is less than 64 CUs, so it's a third as fast.",
  },
  {
    id: "apple-gpu-cores",
    name: "Apple GPU cores",
    appliesTo: ["gpu", "soc"],
    vendorSpecific: "apple",
    whatItIs:
      "Apple counts its GPU in 'cores', each a full cluster of many arithmetic lanes with its own scheduling and cache — closer to an SM or CU than to a CUDA core.",
    whyItExists: "It's Apple's way of describing GPU size within its SoC lineup (e.g. 10-core vs 40-core).",
    whyItMatters: "Within one M-series generation, GPU core count scales GPU performance fairly directly.",
    whenItMatters: "Choosing between Apple chip tiers or configurations.",
    whenItDoesnt: "Against CUDA cores or stream processors — completely different units.",
    crossBrand: {
      verdict: "no",
      explain: "40 Apple GPU cores vs 10,000 CUDA cores compares clusters with lanes. The ratio means nothing.",
    },
    misconception: "Apple GPUs have far fewer cores, so they must be far slower.",
  },
  {
    id: "tensor-cores",
    name: "Tensor Cores / matrix engines",
    appliesTo: ["gpu"],
    whatItIs:
      "Specialised units that multiply small matrices in one operation. NVIDIA calls them Tensor Cores, Intel XMX engines; AMD RDNA uses AI accelerators/WMMA instructions and Instinct GPUs have Matrix Cores; Apple's latest GPUs add neural accelerators per GPU core.",
    whyItExists: "Neural networks are mostly matrix multiplication. Dedicated hardware does it far faster and more efficiently than general lanes.",
    whyItMatters: "They dominate AI training/inference speed and power DLSS/XeSS-style upscaling.",
    whenItMatters: "AI workloads whose software actually uses them (CUDA/cuDNN, ROCm, oneAPI, Metal).",
    whenItDoesnt: "Traditional rendering and general compute that don't use matrix maths.",
    crossBrand: {
      verdict: "no",
      explain: "Counts differ in width, supported precisions and generation. Compare measured AI throughput in your framework instead.",
    },
    misconception: "Tensor Core count tells you AI performance directly.",
  },
  {
    id: "rt-cores",
    name: "RT cores / ray accelerators",
    appliesTo: ["gpu"],
    whatItIs:
      "Fixed-function units that accelerate ray tracing: testing rays against scene geometry. NVIDIA: RT Cores. AMD: Ray Accelerators. Intel: Ray Tracing Units. Apple: hardware ray tracing in M3 and later GPUs.",
    whyItExists: "Ray-triangle intersection tests are extremely numerous and slow on general shader lanes.",
    whyItMatters: "Determine how expensive ray-traced lighting, reflections and path tracing are.",
    whenItMatters: "Games with heavy ray tracing; GPU renderers like Blender Cycles (OptiX, HIP RT, Metal RT).",
    whenItDoesnt: "Rasterised games without ray tracing; non-graphics compute.",
    crossBrand: { verdict: "no", explain: "Each vendor's unit handles a different share of the ray-tracing pipeline in hardware." },
    misconception: "Same RT core count = same ray-tracing performance.",
  },
  {
    id: "tgp",
    name: "TGP / TBP (GPU power)",
    appliesTo: ["gpu"],
    whatItIs:
      "Total Graphics Power or Total Board Power: the power budget for a graphics card or laptop GPU. Laptop makers choose the TGP within a range the GPU vendor allows.",
    whyItExists: "GPUs scale performance with power; the limit keeps heat and PSU load in check.",
    whyItMatters:
      "In laptops it's huge: the same GPU name at a low TGP can perform far below the same name at a high TGP.",
    whenItMatters: "Comparing gaming laptops; sizing a desktop PSU.",
    whenItDoesnt: "As a measure of efficiency on its own.",
    crossBrand: { verdict: "partly", explain: "Watts are watts, but vendors measure board vs chip power differently." },
    misconception: "Every laptop with the same GPU name performs the same.",
  },
  // ---------------------------------------------------------------- Memory
  {
    id: "vram",
    name: "VRAM capacity",
    appliesTo: ["gpu", "memory"],
    whatItIs: "Dedicated memory on a graphics card (GDDR6, GDDR7 or HBM), usable only by that GPU.",
    whyItExists: "GPUs need very high bandwidth close to the chip; the PCIe link to system RAM is far too slow to feed them.",
    whyItMatters: "Sets the size of textures, scenes and AI models the GPU can hold. Running out forces slow spills to system RAM.",
    whenItMatters: "4K gaming with high textures, large 3D scenes, local LLMs and image generation.",
    whenItDoesnt: "When your workload already fits comfortably — extra VRAM doesn't add speed.",
    crossBrand: {
      verdict: "partly",
      explain:
        "GB of VRAM compares fairly between discrete GPUs. It does NOT compare directly with unified memory, which is shared with the OS and CPU.",
    },
    misconception: "More VRAM makes the GPU faster.",
  },
  {
    id: "unified-memory",
    name: "Unified memory capacity",
    appliesTo: ["memory", "soc"],
    whatItIs:
      "One pool of DRAM on the SoC package shared by CPU, GPU and accelerators (Apple M-series; also some PC APUs such as AMD Strix Halo).",
    whyItExists: "Avoids separate memory pools and copies, enables a wide bus, and saves power and space.",
    whyItMatters: "It's your RAM and your 'VRAM' at once. Large configurations can hold models far bigger than consumer GPU VRAM.",
    whenItMatters: "Large AI models, big creative projects, heavy multitasking on Macs.",
    whenItDoesnt: "It doesn't make a small configuration behave like a large one — and it can't be upgraded later.",
    crossBrand: {
      verdict: "no",
      explain: "16 GB of unified memory is not 16 GB of VRAM plus 16 GB of RAM; it's one 16 GB pool for everything.",
    },
    misconception: "Unified memory means unlimited GPU memory.",
  },
  {
    id: "bus-width",
    name: "Memory bus width",
    appliesTo: ["gpu", "memory", "soc"],
    whatItIs: "How many bits of data the memory interface transfers in parallel (e.g. 128-bit, 256-bit, 512-bit).",
    whyItExists: "Bandwidth = bus width × transfer rate. Wider buses move more data per transfer.",
    whyItMatters: "Together with memory speed, it sets bandwidth, which feeds the GPU's compute units.",
    whenItMatters: "High resolutions and AI inference, which are often bandwidth-limited.",
    whenItDoesnt: "On its own — a narrow bus with fast memory and big caches can compete with a wider, slower one.",
    crossBrand: {
      verdict: "partly",
      explain: "Bits are bits, but cache sizes (e.g. AMD Infinity Cache) and memory type change how much bandwidth the GPU needs.",
    },
    misconception: "A 256-bit card is always faster than a 192-bit card.",
  },
  {
    id: "memory-bandwidth",
    name: "Memory bandwidth (GB/s)",
    appliesTo: ["gpu", "memory", "soc"],
    whatItIs: "How many gigabytes per second can move between memory and the processor.",
    whyItExists: "Compute units are useless if they're starved of data.",
    whyItMatters:
      "Often the true limit for AI inference: generating each token reads essentially all model weights, so tokens/s is roughly capped by bandwidth ÷ model size.",
    whenItMatters: "LLM inference, high-resolution rendering, scientific computing.",
    whenItDoesnt: "Workloads that fit in cache or are limited by compute or latency.",
    crossBrand: {
      verdict: "yes",
      explain:
        "GB/s is a physical quantity and compares reasonably across brands — but caches and memory architecture affect how much is actually needed, and peak ≠ achieved.",
    },
    misconception: "High bandwidth means low latency.",
  },
  {
    id: "ram-capacity",
    name: "System RAM capacity",
    appliesTo: ["memory"],
    whatItIs: "Main memory for the CPU and the OS: where running programs and their data live.",
    whyItExists: "Storage is thousands of times slower than RAM; active work must sit in RAM.",
    whyItMatters: "If your working set doesn't fit, the system swaps to SSD and slows dramatically.",
    whenItMatters: "Heavy multitasking, VMs, large datasets, creative projects, CPU-side AI.",
    whenItDoesnt: "Once you have enough — surplus RAM doesn't speed things up.",
    crossBrand: { verdict: "yes", explain: "GB of RAM compare fairly — just remember unified memory also serves the GPU." },
    misconception: "More RAM always makes the computer faster.",
  },
  {
    id: "ram-speed",
    name: "RAM speed (MT/s) & CAS latency",
    appliesTo: ["memory"],
    whatItIs:
      "MT/s (mega-transfers per second, e.g. DDR5-6000) sets bandwidth; CAS latency (CL, e.g. CL30) is a delay in clock cycles. True latency in ns ≈ CL × 2000 ÷ MT/s.",
    whyItExists: "Memory timing is a tradeoff between transfer rate, delay and stability.",
    whyItMatters: "Faster memory helps bandwidth-hungry tasks and integrated GPUs; tighter timings help some games.",
    whenItMatters: "Integrated graphics, some CPU-bound games, memory-bound compute.",
    whenItDoesnt: "Most everyday tasks — gains are usually small once you're at a platform's sweet spot.",
    crossBrand: {
      verdict: "partly",
      explain: "Comparable between DDR modules, but higher CL at higher MT/s may equal the same absolute latency. Compute nanoseconds.",
    },
    misconception: "CL40 is slower than CL30 regardless of frequency.",
  },
  // ---------------------------------------------------------------- AI throughput
  {
    id: "tflops",
    name: "TFLOPS",
    appliesTo: ["gpu", "soc"],
    whatItIs: "Trillions of floating-point operations per second, at a stated precision (FP32, FP16, BF16, FP8, FP4…). Usually a theoretical peak = units × clock × ops per clock.",
    whyItExists: "A simple way to express raw arithmetic capability.",
    whyItMatters: "Indicates the ceiling for compute-bound workloads like training.",
    whenItMatters: "Compute-bound work at the same precision, on software that can actually use the hardware.",
    whenItDoesnt: "Bandwidth-bound work (much inference), or when software can't reach peak.",
    crossBrand: {
      verdict: "partly",
      explain: "Only comparable at the same precision, with/without sparsity, and as peak vs peak. Real utilisation differs by architecture and software.",
    },
    misconception: "Twice the TFLOPS means twice the speed in every app.",
  },
  {
    id: "tops",
    name: "TOPS (AI)",
    appliesTo: ["npu", "gpu", "soc"],
    whatItIs: "Trillions of operations per second, usually integer (INT8 or INT4) — the headline figure for NPUs and 'AI PCs'.",
    whyItExists: "Marketing needs one number for AI capability.",
    whyItMatters: "A rough scale indicator for the NPU or accelerator it describes.",
    whenItMatters: "Comparing NPUs at the same stated precision for on-device features.",
    whenItDoesnt: "Predicting LLM speed (bandwidth-bound) or whether your software uses that engine at all.",
    crossBrand: {
      verdict: "no",
      explain: "Vendors use different precisions, sparsity assumptions and may sum CPU+GPU+NPU. Without the fine print the number isn't comparable.",
    },
    misconception: "A 50 TOPS laptop runs AI twice as fast as a 25 TOPS laptop.",
  },
  {
    id: "npu",
    name: "NPU / Neural Engine",
    appliesTo: ["npu", "soc", "cpu"],
    whatItIs:
      "A low-power accelerator for neural-network inference. Apple: Neural Engine. Intel and AMD: NPU in recent laptop chips.",
    whyItExists: "Running background AI (camera effects, transcription, on-device assistants) on the GPU would waste battery.",
    whyItMatters: "Enables efficient always-on AI features.",
    whenItMatters: "OS features and apps built for it (Core ML, Windows ML/DirectML, OpenVINO, Ryzen AI software).",
    whenItDoesnt: "Most PyTorch training or general LLM work, which typically runs on the GPU or CPU.",
    crossBrand: { verdict: "no", explain: "Different architectures, precisions and software paths. TOPS figures aren't comparable without fine print." },
    misconception: "An NPU replaces a GPU for AI.",
  },
  // ---------------------------------------------------------------- Storage / platform
  {
    id: "pcie-gen",
    name: "PCIe generation & lanes",
    appliesTo: ["gpu", "storage", "cpu"],
    whatItIs:
      "The version (4.0, 5.0…) and width (x4, x16) of the PCI Express link. Each generation roughly doubles bandwidth per lane: PCIe 4.0 x16 ≈ 32 GB/s each way, PCIe 5.0 x16 ≈ 64 GB/s.",
    whyItExists: "It's the main highway between the CPU and GPUs, SSDs and other devices.",
    whyItMatters: "Matters when data actually crosses it heavily — e.g. a GPU spilling out of VRAM, or huge SSD transfers.",
    whenItMatters: "Multi-GPU, VRAM overflow, very fast storage arrays, budget GPUs with only x8 lanes on older boards.",
    whenItDoesnt: "Most gaming on a GPU with enough VRAM — the link is rarely saturated.",
    crossBrand: { verdict: "yes", explain: "PCIe is an industry standard; generation and lane counts compare directly (Apple Silicon's internals don't use it the same way)." },
    misconception: "A PCIe 5.0 GPU or SSD is automatically twice as fast.",
  },
  {
    id: "ssd-speed",
    name: "SSD sequential vs random speed",
    appliesTo: ["storage"],
    whatItIs:
      "Sequential speed (GB/s) measures big contiguous reads/writes. Random speed (IOPS, or MB/s at 4K blocks) measures many small scattered accesses.",
    whyItExists: "Different workloads access storage very differently.",
    whyItMatters: "Everyday responsiveness depends more on random reads at low queue depth than on the headline sequential number.",
    whenItMatters: "Sequential: copying big video files, loading huge datasets. Random: booting, app launches, compiling.",
    whenItDoesnt: "Once data is already in RAM, storage speed barely matters.",
    crossBrand: { verdict: "yes", explain: "Benchmarks are comparable if measured the same way — but vendor headline figures are best-case." },
    misconception: "A 14 GB/s SSD loads games twice as fast as a 7 GB/s one.",
  },
  {
    id: "psu-wattage",
    name: "PSU wattage & efficiency",
    appliesTo: ["psu"],
    whatItIs: "The maximum continuous power the power supply can deliver, and how efficiently it converts wall power (80 Plus ratings).",
    whyItExists: "Components need stable DC power with headroom for transient spikes.",
    whyItMatters: "Too small causes shutdowns under load; poor quality can harm stability.",
    whenItMatters: "High-end GPUs with large transient spikes; future upgrades.",
    whenItDoesnt: "It does not determine how much power the PC uses.",
    crossBrand: { verdict: "yes", explain: "Watts and 80 Plus ratings are standardised (build quality still varies)." },
    misconception: "A 1000 W PSU always consumes 1000 W.",
  },
];

export const SPEC_FILTERS: { id: SpecDefinition["appliesTo"][number]; label: string }[] = [
  { id: "cpu", label: "CPU" },
  { id: "gpu", label: "GPU" },
  { id: "memory", label: "Memory" },
  { id: "soc", label: "SoC" },
  { id: "npu", label: "AI / NPU" },
  { id: "storage", label: "Storage" },
  { id: "psu", label: "Power" },
];

import type { Layered, NodeKind } from "@/data/schema";

/**
 * Content for the homepage's interactive computer. The SVG artwork lives in
 * components/computer; every clickable part references an item here by id.
 * `zoom` is the viewBox region (in the 1200 x 760 artwork) to zoom into.
 */
export interface ComputerPart {
  id: string;
  label: string;
  kind: NodeKind;
  zoom: [number, number, number, number];
  body: Layered;
  lookAt: string[];
  lesson?: string;
}

export type ComputerMode = "pc" | "mac";

export const COMPUTER_PARTS: Record<ComputerMode, ComputerPart[]> = {
  pc: [
    {
      id: "cpu",
      label: "CPU",
      kind: "cpu",
      zoom: [380, 80, 300, 280],
      body: {
        simple:
          "The CPU is the computer's general-purpose brain. It runs the operating system and the logic of every program, one instruction at a time per core — billions of times per second. It has a handful of very capable cores, each good at making decisions quickly.",
        technical:
          "Each **core** fetches instructions, decodes them into internal operations, executes them on ALUs and load/store units, and writes results to registers. Modern desktop CPUs have 6–24 cores, run at 4–6 GHz, and execute several instructions per clock (IPC). Some designs mix **performance** and **efficiency** cores. The package also contains the **memory controller** and **PCIe** root complex.",
        deep:
          "Performance ≈ IPC × clock × useful parallelism. IPC comes from the microarchitecture: decode width, reorder-buffer size, branch-prediction accuracy, cache hierarchy and execution ports. Ryzen CPUs place cores on chiplets (CCDs) joined to an I/O die by Infinity Fabric; Intel Core Ultra desktop parts use tiles with Foveros packaging and mix P-cores and E-cores. Both implement the x86-64 instruction set — but the instruction set is only one of many factors in speed and efficiency.",
      },
      lookAt: ["Per-core performance (reviews, not GHz alone)", "Core count & type (P/E)", "Cache size (L2/L3)", "Power limits (TDP/PPT/PL2)"],
      lesson: "/learn/cpu",
    },
    {
      id: "cache",
      label: "CPU cache",
      kind: "cache",
      zoom: [440, 140, 180, 150],
      body: {
        simple:
          "Cache is a tiny amount of super-fast memory built into the CPU. It keeps the data the cores are using right now close by, so they don't have to wait for the much slower RAM.",
        technical:
          "There are levels: **L1** (tens of KB per core, ~1 ns), **L2** (~1–3 MB per core, a few ns) and a shared **L3** (tens of MB, ~10 ns). RAM is ~80–120 ns away. Programs that reuse data run mostly from cache; when they miss, the core can stall for hundreds of cycles.",
        deep:
          "Caches work because of **locality**: data used once is likely to be used again (temporal) and its neighbours too (spatial — caches move 64-byte lines). Hit rate depends on the workload's working-set size. AMD's **3D V-Cache** stacks extra L3 on top of the CCD (96 MB total on the 9800X3D); games with large, scattered working sets often gain a lot, while workloads that already fit in cache or stream through memory gain little.",
      },
      lookAt: ["L3 size (matters for games & some simulations)", "L2 per core", "Is it shared across all cores or per chiplet?"],
      lesson: "/learn/memory-hierarchy",
    },
    {
      id: "ram",
      label: "RAM",
      kind: "memory",
      zoom: [660, 70, 200, 320],
      body: {
        simple:
          "RAM is the computer's working desk. Everything you have open lives here while you use it. It is much faster than storage but forgets everything when the power goes off.",
        technical:
          "Desktop PCs use **DDR5** DIMMs on (usually) two 64-bit channels. Peak bandwidth ≈ data rate × bus width: DDR5-6000 × 128 bits ≈ 96 GB/s. **Capacity** decides how much you can keep open without swapping to the SSD; **speed and latency** affect some workloads modestly.",
        deep:
          "Real access latency (~70–100 ns) is dominated by more than CAS: row activation, controller queuing and the trip across the fabric. Populating 4 DIMMs can force lower speeds. More RAM only helps if you were running out — beyond that, unused RAM is used by the OS as file cache, not as extra speed.",
      },
      lookAt: ["Capacity (16 / 32 / 64 GB)", "Channels populated (2 sticks for dual channel)", "Speed (MT/s) and latency — second-order"],
      lesson: "/learn/ram",
    },
    {
      id: "membus",
      label: "Memory bus",
      kind: "memory",
      zoom: [560, 120, 200, 240],
      body: {
        simple: "These copper traces connect the CPU to its RAM. They are the road that every byte of working data travels on.",
        technical:
          "Each DDR5 DIMM provides two 32-bit sub-channels. A typical desktop has a 128-bit total memory bus — narrow compared with a graphics card's 256–512-bit VRAM bus or Apple's 128- to 1024-bit unified-memory buses. Width × data rate = bandwidth.",
        deep:
          "Signal integrity limits how fast these long board traces can run, which is one reason soldered or on-package memory (LPDDR5X, Apple's in-package memory, CAMM modules) can reach higher data rates with less power — at the cost of upgradeability.",
      },
      lookAt: ["Bus width (channels)", "Data rate (MT/s)", "Supported speeds of the CPU & motherboard"],
      lesson: "/learn/ram",
    },
    {
      id: "gpu",
      label: "GPU",
      kind: "gpu",
      zoom: [380, 430, 440, 210],
      body: {
        simple:
          "The GPU is a huge team of simple workers. Instead of a few clever cores, it has thousands of lanes that all do the same kind of math at once — perfect for drawing millions of pixels or multiplying the giant matrices inside AI models.",
        technical:
          "GPUs group lanes into blocks — NVIDIA **SMs**, AMD **Compute Units**, Intel **Xe cores**, Apple **GPU cores** — each running many threads in lockstep groups (warps/wavefronts/SIMD-groups). Add fixed-function units: rasterisers, texture units, **ray-tracing** cores, **matrix** units (Tensor Cores, XMX, AI accelerators) and video engines.",
        deep:
          "GPUs hide memory latency with massive multithreading rather than big caches: while one group waits for memory, others run. That's why GPU performance leans so heavily on **memory bandwidth**. Unit counts are vendor-specific bookkeeping — 10,000 CUDA cores and 4,096 stream processors are not comparable numbers.",
      },
      lookAt: ["Measured performance in your apps/games", "VRAM capacity", "Memory bandwidth", "Software support (CUDA / ROCm / oneAPI / Metal)", "Power (TGP) & size"],
      lesson: "/learn/gpu",
    },
    {
      id: "vram",
      label: "VRAM",
      kind: "vram",
      zoom: [420, 440, 360, 190],
      body: {
        simple:
          "VRAM is the graphics card's own memory, right next to the GPU. Textures, frames and AI model weights must fit here for the GPU to work at full speed.",
        technical:
          "VRAM chips (GDDR6/GDDR7) surround the GPU on a wide bus — 128 to 512 bits — reaching hundreds of GB/s to ~1.8 TB/s on the largest consumer cards. Capacity is fixed by the card: 8, 12, 16, 24 or 32 GB.",
        deep:
          "When a workload exceeds VRAM, drivers evict and re-upload data across PCIe (games stutter) or runtimes split work with the CPU (LLMs slow sharply). More VRAM does not make a GPU faster — it raises the ceiling on what fits.",
      },
      lookAt: ["Capacity vs your workload (4K textures, LLM size)", "Bus width & bandwidth", "Memory type (GDDR6/GDDR7)"],
      lesson: "/learn/gpu",
    },
    {
      id: "pcie",
      label: "PCIe",
      kind: "interconnect",
      zoom: [300, 300, 520, 200],
      body: {
        simple:
          "PCIe is the high-speed link between the CPU and plug-in cards like the graphics card and SSDs. Think of it as a multi-lane highway between separate buildings.",
        technical:
          "Bandwidth = generation × lanes. PCIe 4.0 ≈ 2 GB/s per lane per direction, PCIe 5.0 ≈ 4 GB/s. A x16 graphics slot at PCIe 5.0 ≈ 64 GB/s each way — fast, but well below a GPU's own VRAM bandwidth. That's why GPUs work out of VRAM.",
        deep:
          "CPUs provide a limited number of lanes (graphics x16, one or two M.2 x4) plus a link to the chipset, which fans out more (slower, shared) lanes. Resizable BAR lets the CPU map all of VRAM at once. For most games the PCIe generation matters little once data is resident in VRAM.",
      },
      lookAt: ["Slot generation and width (x16 / x8)", "Number of CPU-attached M.2 slots", "Lane sharing in the motherboard manual"],
      lesson: "/learn/motherboard-pcie",
    },
    {
      id: "ssd",
      label: "SSD",
      kind: "storage",
      zoom: [240, 610, 400, 120],
      body: {
        simple:
          "The SSD is long-term storage: your files, apps and the operating system live here even when the power is off. It's far bigger than RAM but much slower to reach.",
        technical:
          "Modern **NVMe** SSDs use flash memory over PCIe x4. Sequential speed: ~3.5 GB/s (Gen3), ~7 GB/s (Gen4), ~14 GB/s (Gen5). But many real tasks are small random reads, where latency (tens of µs) and queue depth matter more than the headline number.",
        deep:
          "Flash is read/written in pages and erased in blocks; the controller hides this with a translation layer, caching (SLC cache, DRAM or host memory) and wear levelling. That's why sustained writes can slow down once a cache fills, and why a Gen5 drive rarely halves game load times — CPU decompression and asset processing are often the real limit.",
      },
      lookAt: ["Capacity", "Random 4K performance & latency", "DRAM cache / sustained write", "Generation (Gen4 is plenty for most)"],
      lesson: "/learn/storage",
    },
    {
      id: "storagebus",
      label: "Storage bus",
      kind: "storage",
      zoom: [150, 250, 450, 460],
      body: {
        simple: "These lanes carry data between the SSD and the CPU. When you open a file, it travels along here into RAM.",
        technical:
          "A primary M.2 slot usually connects directly to 4 CPU PCIe lanes; others may go through the chipset, sharing its uplink. Data moves by DMA — the SSD writes straight into RAM without the CPU copying every byte.",
        deep:
          "Technologies like DirectStorage aim to cut CPU overhead on this path by batching requests and decompressing on the GPU. The bus is rarely the bottleneck for everyday use; the flash and the software stack usually are.",
      },
      lookAt: ["Which M.2 slots are CPU-attached", "Whether slots share lanes with other devices"],
      lesson: "/learn/storage",
    },
    {
      id: "board",
      label: "Motherboard",
      kind: "interconnect",
      zoom: [40, 30, 1120, 700],
      body: {
        simple:
          "The motherboard is the city map that connects everything: sockets and slots for each part, the wiring between them, and power delivery.",
        technical:
          "It provides the CPU **socket** (AM5 for current Ryzen, LGA1851 for Core Ultra 200S), DIMM slots, PCIe slots, M.2 slots, the **chipset** for extra I/O, and **VRMs** that convert 12 V into the ~1 V the CPU needs.",
        deep:
          "Boards differ mainly in I/O, lane allocation, VRM quality and features — not raw speed. A socket determines which CPU generations you can upgrade to; this is a long-term cost factor for PC builders, and something an SoC-based machine trades away.",
      },
      lookAt: ["Socket & upgrade path", "M.2 / PCIe lane layout", "VRM cooling for high-power CPUs", "Ports you need"],
      lesson: "/learn/motherboard-pcie",
    },
    {
      id: "psu",
      label: "Power supply",
      kind: "power",
      zoom: [930, 500, 260, 240],
      body: {
        simple:
          "The power supply converts wall power into the steady low voltages the computer needs. Its wattage is a maximum it can deliver — not what it constantly uses.",
        technical:
          "A PSU supplies 12 V (most power, to CPU and GPU), plus 5 V and 3.3 V. The system draws only what it needs: a 1000 W PSU in a PC using 300 W delivers 300 W (plus conversion losses — see the 80 Plus efficiency rating).",
        deep:
          "Size for peak system power plus headroom, especially for high-end GPUs with fast power spikes; ATX 3.x PSUs and the 12V-2x6 connector are designed for them. Oversizing a lot wastes money; efficiency curves are usually best at roughly half load.",
      },
      lookAt: ["Wattage with headroom for your GPU", "Efficiency rating", "Connectors (12V-2x6 for some GPUs)", "Quality reviews"],
      lesson: "/learn/motherboard-pcie",
    },
    {
      id: "cooling",
      label: "Cooling",
      kind: "cooling",
      zoom: [960, 50, 220, 380],
      body: {
        simple:
          "All the electricity a computer uses ends up as heat. Fans, heatsinks and coolers carry it away so chips can keep running fast.",
        technical:
          "Chips boost their clocks until they hit a power, current or temperature limit. Better cooling means higher **sustained** clocks. A desktop GPU may dissipate 200–575 W; a thin laptop must fit everything into a few tens of watts.",
        deep:
          "Power rises steeply with frequency because voltage must rise too (P ∝ C·V²·f). That's why the last few hundred MHz cost so much heat, and why laptop and desktop chips with the same name can perform very differently — their cooling and power budgets differ by several times.",
      },
      lookAt: ["Cooler capacity vs CPU/GPU power", "Case airflow", "Noise under sustained load"],
      lesson: "/efficiency",
    },
  ],
  mac: [
    {
      id: "soc",
      label: "Apple SoC (CPU cores)",
      kind: "cpu",
      zoom: [390, 180, 420, 340],
      body: {
        simple:
          "In an Apple Silicon Mac, the CPU is one part of a single chip — the SoC — which also contains the GPU, Neural Engine and media engines. The CPU cores come in two types: fast performance cores and frugal efficiency cores.",
        technical:
          "Apple's cores implement the **ARM64** instruction set. Performance cores are very wide (many instructions per clock) and run at clocks somewhat below the fastest desktop x86 chips; efficiency cores handle background work at a fraction of the power. macOS schedules work using **quality-of-service** classes.",
        deep:
          "High IPC at lower frequency is an efficiency choice: power rises steeply with clock speed. Apple's performance comes from microarchitecture, large caches, a leading-edge process node and vertical integration with macOS — not from ARM alone. x86 chips can be efficient too; ARM chips can be slow. The ISA is one factor among many.",
      },
      lookAt: ["P-core and E-core counts", "Chip tier (base / Pro / Max / Ultra)", "Generation (M1…M5)"],
      lesson: "/learn/apple-silicon",
    },
    {
      id: "macgpu",
      label: "Apple GPU",
      kind: "gpu",
      zoom: [540, 200, 220, 150],
      body: {
        simple:
          "The GPU is built into the same chip as the CPU. It draws the screen, runs games and does a lot of AI math — using the same memory as everything else.",
        technical:
          "Apple GPUs scale from ~8–10 cores in base chips to dozens in Max/Ultra chips. They use **tile-based deferred rendering** and are programmed through **Metal**. Recent generations add hardware ray tracing, and M5-generation GPU cores add neural accelerators for matrix math.",
        deep:
          "An Apple GPU core is not a CUDA core: it's a much bigger block containing many ALUs. Count comparisons across vendors are meaningless. What matters is measured throughput, memory bandwidth (which scales with chip tier), and whether your software has a good Metal path.",
      },
      lookAt: ["GPU core count within the same generation", "Memory bandwidth of the chip tier", "Metal support in your apps/games"],
      lesson: "/learn/apple-silicon",
    },
    {
      id: "ane",
      label: "Neural Engine",
      kind: "accel",
      zoom: [440, 340, 200, 120],
      body: {
        simple: "The Neural Engine is a small, very efficient accelerator for AI features — things like photo search, dictation and on-device Apple Intelligence.",
        technical:
          "It runs neural-network operations accessed through **Core ML**. It's power-efficient for supported models, but much AI development (PyTorch MPS, MLX, llama.cpp) runs on the **GPU** instead, which is more flexible.",
        deep:
          "NPU TOPS figures (Apple's and others') are quoted at specific low precisions and aren't comparable across vendors. The practical question is which engine your framework actually targets.",
      },
      lookAt: ["Whether your AI tools use Core ML (Neural Engine) or Metal/MLX (GPU)"],
      lesson: "/learn/ai-hardware",
    },
    {
      id: "media",
      label: "Media engines",
      kind: "accel",
      zoom: [540, 340, 200, 120],
      body: {
        simple: "Special circuits that encode and decode video, so editing and playback are fast and don't drain the battery.",
        technical:
          "Hardware support for H.264, HEVC and **ProRes** (on many chips), and AV1 decode on recent generations. Pro and Max chips add more engines.",
        deep:
          "Fixed-function engines are vastly more efficient than general cores for the formats they support — and useless for formats they don't. Codec support, not core count, decides how smooth a given camera's footage edits.",
      },
      lookAt: ["Number of encode/decode engines (by tier)", "ProRes / AV1 support"],
      lesson: "/learn/apple-silicon",
    },
    {
      id: "slc",
      label: "System Level Cache",
      kind: "cache",
      zoom: [440, 300, 320, 100],
      body: {
        simple: "A shared cache in the middle of the chip that the CPU, GPU and other engines can all use to avoid going out to memory.",
        technical:
          "Besides the per-cluster L1/L2 caches, Apple SoCs have a **System Level Cache** in front of the memory controllers, shared by all agents. It reduces memory traffic and power.",
        deep:
          "Because CPU and GPU share memory, keeping data coherent and avoiding redundant traffic is the fabric's job. Cache hierarchy, not just raw bandwidth, is part of why integrated designs can be efficient.",
      },
      lookAt: ["Rarely listed — a reason not to judge chips by spec sheets alone"],
      lesson: "/learn/memory-hierarchy",
    },
    {
      id: "um",
      label: "Unified memory",
      kind: "memory",
      zoom: [390, 180, 420, 340],
      body: {
        simple:
          "In an Apple Silicon Mac, there is one pool of memory that the CPU, GPU and Neural Engine all share. There is no separate graphics memory. It sits inside the chip's package.",
        technical:
          "LPDDR5/5X packages on a wide bus. Bandwidth depends heavily on tier and generation: roughly 70–150 GB/s on base chips, 150–275 GB/s on Pro, 300–550 GB/s on Max and ~800 GB/s on Ultra chips. The GPU can use a large portion of the pool, so big models or scenes fit that wouldn't fit on a consumer graphics card.",
        deep:
          "Capacity is shared: the OS, apps and GPU all draw from it, and macOS limits how much the GPU can wire by default (adjustable). It is fixed at purchase. And bandwidth — not the word 'unified' — determines how fast GPU workloads run.",
      },
      lookAt: ["Capacity — you can't upgrade later", "Bandwidth of the chip tier", "Headroom for OS + apps + GPU together"],
      lesson: "/learn/unified-memory",
    },
    {
      id: "novram",
      label: "VRAM? (none)",
      kind: "vram",
      zoom: [390, 180, 640, 340],
      body: {
        simple: "There is no separate VRAM in an Apple Silicon Mac. The GPU uses the unified memory pool.",
        technical:
          "That's why a Mac's '16 GB' and a graphics card's '16 GB VRAM' aren't the same thing: the Mac's 16 GB is shared with macOS and every app; the card's 16 GB is dedicated to the GPU (and the PC has system RAM on top).",
        deep:
          "Unified memory removes CPU↔GPU bulk copies and lets large data sets fit, but a high-end graphics card's GDDR7 still offers more raw bandwidth than most unified-memory chips. Different tradeoffs, not a strict ranking.",
      },
      lookAt: ["Total memory needed by OS + apps + GPU work"],
      lesson: "/unified-memory",
    },
    {
      id: "macfabric",
      label: "Memory bus & fabric",
      kind: "memory",
      zoom: [390, 180, 420, 340],
      body: {
        simple: "Very short, very wide connections inside the package link the memory to every engine on the chip.",
        technical:
          "Instead of 128-bit DIMM traces across a motherboard, Apple uses many LPDDR channels inside the package: 128-bit on base chips up to 512-bit on Max and 1024-bit on Ultra. Short distances allow high data rates at low power.",
        deep: "This is the physical reason capacity is fixed: the memory is in the package, not on a socket.",
      },
      lookAt: ["Memory bandwidth figure for the chip tier"],
      lesson: "/learn/unified-memory",
    },
    {
      id: "macssd",
      label: "SSD",
      kind: "storage",
      zoom: [800, 210, 180, 230],
      body: {
        simple: "Storage for your files and apps. On Macs it's soldered to the board and the storage controller is inside the SoC.",
        technical:
          "The NAND flash chips sit on the logic board while the controller is part of the SoC (with encryption built in). Capacity is fixed at purchase on most models.",
        deep:
          "Lower-capacity configurations may use fewer NAND chips, which can mean lower parallelism and slower sequential speeds in some generations — another reason to check reviews of the exact configuration.",
      },
      lookAt: ["Capacity — usually not upgradeable", "Reviews of the exact configuration"],
      lesson: "/learn/storage",
    },
    {
      id: "macio",
      label: "PCIe / Thunderbolt",
      kind: "interconnect",
      zoom: [30, 180, 300, 260],
      body: {
        simple: "Macs still use PCIe — but for ports, Wi-Fi and external devices, not to connect the CPU to the GPU.",
        technical:
          "Thunderbolt/USB 4 controllers in the SoC carry PCIe to external devices. Apple Silicon Macs don't support external or add-in GPUs for macOS graphics.",
        deep: "This is the flip side of integration: the CPU-GPU link becomes on-chip fabric, and the GPU can't be swapped or added to.",
      },
      lookAt: ["Number of Thunderbolt ports & displays supported"],
      lesson: "/learn/motherboard-pcie",
    },
    {
      id: "logicboard",
      label: "Logic board",
      kind: "interconnect",
      zoom: [40, 30, 1120, 700],
      body: {
        simple: "A Mac's logic board is small because so much is inside the SoC package. There are no slots to upgrade.",
        technical: "SoC, NAND, power management and port controllers are soldered. Configuration choices are made at purchase.",
        deep: "Compact boards save space and power; the tradeoff is repair and upgrade flexibility.",
      },
      lookAt: ["Buy the memory and storage you'll need for years"],
      lesson: "/learn/apple-silicon",
    },
    {
      id: "macpower",
      label: "Battery & power",
      kind: "power",
      zoom: [60, 530, 1080, 220],
      body: {
        simple: "Laptops run from a battery, so every watt counts. Efficient chips mean longer battery life and less heat.",
        technical:
          "A MacBook's whole SoC may use a few watts for light tasks and tens of watts flat-out; high-end Max chips can draw much more. Performance on battery is a design goal, not an afterthought.",
        deep:
          "Efficiency (work per joule) depends on architecture, process node, power budget, integration and workload. Some PC laptops are very efficient; some Mac workloads are power-hungry. Compare at the same task.",
      },
      lookAt: ["Battery life reviews for your workload", "Performance on battery vs plugged in"],
      lesson: "/efficiency",
    },
    {
      id: "maccooling",
      label: "Cooling",
      kind: "cooling",
      zoom: [120, 30, 960, 220],
      body: {
        simple: "Some Macs have fans; the MacBook Air has none. Less cooling means the chip slows down sooner under long, heavy work.",
        technical:
          "The same chip can sustain different performance in a fanless Air, a MacBook Pro with fans, and a desktop Mac Studio — cooling sets the sustained power budget.",
        deep: "Burst performance (a few seconds) is similar; sustained performance diverges. Benchmarks that run briefly can hide this.",
      },
      lookAt: ["Fan vs fanless for sustained work"],
      lesson: "/efficiency",
    },
  ],
};

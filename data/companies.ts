import type { CompanyId, Manufacturer } from "@/data/schema";

/**
 * Neutral company records. Each describes WHAT the company builds and the
 * tradeoffs of its approach — never a ranking.
 */
export const COMPANIES: Manufacturer[] = [
  {
    id: "apple",
    name: "Apple",
    tagline: "Designs whole systems: its own ARM-based SoCs, the computers they go in, and the operating system that runs on them.",
    isa: ["ARM64 (AArch64)"],
    softwareStack: ["apple-ai", "apple-graphics"],
    summary: {
      simple:
        "Apple doesn't sell chips to anyone else. It designs the chip, the laptop or desktop around it, and macOS — all together. Its M-series chips put the CPU, the graphics, an AI engine and video engines on **one piece of silicon**, sitting right next to a single shared pool of memory.\n\nThat makes Macs quiet, long-lasting on battery and very consistent. The tradeoff is that you can't swap parts later: the memory and storage you buy on day one are what you keep.",
      technical:
        "Apple Silicon is a family of **systems-on-chip (SoCs)** built on the **ARM64** instruction set under Apple's architecture license. A single M-series die (or two fused dies in the Ultra tier) integrates performance cores, efficiency cores, a tile-based GPU, the **Neural Engine** (an NPU), hardware **media engines** for H.264/HEVC/ProRes (and AV1 decode on newer generations), Secure Enclave, and the memory controllers.\n\nLPDDR memory sits **on the package** next to the die. CPU, GPU and Neural Engine all address the same physical memory — Apple calls this the [unified memory architecture](/unified-memory). Wider memory buses on Pro/Max/Ultra tiers scale bandwidth with the chip.\n\nBecause Apple also writes macOS, Metal, Core ML and its compilers, it can tune the scheduler for P/E cores, add hardware for its own media codecs, and assume every Mac of a generation behaves predictably.",
      deep:
        "Apple's advantage is **vertical integration**: microarchitecture, SoC floorplan, memory subsystem, OS scheduler, graphics API ([Metal](/glossary#metal)), ML frameworks (Core ML, MLX) and the product enclosure are designed by one organisation. Decisions that are hard in the PC ecosystem — e.g. shipping a large system-level cache, very wide decode on the P-cores, or running the entire OS on a new ISA (the 2020 x86→ARM transition with Rosetta 2 translation) — are coordinated end to end.\n\nThe cost of that integration is **flexibility**. The SoC is soldered; memory is part of the package and is fixed at purchase; there is no discrete-GPU option on current Apple Silicon Macs; and Apple chooses which APIs exist. There is **no CUDA** on macOS, Vulkan/DirectX run only through translation layers, and many Windows games and anti-cheat systems are unavailable.\n\nApple's GPU uses a tile-based deferred rendering heritage from its mobile GPUs. Since M3 it adds hardware ray tracing, mesh shading and \"Dynamic Caching\" (on-chip GPU memory allocated per-shader at run time). M5 added neural accelerators inside each GPU core. These are Apple-specific design choices and their core counts cannot be compared one-to-one with other vendors' units.",
    },
    productLines: [
      { name: "M-series (M1 → M5)", scope: "platform", kind: "accel", market: "Mac laptops & desktops, iPad Pro/Air", description: "The base SoC for MacBook Air, base MacBook Pro, iMac, Mac mini and iPads. CPU, GPU, Neural Engine, media engines and memory controllers on one die." },
      { name: "M-series Pro / Max", scope: "platform", kind: "accel", market: "MacBook Pro, Mac mini, Mac Studio", description: "Larger dies with more CPU and GPU cores, wider memory buses (more bandwidth), more media engines and larger memory capacities." },
      { name: "M-series Ultra", scope: "platform", kind: "accel", market: "Mac Studio, Mac Pro", description: "Two Max-class dies joined by a high-bandwidth die-to-die interconnect (UltraFusion), presented to software as one chip." },
      { name: "A-series", scope: "chip", kind: "accel", market: "iPhone, some iPads", description: "Phone SoCs that share CPU/GPU core designs with the M-series, tuned for a smaller power budget." },
      { name: "Mac computers", scope: "system", kind: "display", market: "Consumers to pro studios", description: "Apple sells finished systems, not chips. Comparing \"an M-series\" usually means comparing a whole Mac." },
    ],
    keyTech: [
      { term: "ARM64", explain: "The instruction set Apple's cores execute. Apple designs its own cores rather than licensing ARM's off-the-shelf Cortex designs.", conceptId: "arm" },
      { term: "System-on-Chip", explain: "CPU, GPU, Neural Engine, media engines and memory controllers integrated on one die.", conceptId: "soc" },
      { term: "Performance & efficiency cores", explain: "Big wide cores for demanding work and small low-power cores for background tasks; macOS schedules using Quality-of-Service hints.", conceptId: "hybrid-cores" },
      { term: "Unified memory", explain: "One pool of on-package LPDDR memory shared by CPU, GPU and Neural Engine. Fixed at purchase.", conceptId: "unified-memory" },
      { term: "Neural Engine", explain: "A dedicated NPU for low-power ML inference, used through Core ML. Separate from the GPU, which also runs ML work.", conceptId: "npu" },
      { term: "Media engines", explain: "Fixed-function video encode/decode blocks (H.264, HEVC, ProRes; AV1 decode on M3 and later) that handle video without loading CPU or GPU.", conceptId: "media-engine" },
      { term: "Metal", explain: "Apple's low-level graphics and compute API. Metal Performance Shaders and MLX build on it for ML.", conceptId: "metal" },
      { term: "MetalFX", explain: "Apple's upscaling (and on newer OSes, frame interpolation) technology for games.", conceptId: "upscaling" },
    ],
    strengths: [
      "Performance-per-watt in laptops: strong sustained performance on battery with modest cooling.",
      "Large unified-memory configurations let the GPU address far more memory than consumer graphics cards carry as VRAM.",
      "Hardware media engines that accelerate H.264/HEVC/ProRes workflows in apps optimised for them.",
      "One company tunes chip, OS, drivers and APIs, so behaviour is consistent across a product generation.",
    ],
    limitations: [
      "Memory and storage are fixed at purchase; the SoC cannot be upgraded.",
      "No discrete-GPU option and no CUDA — software that requires CUDA will not run natively.",
      "Smaller native game library; many Windows titles and anti-cheat systems are unavailable or run through translation.",
      "Limited hardware customization: you choose among Apple's configurations rather than individual parts.",
      "Memory and storage upgrades at purchase are priced by Apple; there is no third-party option.",
    ],
  },
  {
    id: "amd",
    name: "AMD",
    tagline: "Designs both x86 CPUs and GPUs — from desktop Ryzen and Radeon cards to EPYC servers and Instinct accelerators.",
    isa: ["x86-64"],
    softwareStack: ["amd-ai", "amd-graphics"],
    summary: {
      simple:
        "AMD makes **two different kinds of chips**: Ryzen processors (CPUs) and Radeon graphics cards (GPUs). A PC can use an AMD CPU with an NVIDIA GPU, an AMD CPU with an AMD GPU, or many other combinations.\n\nAMD is known for building processors out of several smaller chips (\"chiplets\") and for its X3D processors, which stack extra cache on top of the CPU — something that helps many games.",
      technical:
        "**CPUs:** Ryzen (desktop/laptop) and EPYC (server) use the **Zen** microarchitectures. Desktop Ryzen and EPYC are built from **chiplets**: one or more CCDs (core complex dies, each typically 8 cores with shared L3) plus an I/O die holding memory controllers, PCIe and — on recent desktop parts — a small integrated GPU. The pieces talk over **Infinity Fabric**.\n\n**X3D** parts add **3D V-Cache**: an extra SRAM die stacked on a CCD, tripling that CCD's L3 (e.g. 32 MB → 96 MB). Workloads whose working set fits in the larger cache — many games — can speed up noticeably; others see little change.\n\n**GPUs:** Radeon gaming GPUs use **RDNA**; datacenter Instinct accelerators use **CDNA**, a compute-focused derivative. AMD's GPU compute stack is **ROCm** with the **HIP** programming model.\n\n**APUs** combine Zen CPU cores and an RDNA GPU on one chip. Ryzen AI Max (\"Strix Halo\") pairs a large iGPU with a wide memory bus and up to 128 GB of shared memory — a PC take on a large shared-memory pool.",
      deep:
        "AMD's chiplet strategy is an economic and engineering bet: small CCDs on a leading-edge node yield better than one large monolithic die, the I/O die can use a cheaper node, and one CCD design scales from 6-core desktop parts to 100+ core EPYC parts. The cost is **cross-die latency** — a core reaching memory or another CCD's cache crosses Infinity Fabric, which is slower than on-die wiring. Scheduling a game onto the CCD with V-Cache (on dual-CCD X3D parts) is one place where OS and driver cooperation matters.\n\nOn GPUs, AMD splits graphics (RDNA) from datacenter compute (CDNA). RDNA counts **Compute Units** (each with 64 stream processors in the marketing count), **Ray Accelerators** and, since RDNA 3, AI-oriented matrix instructions; RDNA 4 added much stronger ML throughput and FSR 4's ML-based upscaling. RDNA 3 introduced GPU chiplets (graphics die + memory cache dies) on high-end cards.\n\nFor AI, AMD's hardware can be competitive on paper, but **software maturity** is the deciding factor: ROCm supports PyTorch and many libraries, yet officially supported consumer GPUs, OS support and third-party library coverage have historically been narrower than CUDA's. Check the ROCm compatibility matrix for the exact GPU and OS before buying for ML.",
    },
    productLines: [
      { name: "Ryzen", scope: "chip", kind: "cpu", market: "Desktop & laptop CPUs", description: "Zen-based x86 CPUs. Desktop parts use chiplets; most laptop parts are monolithic. X3D variants add stacked cache." },
      { name: "Ryzen AI / APUs", scope: "chip", kind: "accel", market: "Laptops, mini PCs", description: "CPU + RDNA iGPU + XDNA NPU on one chip. Ryzen AI Max adds a very large iGPU and a 256-bit memory bus." },
      { name: "EPYC", scope: "chip", kind: "cpu", market: "Servers", description: "Many-chiplet server CPUs with very high core counts and memory-channel counts." },
      { name: "Radeon RX", scope: "component", kind: "gpu", market: "Gaming graphics cards", description: "RDNA-based discrete GPUs with their own GDDR VRAM, plugged in over PCIe." },
      { name: "Radeon PRO", scope: "component", kind: "gpu", market: "Workstation GPUs", description: "RDNA GPUs with workstation drivers and certifications, often more VRAM." },
      { name: "Instinct", scope: "component", kind: "gpu", market: "Datacenter AI/HPC accelerators", description: "CDNA-based accelerators with HBM memory, programmed through ROCm." },
    ],
    keyTech: [
      { term: "Zen", explain: "AMD's family of x86 CPU core designs (Zen 2, 3, 4, 5…).", conceptId: "microarchitecture" },
      { term: "Chiplets", explain: "Building one processor from several smaller dies in a single package.", conceptId: "chiplet" },
      { term: "Infinity Fabric", explain: "AMD's interconnect between chiplets, memory controllers and I/O.", conceptId: "infinity-fabric" },
      { term: "3D V-Cache (X3D)", explain: "An extra L3 cache die stacked on a CPU chiplet. Big gains when a hot working set fits; little when it doesn't.", conceptId: "3d-v-cache" },
      { term: "RDNA", explain: "AMD's gaming GPU architecture (Radeon, consoles, iGPUs).", conceptId: "rdna" },
      { term: "CDNA", explain: "AMD's datacenter compute GPU architecture (Instinct).", conceptId: "cdna" },
      { term: "ROCm / HIP", explain: "AMD's open GPU compute stack and its CUDA-like programming model.", conceptId: "rocm" },
      { term: "FSR", explain: "FidelityFX Super Resolution — AMD's upscaling and frame generation; FSR 4 is ML-based on RDNA 4.", conceptId: "upscaling" },
    ],
    strengths: [
      "Builds both CPUs and GPUs, and APUs that combine them.",
      "Chiplets scale core counts economically, from desktop to large EPYC servers.",
      "X3D processors help cache-sensitive workloads such as many games.",
      "Standard socketed desktop platforms: CPU, RAM, GPU and storage are upgradeable.",
      "Open-source Linux graphics drivers and an open compute stack (ROCm).",
    ],
    limitations: [
      "ROCm hardware/OS support is narrower than CUDA's; confirm your GPU is supported before buying for ML.",
      "Chiplet designs add cross-die latency that some workloads notice.",
      "Fewer professional applications are tuned first for Radeon than for NVIDIA GPUs.",
      "Extra stacked cache limits X3D clock/thermal headroom slightly and does not help every application.",
    ],
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    tagline: "Designs GPUs and the CUDA software platform — from GeForce gaming cards to datacenter AI systems — plus Arm-based CPUs for its own platforms.",
    isa: ["NVIDIA GPU ISA (PTX/SASS)", "ARM64 (Grace)"],
    softwareStack: ["nvidia-ai", "nvidia-graphics"],
    summary: {
      simple:
        "NVIDIA is mainly a **graphics card** company. A GeForce RTX card is one component you put in a PC alongside a CPU from AMD or Intel.\n\nNVIDIA is especially important for AI because of **CUDA** — the software platform most AI tools were built on first. That software head start matters as much as the hardware.",
      technical:
        "GeForce RTX cards contain three kinds of execution hardware: **CUDA cores** (NVIDIA's name for FP32 shader lanes), **Tensor Cores** (matrix-multiply units for AI and DLSS) and **RT Cores** (ray/triangle intersection and BVH traversal). They also contain **NVENC/NVDEC** video engines.\n\nA discrete GeForce card has its own **GDDR VRAM** and talks to the CPU over **PCIe**. Data must be placed in VRAM for the GPU to work on it at full speed, which is why VRAM capacity limits which models, textures and scenes fit.\n\n**CUDA** is a programming model, compiler, driver and a deep library ecosystem (cuBLAS, cuDNN, TensorRT, NCCL…). PyTorch, TensorFlow, JAX and most research code target CUDA first, which is a major reason NVIDIA GPUs are the default for ML work.",
      deep:
        "NVIDIA's position in AI comes from roughly two decades of investment in **general-purpose GPU computing**: CUDA launched in 2007, and every consumer GeForce since has run the same programming model as datacenter parts. A student's gaming GPU runs the same kernels as a research cluster, which created a large developer base and a library ecosystem competitors are still matching.\n\nArchitecturally, each generation (Turing → Ampere → Ada Lovelace → Blackwell) has expanded Tensor Core capabilities and lower-precision formats (FP16/BF16 → FP8 → FP4), RT Core throughput, and caches. Consumer cards are generally limited by **VRAM capacity**: a desktop RTX 5090 has 32 GB, while the largest open models need far more, which is why multi-GPU setups, quantization and datacenter parts with HBM exist.\n\nNVIDIA also designs Arm CPUs (Grace) and complete systems (DGX, and the GB10-based DGX Spark with a large unified memory pool). Laptop GPUs share names with desktop cards but run at much lower power limits and often use different chips — a \"5090 Laptop GPU\" is not a desktop 5090.",
    },
    productLines: [
      { name: "GeForce RTX", scope: "component", kind: "gpu", market: "Gaming & creator GPUs (desktop cards, laptop GPUs)", description: "Discrete GPUs with CUDA, Tensor and RT cores, own GDDR VRAM, connected over PCIe." },
      { name: "RTX PRO / workstation", scope: "component", kind: "gpu", market: "Professional workstations", description: "Same architectures with more VRAM, certified drivers and pro features." },
      { name: "Datacenter GPUs (H100, B200…)", scope: "component", kind: "gpu", market: "AI training & inference, HPC", description: "Large GPUs with HBM memory and NVLink, usually sold in multi-GPU systems." },
      { name: "Grace CPU / Grace-Blackwell", scope: "platform", kind: "cpu", market: "Datacenter", description: "Arm-based CPUs paired with NVIDIA GPUs over a coherent high-bandwidth link." },
      { name: "DGX & DGX Spark", scope: "system", kind: "accel", market: "AI developers to datacenters", description: "Complete systems. DGX Spark uses the GB10 chip with a shared pool of LPDDR5X memory." },
      { name: "CUDA platform", scope: "platform", kind: "software", market: "All NVIDIA GPUs", description: "Compiler, runtime, drivers and libraries — the software layer that makes the hardware broadly useful." },
    ],
    keyTech: [
      { term: "CUDA", explain: "NVIDIA's GPU programming platform, and also NVIDIA's name for its shader lanes (\"CUDA cores\").", conceptId: "cuda" },
      { term: "Tensor Cores", explain: "Matrix-multiply hardware used for AI and for DLSS.", conceptId: "tensor-cores" },
      { term: "RT Cores", explain: "Hardware for ray tracing's intersection tests.", conceptId: "ray-tracing" },
      { term: "NVENC / NVDEC", explain: "Dedicated video encode/decode engines used by streaming and editing apps.", conceptId: "media-engine" },
      { term: "DLSS", explain: "ML-based upscaling, frame generation and ray-reconstruction, running on Tensor Cores.", conceptId: "upscaling" },
      { term: "cuDNN / TensorRT", explain: "Optimised libraries for neural-network training and inference.", conceptId: "cudnn" },
      { term: "NVLink", explain: "High-bandwidth GPU-to-GPU interconnect on datacenter products.", conceptId: "nvlink" },
    ],
    strengths: [
      "CUDA software ecosystem: first-class support in PyTorch, most research code, and many pro apps.",
      "Tensor Cores and broad low-precision support for AI training and inference.",
      "Mature ray tracing and ML upscaling in games.",
      "Wide availability from laptops to datacenter clusters with the same programming model.",
    ],
    limitations: [
      "Consumer VRAM capacity limits model size; more VRAM generally means much more expensive cards.",
      "Discrete GPUs move data over PCIe, which is far slower than VRAM.",
      "High-end desktop cards draw a lot of power and need large cases, PSUs and cooling.",
      "CUDA is proprietary: code written for it is tied to NVIDIA hardware unless ported.",
      "Laptop GPUs share names with desktop cards but perform very differently.",
    ],
  },
  {
    id: "intel",
    name: "Intel",
    tagline: "Designs and largely manufactures x86 CPUs — Core, Core Ultra and Xeon — plus integrated Xe graphics, Arc discrete GPUs and on-chip NPUs.",
    isa: ["x86-64"],
    softwareStack: ["intel-ai", "intel-graphics"],
    summary: {
      simple:
        "Intel created the **x86** family of processors used by most Windows PCs. Its Core and Core Ultra chips are CPUs — the \"brain\" of a PC — and most of them also include built-in graphics.\n\nIntel also makes **Arc** graphics cards and adds a small AI engine (NPU) to its newer laptop chips. Like AMD, Intel makes both processors and graphics, but most Intel PCs pair an Intel CPU with someone else's graphics card.",
      technical:
        "Intel's client CPUs have been **hybrid** since Alder Lake (12th gen): **P-cores** (wide, high-frequency) and **E-cores** (smaller, area- and power-efficient), with **Thread Director** hardware feeding the OS scheduler hints about which threads belong where. Arrow Lake and Lunar Lake dropped Hyper-Threading on P-cores.\n\nSince Meteor Lake (Core Ultra Series 1), Intel builds client CPUs from **tiles** (compute, graphics, SoC, I/O) stacked on a base die with **Foveros** 3D packaging. Tiles can come from Intel's own fabs or from TSMC.\n\nGraphics are **Xe**: integrated Xe-LPG/Xe2 in laptops, and **Arc** discrete cards (Alchemist, then Battlemage). Intel GPUs contain **Xe cores** with vector engines, **XMX** matrix engines for AI and XeSS, and ray tracing units. **Quick Sync** media engines have long been a strength for video encode/decode. AI software runs through **oneAPI** and **OpenVINO**.",
      deep:
        "Intel is unusual in being an **integrated device manufacturer**: it designs chips and runs its own fabs (Intel 7, Intel 4/3, and 18A for Panther Lake), while also buying some tiles from TSMC. Process technology has been a central part of its competitive story — x86 performance and efficiency have moved with process as much as with microarchitecture.\n\nThe hybrid design is a response to power and area limits: E-cores deliver more multithreaded throughput per mm² and per watt, while P-cores handle latency-sensitive threads. This only works well with good scheduling, which is why Thread Director and Windows' scheduler matter. Lunar Lake (Core Ultra 200V) put LPDDR5X memory **on the package** — conceptually closer to Apple's approach — for laptop efficiency, while Arrow Lake desktop kept standard DIMMs.\n\nIn GPUs Intel is the newest entrant. Arc's hardware supports modern features (ray tracing, XMX, AV1 encode), and driver maturity — especially for older DirectX 9/11 games — improved substantially after launch. For AI, OpenVINO targets CPU, iGPU, NPU and Arc together, and PyTorch supports Intel GPUs through its XPU backend; the ecosystem is smaller than CUDA's.",
    },
    productLines: [
      { name: "Core Ultra", scope: "chip", kind: "cpu", market: "Laptops & desktops", description: "Tile-based hybrid x86 CPUs with Xe graphics and an NPU. Series 2 includes Lunar Lake (200V) and Arrow Lake (200S/H/HX)." },
      { name: "Core (i3/i5/i7/i9 and Core 3/5/7)", scope: "chip", kind: "cpu", market: "Mainstream desktops & laptops", description: "Earlier and value hybrid x86 CPUs, often monolithic, with integrated graphics." },
      { name: "Xeon", scope: "chip", kind: "cpu", market: "Servers & workstations", description: "Server x86 CPUs, including P-core (Granite Rapids) and E-core (Sierra Forest) variants." },
      { name: "Arc (discrete)", scope: "component", kind: "gpu", market: "Gaming & creator graphics cards", description: "Xe-based discrete GPUs with XMX engines and strong media encode. Alchemist (A-series), Battlemage (B-series)." },
      { name: "Xe integrated graphics", scope: "chip", kind: "gpu", market: "Built into most Intel CPUs", description: "Graphics inside the CPU package, sharing system memory." },
      { name: "Gaudi", scope: "component", kind: "accel", market: "Datacenter AI", description: "Dedicated AI training/inference accelerators." },
    ],
    keyTech: [
      { term: "x86-64", explain: "The instruction set Intel originated; shared with AMD under cross-licensing.", conceptId: "x86" },
      { term: "P-cores / E-cores", explain: "Hybrid design: performance cores and efficiency cores on one chip.", conceptId: "hybrid-cores" },
      { term: "Thread Director", explain: "Hardware telemetry that helps the OS place threads on the right core type.", conceptId: "hybrid-cores" },
      { term: "Tiles & Foveros", explain: "Building a CPU from separate dies stacked on a base die with 3D packaging.", conceptId: "chiplet" },
      { term: "Xe / Arc", explain: "Intel's GPU architecture family, integrated (Xe) and discrete (Arc).", conceptId: "xe-cores" },
      { term: "XMX", explain: "Xe Matrix Extensions — matrix engines inside Xe cores for AI and XeSS.", conceptId: "tensor-cores" },
      { term: "Quick Sync", explain: "Intel's hardware video encode/decode engines.", conceptId: "media-engine" },
      { term: "oneAPI / OpenVINO", explain: "Intel's cross-device programming model and its inference toolkit.", conceptId: "openvino" },
    ],
    strengths: [
      "Broad x86 software compatibility and a huge installed base.",
      "Quick Sync media engines are widely supported in video software.",
      "Hybrid P/E designs offer high multithreaded throughput.",
      "Arc GPUs offer modern features (AV1 encode, XMX, ray tracing) at value price points.",
      "OpenVINO can target CPU, iGPU, NPU and Arc together for inference.",
    ],
    limitations: [
      "Desktop flagship CPUs can draw high power under sustained all-core load.",
      "Arc's discrete GPU line is young; performance in some older games depends on driver work.",
      "AI ecosystem (oneAPI/OpenVINO/XPU) is smaller than CUDA's.",
      "Hybrid scheduling depends on OS support; older OSes and some apps handle it less well.",
      "Frequent platform/socket changes limit CPU upgrade paths compared with long-lived sockets.",
    ],
  },
];

export const getCompany = (id: string) => COMPANIES.find((c) => c.id === id);

export const COMPANY_IDS: CompanyId[] = ["apple", "amd", "nvidia", "intel"];

/** Product-line matrix: what each company builds in each category. */
export type MatrixCategory = "cpu" | "gpu" | "soc" | "npu" | "datacenter" | "system" | "software";

export const MATRIX_CATEGORIES: { id: MatrixCategory; label: string; hint: string }[] = [
  { id: "cpu", label: "CPUs", hint: "Standalone processors you can pair with other parts" },
  { id: "gpu", label: "Discrete GPUs", hint: "Graphics cards with their own VRAM" },
  { id: "soc", label: "SoCs / APUs", hint: "CPU + GPU (+ more) on one chip" },
  { id: "npu", label: "NPUs", hint: "Dedicated low-power AI engines" },
  { id: "datacenter", label: "Datacenter", hint: "Server CPUs and AI accelerators" },
  { id: "system", label: "Complete systems", hint: "Finished computers sold by the company" },
  { id: "software", label: "Compute platform", hint: "Their own GPU/AI programming stack" },
];

export const PRODUCT_MATRIX: Record<CompanyId, Partial<Record<MatrixCategory, string>>> = {
  apple: {
    soc: "M-series, A-series",
    npu: "Neural Engine (inside the SoC)",
    system: "MacBook, iMac, Mac mini, Mac Studio, Mac Pro",
    software: "Metal, Core ML, MLX",
  },
  amd: {
    cpu: "Ryzen",
    gpu: "Radeon RX / PRO",
    soc: "Ryzen APUs, Ryzen AI Max, console chips",
    npu: "XDNA (in Ryzen AI chips)",
    datacenter: "EPYC CPUs, Instinct GPUs",
    software: "ROCm / HIP",
  },
  nvidia: {
    gpu: "GeForce RTX, RTX PRO",
    soc: "Tegra / Jetson, GB10",
    datacenter: "Hopper / Blackwell GPUs, Grace CPU",
    system: "DGX, DGX Spark",
    software: "CUDA, cuDNN, TensorRT",
    cpu: "Grace (Arm, datacenter only)",
  },
  intel: {
    cpu: "Core, Core Ultra",
    gpu: "Arc A / B series",
    soc: "Core Ultra (CPU + Xe + NPU tiles)",
    npu: "Intel NPU (in Core Ultra)",
    datacenter: "Xeon CPUs, Gaudi accelerators",
    software: "oneAPI, OpenVINO",
  },
};

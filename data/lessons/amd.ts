import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "amd",
  number: 10,
  title: "AMD architecture",
  subtitle: "Two businesses under one name: x86 CPUs built from chiplets, and Radeon/Instinct GPUs — plus chips that combine both.",
  kind: "cpu",
  minutes: 13,
  sections: [
    {
      id: "two",
      title: "AMD makes CPUs and GPUs — separately",
      body: {
        simple:
          "AMD sells **Ryzen** processors (CPUs) and **Radeon** graphics cards (GPUs). They're different products: a PC can have an AMD CPU with an NVIDIA graphics card, an Intel CPU with an AMD graphics card, or AMD for both.\n\nSo \"AMD vs NVIDIA\" is usually a graphics-card comparison, and \"AMD vs Intel\" is usually a CPU comparison. AMD also makes chips that put both on one piece of silicon, called **APUs**.",
        technical:
          "AMD's main lines:\n\n- **Ryzen** — desktop and laptop x86 CPUs (Zen cores)\n- **EPYC** — server CPUs (also Zen, many more cores and memory channels)\n- **Radeon RX / PRO** — gaming and workstation GPUs (RDNA architecture)\n- **Instinct** — datacenter accelerators (CDNA architecture, HBM memory)\n- **APUs / Ryzen AI** — CPU + RDNA GPU + XDNA NPU on one chip\n\nAMD also designs the custom chips in PlayStation 5 and Xbox Series consoles, which pair Zen CPU cores with RDNA graphics and a shared memory pool.",
        deep:
          "Because AMD designs both, it can build integrated parts that neither a pure CPU nor pure GPU company could: console SoCs, large APUs like **Ryzen AI Max** (16 Zen 5 cores, a 40-CU RDNA 3.5 iGPU and a 256-bit LPDDR5X bus with up to 128 GB shared), and datacenter APUs (Instinct MI300A) where CPU and GPU dies share HBM.\n\nIn discrete PCs, though, AMD's CPU and GPU are independent purchases, and their architectures have separate design teams, roadmaps and naming. Don't assume an AMD CPU \"works better\" with an AMD GPU; features like Smart Access Memory are implementations of the PCIe Resizable BAR standard that other vendors support too.",
      },
      interactive: "company-matrix",
    },
    {
      id: "chiplets",
      title: "Zen and chiplets",
      body: {
        simple:
          "Instead of making one big chip, AMD builds many desktop and server processors out of **chiplets** — smaller pieces joined in one package. One kind of chiplet holds the CPU cores; another holds memory controllers and connections.\n\nSmaller pieces are cheaper to make and easier to mix: two core chiplets for a 16-core Ryzen 9, one for an 8-core Ryzen 7, many for a server chip.",
        technical:
          "A desktop Ryzen package contains one or two **CCDs** (core complex dies — currently 8 Zen cores each with a shared L3) and an **I/O die (IOD)** with DDR5 memory controllers, PCIe lanes, USB and a small iGPU. The CCDs use a leading-edge node; the IOD uses an older, cheaper one.\n\nThe dies communicate over **Infinity Fabric**. Anything that crosses dies — a core reading memory, or a core on CCD0 reading data cached on CCD1 — takes longer than staying on one die. Software that keeps related threads on one CCD avoids that penalty. Most laptop Ryzen chips are **monolithic** (one die) for power efficiency.",
        deep:
          "Chiplets improve **yield economics**: defect probability grows with die area, so many small dies waste less silicon than one huge die. They also allow **IP reuse** — one CCD design spans 6-core Ryzen 5s to 100+-core EPYCs — and **node mixing**, since I/O and analog circuits gain little from the newest process.\n\nThe costs are package complexity, interconnect power and **latency**. Memory latency on chiplet Ryzens is typically a bit higher than on monolithic designs, and inter-CCD core-to-core latency is notably higher than intra-CCD. Dual-CCD parts expose this to schedulers, which is why game performance on 12/16-core Ryzens can depend on keeping a game's threads on one CCD.\n\nZen generations have widened the core (Zen 5's dual decode pipes and full 512-bit AVX-512 datapath on desktop), grown L2 (1 MB/core since Zen 4) and moved platforms (AM5, DDR5, PCIe 5.0 with Zen 4).",
      },
      interactive: "generation-timeline-zen",
    },
    {
      id: "vcache",
      title: "3D V-Cache (X3D)",
      body: {
        simple:
          "Some Ryzen chips end in **X3D**. They have an extra slice of super-fast cache memory **stacked on top of (or under) the cores**. Cache is the CPU's nearby scratchpad; when data is already there, the CPU doesn't wait for slower RAM.\n\nMany games constantly reuse a big chunk of data, so they often run noticeably faster on X3D chips. Other tasks — like video encoding — barely notice.",
        technical:
          "3D V-Cache bonds an extra SRAM die to a CCD with through-silicon vias, growing that CCD's L3 from 32 MB to 96 MB. An L3 hit costs on the order of tens of cycles; a miss to DRAM costs hundreds. If a workload's hot working set fits in 96 MB but not 32 MB, a large share of DRAM trips disappear.\n\nGames often fit this profile: lots of small, scattered accesses to game state, physics, AI and draw-call data. Rendering, encoding and many compute workloads either stream data (cache doesn't help much) or already fit in smaller caches.\n\nOn dual-CCD X3D parts, only one CCD has the extra cache, so the OS/driver steers games to it.",
        deep:
          "The first-generation design placed the cache die **on top** of the cores, insulating them and forcing lower clocks and voltage limits. Zen 5's second-gen V-Cache puts the cache die **beneath** the CCD, so the cores sit next to the heat spreader and clocks recover.\n\nThe broader lesson: cache capacity changes **effective memory latency**, and its value depends entirely on the access pattern. A Ryzen 7 9800X3D (8 cores, 96 MB L3) can outperform a Ryzen 9 9950X (16 cores, 64 MB L3 split across two CCDs) in many games while losing clearly in multithreaded rendering. Neither chip is \"better\" in general.",
      },
      callout: { tone: "info", title: "More cache ≠ faster everything", text: "Stacked cache helps when a workload repeatedly touches a working set that fits in the bigger cache. Streaming workloads and work that already fits in normal cache see little change." },
    },
    {
      id: "rdna",
      title: "RDNA, CDNA and Radeon terminology",
      body: {
        simple:
          "AMD's gaming graphics use an architecture called **RDNA**; its datacenter AI chips use a related one called **CDNA**. Radeon cards are measured in **compute units (CUs)**, each containing many **stream processors**.\n\nThose numbers can't be compared directly with NVIDIA's \"CUDA cores\" — each company counts differently.",
        technical:
          "An RDNA **compute unit** contains SIMD units (marketed as 64 stream processors per CU), a **Ray Accelerator** for ray-triangle/box intersection, texture units and, since RDNA 3, **AI accelerator** (WMMA) instructions for matrix math. CUs pair into Workgroup Processors.\n\nRDNA 2 added **Infinity Cache**, a large last-level cache that cuts VRAM traffic. RDNA 3 introduced chiplet GPUs on the high end (a graphics die plus memory-cache dies). RDNA 4 (RX 9070 series) returned to monolithic dies, redesigned ray tracing and greatly increased ML throughput with FP8 — enabling **FSR 4**, AMD's ML-based upscaler.\n\n**CDNA** strips graphics hardware and focuses on matrix throughput and HBM bandwidth for AI/HPC.",
        deep:
          "Unit counts are marketing abstractions over different hardware. RDNA 3's \"dual-issue\" SIMDs can execute two FP32 operations per lane per clock in some cases, doubling theoretical TFLOPS without doubling real performance; NVIDIA's Ampere similarly doubled FP32 per SM. Comparing stream processors with CUDA cores, or TFLOPS across architectures, ignores occupancy, scheduling, cache hierarchy, memory bandwidth and driver efficiency.\n\nThe split between RDNA and CDNA reflects different optimisation targets: graphics needs rasterisers, texture units and ray tracing hardware; datacenter AI needs dense matrix units, huge HBM bandwidth and fast interconnects. NVIDIA instead uses related architectures across both (with different chips), which is part of why consumer NVIDIA cards run the same CUDA stack as datacenter ones.",
      },
      interactive: "generation-timeline-rdna",
    },
    {
      id: "rocm",
      title: "ROCm: the software side",
      body: {
        simple:
          "To use a GPU for AI, you need software that knows how to talk to it. NVIDIA's is called CUDA. AMD's is called **ROCm**.\n\nROCm works with popular tools like PyTorch, but fewer AMD cards and setups are officially supported than with CUDA, so check before you buy an AMD card for AI.",
        technical:
          "**ROCm** is AMD's open-source GPU compute stack: kernel driver, runtime, compilers, and libraries (rocBLAS, MIOpen, RCCL). **HIP** is a C++ programming model deliberately close to CUDA; tools can translate much CUDA code to HIP. PyTorch publishes ROCm builds, and many inference tools (llama.cpp, vLLM) support AMD GPUs.\n\nThe practical caveat is the **support matrix**: which GPUs, OS versions and libraries are officially supported. Coverage of consumer Radeon cards and Windows has historically lagged Instinct and Linux, though it has expanded.",
        deep:
          "Hardware specs only become performance when the software stack has optimised kernels for your operation, data type and GPU. A new attention kernel or quantisation format often appears for CUDA first and for ROCm later (if at all). Conversely, AMD's datacenter Instinct parts offer large HBM capacities that matter for very large models, and ROCm's openness lets the community port and tune software.\n\nFor buyers: if your workflow is 'pip install a popular framework and run standard models', AMD is increasingly viable — verify your exact card. If it depends on custom CUDA extensions or niche research code, expect friction. See [AI compute & software](/ai).",
      },
    },
    {
      id: "apu",
      title: "APUs and Ryzen AI",
      body: {
        simple:
          "An **APU** puts AMD CPU cores and Radeon graphics on one chip, sharing the computer's memory — like many laptops. Newer **Ryzen AI** laptop chips add an **NPU**, a small AI engine for features like background blur or local assistants.\n\nThe largest, **Ryzen AI Max**, has a big GPU and up to 128 GB of shared memory — a PC take on the large shared-memory idea Apple uses.",
        technical:
          "Ordinary APUs use a 128-bit DDR5/LPDDR5 bus, so the iGPU is often bandwidth-limited. Ryzen AI Max widens this to **256-bit LPDDR5X** (≈256 GB/s) and pairs it with a 40-CU RDNA 3.5 GPU, letting the GPU address a large shared pool — useful for big local models and creative apps.\n\nThe **XDNA NPU** is a spatial dataflow engine for low-power inference, exposed through Windows ML / ONNX Runtime paths. Its TOPS figures use low-precision formats and are not comparable to GPU TFLOPS.",
        deep:
          "Shared-memory PCs show that \"unified memory\" is a design choice, not an Apple-only property. The tradeoffs echo Apple's: memory is soldered and fixed; bandwidth is far below a high-end discrete GPU's VRAM but capacity is far larger; and a shared power/thermal budget limits sustained GPU clocks compared with a 300 W graphics card.",
      },
    },
  ],
  quiz: {
    id: "amd-quiz",
    questions: [
      {
        id: "q1",
        prompt: "A Ryzen 7 9800X3D often beats a Ryzen 9 9950X in games. Why?",
        choices: ["It has more cores", "Its 96 MB L3 keeps more of a game's working set close to the cores", "It runs at a higher clock", "It has a better GPU"],
        answer: 1,
        explain: "The X3D has fewer cores and a lower boost clock, but much more cache on one CCD. Games with large hot working sets benefit; multithreaded rendering favours the 9950X.",
      },
      {
        id: "q2",
        prompt: "What does Infinity Fabric connect?",
        choices: ["The PSU to the motherboard", "Chiplets, memory controllers and I/O inside AMD processors", "Two graphics cards", "The SSD to the CPU"],
        answer: 1,
        explain: "Infinity Fabric is AMD's on-package interconnect between CCDs and the I/O die (and more).",
      },
      {
        id: "q3",
        prompt: "Before buying a Radeon card for AI work you should…",
        choices: ["Compare its stream processors with CUDA cores", "Check the ROCm support matrix for your GPU and OS", "Check it has an X3D suffix", "Nothing — all GPUs run the same software"],
        answer: 1,
        explain: "Software support decides whether the hardware gets used. ROCm support varies by GPU and OS.",
      },
      {
        id: "q4",
        prompt: "RDNA vs CDNA:",
        choices: ["RDNA is for CPUs, CDNA for GPUs", "RDNA targets graphics; CDNA targets datacenter compute", "They're the same thing", "CDNA is for laptops"],
        answer: 1,
        explain: "AMD split its GPU architecture: RDNA for gaming/graphics (Radeon, consoles), CDNA for Instinct accelerators.",
      },
    ],
  },
  misconceptions: ["stream-vs-cuda", "more-cores-faster", "igpu-weak"],
  related: ["/companies/amd", "/generations", "cpu", "memory-hierarchy", "/ai"],
};

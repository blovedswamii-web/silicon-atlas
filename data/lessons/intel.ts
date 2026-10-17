import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "intel",
  number: 12,
  title: "Intel architecture",
  subtitle: "x86's originator: hybrid P/E-core CPUs, tile-based packaging, integrated Xe graphics, Arc GPUs and its own fabs.",
  kind: "cpu",
  minutes: 12,
  sections: [
    {
      id: "what",
      title: "What Intel builds",
      body: {
        simple:
          "Intel makes the **Core** and **Core Ultra** processors in many Windows laptops and desktops, and **Xeon** processors for servers. Almost all of its consumer chips also include built-in graphics.\n\nIntel also makes **Arc** graphics cards, and its newer laptop chips include a small AI engine (NPU). Unlike most chip companies, Intel also **manufactures** many of its own chips in its own factories.",
        technical:
          "Intel product lines:\n\n- **Core Ultra** (Series 1: Meteor Lake; Series 2: Lunar Lake 200V and Arrow Lake 200S/H/HX; Series 3: Panther Lake) — tile-based client CPUs with Xe graphics and an NPU\n- **Core** (i3/i5/i7/i9, and Core 3/5/7) — earlier and value hybrid CPUs\n- **Xeon** — server CPUs, split into P-core and E-core product families\n- **Arc** — discrete GPUs (Alchemist A-series, Battlemage B-series)\n- **Gaudi** — datacenter AI accelerators\n\nIntel's CPUs execute **x86-64**, the same ISA as AMD's — so the same Windows and Linux software runs on both.",
        deep:
          "Intel is an **IDM** (integrated device manufacturer): it designs chips and operates fabs (Intel 7, Intel 4/3, 18A). That gives control over process-design co-optimisation but ties product competitiveness to manufacturing execution. In recent generations Intel has also sourced tiles from TSMC (e.g. Lunar Lake and Arrow Lake compute tiles), while Panther Lake's compute tile uses Intel 18A. Tile-based packaging is what makes this mixing possible.",
      },
    },
    {
      id: "hybrid",
      title: "P-cores, E-cores and Thread Director",
      body: {
        simple:
          "Since 12th-gen Core (2021), Intel CPUs have two kinds of core: big **P-cores** (performance) for demanding work like games, and small **E-cores** (efficiency) that handle background tasks and add lots of extra throughput when many things run at once.\n\nThe chip gives Windows hints about which job should run on which kind of core.",
        technical:
          "**P-cores** are wide, high-frequency out-of-order cores. **E-cores** are smaller and more area-efficient — several fit in the area of one P-core — so they add multithreaded throughput cheaply. A Core Ultra 9 285K has 8 P-cores + 16 E-cores.\n\n**Thread Director** is hardware telemetry that classifies running threads and reports to the OS scheduler which core type suits each one. Windows 11 uses it; older OSes schedule less intelligently. Arrow Lake and Lunar Lake removed **Hyper-Threading** (SMT) from P-cores, so thread count equals core count.\n\nApple uses a related hybrid approach (P/E cores with QoS-based scheduling) — the concept isn't vendor-specific.",
        deep:
          "Hybrid designs exist because of the shape of the power/performance curve: the last few hundred MHz on a big core cost disproportionate power, while many workloads are either latency-sensitive (one or few threads — want P-cores) or throughput-oriented (many threads — get more work per watt and per mm² from E-cores). Scheduling is the hard part: a latency-sensitive thread stuck on an E-core feels slow; background work on a P-core wastes power. Thread Director plus OS cooperation is Intel's answer; macOS QoS classes are Apple's.\n\nMeteor Lake added a third tier — low-power E-cores on the SoC tile — so the compute tile can power down entirely during light use.",
      },
      callout: { tone: "myth", title: "More cores ≠ always faster", text: "24 cores help in rendering and compiling; a game that leans on a few threads cares more about P-core speed and cache. Count what matters for your workload." },
    },
    {
      id: "tiles",
      title: "Tiles and Foveros packaging",
      body: {
        simple:
          "Newer Intel chips (Core Ultra) are built from several smaller pieces called **tiles** — one for the CPU cores, one for graphics, one for connections — stacked on a base layer. It's Intel's version of the chiplet idea.",
        technical:
          "Meteor Lake introduced **Foveros** 3D packaging: compute, graphics, SoC and I/O tiles mounted on a base die that provides dense die-to-die connections. Each tile can use a different process — including TSMC nodes — chosen for its function.\n\n**Lunar Lake** (Core Ultra 200V) went further for laptops: it puts **LPDDR5X memory on the package**, conceptually close to Apple's approach, trading upgradeability for efficiency. **Arrow Lake** desktop keeps standard DDR5 DIMMs on the LGA 1851 socket.",
        deep:
          "Compared with AMD's organic-substrate chiplets, Foveros' active base die enables much finer-pitch connections between tiles, reducing the power and latency cost of disaggregation. The tradeoffs are packaging cost and complexity. Disaggregation also affects memory latency: moving the memory controller off the compute tile (as on Arrow Lake) added latency that some workloads, notably certain games, are sensitive to.",
      },
    },
    {
      id: "graphics",
      title: "Xe integrated graphics and Arc",
      body: {
        simple:
          "Most Intel CPUs include **Xe** graphics — good enough for everyday use, video and lighter games, and much better than integrated graphics a few years ago.\n\n**Arc** graphics cards are Intel's discrete GPUs for gaming and creative work. They support modern features like ray tracing and AV1 video encoding, and Intel's **XeSS** upscaling.",
        technical:
          "Intel GPUs are built from **Xe cores**, each with vector engines, **XMX** (Xe Matrix Extensions) matrix engines for AI and XeSS, and ray tracing units. The Arc B580 has 20 Xe cores and 12 GB of GDDR6 on a 192-bit bus.\n\nAlchemist (2022) was Intel's first modern discrete gaming GPU; early drivers struggled with older DirectX 9/11 games, which later updates improved substantially. Battlemage (Xe2, 2024) improved per-core performance and efficiency and added XeSS 2 frame generation. Arc benefits from **Resizable BAR**, which lets the CPU access all of VRAM — enable it in firmware.",
        deep:
          "Xe core counts, like Apple GPU cores, AMD CUs and NVIDIA SMs, are architecture-specific units. An Xe core in Battlemage isn't equivalent to one in Alchemist, let alone to another vendor's unit. Intel's iGPUs and Arc share architecture and drivers, so improvements often land across both.\n\nIntegrated graphics have become far more capable (Lunar Lake's Xe2 iGPU, Panther Lake's Xe3), challenging the idea that integrated always means weak — but they share memory bandwidth and power with the CPU, which caps sustained performance compared with a discrete card.",
      },
      interactive: "generation-timeline-intel",
    },
    {
      id: "media-ai",
      title: "Quick Sync, NPUs and oneAPI",
      body: {
        simple:
          "Intel's **Quick Sync** video engines have long been popular with video editors and streamers because they encode and decode video quickly with little power. Core Ultra chips add an **NPU** for AI features. Intel's AI software includes **OpenVINO**, which can use the CPU, graphics and NPU together.",
        technical:
          "**Quick Sync** handles H.264, HEVC, AV1 (decode on recent iGPUs, encode on Arc and newer iGPUs) and is widely supported in editing and streaming software. The **NPU** runs low-power inference through OpenVINO, ONNX Runtime and Windows ML.\n\nFor AI, **oneAPI** (SYCL-based) is Intel's cross-architecture programming model; **OpenVINO** optimises inference across CPU, iGPU, NPU and Arc; and PyTorch supports Intel GPUs through its **XPU** backend.",
        deep:
          "Intel's AI strategy leans on its CPU footprint: optimised x86 libraries (oneDNN) make CPU inference respectable, and OpenVINO lets one deployment target whatever Intel silicon is present. The ecosystem is smaller than CUDA's and new research lands there later, so check support for your models. NPU TOPS figures are measured at low precision and are not comparable with GPU TFLOPS.",
      },
    },
  ],
  quiz: {
    id: "intel-quiz",
    questions: [
      {
        id: "q1",
        prompt: "Why do Intel CPUs mix P-cores and E-cores?",
        choices: ["E-cores are spares for when P-cores fail", "Big cores suit latency-sensitive work; small cores add throughput and efficiency per watt and area", "To run ARM and x86 at the same time", "E-cores only run graphics"],
        answer: 1,
        explain: "Hybrid designs match core type to work type, with the OS scheduler and Thread Director deciding placement.",
      },
      {
        id: "q2",
        prompt: "What's notable about Lunar Lake (Core Ultra 200V) memory?",
        choices: ["It uses HBM", "LPDDR5X is on the CPU package, so capacity is fixed at purchase", "It has no memory controller", "It uses GDDR7"],
        answer: 1,
        explain: "On-package memory improves efficiency — and means you can't upgrade it, similar to Apple Silicon.",
      },
      {
        id: "q3",
        prompt: "Intel's equivalent of NVIDIA Tensor Cores is…",
        choices: ["Quick Sync", "XMX engines in Xe cores", "Thread Director", "Foveros"],
        answer: 1,
        explain: "XMX (Xe Matrix Extensions) units perform matrix math for AI and XeSS.",
      },
    ],
  },
  misconceptions: ["more-cores-faster", "ghz-faster", "igpu-weak", "arm-slower"],
  related: ["/companies/intel", "cpu", "/generations", "/names"],
};

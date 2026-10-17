import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "choosing-hardware",
  number: 18,
  title: "How to choose hardware",
  subtitle: "Turn everything in this course into a decision: start from the work, protect the things you can't change later, and read every number skeptically.",
  kind: "software",
  minutes: 15,
  sections: [
    {
      id: "start-with-work",
      title: "Start with the work, not the logo",
      body: {
        simple:
          "The best computer for a gamer, a video editor, a student and an AI researcher are four different computers. Before looking at brands, write down the three things you'll do most. Each one points to different specs.\n\nPick a workload below to see which specs rise to the top.",
        technical:
          "Map each workload to the subsystems it stresses (see [Bottlenecks](/learn/bottlenecks)):\n\n- **Gaming** → GPU tier for your resolution, VRAM, CPU single-thread/cache, game compatibility.\n- **Local AI** → GPU-accessible memory capacity, software ecosystem, memory bandwidth.\n- **Programming** → RAM, CPU cores, storage, OS/toolchain.\n- **Video** → hardware codec support, CPU cores, memory, storage speed.\n- **School / general** → battery, weight, screen, 16 GB RAM.\n\nWeight them by how much time you'll spend on each, then buy for the dominant one without starving the others.",
        deep:
          "It helps to separate requirements into three kinds. **Hard constraints** are pass/fail: a required OS, an app that only runs on one platform, a model that must fit in memory, a weight limit for travel. **Throughput drivers** scale with spend: GPU tier, core count, bandwidth. **Quality-of-life factors** shape daily experience: screen, keyboard, noise, battery.\n\nEliminate options on hard constraints first. Then spend on the throughput driver for your dominant workload. Finally, don't let a throughput upgrade crowd out a quality-of-life factor you'll notice every day — an extra GPU tier is wasted if a loud fan or poor screen makes you avoid using the machine.",
      },
      interactive: "buy-mini",
    },
    {
      id: "scope",
      title: "Compare like with like: chip, component, system, platform",
      body: {
        simple:
          "An Apple M-series chip is a whole computer brain — CPU, GPU, AI engine and memory together. A GeForce RTX card is just the graphics part of a PC. Comparing a MacBook with a graphics card is like comparing a whole car with an engine.",
        technical:
          "Keep four scopes distinct:\n\n- **Chip** — one piece of silicon or package (Ryzen 9 9950X, M4 Max, GB202).\n- **Component** — a part you buy and install (a graphics card, a CPU, RAM sticks).\n- **System** — a complete machine (a MacBook Pro, a gaming desktop, a laptop model).\n- **Platform** — hardware plus OS, drivers, APIs and frameworks (macOS + Metal + MLX; Windows + DirectX + CUDA).\n\nApple sells systems built on its own chips and platform; AMD, NVIDIA and Intel sell chips and components that other companies assemble into systems. Fair comparisons are system-to-system for a workload, or chip-to-chip within a clearly stated power budget.",
        deep:
          "Scope confusion drives many misleading claims. 'Chip X beats GPU Y' may compare an SoC's whole power budget with a discrete GPU at a different power level, or quote a desktop GPU figure against a laptop. 'Platform TOPS' may sum CPU, GPU and NPU. When reading a comparison, identify the scope of each side, the power envelope, and which software path was used.\n\nFor purchase decisions, the system and platform scopes usually matter most: they include cooling, memory configuration, drivers and app support — all of which change what a given chip delivers.",
      },
      callout: {
        tone: "info",
        title: "Throughout this site",
        text: "Look for the CHIP / COMPONENT / SYSTEM / PLATFORM tags. They're there so you never compare different kinds of things by accident.",
      },
    },
    {
      id: "fixed-things",
      title: "Capacity first: protect what you can't change later",
      body: {
        simple:
          "Some parts can be upgraded later; others are fixed forever. On most laptops, and on every Apple Silicon Mac, memory is fixed at purchase. On every graphics card, VRAM is fixed. Buy enough of the fixed things for the whole life of the machine.",
        technical:
          "Typical upgradeability:\n\n- **Desktop PC** — CPU (within a socket generation), GPU, RAM, storage all replaceable.\n- **Most PC laptops** — storage often replaceable; RAM increasingly soldered (LPDDR); GPU never.\n- **Apple Silicon Macs** — memory and internal storage fixed; external storage via Thunderbolt.\n- **Graphics cards** — VRAM fixed per card.\n\nBecause capacity is a cliff (see [Bottlenecks](/learn/bottlenecks)), under-buying a fixed capacity is the most expensive mistake to fix — it often means replacing the whole machine.",
        deep:
          "A reasonable heuristic: estimate your peak working set today (largest project, largest model, typical number of open apps and VMs), then add headroom for growth over the years you expect to keep the machine. Software memory use tends to rise over time.\n\nFor unified-memory systems, budget one total: model or project data on the GPU side plus OS and apps on the CPU side, remembering that macOS limits how much the GPU can use by default. For discrete-GPU systems, budget VRAM for the GPU working set and system RAM separately — and note that system RAM can usually be upgraded later while VRAM cannot.",
      },
    },
    {
      id: "software",
      title: "Software decides what hardware is worth",
      body: {
        simple:
          "A powerful chip is only useful if your apps can use it. A great gaming GPU is less useful if your games don't run on your operating system; a fast AI chip is less useful if your AI tools don't support it.",
        technical:
          "Check, before you buy:\n\n- Your **must-have applications** run natively on the OS and CPU architecture (x86-64 vs ARM64).\n- Your **GPU-accelerated tools** support the GPU's API: CUDA, ROCm/HIP, Metal, oneAPI/SYCL, DirectX/Vulkan.\n- Your **AI framework** supports the backend (PyTorch CUDA/ROCm/MPS/XPU, MLX, llama.cpp backends, OpenVINO).\n- **Games** you care about run on the platform, including anti-cheat.\n\nExplore how platforms fit each workload below, and see [AI Compute & Software](/ai) for the full stacks.",
        deep:
          "Ecosystem maturity has momentum: tools target the most common platform first, which makes it more common. NVIDIA's CUDA lead in AI is the clearest example; Windows + DirectX in gaming is another; macOS + Metal in certain creative workflows is a third. Alternatives can be excellent for specific, supported workflows — and can be meaningfully cheaper or more efficient — but you take on the work of verifying support.\n\nA good practice: find the specific project, game or app you care most about and look up its documentation or issue tracker for your candidate hardware. That's a stronger signal than any spec sheet.",
      },
      interactive: "workload-fit",
    },
    {
      id: "read-skeptically",
      title: "Read every number skeptically",
      body: {
        simple:
          "Numbers on boxes are usually true but often not comparable. 5 GHz on one chip isn't 5 GHz on another. 16 GB of VRAM isn't 16 GB of unified memory. 32 Apple GPU cores can't be compared to thousands of CUDA cores. Ask what's being counted.",
        technical:
          "For any number, ask:\n\n- What unit, and is it the same unit on both sides?\n- Peak or sustained? At what power?\n- Which precision (for TFLOPS/TOPS), with or without sparsity?\n- Which scope: chip, component, system or platform?\n- Does my software use the hardware this number describes?\n\nThe [Spec Decoder](/specs) answers 'can I compare this across brands?' for every common spec.",
        deep:
          "Treat spec sheets as filters, not rankings. They're good at excluding options (not enough memory, unsupported codec, no CUDA, too heavy) and bad at ordering what remains. Independent, workload-specific benchmarks — ideally under sustained load and at the power level of the actual system — are the tool for ordering.\n\nAlso watch for comparisons across generations and form factors, where names stay similar while silicon changes: laptop GPUs that share desktop names, tier names (Ryzen 9, Core Ultra 9) that span very different chips, and core counts that mix core types.",
      },
      interactive: "misleading-compare",
    },
    {
      id: "form-factor",
      title: "Form factor sets the power budget",
      body: {
        simple:
          "A laptop has to fit its cooling in a thin case and run on a battery, so its chips get less power than desktop chips — even when the names match. If you need sustained heavy performance, a desktop (or a thick laptop) goes further. If you need portability and battery life, efficiency matters more than peak speed.",
        technical:
          "Same-name parts can differ in silicon (RTX 5090 Laptop GPU uses a different die from the desktop RTX 5090), in configuration (fewer cores, less VRAM) and in power (laptop makers choose the TGP). Even identical chips (Apple uses the same M-series chips across laptops and desktops) sustain differently in different chassis. Compare the specific system, not the chip name.",
        deep:
          "Efficiency curves explain why form factor matters so much: near the top of the voltage–frequency curve, the last increments of performance cost disproportionate power. Laptops operate lower on the curve, where performance per watt is far better but absolute performance is lower. Desktop parts are allowed to run where efficiency is worse but throughput is highest. See [Performance per Watt](/efficiency).",
      },
      interactive: "laptop-vs-desktop",
    },
    {
      id: "checklist",
      title: "A decision checklist",
      body: {
        simple:
          "- Write down your top three tasks.\n- Pick the OS your must-have apps need.\n- Decide laptop or desktop.\n- Buy enough memory and storage for the machine's whole life.\n- Choose the GPU/CPU tier for your main task.\n- Check independent reviews of the exact model.",
        technical:
          "- **Hard constraints**: OS, required apps, games/anti-cheat, frameworks, weight, budget ceiling.\n- **Capacity**: RAM / VRAM / unified memory and storage for your largest projects plus growth.\n- **Throughput**: GPU tier, CPU cores and single-thread performance, memory bandwidth — weighted by workload.\n- **Specialised engines**: media engines for your codecs, matrix units/NPUs if your software uses them.\n- **Sustained behaviour**: power limits, cooling, battery tests.\n- **Validation**: benchmarks of your workloads on the exact system.\n\nRun the full [buying assistant](/buy) to get a ranked list for your answers.",
        deep:
          "Finally, consider total cost over the machine's life: upgrade paths (a desktop that can take a new GPU in three years), resale value, power costs for heavy daily use, and the cost of your time if the platform needs workarounds for your tools. The cheapest machine that meets every hard constraint and capacity need, with throughput aimed at your dominant workload, is usually the right one — whichever company's logo is on it.",
      },
    },
  ],
  quiz: {
    id: "choosing-quiz",
    questions: [
      {
        id: "q1",
        prompt: "Which purchase mistake is hardest to fix later on an Apple Silicon Mac?",
        choices: ["Choosing the wrong colour", "Too little unified memory", "Too slow an external drive", "The wrong keyboard layout"],
        answer: 1,
        explain: "Unified memory is part of the SoC package and can't be upgraded, so capacity must be chosen for the machine's lifetime.",
      },
      {
        id: "q2",
        prompt: "Why isn't 'MacBook Pro vs RTX 5090' a fair comparison?",
        choices: [
          "One is a whole system (platform), the other a single component",
          "They use the same memory",
          "Apple doesn't make GPUs",
          "The RTX 5090 has no VRAM",
        ],
        answer: 0,
        explain: "Comparisons must keep scope straight: a laptop system vs a desktop graphics card compares different kinds of things at very different power levels.",
      },
      {
        id: "q3",
        prompt: "For local LLMs, what should you check first?",
        choices: ["Boost clock", "Whether the model fits in GPU-accessible memory, and that your tools support the hardware", "The number of USB ports", "PCIe 5.0 SSD support"],
        answer: 1,
        explain: "Capacity is pass/fail and software support decides usability; bandwidth and compute come next.",
      },
      {
        id: "q4",
        prompt: "A laptop lists an 'RTX 5090 Laptop GPU'. What should you check?",
        choices: [
          "Nothing — it's identical to the desktop card",
          "Its configured power limit (TGP), cooling and independent reviews of that laptop",
          "Only the CPU",
          "The PSU wattage",
        ],
        answer: 1,
        explain: "Laptop GPUs use different configurations and power limits that vary by manufacturer; check the specific system.",
      },
    ],
  },
  misconceptions: ["ghz-faster", "dgpu-better", "nvidia-ai-hardware-only", "unified-infinite", "apple-cores-vs-cuda"],
  related: ["/buy", "/workloads", "/specs", "/compare", "/llm", "/myths", "bottlenecks"],
};

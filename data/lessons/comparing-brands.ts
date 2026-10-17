import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "comparing-brands",
  number: 17,
  title: "How to compare brands",
  subtitle: "Apple, AMD, NVIDIA and Intel make different things at different scopes. Fair comparisons start by matching the scope and separating the questions.",
  kind: "software",
  minutes: 12,
  sections: [
    {
      id: "scope",
      title: "Match the scope first",
      body: {
        simple:
          "\"Is Apple faster than NVIDIA?\" sounds like a simple question, but Apple sells **whole computers** built around one chip, while NVIDIA sells **graphics cards** that go inside a PC.\n\nBefore comparing anything, decide what level you're comparing: a **chip**, a **component**, a whole **system**, or a **platform** (hardware plus its software world). Then compare things at the same level.",
        technical:
          "- **Chip:** a die or package — Ryzen CPU, Core Ultra CPU, Apple M-series SoC\n- **Component:** a purchasable part — GeForce or Radeon card, RAM kit, SSD\n- **System:** a working computer — MacBook Pro, gaming desktop, workstation\n- **Platform:** system + OS + drivers + APIs + ecosystem — macOS/Metal, Windows/CUDA, Linux/ROCm\n\nAn M-series chip spans what a PC splits across CPU, GPU, VRAM and RAM, so chip-to-chip comparisons with a PC CPU or GPU are always partial. System-to-system at a price and power point, or platform-to-platform for a workflow, are usually the fair framings.",
        deep:
          "Mismatched scope produces predictable errors: comparing an M-series GPU to a 575 W desktop card ignores that the Mac's whole system may draw less than the card alone; comparing a Ryzen CPU to an M-series chip on GPU work ignores the separate GPU the PC would have. Even component comparisons need care — a laptop RTX GPU is a different scope of power budget than a desktop card with the same name.",
      },
      interactive: "scope-ladder",
    },
    {
      id: "separate",
      title: "Separate the questions",
      body: {
        simple:
          "Brand arguments usually mix several different questions. Pull them apart:\n\n- **Architecture** — how it's designed\n- **Performance** — how fast it is at a specific task\n- **Software** — what runs on it\n- **Power** — energy, heat, noise, battery\n- **Memory** — how much, how fast, shared or separate\n- **Price** — of the whole system you need\n- **Compatibility** — your apps, games, tools\n- **Workload** — what you actually do\n\nA platform can lead on one and trail on another. That's not a contradiction — it's a tradeoff.",
        technical:
          "For each candidate, fill in the eight dimensions for **your** workload. For example, local LLM inference: memory capacity (does the model fit?), memory bandwidth (token rate ceiling), compute (prompt processing), software (does your tool support this GPU?), power and portability, price. A Mac with large unified memory might win on capacity and portability; an NVIDIA desktop on bandwidth, compute and software breadth; an AMD system on VRAM per dollar if ROCm supports it.",
        deep:
          "Benchmarks collapse many dimensions into one number under one set of conditions. That's useful only when the benchmark's conditions match yours: same software version, same precision, same resolution, same power limit. Prefer multiple independent measurements in workloads like yours over any single score, and be wary of vendor-chosen comparisons that pick favourable settings (e.g. frame generation on vs off, or different precisions).",
      },
    },
    {
      id: "architecture",
      title: "Compare architecture one aspect at a time",
      body: {
        simple:
          "The diagrams below compare a Mac, a Ryzen + RTX PC and an Intel + RTX PC. Pick one aspect — memory, AI engines, upgradeability — and see how each system handles it.",
        technical:
          "Notice how the same question has structurally different answers: memory is one pool on the Mac and two pools across PCIe on the PCs; AI acceleration lives in the Neural Engine and GPU on the Mac and mainly in the GPU's Tensor Cores on the PCs; upgradeability is none vs nearly everything.",
        deep:
          "Architectural differences predict *where* systems will differ, not *by how much*. Use them to form hypotheses (\"this workload streams large data CPU→GPU, so PCIe may matter\") and then check measurements.",
      },
      interactive: "arch-compare",
    },
    {
      id: "misleading",
      title: "Spot misleading comparisons",
      body: {
        simple:
          "Watch out for comparisons like:\n\n- **5 GHz vs 5 GHz** — different chips do different amounts of work per clock\n- **16 GB VRAM vs 16 GB unified memory** — different memory designs\n- **thousands of CUDA cores vs 40 Apple GPU cores** — different units\n- **200 TOPS vs 100 TOPS** — possibly different precisions or conditions\n\nSee the full list in [Myths & Misleading Numbers](/myths).",
        technical:
          "Common distortions: comparing at different power levels; enabling upscaling or frame generation on one side only; comparing peak to sustained numbers; using a benchmark that runs natively on one platform and through translation on another; or comparing a top-tier part from one brand with a mid-tier part from another and generalising to the brand.",
        deep:
          "A trustworthy comparison states: the exact configurations (including power limits and memory), software versions, settings, and whether results are averages of multiple runs. If any of these are missing, treat the comparison as marketing. The safest generalisation about a brand is about its **design choices** (unified vs discrete memory, CUDA vs ROCm), not about its speed.",
      },
      callout: { tone: "myth", title: "'Brand X is always better'", text: "No company is best for every workload. Each makes different tradeoffs in compute, memory, data movement, software and power." },
    },
    {
      id: "table",
      title: "Use a comparison table that explains itself",
      body: {
        simple:
          "Comparison tables are only useful if you know what each row means for you. In the table below, every row has a \"what this means\" explanation. Pick the kinds of computer you're considering.",
        technical:
          "The rows cover CPU and GPU architecture, memory model, VRAM and RAM, bandwidth, upgradeability, AI and gaming ecosystems, video engines, power, cooling, OS, compatibility, portability and price category. Values are typical configurations, not specific products.",
        deep:
          "Once you've narrowed to two or three candidates, move from the table to specific products in the [hardware database](/hardware) and to measurements in your workload. The table is for understanding tradeoffs, not for picking a winner.",
      },
      interactive: "platform-compare",
    },
  ],
  quiz: {
    id: "comparing-brands-quiz",
    questions: [
      {
        id: "q1",
        prompt: "Which comparison is at a matching scope?",
        choices: ["MacBook Pro vs RTX 5080 card", "Mac Studio vs a complete desktop PC at a similar price", "M-series chip vs a stick of RAM", "Ryzen CPU vs macOS"],
        answer: 1,
        explain: "System vs system. The other pairs mix chips, components, systems and platforms.",
      },
      {
        id: "q2",
        prompt: "A vendor shows its GPU is '3× faster' with frame generation on, vs a rival with it off. This comparison is…",
        choices: ["Fair", "Misleading — the settings differ", "Impossible", "Proof the rival is obsolete"],
        answer: 1,
        explain: "Comparisons must use matching settings. Frame generation changes what's being measured.",
      },
      {
        id: "q3",
        prompt: "The most reliable generalisation about a company is about its…",
        choices: ["Speed in all workloads", "Design choices and tradeoffs", "Logo", "Fan noise"],
        answer: 1,
        explain: "Design choices (unified vs discrete memory, CUDA vs ROCm, integrated vs modular) are stable; speed depends on the workload.",
      },
    ],
  },
  misconceptions: ["ghz-faster", "unified-same-as-ram", "apple-cores-vs-cuda", "dgpu-better", "nvidia-ai-hardware-only"],
  related: ["/companies", "/compare", "/myths", "/workloads", "choosing-hardware"],
};

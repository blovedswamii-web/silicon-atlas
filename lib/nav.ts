/** Single source of truth for site structure. Every route on the site is listed here. */
export interface NavItem {
  href: string;
  label: string;
  blurb: string;
}
export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    id: "explore",
    label: "Explore",
    items: [
      { href: "/", label: "Interactive Computer", blurb: "Click any part of a PC or a Mac to zoom in." },
      { href: "/platforms", label: "Platform Explorer", blurb: "Six system architectures, side by side." },
      { href: "/run", label: "Run a Program", blurb: "Run the same workload on different computers." },
      { href: "/map", label: "System Map", blurb: "Compute, memory, data movement and software as one map." },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    items: [
      { href: "/learn", label: "All 18 Lessons", blurb: "From 'what is an instruction' to 'what should I buy'." },
      { href: "/memory", label: "Memory Hierarchy", blurb: "Registers to network, on a log scale." },
      { href: "/unified-memory", label: "Unified Memory", blurb: "What Apple means — and what it doesn't." },
      { href: "/parallel", label: "CPU vs GPU", blurb: "Process 10,000 pixels with few or many workers." },
      { href: "/efficiency", label: "Performance per Watt", blurb: "Power, heat, battery, and laptop vs desktop." },
    ],
  },
  {
    id: "companies",
    label: "Companies",
    items: [
      { href: "/companies", label: "Apple · AMD · NVIDIA · Intel", blurb: "What each company actually builds." },
      { href: "/compare", label: "Platform Comparison", blurb: "Every row explains what it means." },
      { href: "/generations", label: "Generations", blurb: "What changed between architecture generations." },
      { href: "/names", label: "Name Decoder", blurb: "RTX 5070 Ti, Ryzen 7, Core Ultra 9, M5 Max." },
    ],
  },
  {
    id: "ai",
    label: "AI",
    items: [
      { href: "/ai", label: "AI Compute & Software", blurb: "CUDA, ROCm, Metal/MLX, oneAPI — hardware is half the story." },
      { href: "/llm", label: "LLM Memory Calculator", blurb: "Will a 32B model fit? And how fast could it go?" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    items: [
      { href: "/bottleneck-lab", label: "Bottleneck Lab", blurb: "Build a system, pick a workload, find the limiter." },
      { href: "/buy", label: "What Should I Buy?", blurb: "Specs to prioritise for your work — with tradeoffs." },
      { href: "/workloads", label: "Workload Fit", blurb: "Why a platform suits gaming, AI, video, code…" },
      { href: "/specs", label: "Spec Decoder", blurb: "What each number means, and if it compares across brands." },
      { href: "/myths", label: "Myths & Misleading Numbers", blurb: "16 GB VRAM ≠ 16 GB unified memory, and more." },
      { href: "/hardware", label: "Hardware Database", blurb: "Representative products, with sources." },
      { href: "/glossary", label: "Glossary", blurb: "Every term, in plain language first." },
    ],
  },
];

export const ALL_ROUTES = NAV.flatMap((g) => g.items);

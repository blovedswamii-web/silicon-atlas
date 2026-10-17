import type { CompanyId } from "@/data/schema";

/**
 * Rules for the "What should I buy?" assistant. The assistant never names a winner:
 * it ranks which SPECIFICATIONS matter for the person's answers, and explains when
 * each platform family is attractive and what to watch out for.
 */

export type BuyWorkload = "gaming" | "ai" | "programming" | "video" | "3d" | "school" | "general";
export type Level = 0 | 1 | 2; // not important / somewhat / very

export interface BuyAnswers {
  workload: BuyWorkload;
  budget: "low" | "mid" | "high" | "max";
  form: "laptop" | "desktop" | "either";
  battery: Level;
  portability: Level;
  gaming: Level;
  ai: Level;
  upgrade: Level;
  os: "any" | "windows" | "macos" | "linux";
}

export const DEFAULT_ANSWERS: BuyAnswers = {
  workload: "general",
  budget: "mid",
  form: "laptop",
  battery: 1,
  portability: 1,
  gaming: 0,
  ai: 0,
  upgrade: 0,
  os: "any",
};

export const WORKLOAD_OPTIONS: { value: BuyWorkload; label: string; blurb: string }[] = [
  { value: "gaming", label: "Gaming", blurb: "PC games, high refresh rates, ray tracing" },
  { value: "ai", label: "AI / ML", blurb: "Local LLMs, image generation, training" },
  { value: "programming", label: "Programming", blurb: "IDEs, containers, compiling" },
  { value: "video", label: "Video editing", blurb: "4K timelines, colour, exports" },
  { value: "3d", label: "3D & rendering", blurb: "Blender, CAD, game dev" },
  { value: "school", label: "School", blurb: "Notes, docs, browsing, battery" },
  { value: "general", label: "General use", blurb: "Web, email, media, office" },
];

export type PriorityId =
  | "gpu-tier"
  | "vram"
  | "cpu-single"
  | "cpu-multi"
  | "ram"
  | "unified-capacity"
  | "bandwidth"
  | "ai-software"
  | "media-engines"
  | "ssd"
  | "battery"
  | "weight"
  | "display"
  | "cooling"
  | "upgradeability"
  | "game-compat"
  | "os-fit";

export const PRIORITY_DEFS: Record<PriorityId, { title: string; why: string }> = {
  "gpu-tier": {
    title: "GPU performance tier",
    why: "The GPU draws the frames (or runs the parallel maths). For graphics-heavy work it sets the ceiling more than any other part.",
  },
  vram: {
    title: "VRAM capacity",
    why: "Textures, 3D scenes and AI model weights must fit in GPU memory. Running out causes sharp slowdowns or failures — and VRAM can't be upgraded.",
  },
  "cpu-single": {
    title: "CPU single-thread performance",
    why: "Responsiveness, many games' main threads and lots of everyday software depend on one fast core.",
  },
  "cpu-multi": {
    title: "CPU core count & sustained multi-core",
    why: "Compiling, exporting, encoding and CPU rendering split across cores. Sustained power and cooling decide how long the cores hold their speed.",
  },
  ram: {
    title: "RAM capacity",
    why: "Enough RAM avoids swapping. Beyond your working set, more doesn't add speed — but too little is painful.",
  },
  "unified-capacity": {
    title: "Unified memory capacity (if choosing a Mac)",
    why: "On Apple Silicon one pool serves CPU and GPU, so it's both your RAM and your 'VRAM'. It's fixed at purchase.",
  },
  bandwidth: {
    title: "Memory bandwidth",
    why: "AI inference is often bandwidth-bound: tokens per second are roughly capped by bandwidth ÷ model size.",
  },
  "ai-software": {
    title: "AI software ecosystem support",
    why: "Whether your frameworks run well (CUDA, ROCm, MLX/Metal, oneAPI/OpenVINO) can matter as much as TFLOPS.",
  },
  "media-engines": {
    title: "Hardware video engines & codec support",
    why: "Smooth editing depends on whether your camera's codecs (H.264/HEVC 10-bit, ProRes, AV1…) are hardware-decoded on your platform.",
  },
  ssd: {
    title: "SSD capacity & speed",
    why: "Projects, footage, datasets and games need space; NVMe keeps load times and scrubbing smooth. Internal storage is often not upgradeable on laptops.",
  },
  battery: {
    title: "Battery life & efficiency",
    why: "Performance per watt decides how much work you get done unplugged — and how hot and loud the laptop gets.",
  },
  weight: {
    title: "Weight & size",
    why: "Portable machines trade cooling capacity (and so sustained performance) for weight.",
  },
  display: {
    title: "Display quality",
    why: "You look at it all day: brightness, colour accuracy for creative work, refresh rate for games.",
  },
  cooling: {
    title: "Cooling & sustained power limits",
    why: "Two machines with the same chip can perform very differently if one can sustain higher power.",
  },
  upgradeability: {
    title: "Upgradeability",
    why: "Desktops let you replace GPU, RAM and storage later. Most laptops (and all Apple Silicon Macs) fix RAM at purchase.",
  },
  "game-compat": {
    title: "Game compatibility (OS, anti-cheat, APIs)",
    why: "Most PC games target Windows + DirectX. Native macOS and Linux libraries are smaller; some anti-cheat systems block non-Windows platforms.",
  },
  "os-fit": {
    title: "Operating system & tool compatibility",
    why: "Your required apps, school or work software decide the OS — and the OS narrows the hardware choices.",
  },
};

/** Base weights per workload (0–10). */
export const WORKLOAD_PRIORITIES: Record<BuyWorkload, Partial<Record<PriorityId, number>>> = {
  gaming: { "gpu-tier": 10, vram: 7, "cpu-single": 7, "game-compat": 8, ram: 4, ssd: 4, display: 5, cooling: 5 },
  ai: { vram: 10, "unified-capacity": 8, "ai-software": 10, bandwidth: 8, "gpu-tier": 7, ram: 6, ssd: 4, cooling: 4 },
  programming: { "cpu-multi": 7, "cpu-single": 7, ram: 8, ssd: 6, battery: 5, display: 4, "os-fit": 6 },
  video: { "media-engines": 9, "cpu-multi": 7, ram: 7, "gpu-tier": 6, ssd: 8, display: 6, "unified-capacity": 4 },
  "3d": { "gpu-tier": 9, vram: 8, "cpu-multi": 6, ram: 7, "ai-software": 3, cooling: 5, display: 4 },
  school: { battery: 9, weight: 8, ram: 5, "cpu-single": 4, ssd: 4, "os-fit": 6, display: 4 },
  general: { battery: 6, "cpu-single": 6, ram: 5, display: 5, ssd: 4, weight: 4 },
};

/** Conditional adjustments applied on top of the base weights. */
export const MODIFIERS: { when: (a: BuyAnswers) => boolean; adjust: Partial<Record<PriorityId, number>> }[] = [
  { when: (a) => a.battery === 2, adjust: { battery: 6, cooling: -2 } },
  { when: (a) => a.battery === 1, adjust: { battery: 3 } },
  { when: (a) => a.portability === 2, adjust: { weight: 6, battery: 2 } },
  { when: (a) => a.portability === 1, adjust: { weight: 3 } },
  { when: (a) => a.gaming === 2, adjust: { "gpu-tier": 4, "game-compat": 6, "cpu-single": 2 } },
  { when: (a) => a.gaming === 1, adjust: { "gpu-tier": 2, "game-compat": 3 } },
  { when: (a) => a.ai === 2, adjust: { vram: 5, "ai-software": 6, bandwidth: 4, "unified-capacity": 4 } },
  { when: (a) => a.ai === 1, adjust: { vram: 2, "ai-software": 3, "unified-capacity": 2 } },
  { when: (a) => a.upgrade === 2, adjust: { upgradeability: 9 } },
  { when: (a) => a.upgrade === 1, adjust: { upgradeability: 4 } },
  { when: (a) => a.form === "laptop", adjust: { cooling: 2, weight: 1 } },
  { when: (a) => a.form === "desktop", adjust: { battery: -10, weight: -10, upgradeability: 2 } },
  { when: (a) => a.os !== "any", adjust: { "os-fit": 4 } },
  { when: (a) => a.budget === "low", adjust: { ram: 1, ssd: -1 } },
];

/** Concrete spec targets per workload. Ranges are general guidance as of 2026, not product recommendations. */
export const SPEC_TARGETS: Record<BuyWorkload, { spec: string; target: string }[]> = {
  gaming: [
    { spec: "GPU", target: "The tier matched to your resolution: 1080p → mainstream; 1440p → upper-mid; 4K → high-end" },
    { spec: "VRAM", target: "12 GB+ for comfortable 1440p in recent games; 16 GB+ for 4K with high textures" },
    { spec: "RAM", target: "32 GB comfortable; 16 GB workable" },
    { spec: "CPU", target: "Strong single-thread / large cache matters most for high-refresh 1080p" },
  ],
  ai: [
    { spec: "GPU memory", target: "As much as you can afford: 16 GB VRAM is a practical floor; 24–32 GB opens larger models" },
    { spec: "Unified memory (Mac)", target: "64 GB+ for 30B-class models at 4-bit with room for apps; 128 GB+ for 70B-class" },
    { spec: "System RAM (PC)", target: "At least as much as VRAM, ideally 2×" },
    { spec: "Software", target: "Confirm your frameworks support the GPU (CUDA / ROCm list / MLX / XPU)" },
  ],
  programming: [
    { spec: "RAM", target: "32 GB for containers, VMs and big IDEs; 16 GB minimum" },
    { spec: "CPU", target: "8+ fast cores for large builds" },
    { spec: "Storage", target: "1 TB NVMe — toolchains, images and caches grow quickly" },
  ],
  video: [
    { spec: "Codec support", target: "Check hardware decode for your camera's codec and bit depth" },
    { spec: "RAM / unified memory", target: "32 GB for 4K; more for heavy effects or 8K" },
    { spec: "Storage", target: "Fast internal NVMe plus a fast external drive for footage" },
  ],
  "3d": [
    { spec: "GPU", target: "Upper-tier GPU with strong render-engine support (OptiX, HIP, Metal, oneAPI)" },
    { spec: "GPU memory", target: "12–16 GB+ VRAM for complex scenes; or large unified memory" },
    { spec: "RAM", target: "32–64 GB" },
  ],
  school: [
    { spec: "Battery", target: "Look for independent battery tests, not manufacturer maxima" },
    { spec: "RAM", target: "16 GB keeps a browser-heavy workflow smooth for years" },
    { spec: "Storage", target: "256–512 GB; more if storing media locally" },
  ],
  general: [
    { spec: "RAM", target: "16 GB" },
    { spec: "Storage", target: "512 GB SSD" },
    { spec: "CPU / GPU", target: "Any current mainstream chip is ample; prioritise screen, keyboard and battery" },
  ],
};

export interface Family {
  id: string;
  name: string;
  companies: CompanyId[];
  description: string;
  /** Is this family possible given the answers? If not, why. */
  excluded: (a: BuyAnswers) => string | null;
  attractive: { when: (a: BuyAnswers) => boolean; text: string }[];
  caution: { when: (a: BuyAnswers) => boolean; text: string }[];
}

const always = () => true;

export const FAMILIES: Family[] = [
  {
    id: "apple",
    name: "Apple Silicon Mac",
    companies: ["apple"],
    description: "An SoC platform: CPU, GPU, Neural Engine and media engines share unified memory.",
    excluded: (a) =>
      a.os === "windows" ? "You need Windows." : a.os === "linux" ? "You prefer Linux (native Linux on Apple Silicon is community-supported and limited)." : null,
    attractive: [
      { when: (a) => a.battery >= 1 || a.portability >= 1, text: "Strong performance per watt in laptops — long battery life with sustained performance unplugged." },
      { when: (a) => a.workload === "video", text: "Media engines (including ProRes) are tightly integrated with major editors." },
      { when: (a) => a.workload === "ai" || a.ai >= 1, text: "Large unified-memory configurations can hold models that won't fit in consumer GPU VRAM (MLX, llama.cpp Metal)." },
      { when: (a) => a.workload === "programming", text: "Unix-based macOS with native ARM64 toolchains; good for web, mobile (required for iOS) and general development." },
      { when: (a) => a.os === "macos", text: "It's the only platform that runs macOS." },
    ],
    caution: [
      { when: always, text: "Memory and storage are fixed at purchase — buy the capacity you'll need for the machine's lifetime." },
      { when: (a) => a.workload === "gaming" || a.gaming >= 1, text: "Smaller native game library; some titles and anti-cheat systems are Windows-only." },
      { when: (a) => a.workload === "ai" || a.ai >= 1, text: "No CUDA. Training throughput is generally below high-end NVIDIA GPUs; check your tools support MPS/MLX." },
      { when: (a) => a.upgrade >= 1, text: "Not upgradeable: no GPU, RAM or internal SSD upgrades." },
      { when: (a) => a.budget === "low", text: "Upgrading memory/storage at purchase is expensive relative to the base price." },
    ],
  },
  {
    id: "pc-nvidia",
    name: "PC with NVIDIA GeForce GPU",
    companies: ["nvidia", "amd", "intel"],
    description: "Discrete GPU with dedicated VRAM, paired with an AMD or Intel CPU.",
    excluded: (a) => (a.os === "macos" ? "You need macOS." : null),
    attractive: [
      { when: (a) => a.workload === "ai" || a.ai >= 1, text: "CUDA is the default target for most AI frameworks and research code." },
      { when: (a) => a.workload === "3d", text: "Mature render support (OptiX in Blender, CUDA in many renderers)." },
      { when: (a) => a.workload === "gaming" || a.gaming >= 1, text: "Broad Windows game compatibility; DLSS integrated in many titles." },
      { when: (a) => a.workload === "video", text: "NVENC/NVDEC and CUDA effects are widely supported by editors." },
    ],
    caution: [
      { when: (a) => a.workload === "ai" || a.ai >= 1, text: "VRAM is a hard limit — and consumer cards top out well below large unified-memory systems." },
      { when: (a) => a.form !== "desktop", text: "Laptop GPUs share names with desktop GPUs but have far lower power limits and often fewer cores and less VRAM." },
      { when: (a) => a.battery === 2, text: "High-power discrete GPUs cost battery life in laptops." },
      { when: (a) => a.budget === "low", text: "Lower-tier cards can be VRAM-limited for recent games and AI." },
    ],
  },
  {
    id: "pc-amd",
    name: "PC with AMD Radeon GPU",
    companies: ["amd"],
    description: "Discrete Radeon GPU with dedicated VRAM; often paired with a Ryzen CPU.",
    excluded: (a) => (a.os === "macos" ? "You need macOS." : null),
    attractive: [
      { when: (a) => a.workload === "gaming" || a.gaming >= 1, text: "Competitive rasterisation performance and VRAM for the price in many segments; FSR supported widely." },
      { when: (a) => a.os === "linux", text: "Open-source Linux graphics drivers are well integrated into mainstream distributions." },
      { when: (a) => a.workload === "ai" || a.ai >= 1, text: "Can be attractive for VRAM per dollar if your GPU is on the ROCm support list and your tools support ROCm or Vulkan." },
    ],
    caution: [
      { when: (a) => a.workload === "ai" || a.ai >= 1, text: "ROCm coverage is narrower than CUDA; check your exact GPU, OS and framework versions." },
      { when: (a) => a.workload === "3d", text: "Blender HIP works well; some other renderers are CUDA-only." },
    ],
  },
  {
    id: "pc-intel",
    name: "PC with Intel Arc or strong integrated graphics",
    companies: ["intel"],
    description: "Intel Arc discrete GPUs, or Core Ultra laptops relying on integrated Arc/Xe graphics.",
    excluded: (a) => (a.os === "macos" ? "You need macOS." : null),
    attractive: [
      { when: (a) => a.budget === "low" || a.budget === "mid", text: "Arc discrete GPUs target value segments with useful VRAM amounts." },
      { when: (a) => a.workload === "video", text: "Quick Sync / Arc media engines have broad codec support (including AV1)." },
      { when: (a) => a.workload === "school" || a.workload === "general", text: "Modern Core Ultra laptops pair efficient CPUs with capable integrated graphics for everyday work." },
    ],
    caution: [
      { when: (a) => a.workload === "gaming" || a.gaming >= 1, text: "No current high-end Arc tier; older DirectX titles have historically been less consistent." },
      { when: (a) => a.workload === "ai" || a.ai >= 1, text: "AI via oneAPI/OpenVINO/PyTorch XPU works, but fewer projects target it first." },
    ],
  },
  {
    id: "pc-apu",
    name: "PC laptop/mini-PC with a large unified-memory APU",
    companies: ["amd"],
    description: "Large integrated GPU sharing a big LPDDR5X pool (e.g. AMD Ryzen AI Max-class) — PC's closest analogue to Apple's approach.",
    excluded: (a) => (a.os === "macos" ? "You need macOS." : a.upgrade === 2 ? "You want upgradeability; these use soldered memory." : null),
    attractive: [
      { when: (a) => a.workload === "ai" || a.ai >= 1, text: "Large shared memory lets bigger models load than on most discrete laptop GPUs." },
      { when: (a) => a.portability >= 1 && (a.gaming >= 1 || a.workload === "3d"), text: "Discrete-class graphics in compact devices without a separate GPU." },
    ],
    caution: [
      { when: always, text: "Memory is soldered and fixed; availability is narrower than mainstream laptops." },
      { when: (a) => a.workload === "ai" || a.ai >= 1, text: "Bandwidth is below high-end discrete GPUs, so generation speed is lower even when models fit; ROCm support varies." },
    ],
  },
];

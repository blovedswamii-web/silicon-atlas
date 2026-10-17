import type { Comparison, CompanyId } from "@/data/schema";

/**
 * Platform comparison. Values describe typical configurations of each kind of
 * system (not specific SKUs). Every row carries "what this means".
 */
export const PLATFORM_COMPARISON: Comparison = {
  id: "platforms",
  title: "Platform comparison",
  columns: [
    { id: "mac", label: "MacBook / Mac (Apple Silicon)", company: "apple" },
    { id: "amd-pc", label: "AMD-based PC (Ryzen CPU)", company: "amd" },
    { id: "intel-pc", label: "Intel-based PC (Core CPU)", company: "intel" },
    { id: "nvidia-pc", label: "PC with NVIDIA GeForce GPU", company: "nvidia" },
    { id: "amd-gpu-pc", label: "PC with AMD Radeon GPU", company: "amd" },
    { id: "intel-gpu-pc", label: "PC with Intel Arc GPU", company: "intel" },
  ],
  rows: [
    {
      id: "cpu-arch",
      label: "CPU architecture",
      values: {
        mac: "Apple-designed ARM64 cores; performance + efficiency cores in the SoC",
        "amd-pc": "x86-64 Zen cores; desktop parts built from chiplets; X3D options with stacked cache",
        "intel-pc": "x86-64 hybrid P-cores + E-cores; tile-based Core Ultra",
        "nvidia-pc": "Any x86 CPU (AMD or Intel) — the GPU brand doesn't decide the CPU",
        "amd-gpu-pc": "Any x86 CPU (AMD or Intel)",
        "intel-gpu-pc": "Any x86 CPU; Arc benefits from a platform with Resizable BAR enabled",
      },
      meaning:
        "ARM vs x86 decides which software runs natively; the microarchitecture (cache, width, clocks, power budget) decides how fast it runs. Neither ISA is inherently 'faster'. On a PC the CPU and GPU are independent choices.",
    },
    {
      id: "gpu-arch",
      label: "GPU architecture",
      values: {
        mac: "Apple GPU integrated in the SoC (tile-based, Metal), hardware RT since M3",
        "amd-pc": "Radeon iGPU (RDNA) or any discrete card",
        "intel-pc": "Xe integrated graphics or any discrete card",
        "nvidia-pc": "GeForce RTX: CUDA cores + Tensor Cores + RT Cores",
        "amd-gpu-pc": "Radeon RDNA: compute units + Ray Accelerators + AI accelerators",
        "intel-gpu-pc": "Arc Xe: Xe cores + XMX engines + ray tracing units",
      },
      meaning:
        "Each vendor counts its execution units differently. CUDA cores, stream processors, Xe cores and Apple GPU cores are not interchangeable units — compare measured performance in your workload instead of unit counts.",
    },
    {
      id: "memory-model",
      label: "Memory model",
      values: {
        mac: "Unified: CPU, GPU and Neural Engine share one on-package pool",
        "amd-pc": "System RAM for CPU; iGPU borrows from it; discrete GPU has its own VRAM",
        "intel-pc": "System RAM for CPU; iGPU borrows from it; discrete GPU has its own VRAM",
        "nvidia-pc": "Discrete: system RAM + separate GDDR VRAM across PCIe",
        "amd-gpu-pc": "Discrete: system RAM + separate GDDR VRAM across PCIe",
        "intel-gpu-pc": "Discrete: system RAM + separate GDDR VRAM across PCIe",
      },
      meaning:
        "Unified memory lets the GPU address a large pool without copying across PCIe, but that pool is shared with everything else and is fixed. Discrete VRAM is dedicated and very fast, but limited in size and separate from system RAM. See [Unified memory](/unified-memory).",
    },
    {
      id: "vram",
      label: "VRAM",
      values: {
        mac: "No separate VRAM — the GPU uses part of unified memory (macOS caps the default GPU share below the total)",
        "amd-pc": "Depends on the GPU chosen; iGPU uses system RAM",
        "intel-pc": "Depends on the GPU chosen; iGPU uses system RAM",
        "nvidia-pc": "Typically 8–16 GB on mainstream cards; 24–32 GB on the top consumer cards",
        "amd-gpu-pc": "Typically 8–16 GB on mainstream cards; up to 24 GB on past flagships",
        "intel-gpu-pc": "Typically 8–12 GB (current Arc cards)",
      },
      meaning:
        "VRAM capacity decides what fits on the GPU — textures, scenes, AI models. Running out forces data over PCIe or fails entirely. It does not make a GPU faster when you aren't running out.",
    },
    {
      id: "ram",
      label: "System RAM",
      values: {
        mac: "16–512 GB unified on current models depending on chip; chosen at purchase",
        "amd-pc": "DDR5 DIMMs on desktop (often 16–64 GB, up to 192+ GB); laptops often soldered",
        "intel-pc": "DDR5 DIMMs on desktop; Lunar Lake laptops use fixed on-package memory",
        "nvidia-pc": "Independent of the GPU",
        "amd-gpu-pc": "Independent of the GPU",
        "intel-gpu-pc": "Independent of the GPU",
      },
      meaning:
        "Capacity prevents slowdowns from swapping; beyond what your work needs, more RAM adds little. On a Mac, RAM is also your GPU memory, so size it for both.",
    },
    {
      id: "bandwidth",
      label: "Memory bandwidth",
      values: {
        mac: "≈120–150 GB/s (base) up to ≈550–820 GB/s (Max/Ultra), shared by CPU and GPU",
        "amd-pc": "≈60–100 GB/s dual-channel DDR5 for the CPU; ≈256 GB/s on Ryzen AI Max",
        "intel-pc": "≈60–100 GB/s dual-channel DDR5 for the CPU",
        "nvidia-pc": "GPU VRAM ≈400–1,800 GB/s depending on card; CPU RAM separate",
        "amd-gpu-pc": "GPU VRAM ≈300–960 GB/s depending on card",
        "intel-gpu-pc": "GPU VRAM ≈450 GB/s class on current cards",
      },
      meaning:
        "Bandwidth is how fast data streams from memory. GPUs and LLM token generation are often bandwidth-bound. High bandwidth is not low latency — see the [memory hierarchy](/memory). Figures are representative ranges.",
    },
    {
      id: "upgrade",
      label: "Upgradeability",
      values: {
        mac: "None for CPU/GPU/RAM; internal storage fixed on most models (external storage via Thunderbolt)",
        "amd-pc": "Desktop: socketed CPU (AM5), DIMMs, GPU, SSDs all replaceable",
        "intel-pc": "Desktop: socketed CPU, DIMMs, GPU, SSDs replaceable; sockets change more often",
        "nvidia-pc": "GPU replaceable in desktops; laptop GPUs are soldered",
        "amd-gpu-pc": "GPU replaceable in desktops",
        "intel-gpu-pc": "GPU replaceable in desktops",
      },
      meaning:
        "If you can't upgrade later, buy the memory and storage you'll need for the machine's whole life. Upgradeable desktops let you spread spending over time.",
    },
    {
      id: "ai",
      label: "AI ecosystem",
      values: {
        mac: "Metal / MPS, MLX, Core ML; PyTorch MPS backend; no CUDA",
        "amd-pc": "CPU inference everywhere; NPU on Ryzen AI laptops",
        "intel-pc": "OpenVINO across CPU/iGPU/NPU; PyTorch XPU",
        "nvidia-pc": "CUDA, cuDNN, TensorRT — the default target of most AI software",
        "amd-gpu-pc": "ROCm / HIP with PyTorch on supported GPUs and OSes",
        "intel-gpu-pc": "oneAPI, OpenVINO, PyTorch XPU on Arc",
      },
      meaning:
        "For AI, software support often matters as much as TFLOPS. A tool that only ships CUDA kernels won't use a Radeon, Arc or Apple GPU at full speed — or at all. See [AI compute](/ai).",
    },
    {
      id: "gaming",
      label: "Gaming ecosystem",
      values: {
        mac: "Metal games and ports; growing library; many Windows titles and anti-cheat games unavailable",
        "amd-pc": "Full Windows library; X3D CPUs strong in CPU-limited games",
        "intel-pc": "Full Windows library",
        "nvidia-pc": "Full Windows library; DLSS; mature ray tracing",
        "amd-gpu-pc": "Full Windows library; FSR (FSR 4 ML upscaling on RDNA 4)",
        "intel-gpu-pc": "Full Windows library; XeSS; older-API games depend on driver maturity",
      },
      meaning:
        "Game compatibility comes from OS + API + drivers, not just raw GPU speed. Upscalers (DLSS, FSR, XeSS, MetalFX) render fewer pixels and reconstruct the rest — compare image quality, not just FPS.",
    },
    {
      id: "video",
      label: "Video engines",
      values: {
        mac: "Media engines: H.264, HEVC, ProRes encode/decode; AV1 decode (M3+)",
        "amd-pc": "AMD VCN in iGPU/Radeon",
        "intel-pc": "Quick Sync in the iGPU — widely supported by editors",
        "nvidia-pc": "NVENC / NVDEC; AV1 encode on RTX 40 and newer",
        "amd-gpu-pc": "VCN; AV1 encode on RX 7000 and newer",
        "intel-gpu-pc": "Quick Sync on Arc, including AV1 encode",
      },
      meaning:
        "Fixed-function video engines make specific codecs fast and cheap in power. They only help when your editor uses them and your footage is in a supported codec.",
    },
    {
      id: "power",
      label: "Power consumption",
      values: {
        mac: "Laptops ≈ tens of watts under load; whole Mac Studio far below a high-end gaming PC",
        "amd-pc": "Desktop CPUs ≈65–170 W rated (more under boost); laptop chips 15–55 W+",
        "intel-pc": "Desktop CPUs up to ≈250 W turbo on flagships; laptop chips 15–55 W+",
        "nvidia-pc": "Desktop cards ≈150–575 W; laptop GPUs ≈60–175 W",
        "amd-gpu-pc": "Desktop cards ≈150–355 W",
        "intel-gpu-pc": "Desktop cards ≈150–225 W",
      },
      meaning:
        "Power drives heat, noise, battery life and running cost. Peak power and efficiency are different questions: a chip can be both power-hungry and efficient if it finishes work fast. Ranges are representative.",
    },
    {
      id: "cooling",
      label: "Cooling",
      values: {
        mac: "Small fans or fanless (MacBook Air); quiet under most loads",
        "amd-pc": "Depends on the build; from small air coolers to large liquid coolers",
        "intel-pc": "Depends on the build; flagship CPUs benefit from strong cooling",
        "nvidia-pc": "Large triple-fan coolers on high-end cards; laptops limited by chassis",
        "amd-gpu-pc": "Large air coolers on high-end cards",
        "intel-gpu-pc": "Dual-fan coolers typical",
      },
      meaning:
        "Cooling sets how long a chip can hold its boost clocks. The same chip in a thin laptop and a big desktop can perform very differently.",
    },
    {
      id: "os",
      label: "Operating system",
      values: {
        mac: "macOS (Linux via community projects; no native Windows boot)",
        "amd-pc": "Windows, Linux",
        "intel-pc": "Windows, Linux",
        "nvidia-pc": "Windows, Linux (proprietary + open kernel modules)",
        "amd-gpu-pc": "Windows, Linux (open-source drivers in the mainline kernel)",
        "intel-gpu-pc": "Windows, Linux (open-source drivers)",
      },
      meaning: "The OS determines which apps, games and developer tools are available. It's often the deciding factor before any hardware spec.",
    },
    {
      id: "compat",
      label: "Software compatibility",
      values: {
        mac: "Native ARM apps + Rosetta 2 for x86 Mac apps; Windows apps via VMs/translation",
        "amd-pc": "Broad x86 compatibility",
        "intel-pc": "Broad x86 compatibility",
        "nvidia-pc": "Broadest GPU-compute and pro-app support",
        "amd-gpu-pc": "Broad for games; narrower for GPU compute/pro apps",
        "intel-gpu-pc": "Broad for modern games; narrower for GPU compute/pro apps",
      },
      meaning: "Check the specific apps you rely on — especially plugins, engineering tools, anti-cheat games and CUDA-only software.",
    },
    {
      id: "portability",
      label: "Portability",
      values: {
        mac: "MacBooks: long battery life with full performance on battery",
        "amd-pc": "Laptops and desktops; battery life varies widely by laptop",
        "intel-pc": "Laptops and desktops; Lunar Lake/Panther Lake target battery life",
        "nvidia-pc": "Gaming laptops are portable but often reduce GPU power on battery",
        "amd-gpu-pc": "Mostly desktop",
        "intel-gpu-pc": "Mostly desktop",
      },
      meaning: "Many laptops with discrete GPUs throttle on battery. If you work unplugged, look at performance on battery, not plugged-in benchmarks.",
    },
    {
      id: "price",
      label: "Price category",
      values: {
        mac: "Fixed configurations; memory/storage upgrades priced by Apple at purchase",
        "amd-pc": "Wide range; competitive pricing across tiers",
        "intel-pc": "Wide range; frequent discounts on prior generations",
        "nvidia-pc": "Wide range; high-VRAM cards carry large premiums",
        "amd-gpu-pc": "Often more VRAM per dollar at a given tier",
        "intel-gpu-pc": "Value-focused tiers",
      },
      meaning: "Compare complete systems at equal prices for the same job — not chip vs chip.",
    },
  ],
};

export const COMPARE_PROFILES: { id: string; label: string; company: CompanyId; short: string }[] =
  PLATFORM_COMPARISON.columns.map((c) => ({
    id: c.id,
    label: c.label,
    company: c.company!,
    short: { mac: "Mac", "amd-pc": "AMD CPU PC", "intel-pc": "Intel CPU PC", "nvidia-pc": "NVIDIA GPU PC", "amd-gpu-pc": "AMD GPU PC", "intel-gpu-pc": "Intel GPU PC" }[c.id] ?? c.label,
  }));

/** Architecture comparison: Apple M-series vs Ryzen + RTX vs Intel + RTX. */
export type ArchBlock = "cpu" | "gpu" | "sysmem" | "vram" | "npu" | "media" | "pcie" | "soc";

export interface ArchCompareSystem {
  id: string;
  label: string;
  companies: CompanyId[];
  scope: "platform" | "system";
  layout: "soc" | "discrete";
  /** Block labels in the mini diagram. */
  blocks: Partial<Record<ArchBlock, string>>;
}

export interface ArchCompareRow {
  id: string;
  label: string;
  highlight: ArchBlock[];
  values: Record<string, string>;
  meaning: string;
}

export const ARCH_SYSTEMS: ArchCompareSystem[] = [
  {
    id: "apple",
    label: "Apple M-series Mac",
    companies: ["apple"],
    scope: "platform",
    layout: "soc",
    blocks: { soc: "Apple SoC", cpu: "CPU (P + E cores)", gpu: "GPU cores", npu: "Neural Engine", media: "Media engines", sysmem: "Unified memory" },
  },
  {
    id: "ryzen-rtx",
    label: "Ryzen + GeForce RTX PC",
    companies: ["amd", "nvidia"],
    scope: "system",
    layout: "discrete",
    blocks: { cpu: "Ryzen CPU", sysmem: "DDR5 RAM", pcie: "PCIe", gpu: "RTX GPU", vram: "GDDR7 VRAM", npu: "Tensor Cores", media: "NVENC" },
  },
  {
    id: "intel-rtx",
    label: "Intel Core + GeForce RTX PC",
    companies: ["intel", "nvidia"],
    scope: "system",
    layout: "discrete",
    blocks: { cpu: "Core Ultra CPU", sysmem: "DDR5 RAM", pcie: "PCIe", gpu: "RTX GPU", vram: "GDDR7 VRAM", npu: "Tensor Cores", media: "NVENC" },
  },
];

export const ARCH_ROWS: ArchCompareRow[] = [
  {
    id: "cpu",
    label: "CPU",
    highlight: ["cpu"],
    values: {
      apple: "ARM64 P-cores + E-cores inside the SoC",
      "ryzen-rtx": "x86 Zen cores, chiplet-based on desktop; optional X3D cache",
      "intel-rtx": "x86 hybrid P-cores + E-cores, tile-based",
    },
    meaning: "All three are fast, modern out-of-order CPUs. Differences come from microarchitecture, cache and power budget — not from the ARM/x86 label alone.",
  },
  {
    id: "gpu",
    label: "GPU",
    highlight: ["gpu"],
    values: {
      apple: "Integrated GPU on the same die as the CPU",
      "ryzen-rtx": "Discrete GeForce card on its own board",
      "intel-rtx": "Discrete GeForce card on its own board",
    },
    meaning: "A discrete GPU gets its own power budget (hundreds of watts on desktop) and its own memory. An integrated GPU shares power, cooling and memory with the CPU.",
  },
  {
    id: "memory",
    label: "Memory",
    highlight: ["sysmem", "vram"],
    values: {
      apple: "One pool (e.g. 16–128 GB) used by CPU, GPU and Neural Engine",
      "ryzen-rtx": "System RAM (e.g. 32 GB) + separate VRAM (e.g. 16 GB)",
      "intel-rtx": "System RAM (e.g. 32 GB) + separate VRAM (e.g. 16 GB)",
    },
    meaning: "'32 GB + 16 GB' and '48 GB unified' are not the same thing: the PC GPU sees 16 GB at very high bandwidth; the Mac GPU can address most of 48 GB at lower bandwidth.",
  },
  {
    id: "ai",
    label: "AI accelerators",
    highlight: ["npu", "gpu"],
    values: {
      apple: "Neural Engine + GPU (with per-core neural accelerators from M5)",
      "ryzen-rtx": "Tensor Cores in the GPU; NPU only on Ryzen AI laptop chips",
      "intel-rtx": "Tensor Cores in the GPU; NPU in Core Ultra chips",
    },
    meaning: "Where AI runs depends on software. Most local-LLM and training tools use the GPU; NPUs mainly serve OS features and low-power inference.",
  },
  {
    id: "media",
    label: "Media engines",
    highlight: ["media"],
    values: {
      apple: "Media engines with ProRes, HEVC, H.264; AV1 decode",
      "ryzen-rtx": "NVENC/NVDEC on the GPU (AV1 encode on RTX 40+)",
      "intel-rtx": "NVENC on the GPU plus Quick Sync in the Intel iGPU",
    },
    meaning: "Hardware codecs make editing and streaming fast and efficient — when your app and codec are supported.",
  },
  {
    id: "memarch",
    label: "Memory architecture",
    highlight: ["sysmem", "vram", "pcie"],
    values: {
      apple: "Unified memory architecture, on-package LPDDR",
      "ryzen-rtx": "Discrete: DDR5 DIMMs + GDDR7 on the graphics card",
      "intel-rtx": "Discrete: DDR5 DIMMs + GDDR7 on the graphics card",
    },
    meaning: "Unified avoids certain CPU↔GPU copies and allows big GPU working sets; discrete gives the GPU dedicated, very high bandwidth memory.",
  },
  {
    id: "interconnect",
    label: "Interconnect",
    highlight: ["pcie"],
    values: {
      apple: "On-die fabric between CPU, GPU, NE and memory controllers",
      "ryzen-rtx": "Infinity Fabric inside the CPU; PCIe 5.0 x16 to the GPU",
      "intel-rtx": "On-package die-to-die links; PCIe 5.0 x16 to the GPU",
    },
    meaning: "PCIe 5.0 x16 moves ~64 GB/s each way — fast, but over 10× slower than a high-end GPU's own VRAM. Workloads that shuttle data CPU↔GPU feel this.",
  },
  {
    id: "power",
    label: "Power concept",
    highlight: ["soc", "cpu", "gpu"],
    values: {
      apple: "One shared power/thermal budget for the whole SoC; tuned for efficiency",
      "ryzen-rtx": "Separate budgets: CPU (≈65–170 W+) and GPU (up to ≈575 W)",
      "intel-rtx": "Separate budgets: CPU (up to ≈250 W turbo) and GPU (up to ≈575 W)",
    },
    meaning: "More total power can buy more peak performance; a smaller budget buys silence and battery life. Neither is 'better' without a workload.",
  },
  {
    id: "upgrade",
    label: "Upgradeability",
    highlight: ["sysmem", "gpu", "cpu"],
    values: {
      apple: "Nothing: memory, CPU, GPU fixed at purchase",
      "ryzen-rtx": "CPU, RAM, GPU, storage all replaceable (desktop)",
      "intel-rtx": "CPU, RAM, GPU, storage all replaceable (desktop)",
    },
    meaning: "Integration buys efficiency and simplicity; modularity buys upgrade paths. Decide which you value before comparing benchmarks.",
  },
];

// ---------------------------------------------------------------------------
// Scope ladder: chip · component · system · platform
// ---------------------------------------------------------------------------

export type ScopeRole = "cpu" | "gpu" | "memory" | "ai" | "media" | "storage" | "chassis" | "os";

export const SCOPE_ROLES: { id: ScopeRole; label: string }[] = [
  { id: "cpu", label: "CPU cores" },
  { id: "gpu", label: "GPU" },
  { id: "memory", label: "Memory (RAM / VRAM)" },
  { id: "ai", label: "AI engine" },
  { id: "media", label: "Video engines" },
  { id: "storage", label: "Storage" },
  { id: "chassis", label: "Display, battery, cooling" },
  { id: "os", label: "OS, drivers & APIs" },
];

export const SCOPE_LEVELS: { id: "chip" | "component" | "system" | "platform"; label: string; explain: string }[] = [
  { id: "platform", label: "Platform", explain: "Hardware + operating system + drivers + APIs + ecosystem. What software you can run and how." },
  { id: "system", label: "System", explain: "A complete working computer: chips, memory, storage, cooling, power, display/battery for laptops." },
  { id: "component", label: "Component", explain: "A part you can buy and install: a graphics card, a boxed CPU, a RAM kit, an SSD." },
  { id: "chip", label: "Chip", explain: "A piece of silicon (or a package of several dies). May contain one function or many." },
];

export interface ScopeItem {
  id: string;
  name: string;
  company: CompanyId | "mixed";
  scope: "chip" | "component" | "system" | "platform";
  covers: ScopeRole[];
  note: string;
  compareWith: string;
}

export const SCOPE_ITEMS: ScopeItem[] = [
  {
    id: "m-series",
    name: "Apple M-series chip",
    company: "apple",
    scope: "chip",
    covers: ["cpu", "gpu", "memory", "ai", "media"],
    note: "One SoC package covers what a PC splits across a CPU, a graphics card, VRAM and RAM. Memory sits on the package.",
    compareWith: "A CPU + GPU + memory combination — or better, a whole system at the same price and power.",
  },
  {
    id: "ryzen",
    name: "AMD Ryzen CPU",
    company: "amd",
    scope: "chip",
    covers: ["cpu"],
    note: "A CPU (most current desktop Ryzens include a small iGPU for display output). RAM and a graphics card are separate purchases.",
    compareWith: "Other CPUs — Intel Core, or the CPU portion of an Apple chip in CPU-bound tests.",
  },
  {
    id: "core",
    name: "Intel Core Ultra CPU",
    company: "intel",
    scope: "chip",
    covers: ["cpu", "ai", "media"],
    note: "CPU tiles plus integrated Xe graphics, an NPU and Quick Sync media engines. RAM is separate (except Lunar Lake laptops).",
    compareWith: "Other CPUs, or a whole laptop when it's a laptop chip.",
  },
  {
    id: "rtx",
    name: "NVIDIA GeForce RTX card",
    company: "nvidia",
    scope: "component",
    covers: ["gpu", "memory", "ai", "media"],
    note: "A GPU chip plus its own VRAM, power delivery and cooler on a board. Needs a CPU, RAM, motherboard and PSU to do anything.",
    compareWith: "Other graphics cards (Radeon, Arc). Not a whole Mac.",
  },
  {
    id: "radeon",
    name: "AMD Radeon RX card",
    company: "amd",
    scope: "component",
    covers: ["gpu", "memory", "ai", "media"],
    note: "Same scope as a GeForce card: GPU + VRAM on a board.",
    compareWith: "Other graphics cards.",
  },
  {
    id: "arc",
    name: "Intel Arc card",
    company: "intel",
    scope: "component",
    covers: ["gpu", "memory", "ai", "media"],
    note: "Same scope as other graphics cards.",
    compareWith: "Other graphics cards.",
  },
  {
    id: "macbook",
    name: "MacBook Pro",
    company: "apple",
    scope: "system",
    covers: ["cpu", "gpu", "memory", "ai", "media", "storage", "chassis"],
    note: "The M-series chip plus SSD, display, battery, cooling, speakers and keyboard.",
    compareWith: "Other complete laptops at the same price, size and battery life.",
  },
  {
    id: "gaming-pc",
    name: "Desktop gaming PC",
    company: "mixed",
    scope: "system",
    covers: ["cpu", "gpu", "memory", "ai", "media", "storage", "chassis"],
    note: "CPU + motherboard + RAM + graphics card + SSD + PSU + case + cooling, often from several vendors.",
    compareWith: "Other complete desktops — including a Mac Studio for creative/AI work.",
  },
  {
    id: "mac-platform",
    name: "macOS on Apple Silicon",
    company: "apple",
    scope: "platform",
    covers: ["cpu", "gpu", "memory", "ai", "media", "storage", "chassis", "os"],
    note: "Hardware plus macOS, Metal, Core ML, MLX and the Mac app ecosystem.",
    compareWith: "Windows or Linux PC platforms, judged by the software you need.",
  },
  {
    id: "cuda-platform",
    name: "Windows/Linux PC + NVIDIA CUDA",
    company: "mixed",
    scope: "platform",
    covers: ["cpu", "gpu", "memory", "ai", "media", "storage", "chassis", "os"],
    note: "Any x86 PC with a GeForce GPU, plus drivers, CUDA, cuDNN and the frameworks built on them.",
    compareWith: "Other platforms — Apple Metal/MLX, AMD ROCm, Intel oneAPI — for the frameworks you use.",
  },
];

// ---------------------------------------------------------------------------
// Spec-sheet anatomy: hypothetical listings, segment by segment
// ---------------------------------------------------------------------------

export interface ListingSegment {
  text: string;
  /** Plain separator text has no explanation. */
  explain?: { what: string; tells: string; doesnt: string; ask: string };
}

export interface SpecListing {
  id: string;
  label: string;
  context: string;
  segments: ListingSegment[];
}

export const SPEC_LISTINGS: SpecListing[] = [
  {
    id: "gaming-laptop",
    label: "Gaming laptop",
    context: "A typical retailer title for a Windows gaming laptop (hypothetical example).",
    segments: [
      { text: "16″ Gaming Laptop", explain: { what: "Category and screen size.", tells: "Rough chassis size — bigger chassis usually allow more cooling and higher sustained power.", doesnt: "How much power the CPU and GPU are actually allowed to use.", ask: "What are the CPU and GPU power limits in this model?" } },
      { text: " · " },
      { text: "Core Ultra 9 275HX", explain: { what: "Intel CPU: tier 9, Series 2, HX = highest-power laptop class.", tells: "A desktop-derived chip with many cores, meant for plugged-in performance.", doesnt: "Battery life, or how fast it runs on battery.", ask: "How does it perform unplugged? How loud is it under load?" } },
      { text: " · " },
      { text: "RTX 5070 Ti Laptop GPU", explain: { what: "NVIDIA laptop GPU, 50-series, tier 70 Ti.", tells: "Feature set (DLSS 4, AV1 encode, CUDA) and rough positioning.", doesnt: "Performance — a laptop GPU is a different configuration from the desktop card with the same name, and its speed depends on the laptop's power limit.", ask: "What is the GPU's maximum graphics power (TGP) in this laptop? How much VRAM?" } },
      { text: " · " },
      { text: "32 GB DDR5-5600", explain: { what: "System RAM capacity and type/speed.", tells: "Enough capacity for most games and creative apps; DDR5 at 5600 MT/s.", doesnt: "Whether it's dual-channel, and whether you can upgrade it later (soldered or SO-DIMM).", ask: "Is it two SO-DIMMs (upgradeable, dual-channel) or soldered?" } },
      { text: " · " },
      { text: "1 TB PCIe 4.0 NVMe SSD", explain: { what: "Storage capacity and interface.", tells: "Fast sequential throughput; enough space for a handful of large games.", doesnt: "Random-access performance or sustained write speed — which depend on the specific drive.", ask: "Is there a second M.2 slot for expansion?" } },
      { text: " · " },
      { text: "240 Hz QHD+", explain: { what: "Display refresh rate and resolution.", tells: "Smooth motion if the GPU can produce enough frames.", doesnt: "Colour accuracy, brightness, response time — or whether the GPU can reach 240 FPS in your games.", ask: "What FPS does this GPU reach at native resolution in the games I play?" } },
    ],
  },
  {
    id: "macbook",
    label: "MacBook Pro",
    context: "How a Mac configuration is typically described (hypothetical example).",
    segments: [
      { text: "M-series Pro chip", explain: { what: "Apple SoC: CPU + GPU + Neural Engine + media engines + memory controllers.", tells: "Generation and tier — Pro means more cores and more memory bandwidth than the base chip.", doesnt: "Exact core counts or bandwidth; tiers ship in several configurations.", ask: "Which exact CPU/GPU core configuration, and what memory bandwidth?" } },
      { text: " with " },
      { text: "12-core CPU", explain: { what: "Total CPU cores — a mix of performance and efficiency cores.", tells: "Rough multithreaded headroom within Apple's line-up.", doesnt: "How it compares to an x86 chip with the same core count — different designs.", ask: "How many are performance cores?" } },
      { text: ", " },
      { text: "16-core GPU", explain: { what: "Apple GPU cores.", tells: "Relative GPU size within Apple's own line-up.", doesnt: "Anything comparable to NVIDIA CUDA cores or AMD stream processors — the units are defined differently.", ask: "How does it perform in my specific app or game?" } },
      { text: ", " },
      { text: "16-core Neural Engine", explain: { what: "Apple's NPU.", tells: "Apps using Core ML can offload some ML tasks efficiently.", doesnt: "Local LLM speed — most LLM tools run on the GPU and are limited by memory bandwidth.", ask: "Does the AI software I use run on the Neural Engine, the GPU, or the CPU?" } },
      { text: " · " },
      { text: "24 GB unified memory", explain: { what: "One memory pool shared by CPU, GPU and Neural Engine.", tells: "Total memory for apps AND graphics AND ML models.", doesnt: "That the GPU gets all 24 GB, or that it equals a 24 GB graphics card — it's shared and fixed forever.", ask: "Will this be enough for the machine's whole life, since it can't be upgraded?" } },
      { text: " · " },
      { text: "512 GB SSD", explain: { what: "Internal storage.", tells: "Capacity — fixed at purchase on current Macs.", doesnt: "Whether you'll outgrow it; external Thunderbolt storage is the upgrade path.", ask: "How much space do my projects, libraries and models need?" } },
    ],
  },
  {
    id: "gpu-box",
    label: "Graphics card box",
    context: "Common claims on a desktop graphics card box (hypothetical example).",
    segments: [
      { text: "16 GB GDDR7", explain: { what: "VRAM capacity and memory type.", tells: "How much data the GPU can hold locally — textures, scenes, AI models.", doesnt: "Speed by itself. Bandwidth depends on the bus width and memory speed too.", ask: "What's the memory bandwidth? Is 16 GB enough for the models/resolution I use?" } },
      { text: " · " },
      { text: "10,000+ cores", explain: { what: "A vendor's count of shader lanes (CUDA cores / stream processors).", tells: "Relative size within one vendor's same generation.", doesnt: "Performance vs another brand or generation — units are defined differently.", ask: "What do independent reviews show in my workloads?" } },
      { text: " · " },
      { text: "1,000+ AI TOPS", explain: { what: "Peak AI throughput.", tells: "The ceiling for a specific low-precision format, often with sparsity.", doesnt: "Real-world speed; precision, sparsity and software support change the number a lot.", ask: "At what precision (FP4? INT8? FP16?), dense or sparse?" } },
      { text: " · " },
      { text: "PCIe 5.0", explain: { what: "Host interface generation.", tells: "Maximum link bandwidth to the CPU.", doesnt: "Game performance — most games barely use the link once data is in VRAM.", ask: "Does my motherboard support it? (It works on PCIe 4.0 too.)" } },
      { text: " · " },
      { text: "850 W PSU recommended", explain: { what: "The power supply capacity the maker suggests for a whole system.", tells: "Headroom guidance including CPU and transients.", doesnt: "How much power the card draws — a PSU supplies only what's demanded.", ask: "What's the card's rated board power, and which power connector does it use?" } },
    ],
  },
];

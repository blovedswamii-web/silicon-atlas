import type { ArchEdge, ArchNode, CompanyId, Platform } from "@/data/schema";

/**
 * Platform architecture graphs.
 *
 * Two layout builders produce the node/edge geometry (1000 x 600 viewBox):
 *   - discreteLayout: CPU package + system RAM, PCIe lanes, graphics card with its own VRAM
 *   - socLayout:      one package where CPU, GPU and accelerators share a fabric and one memory pool
 * Each platform record supplies the vendor-specific labels and explanations.
 * These are conceptual diagrams for building intuition — not die shots or floor plans.
 */

interface DiscreteLabels {
  cpu: string;
  cpuSub: string;
  cache: string;
  ram: string;
  ramSub: string;
  gpu: string;
  gpuSub: string;
  vram: string;
  vramSub: string;
  pcieSub: string;
  card: string;
}

function discreteLayout(l: DiscreteLabels): Pick<Platform, "nodes" | "edges" | "roles"> {
  const nodes: ArchNode[] = [
    { id: "cpu-pkg", label: "CPU package", kind: "cpu", x: 260, y: 40, w: 300, h: 300, container: true },
    { id: "cores", label: l.cpu, sublabel: l.cpuSub, kind: "cpu", role: "cpu", x: 280, y: 80, w: 260, h: 110, conceptId: "core" },
    { id: "cache", label: l.cache, sublabel: "on-die SRAM", kind: "cache", role: "cache", x: 280, y: 205, w: 260, h: 50, conceptId: "cache" },
    { id: "imc", label: "Memory controller · PCIe root", sublabel: "I/O die / uncore", kind: "interconnect", role: "fabric", x: 280, y: 270, w: 260, h: 52, conceptId: "memory-controller" },
    { id: "ram", label: l.ram, sublabel: l.ramSub, kind: "memory", role: "sysmem", x: 40, y: 225, w: 170, h: 120, conceptId: "ddr5" },
    { id: "ssd", label: "NVMe SSD", sublabel: "M.2 · PCIe x4", kind: "storage", role: "storage", x: 40, y: 400, w: 170, h: 100, conceptId: "nvme" },
    { id: "pcie", label: "PCIe lanes", sublabel: l.pcieSub, kind: "interconnect", role: "pcie", x: 250, y: 405, w: 510, h: 46, conceptId: "pcie" },
    { id: "card", label: l.card, kind: "gpu", x: 620, y: 40, w: 340, h: 300, container: true },
    { id: "vram", label: l.vram, sublabel: l.vramSub, kind: "vram", role: "vram", x: 640, y: 80, w: 300, h: 80, conceptId: "vram" },
    { id: "gpu", label: l.gpu, sublabel: l.gpuSub, kind: "gpu", role: "gpu", x: 640, y: 180, w: 300, h: 140, conceptId: "shader" },
    { id: "display", label: "Display", sublabel: "DisplayPort / HDMI", kind: "display", role: "display", x: 800, y: 480, w: 160, h: 70 },
  ];
  const edges: ArchEdge[] = [
    { id: "e-cores-cache", from: "cores", to: "cache", kind: "fabric" },
    { id: "e-cache-imc", from: "cache", to: "imc", kind: "fabric" },
    { id: "e-ram", from: "ram", to: "imc", kind: "memory-bus", label: "DDR5" },
    { id: "e-imc-pcie", from: "imc", to: "pcie", kind: "pcie" },
    { id: "e-ssd", from: "ssd", to: "pcie", kind: "storage-bus", label: "x4" },
    { id: "e-pcie-gpu", from: "pcie", to: "gpu", kind: "pcie", label: "x16" },
    { id: "e-vram", from: "gpu", to: "vram", kind: "memory-bus", label: "wide VRAM bus" },
    { id: "e-display", from: "gpu", to: "display", kind: "display" },
  ];
  return {
    nodes,
    edges,
    roles: { cpu: "cores", cache: "cache", fabric: "imc", sysmem: "ram", storage: "ssd", pcie: "pcie", gpu: "gpu", vram: "vram", display: "display" },
  };
}

interface SocLabels {
  pkg: string;
  die: string;
  pCores: string;
  eCores: string;
  gpu: string;
  gpuSub: string;
  npu: string;
  media: string;
  fabric: string;
  mem: string;
  memSub: string;
  storageCtrl: string;
  storage: string;
  storageSub: string;
  memKind: "memory";
}

function socLayout(l: SocLabels): Pick<Platform, "nodes" | "edges" | "roles"> {
  const nodes: ArchNode[] = [
    { id: "pkg", label: l.pkg, kind: "interconnect", x: 25, y: 30, w: 700, h: 530, container: true },
    { id: "die", label: l.die, kind: "accel", x: 240, y: 60, w: 470, h: 480, container: true },
    { id: "pcores", label: "P-cores", sublabel: l.pCores, kind: "cpu", role: "cpu", x: 258, y: 100, w: 100, h: 125, conceptId: "p-cores" },
    { id: "ecores", label: "E-cores", sublabel: l.eCores, kind: "cpu", x: 368, y: 100, w: 82, h: 125, conceptId: "e-cores" },
    { id: "gpu", label: l.gpu, sublabel: l.gpuSub, kind: "gpu", role: "gpu", x: 460, y: 100, w: 232, h: 125, conceptId: "igpu" },
    { id: "fabric", label: l.fabric, sublabel: "cache · fabric · memory controllers", kind: "cache", role: "fabric", x: 258, y: 262, w: 434, h: 54, conceptId: "memory-controller" },
    { id: "npu", label: l.npu, sublabel: "matrix accelerator", kind: "accel", role: "npu", x: 258, y: 352, w: 122, h: 110, conceptId: "npu" },
    { id: "media", label: "Media engines", sublabel: l.media, kind: "accel", role: "media", x: 390, y: 352, w: 128, h: 110, conceptId: "media-engine" },
    { id: "sctrl", label: "Storage ctrl", sublabel: l.storageCtrl, kind: "storage", x: 528, y: 352, w: 164, h: 110 },
    { id: "mem", label: l.mem, sublabel: l.memSub, kind: l.memKind, role: "sysmem", x: 45, y: 195, w: 165, h: 190, conceptId: "unified-memory" },
    { id: "ssd", label: l.storage, sublabel: l.storageSub, kind: "storage", role: "storage", x: 790, y: 370, w: 175, h: 90, conceptId: "nvme" },
    { id: "display", label: "Display", sublabel: "display engine output", kind: "display", role: "display", x: 790, y: 252, w: 175, h: 74 },
  ];
  const edges: ArchEdge[] = [
    { id: "e-p", from: "pcores", to: "fabric", kind: "fabric" },
    { id: "e-e", from: "ecores", to: "fabric", kind: "fabric" },
    { id: "e-g", from: "gpu", to: "fabric", kind: "fabric" },
    { id: "e-n", from: "npu", to: "fabric", kind: "fabric" },
    { id: "e-m", from: "media", to: "fabric", kind: "fabric" },
    { id: "e-s", from: "sctrl", to: "fabric", kind: "fabric" },
    { id: "e-mem", from: "mem", to: "fabric", kind: "memory-bus", label: "wide bus" },
    { id: "e-ssd", from: "sctrl", to: "ssd", kind: "storage-bus" },
    { id: "e-disp", from: "fabric", to: "display", kind: "display" },
  ];
  return {
    nodes,
    edges,
    roles: { cpu: "pcores", cache: "fabric", fabric: "fabric", sysmem: "mem", storage: "ssd", gpu: "gpu", npu: "npu", media: "media", display: "display" },
  };
}

const NVIDIA_ENGINES = {
  gpu: "GeForce RTX GPU",
  matrix: "Tensor Cores",
  media: "NVENC / NVDEC",
  computeApi: "CUDA",
  graphicsApi: "DirectX 12 / Vulkan",
  upscaler: "DLSS",
  gpuMemory: "VRAM",
};

const pcDiscrete = (cpu: CompanyId, gpu: CompanyId): Pick<Platform, "nodes" | "edges" | "roles"> => {
  const cpuLabels = {
    amd: { cpu: "Ryzen CPU cores", cpuSub: "Zen cores on chiplets (CCDs)", cache: "L2 · L3 (V-Cache on X3D)" },
    intel: { cpu: "Core Ultra CPU", cpuSub: "P-cores + E-cores on tiles", cache: "L2 · shared L3" },
  } as const;
  const gpuLabels = {
    nvidia: { card: "GeForce RTX card", gpu: "NVIDIA GPU", gpuSub: "SMs · CUDA / Tensor / RT cores", vram: "VRAM", vramSub: "GDDR7 on the card" },
    amd: { card: "Radeon RX card", gpu: "AMD GPU", gpuSub: "Compute Units · Ray Accelerators", vram: "VRAM", vramSub: "GDDR6 on the card" },
    intel: { card: "Arc card", gpu: "Intel GPU", gpuSub: "Xe cores · XMX · RT units", vram: "VRAM", vramSub: "GDDR6 on the card" },
  } as const;
  const c = cpuLabels[cpu as "amd" | "intel"];
  const g = gpuLabels[gpu as "nvidia" | "amd" | "intel"];
  return discreteLayout({ ...c, ...g, ram: "System RAM", ramSub: "DDR5 DIMMs · 2 channels", pcieSub: "x16 to GPU · x4 to SSD" });
};

const PC_TRAITS_DISCRETE = (cpuArch: string, gpuArch: string) => [
  { label: "CPU", value: cpuArch },
  { label: "GPU", value: gpuArch },
  { label: "Memory model", value: "Separate pools: system RAM + dedicated VRAM" },
  { label: "CPU ↔ GPU link", value: "PCIe (tens of GB/s)" },
  { label: "Upgradeable", value: "GPU, RAM, SSD, often CPU" },
];

export const PLATFORMS: Platform[] = [
  {
    id: "traditional-pc",
    name: "Traditional Desktop PC",
    short: "Desktop PC",
    memoryModel: "discrete",
    cpuVendor: "amd",
    gpuVendor: "nvidia",
    scope: "system",
    generic: true,
    summary:
      "A CPU with its own system RAM, plus a separate graphics card that carries its own GPU and its own memory (VRAM). The two halves talk across PCIe. Every brand combination below is a variation of this shape.",
    ...discreteLayout({
      cpu: "CPU cores",
      cpuSub: "a few powerful cores",
      cache: "L1 · L2 · L3 cache",
      ram: "System RAM",
      ramSub: "DDR5 DIMMs · 2 channels",
      gpu: "GPU",
      gpuSub: "thousands of parallel lanes",
      vram: "VRAM",
      vramSub: "GDDR on the card",
      pcieSub: "x16 to GPU · x4 to SSD",
      card: "Graphics card",
    }),
    engines: {
      gpu: "discrete GPU",
      matrix: "the GPU's matrix units",
      media: "hardware video engine",
      computeApi: "the vendor's compute API",
      graphicsApi: "DirectX 12 / Vulkan",
      upscaler: "the vendor's upscaler",
      gpuMemory: "VRAM",
    },
    traits: [
      { label: "Memory model", value: "Two pools: system RAM (CPU) + VRAM (GPU)" },
      { label: "CPU ↔ GPU link", value: "PCIe — fast, but far slower than VRAM" },
      { label: "Typical power", value: "Hundreds of watts under load" },
      { label: "Upgradeable", value: "Almost everything is a separate part" },
    ],
    advantages: [
      "Each part can be chosen, upgraded and replaced independently.",
      "VRAM sits right next to the GPU on a very wide, very fast bus.",
      "Huge power and cooling budgets allow the fastest individual GPUs.",
    ],
    disadvantages: [
      "Data the CPU prepares must cross PCIe before the GPU can use it from VRAM.",
      "GPU memory capacity is fixed by the card — a model larger than VRAM spills to slower paths.",
      "More power, heat and space than an integrated design.",
    ],
  },
  {
    id: "apple-silicon",
    name: "Apple Silicon Mac",
    short: "Apple Silicon",
    memoryModel: "unified",
    cpuVendor: "apple",
    gpuVendor: "apple",
    scope: "platform",
    summary:
      "One system-on-chip contains the CPU cores, GPU cores, Neural Engine and media engines. They all reach a single pool of unified memory that sits in the same package, over a wide memory bus. There is no separate VRAM and no PCIe hop between CPU and GPU.",
    ...socLayout({
      pkg: "Apple M-series package",
      die: "SoC die",
      pCores: "performance",
      eCores: "efficiency",
      gpu: "GPU cores",
      gpuSub: "tile-based, Metal",
      npu: "Neural Engine",
      media: "ProRes · HEVC · AV1 dec.",
      fabric: "System Level Cache",
      mem: "Unified memory",
      memSub: "LPDDR5/5X in the package",
      storageCtrl: "in the SoC",
      storage: "SSD (NAND)",
      storageSub: "controller lives in the SoC",
      memKind: "memory",
    }),
    engines: {
      gpu: "Apple GPU",
      matrix: "GPU (Metal / MLX) or Neural Engine",
      npu: "Neural Engine",
      media: "media engines",
      computeApi: "Metal / MLX",
      graphicsApi: "Metal",
      upscaler: "MetalFX",
      gpuMemory: "unified memory",
    },
    traits: [
      { label: "Memory model", value: "One unified pool shared by CPU, GPU and accelerators" },
      { label: "CPU ↔ GPU link", value: "On-chip fabric — no PCIe hop" },
      { label: "Typical power", value: "Single-digit to low hundreds of watts by chip tier" },
      { label: "Upgradeable", value: "No — memory and SoC are fixed at purchase" },
    ],
    advantages: [
      "CPU and GPU work on the same data without copying it into a separate VRAM pool.",
      "Large memory configurations let the GPU address far more memory than most consumer graphics cards.",
      "High performance per watt from tight integration, a wide memory bus and macOS tuned for the hardware.",
    ],
    disadvantages: [
      "Memory capacity is chosen once, at purchase, and cannot be upgraded.",
      "The GPU is not swappable; peak GPU throughput is below the largest desktop cards.",
      "No CUDA; some games and professional tools are Windows- or CUDA-only.",
    ],
  },
  {
    id: "amd-nvidia",
    name: "AMD CPU + NVIDIA GPU",
    short: "Ryzen + RTX",
    memoryModel: "discrete",
    cpuVendor: "amd",
    gpuVendor: "nvidia",
    scope: "system",
    summary:
      "A Ryzen CPU (Zen cores on chiplets, joined by Infinity Fabric) with system DDR5, plus a GeForce RTX card with its own GDDR7. The most common enthusiast gaming and AI-hobbyist build.",
    ...pcDiscrete("amd", "nvidia"),
    engines: NVIDIA_ENGINES,
    traits: PC_TRAITS_DISCRETE("AMD Zen (x86-64), chiplet design", "NVIDIA RTX: SMs with CUDA, Tensor and RT cores"),
    advantages: [
      "CUDA is the default target of most AI and GPU-compute software.",
      "X3D Ryzen parts add stacked L3 cache that some games benefit from strongly.",
      "Both CPU and GPU are independently upgradeable.",
    ],
    disadvantages: [
      "GPU memory = the card's VRAM. Larger AI models need a card with more VRAM, which is expensive.",
      "High-end desktop GPUs draw a lot of power and need serious cooling and PSU headroom.",
    ],
  },
  {
    id: "amd-amd",
    name: "AMD CPU + AMD GPU",
    short: "Ryzen + Radeon",
    memoryModel: "discrete",
    cpuVendor: "amd",
    gpuVendor: "amd",
    scope: "system",
    summary:
      "A Ryzen CPU with a Radeon RX card (RDNA architecture). Same physical shape as any discrete PC — the CPU and GPU still talk over PCIe and the GPU still has its own VRAM. One vendor does not mean shared memory.",
    ...pcDiscrete("amd", "amd"),
    engines: {
      gpu: "Radeon GPU",
      matrix: "RDNA AI accelerators",
      media: "AMD media engine",
      computeApi: "ROCm / HIP",
      graphicsApi: "DirectX 12 / Vulkan",
      upscaler: "FSR",
      gpuMemory: "VRAM",
    },
    traits: PC_TRAITS_DISCRETE("AMD Zen (x86-64), chiplet design", "AMD RDNA: Compute Units, Ray Accelerators"),
    advantages: [
      "Radeon cards often offer generous VRAM for their price tier.",
      "Open-source Linux graphics drivers are mature.",
      "Smart Access Memory (Resizable BAR) lets the CPU address all of VRAM at once — a standard PCIe feature, also used by other vendors.",
    ],
    disadvantages: [
      "ROCm (AMD's CUDA counterpart) supports fewer consumer cards and tools than CUDA — check compatibility for AI work.",
      "Still two memory pools joined by PCIe, exactly like any discrete PC.",
    ],
  },
  {
    id: "intel-nvidia",
    name: "Intel CPU + NVIDIA GPU",
    short: "Core + RTX",
    memoryModel: "discrete",
    cpuVendor: "intel",
    gpuVendor: "nvidia",
    scope: "system",
    summary:
      "An Intel Core / Core Ultra CPU — a hybrid of performance cores and efficiency cores — with system DDR5, plus a GeForce RTX card with its own VRAM.",
    ...pcDiscrete("intel", "nvidia"),
    engines: NVIDIA_ENGINES,
    traits: PC_TRAITS_DISCRETE("Intel hybrid x86-64: P-cores + E-cores, tiles", "NVIDIA RTX: SMs with CUDA, Tensor and RT cores"),
    advantages: [
      "Hybrid CPU: many E-cores add multi-threaded throughput for builds and renders.",
      "Intel Quick Sync on the CPU's integrated graphics can handle video encode/decode in some editors.",
      "CUDA ecosystem for AI and GPU compute.",
    ],
    disadvantages: [
      "Hybrid scheduling depends on the OS and Intel Thread Director getting placement right.",
      "Same VRAM-capacity ceiling as any discrete GPU build.",
    ],
  },
  {
    id: "intel-intel",
    name: "Intel CPU + Intel GPU",
    short: "Core + Arc",
    memoryModel: "discrete",
    cpuVendor: "intel",
    gpuVendor: "intel",
    scope: "system",
    summary:
      "An Intel Core CPU with an Intel Arc discrete card (Xe architecture). Intel CPUs also include Xe integrated graphics — with an Arc card installed, the card does the heavy lifting from its own VRAM, and the iGPU can still help with media work.",
    ...pcDiscrete("intel", "intel"),
    engines: {
      gpu: "Arc GPU",
      matrix: "XMX engines",
      media: "Xe media engine (Quick Sync)",
      computeApi: "oneAPI / SYCL · OpenVINO",
      graphicsApi: "DirectX 12 / Vulkan",
      upscaler: "XeSS",
      gpuMemory: "VRAM",
    },
    traits: PC_TRAITS_DISCRETE("Intel hybrid x86-64: P-cores + E-cores", "Intel Xe: Xe cores with XMX matrix engines, RT units"),
    advantages: [
      "Arc cards include strong media engines (AV1 encode) and XMX matrix units.",
      "OpenVINO and oneAPI target Intel CPUs, GPUs and NPUs from one toolkit.",
    ],
    disadvantages: [
      "Arc relies on modern APIs; older DirectX titles have historically depended more on driver work.",
      "AI software support is narrower than CUDA's — check your tools.",
      "Arc performs best with Resizable BAR enabled.",
    ],
  },
  {
    id: "pc-integrated",
    name: "PC laptop with integrated graphics",
    short: "PC iGPU laptop",
    memoryModel: "integrated-shared",
    cpuVendor: "intel",
    gpuVendor: "intel",
    scope: "system",
    summary:
      "Most PC laptops have no graphics card: CPU, integrated GPU, NPU and media engines share one chip (or package) and share system RAM. This is also a shared-memory design — so “unified memory” is not unique to Apple. What differs is mainly memory bandwidth, capacity and how the software stack treats the pool.",
    ...socLayout({
      pkg: "Laptop processor package",
      die: "CPU + iGPU + NPU",
      pCores: "performance",
      eCores: "efficiency",
      gpu: "Integrated GPU",
      gpuSub: "Xe or Radeon graphics",
      npu: "NPU",
      media: "Quick Sync / VCN",
      fabric: "Shared cache / fabric",
      mem: "System RAM",
      memSub: "LPDDR5X · shared with iGPU",
      storageCtrl: "PCIe x4 link",
      storage: "NVMe SSD",
      storageSub: "M.2 module",
      memKind: "memory",
    }),
    engines: {
      gpu: "integrated GPU",
      matrix: "NPU or iGPU matrix units",
      npu: "NPU",
      media: "media engine",
      computeApi: "DirectML / OpenVINO / ROCm (varies)",
      graphicsApi: "DirectX 12 / Vulkan",
      upscaler: "XeSS / FSR",
      gpuMemory: "shared system RAM",
    },
    traits: [
      { label: "Memory model", value: "Shared: the iGPU uses part of system RAM" },
      { label: "Bandwidth", value: "Usually a 128-bit bus — much less than a discrete card's VRAM" },
      { label: "Typical power", value: "~15–55 W for the whole processor" },
      { label: "Examples", value: "Intel Core Ultra (Lunar/Panther Lake), AMD Ryzen AI; Ryzen AI Max uses a wider 256-bit bus" },
    ],
    advantages: [
      "Excellent battery life and low cost; no separate GPU to power or cool.",
      "Modern iGPUs handle video, light games and on-device AI features well.",
    ],
    disadvantages: [
      "Memory bandwidth is the usual limiter for graphics and LLMs.",
      "RAM is frequently soldered — choose capacity at purchase.",
    ],
  },
];

export const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);

/** Short role-level explanations shown when a node is clicked, per memory model. */
export const ROLE_INFO: Record<string, { title: string; text: string; lesson?: string }> = {
  cpu: {
    title: "CPU cores",
    text: "A few powerful, general-purpose cores that run the operating system and the logic of every program. Great at branching, decision-heavy, sequential work.",
    lesson: "/learn/cpu",
  },
  cache: {
    title: "Cache",
    text: "Small, extremely fast on-chip memory that keeps recently used data close to the cores, so they don't wait ~100 ns for RAM every time.",
    lesson: "/learn/memory-hierarchy",
  },
  fabric: {
    title: "Fabric & memory controller",
    text: "The on-chip interconnect that routes requests between cores, caches, memory and I/O. The memory controller turns requests into DRAM commands.",
    lesson: "/learn/motherboard-pcie",
  },
  sysmem: {
    title: "Main memory",
    text: "Holds the working data of everything that's running. Far larger than cache, far faster than storage. On a unified design it is also the GPU's memory.",
    lesson: "/learn/ram",
  },
  storage: {
    title: "Storage (SSD)",
    text: "Keeps files and programs when the power is off. Huge capacity, but ~1,000× slower to reach than RAM, so data is loaded into memory before use.",
    lesson: "/learn/storage",
  },
  pcie: {
    title: "PCIe",
    text: "The high-speed serial link that connects the CPU to the graphics card and SSDs. Fast — but many times slower than the GPU's own VRAM bus.",
    lesson: "/learn/motherboard-pcie",
  },
  gpu: {
    title: "GPU",
    text: "Thousands of simpler parallel lanes, built to apply the same operation to huge amounts of data at once: pixels, vertices, matrix math.",
    lesson: "/learn/gpu",
  },
  vram: {
    title: "VRAM",
    text: "The graphics card's own memory on a very wide bus. Textures, frame buffers and AI model weights must live here for the GPU to use them at full speed.",
    lesson: "/learn/gpu",
  },
  npu: {
    title: "Neural engine / NPU",
    text: "A dedicated, power-efficient accelerator for neural-network math. Fast at the operations it supports; the GPU remains the more flexible AI engine.",
    lesson: "/learn/ai-hardware",
  },
  media: {
    title: "Media engines",
    text: "Fixed-function hardware for video encode and decode (H.264, HEVC, AV1, ProRes on Apple). Far more efficient than doing it on CPU or GPU cores.",
    lesson: "/learn/gpu",
  },
  display: {
    title: "Display output",
    text: "Finished frames are scanned out from a frame buffer in GPU memory to the screen by a display engine.",
  },
};

/**
 * The System Map: one set of concepts laid out twice — as a traditional PC and
 * as Apple Silicon. Nodes keep their ids across layouts so the UI can animate
 * the map restructuring itself. Coordinates are percentages of the map box.
 */
export type MapLayer = "compute" | "memory" | "movement" | "software" | "power";
export type MapMode = "pc" | "apple";

export interface MapNodeLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  hidden?: boolean;
  text: string;
}

export interface MapNode {
  id: string;
  layer: MapLayer;
  kind: "cpu" | "gpu" | "accel" | "memory" | "vram" | "cache" | "storage" | "interconnect" | "power" | "cooling" | "software" | "network";
  layout: Record<MapMode, MapNodeLayout>;
}

export interface MapEdge {
  a: string;
  b: string;
  type: "data" | "power" | "software";
}

export const MAP_LAYERS: { id: MapLayer; label: string; text: Record<MapMode, string> }[] = [
  {
    id: "compute",
    label: "Compute",
    text: {
      pc: "Compute is split across separate chips: the CPU (with an NPU on some recent models) and a discrete GPU on its own card, which also carries the video engines.",
      apple: "All compute engines — CPU clusters, GPU, Neural Engine, media engines — are blocks on one SoC.",
    },
  },
  {
    id: "memory",
    label: "Memory",
    text: {
      pc: "Two separate pools: system RAM for the CPU and VRAM for the GPU. Capacity of each is chosen (and upgraded) independently.",
      apple: "One unified pool serves every engine. There is no VRAM box — the GPU's memory is the same memory. Capacity is fixed at purchase.",
    },
  },
  {
    id: "movement",
    label: "Data movement",
    text: {
      pc: "Three very different roads: a ~128-bit DDR5 bus to RAM, PCIe between CPU and GPU, and a very wide GDDR bus from GPU to VRAM.",
      apple: "One wide in-package memory bus plus the on-chip fabric. PCIe still exists, but only for I/O such as Thunderbolt and Wi-Fi.",
    },
  },
  {
    id: "software",
    label: "Software",
    text: {
      pc: "Hardware is useful only through software: OS, vendor driver, APIs (DirectX, Vulkan, CUDA, ROCm, oneAPI) and frameworks. Mixing vendors means mixing stacks.",
      apple: "Apple writes the OS, the GPU driver and the main APIs (Metal, Core ML) for its own hardware — tight integration, but one path.",
    },
  },
  {
    id: "power",
    label: "Power",
    text: {
      pc: "A PSU feeds 12 V to voltage regulators on the motherboard and graphics card. Desktop parts trade power for performance freely.",
      apple: "Battery or USB-C power, a power-management chip, and a much smaller thermal budget — efficiency shapes every design decision.",
    },
  },
];

const n = (
  id: string,
  layer: MapLayer,
  kind: MapNode["kind"],
  pc: MapNodeLayout,
  apple: MapNodeLayout,
): MapNode => ({ id, layer, kind, layout: { pc, apple } });

export const MAP_NODES: MapNode[] = [
  // software column
  n("app", "software", "software",
    { x: 2, y: 6, w: 17, h: 11, label: "Application", sub: "game · Blender · LLM app", text: "What you actually run. It calls frameworks and APIs; it never touches the hardware directly." },
    { x: 2, y: 6, w: 17, h: 11, label: "Application", sub: "Final Cut · LM Studio · games", text: "What you actually run — built against Apple's frameworks or cross-platform ones with a Metal back-end." }),
  n("framework", "software", "software",
    { x: 2, y: 22, w: 17, h: 11, label: "Frameworks", sub: "PyTorch · Unreal · Blender Cycles", text: "Libraries that turn high-level work into GPU/CPU operations. Their back-end support decides which hardware you can use." },
    { x: 2, y: 22, w: 17, h: 11, label: "Frameworks", sub: "MLX · PyTorch (MPS) · Core ML", text: "Frameworks with Metal back-ends. Projects that only target CUDA won't run here without porting." }),
  n("api", "software", "software",
    { x: 2, y: 38, w: 17, h: 11, label: "APIs", sub: "DirectX · Vulkan · CUDA/ROCm/oneAPI", text: "Graphics and compute APIs. CUDA is NVIDIA-only; ROCm/HIP is AMD's; oneAPI/SYCL is Intel's; DirectX/Vulkan span vendors." },
    { x: 2, y: 38, w: 17, h: 11, label: "APIs", sub: "Metal · Core ML · Accelerate", text: "Metal is Apple's graphics and compute API; Core ML targets CPU, GPU and Neural Engine." }),
  n("driver", "software", "software",
    { x: 2, y: 54, w: 17, h: 11, label: "GPU driver", sub: "from NVIDIA / AMD / Intel", text: "Each GPU vendor ships its own driver. Driver quality can change game performance and compatibility over time." },
    { x: 2, y: 54, w: 17, h: 11, label: "GPU driver", sub: "part of macOS", text: "Apple ships the driver inside macOS updates — no separate download, no choice of version." }),
  n("os", "software", "software",
    { x: 2, y: 70, w: 17, h: 11, label: "Operating system", sub: "Windows · Linux", text: "Schedules threads onto cores (including hybrid P/E cores), manages memory, and talks to drivers." },
    { x: 2, y: 70, w: 17, h: 11, label: "Operating system", sub: "macOS", text: "macOS schedules work by quality-of-service class onto P- and E-cores and manages the unified memory pool." }),

  // compute
  n("cpu", "compute", "cpu",
    { x: 25, y: 6, w: 19, h: 14, label: "CPU cores", sub: "x86-64 · Ryzen / Core", text: "A separate CPU chip (or chiplets) on a socket. Upgradeable within the socket's generations." },
    { x: 25, y: 7, w: 12, h: 14, label: "CPU", sub: "ARM64 · P + E", text: "CPU clusters inside the SoC, sharing the fabric and memory with everything else." }),
  n("npu", "compute", "accel",
    { x: 48, y: 6, w: 14, h: 9, label: "NPU", sub: "on some recent CPUs", text: "Recent Intel Core Ultra and AMD Ryzen AI processors add an NPU for low-power AI features." },
    { x: 25, y: 25, w: 12, h: 9, label: "Neural Engine", sub: "in the SoC", text: "Apple's NPU, used through Core ML for supported models." }),
  n("gpu", "compute", "gpu",
    { x: 66, y: 6, w: 17, h: 14, label: "GPU", sub: "discrete card", text: "A separate GPU with its own power delivery, cooling and memory. Swappable." },
    { x: 40, y: 7, w: 23, h: 14, label: "GPU", sub: "integrated in the SoC", text: "Integrated, yet scaled up to dozens of cores on Max/Ultra chips. Not swappable." }),
  n("media", "compute", "accel",
    { x: 66, y: 24, w: 17, h: 9, label: "Media engine", sub: "on the GPU card", text: "Video encode/decode (NVENC/NVDEC, VCN, Xe media). Intel CPUs' iGPU adds Quick Sync." },
    { x: 40, y: 25, w: 11, h: 9, label: "Media", sub: "ProRes · HEVC", text: "Media engines inside the SoC, scaling in number with chip tier." }),

  // memory
  n("cache", "memory", "cache",
    { x: 25, y: 24, w: 19, h: 9, label: "L1 · L2 · L3 cache", text: "CPU caches. Large L3 (or stacked V-Cache) helps workloads with big, reused working sets." },
    { x: 53, y: 25, w: 10, h: 9, label: "SLC", sub: "shared cache", text: "A System Level Cache shared by CPU, GPU and other agents in front of memory." }),
  n("ram", "memory", "memory",
    { x: 25, y: 50, w: 19, h: 13, label: "System RAM", sub: "DDR5 DIMMs · upgradeable", text: "The CPU's memory. Upgradeable DIMMs; the GPU can only reach it across PCIe." },
    { x: 25, y: 57, w: 38, h: 15, label: "Unified memory", sub: "one pool for CPU · GPU · NPU · media", text: "The only memory pool. Everything — OS, apps, GPU buffers, model weights — shares it." }),
  n("vram", "memory", "vram",
    { x: 66, y: 50, w: 17, h: 13, label: "VRAM", sub: "GDDR6/7 · fixed per card", text: "The GPU's dedicated memory. Very high bandwidth, fixed capacity." },
    { x: 46, y: 60, w: 14, h: 9, label: "VRAM", hidden: true, text: "" }),
  n("storage", "memory", "storage",
    { x: 25, y: 80, w: 19, h: 12, label: "NVMe SSD", sub: "M.2 · replaceable", text: "Persistent storage on PCIe lanes. Usually replaceable and expandable." },
    { x: 25, y: 80, w: 19, h: 12, label: "SSD", sub: "controller in SoC · soldered NAND", text: "Storage controller in the SoC; flash soldered to the board on most models." }),

  // movement
  n("membus", "movement", "interconnect",
    { x: 25, y: 38, w: 19, h: 7, label: "Memory bus", sub: "128-bit DDR5", text: "Roughly 60–100 GB/s on a typical dual-channel desktop." },
    { x: 25, y: 47, w: 38, h: 6, label: "Wide in-package bus", sub: "128- to 1024-bit LPDDR", text: "From ~100 GB/s on base chips to ~800 GB/s on Ultra chips, shared by all engines." }),
  n("pcie", "movement", "interconnect",
    { x: 48, y: 24, w: 14, h: 9, label: "PCIe x16", sub: "CPU ↔ GPU", text: "~32 GB/s (Gen4) or ~64 GB/s (Gen5) per direction — much slower than VRAM, so data is uploaded once and reused." },
    { x: 67, y: 25, w: 16, h: 9, label: "PCIe / TB", sub: "I/O only", text: "PCIe remains for Thunderbolt, Wi-Fi and other I/O — but there is no PCIe hop between CPU and GPU." }),
  n("vrambus", "movement", "interconnect",
    { x: 66, y: 38, w: 17, h: 7, label: "VRAM bus", sub: "128–512-bit GDDR", text: "Hundreds of GB/s to ~1.8 TB/s on the largest consumer cards." },
    { x: 46, y: 47, w: 14, h: 6, label: "VRAM bus", hidden: true, text: "" }),
  n("fabric", "movement", "interconnect",
    { x: 48, y: 50, w: 14, h: 9, label: "Chipset / I/O", sub: "more lanes, USB, SATA", text: "The chipset fans out extra (shared) lanes for storage, USB and networking." },
    { x: 25, y: 37, w: 38, h: 6, label: "On-chip fabric", sub: "connects every block", text: "The SoC's internal network connecting all engines to the SLC and memory controllers." }),
  n("network", "movement", "network",
    { x: 48, y: 80, w: 14, h: 12, label: "Network", sub: "Ethernet · Wi-Fi", text: "Milliseconds away for the internet — a million times slower than cache." },
    { x: 48, y: 80, w: 15, h: 12, label: "Network", sub: "Wi-Fi · Thunderbolt", text: "Milliseconds away for the internet — a million times slower than cache." }),

  // power
  n("psu", "power", "power",
    { x: 87, y: 6, w: 11, h: 14, label: "PSU", sub: "12 V", text: "Delivers what the system draws — its wattage rating is a ceiling, not a constant draw." },
    { x: 87, y: 6, w: 11, h: 14, label: "Battery", sub: "+ USB-C", text: "A fixed energy budget: every watt saved is battery life." }),
  n("vrm", "power", "power",
    { x: 87, y: 24, w: 11, h: 11, label: "VRMs", sub: "board + card", text: "Convert 12 V to the ~1 V chips run at. High-end CPUs and GPUs need beefy VRMs." },
    { x: 87, y: 24, w: 11, h: 11, label: "PMIC", sub: "power mgmt", text: "Power-management chips feeding the SoC's many voltage domains." }),
  n("cooling", "power", "cooling",
    { x: 87, y: 40, w: 11, h: 13, label: "Cooling", sub: "tower/AIO + case fans", text: "Hundreds of watts of heat to remove. Cooling sets sustained clocks." },
    { x: 87, y: 40, w: 11, h: 13, label: "Cooling", sub: "fans or fanless", text: "Tens of watts in a laptop. Sustained performance depends on fan vs fanless designs." }),
];

export const MAP_EDGES: Record<MapMode, MapEdge[]> = {
  pc: [
    { a: "app", b: "framework", type: "software" },
    { a: "framework", b: "api", type: "software" },
    { a: "api", b: "driver", type: "software" },
    { a: "driver", b: "os", type: "software" },
    { a: "driver", b: "gpu", type: "software" },
    { a: "os", b: "cpu", type: "software" },
    { a: "cpu", b: "cache", type: "data" },
    { a: "cpu", b: "npu", type: "data" },
    { a: "cache", b: "membus", type: "data" },
    { a: "membus", b: "ram", type: "data" },
    { a: "cache", b: "pcie", type: "data" },
    { a: "pcie", b: "gpu", type: "data" },
    { a: "gpu", b: "media", type: "data" },
    { a: "media", b: "vrambus", type: "data" },
    { a: "vrambus", b: "vram", type: "data" },
    { a: "pcie", b: "fabric", type: "data" },
    { a: "ram", b: "storage", type: "data" },
    { a: "fabric", b: "network", type: "data" },
    { a: "psu", b: "vrm", type: "power" },
    { a: "vrm", b: "cooling", type: "power" },
    { a: "psu", b: "gpu", type: "power" },
  ],
  apple: [
    { a: "app", b: "framework", type: "software" },
    { a: "framework", b: "api", type: "software" },
    { a: "api", b: "driver", type: "software" },
    { a: "driver", b: "os", type: "software" },
    { a: "driver", b: "gpu", type: "software" },
    { a: "os", b: "cpu", type: "software" },
    { a: "cpu", b: "npu", type: "data" },
    { a: "npu", b: "fabric", type: "data" },
    { a: "gpu", b: "media", type: "data" },
    { a: "media", b: "fabric", type: "data" },
    { a: "cache", b: "fabric", type: "data" },
    { a: "gpu", b: "cache", type: "data" },
    { a: "fabric", b: "membus", type: "data" },
    { a: "membus", b: "ram", type: "data" },
    { a: "cache", b: "pcie", type: "data" },
    { a: "ram", b: "storage", type: "data" },
    { a: "pcie", b: "network", type: "data" },
    { a: "psu", b: "vrm", type: "power" },
    { a: "vrm", b: "cooling", type: "power" },
  ],
};

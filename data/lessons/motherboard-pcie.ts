import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "motherboard-pcie",
  number: 8,
  title: "Motherboard & PCIe",
  subtitle: "The roads between components: sockets, chipsets, PCIe lanes, memory slots and power delivery — and what changes in a laptop or a Mac.",
  kind: "interconnect",
  minutes: 11,
  sections: [
    {
      id: "role",
      title: "The motherboard is the city's road network",
      body: {
        simple: `The motherboard is the big circuit board everything plugs into. It doesn't compute much itself. Its job is to **connect** things — CPU to RAM, CPU to graphics card, CPU to SSDs, USB ports, network — and to **deliver power** to each part.

If the CPU is a factory and RAM is its warehouse, the motherboard is the road network. Wide roads go to the most important places.`,
        technical: `A desktop motherboard provides: the **CPU socket** (which determines which CPUs fit), **DIMM slots** wired to the CPU's memory controller, **PCIe slots** and **M.2 slots**, a **chipset** that adds extra I/O, **VRMs** (voltage regulator modules) that convert 12 V from the power supply into the ~1 V the CPU needs, firmware (UEFI), and connectors for USB, audio, networking and fans.

Most high-speed connections go **directly to the CPU** — memory, the main graphics slot, often one or two NVMe slots. The chipset hangs off the CPU through a single uplink and fans out into many slower devices.`,
        deep: `Board tiers within a platform mostly differ in: VRM capacity and cooling (matters for sustained high-power CPUs), how many CPU lanes are routed to slots vs shared, chipset tier (number of downstream lanes and USB ports), memory trace quality (affects stable high-speed DDR5), and extras (Wi-Fi, 10 GbE, Thunderbolt/USB4).

Many boards use **lane sharing**: populating a particular M.2 slot may drop the main graphics slot from x16 to x8, or disable SATA ports. The block diagram in the motherboard manual is the source of truth.`,
      },
    },
    {
      id: "pcie",
      title: "PCIe: lanes and generations",
      body: {
        simple: `**PCIe** is the high-speed connection for graphics cards, SSDs and other add-ons. It's made of **lanes** — think of each lane as one lane of a highway. A graphics card usually gets 16 lanes (written "x16"); an SSD gets 4 ("x4").

Every new PCIe **generation** doubles the speed of each lane. So PCIe 5.0 with 8 lanes is about as fast as PCIe 4.0 with 16.`,
        technical: `Approximate usable bandwidth per lane, per direction: Gen3 ~1 GB/s, Gen4 ~2 GB/s, Gen5 ~4 GB/s, Gen6 ~7.5 GB/s. A Gen4 x16 graphics slot offers ~32 GB/s each way; Gen5 x16 ~63 GB/s. PCIe is full-duplex: both directions at once.

Compatibility is backwards and forwards: a Gen5 card in a Gen4 slot runs at Gen4 speeds; an x4 SSD works in an x16 slot. Physical slot size doesn't guarantee electrical lanes — "x16-sized, x4 electrical" slots are common.`,
        deep: `For gaming, most GPUs lose only a few percent when limited to Gen4 x8 or Gen3 x16, because textures and geometry live in VRAM and per-frame PCIe traffic is modest. Exceptions: GPUs that are themselves wired x8 (some lower-end cards) when installed in older Gen3 boards, and cases where VRAM is too small and the GPU spills into system memory over PCIe — then link bandwidth suddenly matters a lot.

For AI and compute, PCIe matters when data must repeatedly cross it: models larger than VRAM with layers offloaded to system RAM, multi-GPU setups without a dedicated GPU-to-GPU link, or data-loading pipelines. Datacenter GPUs use dedicated links (e.g. NVIDIA's NVLink) for exactly this reason.`,
      },
      interactive: "pcie-lanes",
    },
    {
      id: "memory-slots",
      title: "Memory slots and channels",
      body: {
        simple: `RAM slots connect directly to the CPU. Desktop CPUs usually have **two memory channels**, and boards often have four slots — two per channel. Install RAM in matched pairs, in the slots the manual recommends, to use both channels.`,
        technical: `Two DIMMs (one per channel) usually run fastest. Four DIMMs (two per channel) increase capacity but load the memory bus more heavily, so supported speeds often drop. **XMP** (Intel) and **EXPO** (AMD) profiles let the board run RAM at its rated speed instead of conservative JEDEC defaults; they're a form of officially supported overclocking and occasionally need tuning for stability.

DDR5's first boot after a memory change involves **training** — the board calibrates timings — which can take noticeably long.`,
        deep: `Memory topology is a design decision: "daisy-chain" vs "T-topology" routing favours 2- or 4-DIMM configurations respectively, and two-DIMM boards can often reach higher speeds. Workstation platforms add more channels (4–8+) and registered ECC memory for capacity and reliability.`,
      },
    },
    {
      id: "power",
      title: "Power delivery and the power supply",
      body: {
        simple: `The **power supply (PSU)** converts wall power into the voltages the computer needs. Its rating — say 850 W — is the **maximum** it can deliver, not what it uses. A computer only draws the power its parts actually need at that moment: maybe 60 W at the desktop, 500 W while gaming.

Choose a PSU with headroom over your peak load and a good efficiency rating; a huge PSU doesn't make anything faster.`,
        technical: `PSUs output 12 V (most power), 5 V and 3.3 V. The motherboard's **VRMs** convert 12 V to the CPU's core voltage; graphics cards have their own VRMs and draw from the slot (up to 75 W) plus dedicated power connectors (8-pin PCIe, or 12V-2×6 / 12VHPWR on recent high-end cards).

Efficiency ratings (80 PLUS Bronze/Gold/Platinum/Titanium) describe how much input power becomes output power; the rest is heat. Modern high-end GPUs have short power **transients** well above their average draw, so PSU quality and headroom matter more than the label suggests.`,
        deep: `Sizing: sum the CPU's realistic sustained power, the GPU's board power, ~50–100 W for the rest of the system, then add margin for transients and ageing — and check the GPU vendor's recommended PSU. PSU efficiency curves usually peak around 40–60% load, but the difference between running at 40% and 70% is a few percentage points, not a reason to massively oversize.

Laptops and SoCs replace all of this with a battery, a charger and integrated power management — and a **power budget** shared between CPU and GPU. That shared budget is why a laptop GPU with a desktop GPU's name performs very differently (see [Performance per watt](/efficiency)).`,
      },
      callout: {
        tone: "myth",
        title: "Myth: a 1000 W PSU consumes 1000 W",
        text: "A PSU supplies what the components draw, up to its rating. The rating is a ceiling, not a constant draw.",
      },
    },
    {
      id: "laptops-socs",
      title: "Laptops, SoCs and Apple's logic board",
      body: {
        simple: `In most laptops, and in every Apple Silicon Mac, there's no room for slots. Parts are **soldered** to the board or combined into one chip. That makes them smaller, cooler and more efficient — but you usually can't upgrade the RAM, and often not the storage either.

On a Mac, the CPU, GPU, Neural Engine and memory controllers are all inside one chip (the SoC), with RAM sitting right next to it on the same package.`,
        technical: `An **SoC** (system on a chip) integrates what a desktop spreads across a board: CPU, GPU, memory controllers, media engines, NPU, display controllers, often the SSD controller and Thunderbolt/USB controllers. Connections become on-die fabrics instead of PCIe traces, cutting power and latency.

Even many Windows laptops with discrete GPUs use soldered LPDDR for the CPU and soldered GDDR for the GPU, connected over PCIe on the motherboard. Some laptops keep SO-DIMM or CAMM2 memory slots and one or two M.2 slots — worth checking if upgradeability matters to you.`,
        deep: `Integration trades flexibility for efficiency. Moving data across a package costs far less energy per bit than driving it across a motherboard and through a connector — which is a large part of why SoC designs (Apple, AMD's big APUs, Intel's Lunar Lake with on-package memory) can deliver good performance per watt.

The cost: configuration is fixed at purchase, upgrade paths disappear, repairs often mean replacing the whole board, and you pay the manufacturer's price for memory and storage tiers. Desktop PCs remain the most modular and repairable option. See [Platform Explorer](/platforms) for the architectures side by side.`,
      },
    },
  ],
  quiz: {
    id: "q-mobo",
    questions: [
      {
        id: "q1",
        prompt: "Roughly how much bandwidth does PCIe 5.0 x8 provide compared with PCIe 4.0 x16?",
        choices: ["Half", "About the same", "Double", "Four times"],
        answer: 1,
        explain: "Each generation doubles per-lane bandwidth, so Gen5 x8 ≈ Gen4 x16 (~32 GB/s each way).",
      },
      {
        id: "q2",
        prompt: "Two NVMe SSDs and a 10 GbE card all sit behind the chipset. What might limit them when used together?",
        choices: ["The PSU", "The chipset's single uplink to the CPU", "The GPU", "The BIOS battery"],
        answer: 1,
        explain: "Everything behind the chipset shares one link to the CPU.",
      },
      {
        id: "q3",
        prompt: "A gaming PC with an 850 W PSU typically draws how much while gaming?",
        choices: ["Exactly 850 W", "Whatever the components need — often well under the rating", "850 W plus losses", "Nothing until the rating is reached"],
        answer: 1,
        explain: "The PSU rating is its maximum capability; actual draw follows the load.",
      },
    ],
  },
  misconceptions: ["psu-consumes", "pcie5-ssd-doubles"],
  related: ["/platforms", "storage", "ram", "/efficiency", "gpu"],
};

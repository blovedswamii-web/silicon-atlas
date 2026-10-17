import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "storage",
  number: 5,
  title: "Storage",
  subtitle: "Hard disks, SATA and NVMe SSDs, PCIe generations — and why the number on the box is rarely the one you feel.",
  kind: "storage",
  minutes: 10,
  sections: [
    {
      id: "what",
      title: "Storage is not memory",
      body: {
        simple: `**Storage** (an SSD or hard disk) keeps your files when the power is off: apps, photos, games, the operating system itself. **Memory** (RAM) is the fast, temporary workspace used while things are running.

Storage is much bigger and cheaper per gigabyte than RAM — and much slower. When people say "my computer has 512 GB", that's storage; "16 GB" is usually RAM.`,
        technical: `Storage is **non-volatile** and block-addressed: the OS reads and writes it in blocks (typically 4 KB) through a file system, rather than byte-by-byte like RAM. Data must be copied into RAM before the CPU can work on it.

An SSD stores data in **NAND flash** cells, managed by a controller that handles wear-levelling, error correction, garbage collection and a mapping table from logical blocks to physical flash. Interfaces: **SATA** (legacy, ~550 MB/s ceiling) and **NVMe over PCIe** (scales with PCIe generation and lane count).`,
        deep: `Flash can't overwrite in place: it writes pages but erases only large blocks, so the controller writes new data elsewhere and garbage-collects later. This creates **write amplification**, motivates **TRIM**, and explains why SSDs slow down when nearly full.

Cell types trade density for endurance and speed: SLC → MLC → TLC → QLC store 1–4 bits per cell. Most consumer drives are TLC or QLC and use part of their flash as a fast **SLC cache**; sustained writes larger than that cache can drop to a fraction of the advertised speed — very noticeable on QLC drives.`,
      },
    },
    {
      id: "compare",
      title: "What actually changes between drives",
      body: {
        simple: `There are three numbers to think about:

- **Sequential speed** — copying one big file. This is the number on the box.
- **Random speed** — lots of tiny reads scattered around, like starting the computer or opening apps.
- **Latency** — how long one small read takes.

The giant leap is from a **hard disk to any SSD** — about 100× better latency. Between SSD generations, sequential speed keeps doubling, but random speed and latency barely move. Try the load-time model: a PCIe 5.0 drive saves almost nothing over PCIe 4.0 for a game load.`,
        technical: `Representative figures: HDD ~200 MB/s sequential, <1 MB/s 4K random QD1, several ms latency; SATA SSD ~550 MB/s; NVMe Gen3 ~3.5 GB/s; Gen4 ~7 GB/s; Gen5 ~10–14+ GB/s sequential. Low-queue-depth 4K random reads stay in the tens of MB/s across NVMe generations because they're bound by flash read latency (tens of µs), not by the link.

Real-world load times are bounded by everything else that happens during loading: decompression, shader compilation, asset processing and game logic on the CPU. Once storage is fast enough to keep the CPU busy, faster storage stops helping.`,
        deep: `APIs are evolving to move that bottleneck: **DirectStorage** on Windows reduces per-request overhead and can offload decompression to the GPU; consoles use dedicated hardware decompression blocks. Games designed around these can exploit fast NVMe drives better — but the benefit comes from the software path, not from the drive's peak sequential number.

Where high sequential bandwidth genuinely matters: copying large files between fast drives, video editing with high-bitrate raw footage, loading large AI model weights into memory, and scratch disks for big datasets.`,
      },
      interactive: "storage-compare",
      callout: {
        tone: "myth",
        title: "Myth: a PCIe 5 SSD doubles performance everywhere",
        text: "It doubles sequential bandwidth. Boot, app launch and most game loads are dominated by latency and CPU work, so they barely change.",
      },
    },
    {
      id: "choosing",
      title: "What to look for when buying",
      body: {
        simple: `For most people: **an NVMe SSD with enough capacity** matters far more than the fastest model. Running out of space is a bigger problem than a slightly slower drive — and SSDs slow down when nearly full.

Rough guide: 512 GB for light use, 1 TB for general use and some games, 2 TB+ for big game libraries, video or AI models. On Macs, internal storage can't be upgraded later, so choose carefully (external drives are a fine supplement).`,
        technical: `Beyond capacity, the specs that change daily experience:

- **DRAM cache or HMB**: drives with their own DRAM (or using Host Memory Buffer) keep mapping tables fast; DRAM-less budget drives can stutter under heavy random workloads.
- **Flash type and SLC cache size**: affects sustained write speed for large copies.
- **Endurance (TBW)** and warranty: matters for heavy write workloads like video caches or frequent dataset rewrites.
- **Thermals**: Gen5 drives often need heatsinks and can throttle under sustained load.`,
        deep: `Platform details: an M.2 slot wired through the chipset shares the chipset's uplink with USB, networking and other devices (see [Motherboard & PCIe](/learn/motherboard-pcie)); a Gen5 drive in a Gen4 slot simply runs at Gen4 speeds.

On Apple Silicon the SSD controller lives inside the SoC and the NAND is on the logic board, which enables tight integration (e.g. hardware encryption at full speed) but means storage is fixed at purchase on most models. Base configurations with smaller NAND counts have in some generations shown lower sequential speeds than higher-capacity configurations — check reviews of the exact configuration if it matters to you.`,
      },
    },
    {
      id: "hierarchy",
      title: "Storage in the bigger picture",
      body: {
        simple: `Storage sits at the bottom of the memory ladder. When RAM runs out, the computer uses storage as overflow ("swap"), and since storage is ~1000× slower than RAM, everything crawls. A fast SSD makes swapping less painful — but having enough RAM avoids it.`,
        technical: `Swap, hibernation, the page cache, and memory-mapped files all blur the line between memory and storage. For AI, model weights load from storage into RAM/VRAM once per session: a 40 GB model takes ~6 s at 7 GB/s versus several minutes from a hard disk — after that, storage speed doesn't affect generation speed.`,
        deep: `Persistent-memory technologies that sat between DRAM and NAND (e.g. Intel Optane, now discontinued) showed how much latency, not bandwidth, defines the storage experience: Optane's ~10 µs reads made systems feel faster than NVMe drives with higher sequential numbers. CXL-attached memory is the current direction for extending memory capacity in servers.`,
      },
      interactive: "latency-ladder",
    },
  ],
  quiz: {
    id: "q-storage",
    questions: [
      {
        id: "q1",
        prompt: "Which upgrade usually makes the biggest everyday difference?",
        choices: ["NVMe Gen4 → Gen5", "Hard disk → any SSD", "SATA SSD → NVMe Gen5 for web browsing", "Larger SLC cache"],
        answer: 1,
        explain: "HDD to SSD improves access latency by ~100×. Between SSD generations, latency barely changes.",
      },
      {
        id: "q2",
        prompt: "Why do game loads barely improve from PCIe 4.0 to PCIe 5.0 SSDs?",
        choices: ["Games can't read from SSDs", "CPU work like decompression and shader compilation dominates once storage is fast enough", "PCIe 5.0 is slower", "Games use the GPU's VRAM instead"],
        answer: 1,
        explain: "After storage stops being the limit, other stages of loading set the pace.",
      },
      {
        id: "q3",
        prompt: "Why can a nearly full QLC SSD feel slow during large copies?",
        choices: ["It runs out of SLC cache and has less free space for garbage collection", "QLC uses SATA", "It switches to HDD mode", "TRIM disables it"],
        answer: 0,
        explain: "Once the fast SLC cache fills, writes go at native QLC speed; a full drive also has less room to manage writes.",
      },
    ],
  },
  misconceptions: ["pcie5-ssd-doubles", "more-ram-faster"],
  related: ["/memory", "motherboard-pcie", "ram", "/bottleneck-lab"],
};

import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "ram",
  number: 4,
  title: "RAM",
  subtitle: "Capacity, speed, channels and form factors — when more RAM helps, when faster RAM helps, and when neither does.",
  kind: "memory",
  minutes: 12,
  sections: [
    {
      id: "what",
      title: "What RAM is for",
      body: {
        simple: `RAM is the computer's **workspace**. Everything that's open — the OS, your browser tabs, the document you're editing, the game level you're in — lives in RAM while you use it. When you turn the computer off, RAM forgets everything; that's what the SSD is for.

RAM is about **a thousand times faster** than an SSD, which is why the computer copies things into RAM before working on them.`,
        technical: `System RAM is **DRAM**: each bit is a tiny capacitor that leaks and must be refreshed thousands of times per second. DRAM chips are organised into banks, rows and columns; reading means opening a row into a row buffer and then reading columns from it.

The OS presents each process with **virtual memory** and maps it onto physical RAM in pages. When physical RAM runs short, the OS compresses pages (macOS and Windows both do this) and eventually **swaps** them to the SSD.`,
        deep: `DRAM timing parameters describe that row/column dance: **tCL** (CAS latency — column read after the row is open), **tRCD** (row-to-column delay — opening a row), **tRP** (precharge — closing a row), **tRAS** and many more. Accesses that hit an already-open row are faster than those requiring a row switch, so memory controllers reorder requests to maximise row-buffer hits.

DDR5 also added on-die ECC (which corrects errors inside the chip, but is not the same as end-to-end ECC memory used in workstations and servers), split each DIMM into two independent 32-bit sub-channels, and moved voltage regulation onto the module.`,
      },
    },
    {
      id: "capacity",
      title: "Capacity: when more RAM helps (and when it doesn't)",
      body: {
        simple: `More RAM only helps if you were **running out**. If everything you use fits, extra RAM just sits there — your computer won't be any faster.

If things don't fit, the computer starts using the SSD as overflow, and everything slows down dramatically. That's when more RAM is the single best upgrade. Signs: heavy slowdowns when switching apps, "memory pressure" warnings, constant disk activity.`,
        technical: `Practical guidance (it shifts over time as software grows):

- **8 GB**: light use; quickly pressured by modern browsers plus a few apps.
- **16 GB**: comfortable for general use, programming, most gaming.
- **32 GB**: heavy multitasking, large codebases, VMs and containers, video editing, many modern games with lots running alongside.
- **64 GB+**: large datasets, professional 3D/VFX, many VMs, and — on unified-memory machines — running large AI models locally.

On a **unified-memory** Mac, RAM also serves as GPU memory, so graphics and AI workloads consume the same pool. Size it for CPU and GPU needs together, and remember it can't be upgraded later.`,
        deep: `"Free RAM" is a misleading metric: modern OSes deliberately fill spare RAM with file cache and evict it instantly when needed. Better signals are **memory pressure** (macOS), **committed memory vs physical** and hard-fault rates (Windows), or PSI and swap activity (Linux).

Memory compression trades CPU time for effective capacity and works well for many workloads — so an 8 GB machine can feel better than raw numbers suggest — but it cannot help data that is already compressed (video, model weights, most game assets).`,
      },
      callout: {
        tone: "myth",
        title: "Myth: more RAM = faster computer",
        text: "Extra capacity only helps when your workload would otherwise exceed what you have. Speed comes from latency and bandwidth, not capacity.",
      },
    },
    {
      id: "speed",
      title: "Speed: MT/s, CAS latency and what they really mean",
      body: {
        simple: `RAM is labelled like **DDR5-6000 CL30**. The first number is how many transfers per second (millions) — higher means more bandwidth. "CL" is the delay in clock ticks before data comes back — lower is better, but only when comparing at the same speed.

Use the calculator: DDR4-3200 CL16 and DDR5-6000 CL30 have the **same** real delay — about 10 nanoseconds — but DDR5 moves almost twice as much data per second.`,
        technical: `**DDR** means data moves on both clock edges, so DDR5-6000 runs a 3000 MHz I/O clock and performs 6000 MT/s. **True CAS latency (ns) = CL × 2000 ÷ MT/s**. **Peak bandwidth (GB/s) = MT/s × bus width (bits) ÷ 8 ÷ 1000**: a 64-bit DDR5-6000 channel gives 48 GB/s; dual channel 96 GB/s.

Faster RAM helps workloads that are bandwidth- or latency-sensitive: integrated graphics (which use system RAM as VRAM), some games at high frame rates, compression, and simulations. Many everyday apps show small differences. Very high speeds can also require running the memory controller at a reduced ratio, which can cancel the gain — platform-specific "sweet spots" exist for this reason.`,
        deep: `CAS is a small part of real load-to-use latency. A full DRAM access includes missing every cache level, crossing the on-chip fabric to the memory controller, queuing, a possible row switch (tRP + tRCD), CAS, and the data's return — typically 60–110 ns on desktops, with LPDDR systems often somewhat higher. Measured latency differences between platforms frequently come more from fabric and controller design than from the DIMM's CL.

Bandwidth also has a practical ceiling below peak: refresh, bank conflicts, read/write turnarounds and controller efficiency usually leave sustained bandwidth around 70–90% of theoretical.`,
      },
      interactive: "ram-calculator",
    },
    {
      id: "channels",
      title: "Channels and bus width — the spec nobody prints on the box",
      body: {
        simple: `Bandwidth depends on how **wide** the road to memory is, not just how fast the cars go. Desktop PCs usually have two memory channels; that's why you install RAM sticks in pairs. Using one stick halves bandwidth.

Apple's Pro and Max chips, and some large PC laptop chips, connect memory through very wide roads — 256 or 512 bits — which is how they get several times a typical desktop's memory bandwidth.`,
        technical: `Mainstream desktop platforms: **2 channels × 64 bits = 128-bit**, regardless of whether you use 2 or 4 DIMMs (four DIMMs share the same two channels and often have to run slower). Workstation and server platforms: 4–12 channels. Laptops with LPDDR5X: commonly 128-bit; large SoCs and APUs: 256-bit or 512-bit.

Example arithmetic (bandwidths derived from bus width × data rate): LPDDR5X-8533 on a 512-bit bus ≈ 546 GB/s; on 256-bit ≈ 273 GB/s; desktop dual-channel DDR5-6000 ≈ 96 GB/s; a 256-bit GDDR7 graphics card at 28 Gbps ≈ 896 GB/s.`,
        deep: `Wide buses require many pins and short, clean traces — which is why they appear with memory soldered onto or beside the processor package rather than in sockets. The cost is upgradeability and, at large capacities, price. Socketed alternatives push back: **CAMM2** modules aim to give laptops LPDDR-class speed in a replaceable form factor.

Bandwidth must also be **shared**: on an SoC, CPU cores alone often can't consume the full bus — the width exists largely for the GPU and accelerators. So "546 GB/s" on a laptop SoC and "~96 GB/s" on a desktop CPU describe different consumers; the desktop's discrete GPU brings its own hundreds of GB/s of VRAM bandwidth.`,
      },
    },
    {
      id: "forms",
      title: "DIMMs, soldered, on-package — and VRAM",
      body: {
        simple: `RAM comes in different physical forms:

- **Sticks (DIMMs/SO-DIMMs)** you can add or replace — common in desktops and some laptops.
- **Soldered** to the motherboard — common in thin laptops.
- **On the processor package** — Apple Silicon. Very fast and efficient, but fixed forever at purchase.

A graphics card has its own RAM called **VRAM**, soldered around the GPU. It's separate from system RAM.`,
        technical: `Upgradeability vs performance/efficiency is the core tradeoff. Soldered and on-package LPDDR use less power and support wider buses, and the short distance helps signal quality at high speeds. Socketed DDR5 allows upgrades and very large capacities (desktop boards commonly support 128–192 GB or more).

VRAM types: **GDDR6/GDDR6X/GDDR7** on consumer GPUs (high per-pin speed, moderate bus widths), **HBM** on datacenter accelerators (stacked DRAM with extremely wide interfaces, multiple TB/s). VRAM capacity limits texture detail, resolution and — especially — which AI models fit entirely on the GPU.`,
        deep: `For buying decisions, the questions are:

- **Can it be upgraded later?** If not, buy for the lifetime of the machine.
- **What is the bus width and type?** It sets bandwidth, which matters for integrated/unified GPUs and AI inference.
- **Who shares it?** On unified or integrated designs, GPU usage reduces what's left for apps.
- **Is it ECC?** Matters for workstations and long-running scientific or server work.

Compare unified memory and VRAM with care: [why 16 GB unified ≠ 16 GB VRAM](/unified-memory).`,
      },
    },
  ],
  quiz: {
    id: "q-ram",
    questions: [
      {
        id: "q1",
        prompt: "What is the true CAS latency of DDR5-6000 CL30?",
        choices: ["30 ns", "10 ns", "6 ns", "60 ns"],
        answer: 1,
        explain: "30 × 2000 ÷ 6000 = 10 ns — the same as DDR4-3200 CL16.",
      },
      {
        id: "q2",
        prompt: "A desktop with one DDR5 stick instead of two (same total capacity) will most likely…",
        choices: ["Be identical", "Have about half the memory bandwidth", "Have double the latency", "Not boot"],
        answer: 1,
        explain: "Mainstream desktops have two 64-bit channels; one stick populates only one channel.",
      },
      {
        id: "q3",
        prompt: "When does adding RAM make a computer noticeably faster?",
        choices: ["Always", "When the current workload was running out of RAM and swapping", "Only for games", "Never"],
        answer: 1,
        explain: "Capacity helps only when you were short of it; then avoiding swap is a huge win.",
      },
      {
        id: "q4",
        prompt: "Why can SoC laptops reach 250–550 GB/s memory bandwidth?",
        choices: ["They use magic RAM", "They use very wide (256–512-bit) LPDDR buses close to the processor", "They skip caches", "Because ARM is faster"],
        answer: 1,
        explain: "Bandwidth = data rate × bus width. Wide buses are practical when memory sits on or beside the package.",
      },
    ],
  },
  misconceptions: ["more-ram-faster", "unified-same-as-ram", "unified-infinite"],
  related: ["/memory", "memory-hierarchy", "/unified-memory", "/llm", "storage"],
};

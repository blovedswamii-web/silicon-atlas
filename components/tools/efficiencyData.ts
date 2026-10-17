import type { Source } from "@/data/schema";

interface Cell {
  text: string;
  /** 0–1 relative bar, when the row is a comparable quantity. */
  rel?: number;
}

export interface SameNamePair {
  id: string;
  tab: string;
  title: string;
  intro: string;
  a: string;
  b: string;
  rows: { label: string; a: Cell; b: Cell }[];
  takeaway: string;
  representative: boolean;
  sources: Source[];
}

export const SAME_NAME_PAIRS: SameNamePair[] = [
  {
    id: "rtx5090",
    tab: "RTX 5090",
    title: "GeForce RTX 5090 (desktop) vs GeForce RTX 5090 Laptop GPU",
    intro:
      "Same product name, different silicon. The laptop part is built on a smaller GPU die than the desktop card, with roughly half the CUDA cores, a narrower memory bus, and a power budget the laptop maker chooses within NVIDIA's allowed range.",
    a: "RTX 5090 desktop",
    b: "RTX 5090 Laptop GPU",
    rows: [
      { label: "GPU die", a: { text: "GB202" }, b: { text: "GB203 (the die used by the desktop RTX 5080)" } },
      { label: "CUDA cores", a: { text: "21,760", rel: 1 }, b: { text: "10,496", rel: 10496 / 21760 } },
      { label: "VRAM", a: { text: "32 GB GDDR7", rel: 1 }, b: { text: "24 GB GDDR7", rel: 0.75 } },
      { label: "Memory bus", a: { text: "512-bit", rel: 1 }, b: { text: "256-bit", rel: 0.5 } },
      { label: "Graphics power", a: { text: "575 W total graphics power", rel: 1 }, b: { text: "≈95–150 W (+ Dynamic Boost), set per laptop", rel: 150 / 575 } },
    ],
    takeaway:
      "Expect a large gap in sustained performance — and expect two laptops with the 'same' GPU to differ, depending on the power limit and cooling each manufacturer chose. Always check the configured TGP and independent reviews of that exact laptop.",
    representative: false,
    sources: [
      { label: "NVIDIA RTX 5090 specs", url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/", lastUpdated: "2026-10-17", status: "compiled" },
      { label: "NVIDIA RTX 50 laptops", url: "https://www.nvidia.com/en-us/geforce/laptops/50-series/", lastUpdated: "2026-10-17", status: "compiled" },
    ],
  },
  {
    id: "cpu",
    tab: "Ryzen 9 / Core Ultra 9",
    title: "Desktop vs laptop CPUs with the same tier name",
    intro:
      "'Ryzen 9' or 'Core Ultra 9' tells you the tier within a lineup, not the chip. Laptop and desktop versions are usually different silicon tuned for very different power budgets.",
    a: "Desktop tier-9 CPU",
    b: "Laptop tier-9 CPU",
    rows: [
      { label: "Cores", a: { text: "Typically 16–24", rel: 1 }, b: { text: "Typically 10–16, often more efficiency/compact cores", rel: 0.6 } },
      { label: "Sustained power", a: { text: "≈120–250 W", rel: 1 }, b: { text: "≈28–80 W, chosen by the laptop maker", rel: 0.3 } },
      { label: "Peak single-core boost", a: { text: "Highest in the lineup", rel: 1 }, b: { text: "Often somewhat lower; brief in thin designs", rel: 0.88 } },
      { label: "Memory", a: { text: "Socketed DDR5 DIMMs (upgradeable)" }, b: { text: "Often soldered LPDDR5X (fixed)" } },
      { label: "Integrated GPU & NPU", a: { text: "Small or basic iGPU" }, b: { text: "Often a larger iGPU and an NPU" } },
    ],
    takeaway:
      "Laptop chips trade peak multi-core throughput for efficiency and integration. For single-threaded work the gap can be small; for long all-core renders and compiles it is large.",
    representative: true,
    sources: [],
  },
  {
    id: "apple",
    tab: "Apple M-series",
    title: "The same Apple chip in a laptop and a desktop — and chips only desktops get",
    intro:
      "Apple uses identical chips across MacBook Pro and desktop Macs, so the silicon is the same. What differs is cooling, sustained power, and — for the Ultra tier — whether the chip exists in that form factor at all.",
    a: "Max chip in a 14-inch laptop",
    b: "Same Max chip in a desktop (Mac Studio)",
    rows: [
      { label: "CPU / GPU cores", a: { text: "Identical", rel: 1 }, b: { text: "Identical", rel: 1 } },
      { label: "Unified memory options", a: { text: "Same chip-dependent options" }, b: { text: "Same chip-dependent options" } },
      { label: "Cooling headroom", a: { text: "Compact; louder fans under long loads", rel: 0.55 }, b: { text: "Large heatsink and fans", rel: 1 } },
      { label: "Very long all-out loads", a: { text: "May settle at lower clocks", rel: 0.85 }, b: { text: "Sustains closer to peak", rel: 1 } },
      { label: "Ultra tier (two Max dies joined)", a: { text: "Not offered" }, b: { text: "Desktop only" } },
    ],
    takeaway:
      "Apple's laptop chips lose less to throttling than many high-power PC laptops because their peak power targets are lower — but that same lower ceiling is why the biggest configurations exist only in desktops. Larger laptops (16-inch) generally sustain better than smaller ones.",
    representative: true,
    sources: [],
  },
];

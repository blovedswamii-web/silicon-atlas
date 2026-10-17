import type { NodeKind } from "@/data/schema";

/** Curriculum order. Full content for each lesson lives in data/lessons/<slug>.ts. */
export const LESSON_META: { slug: string; number: number; title: string; kind: NodeKind; owner: string }[] = [
  { slug: "run-a-program", number: 1, title: "What happens when you run a program?", kind: "software", owner: "cpu" },
  { slug: "cpu", number: 2, title: "CPU fundamentals", kind: "cpu", owner: "cpu" },
  { slug: "memory-hierarchy", number: 3, title: "The memory hierarchy", kind: "cache", owner: "cpu" },
  { slug: "ram", number: 4, title: "RAM", kind: "memory", owner: "cpu" },
  { slug: "storage", number: 5, title: "Storage", kind: "storage", owner: "cpu" },
  { slug: "gpu", number: 6, title: "The GPU", kind: "gpu", owner: "gpu" },
  { slug: "parallel-computing", number: 7, title: "Parallel computing", kind: "gpu", owner: "gpu" },
  { slug: "motherboard-pcie", number: 8, title: "Motherboard & PCIe", kind: "interconnect", owner: "cpu" },
  { slug: "apple-silicon", number: 9, title: "Apple Silicon", kind: "accel", owner: "companies" },
  { slug: "amd", number: 10, title: "AMD architecture", kind: "cpu", owner: "companies" },
  { slug: "nvidia", number: 11, title: "NVIDIA architecture", kind: "gpu", owner: "companies" },
  { slug: "intel", number: 12, title: "Intel architecture", kind: "cpu", owner: "companies" },
  { slug: "unified-memory", number: 13, title: "Unified memory", kind: "memory", owner: "gpu" },
  { slug: "ai-hardware", number: 14, title: "AI hardware", kind: "accel", owner: "gpu" },
  { slug: "bottlenecks", number: 15, title: "Bottlenecks", kind: "interconnect", owner: "tools" },
  { slug: "reading-specs", number: 16, title: "How to read specifications", kind: "software", owner: "companies" },
  { slug: "comparing-brands", number: 17, title: "How to compare brands", kind: "software", owner: "companies" },
  { slug: "choosing-hardware", number: 18, title: "How to choose hardware", kind: "software", owner: "tools" },
];

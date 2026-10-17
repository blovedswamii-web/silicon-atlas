import type { Lesson } from "@/data/schema";
import { lesson as l0 } from "./run-a-program";
import { lesson as l1 } from "./cpu";
import { lesson as l2 } from "./memory-hierarchy";
import { lesson as l3 } from "./ram";
import { lesson as l4 } from "./storage";
import { lesson as l5 } from "./gpu";
import { lesson as l6 } from "./parallel-computing";
import { lesson as l7 } from "./motherboard-pcie";
import { lesson as l8 } from "./apple-silicon";
import { lesson as l9 } from "./amd";
import { lesson as l10 } from "./nvidia";
import { lesson as l11 } from "./intel";
import { lesson as l12 } from "./unified-memory";
import { lesson as l13 } from "./ai-hardware";
import { lesson as l14 } from "./bottlenecks";
import { lesson as l15 } from "./reading-specs";
import { lesson as l16 } from "./comparing-brands";
import { lesson as l17 } from "./choosing-hardware";

export const LESSONS: Lesson[] = [l0, l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13, l14, l15, l16, l17].sort((a, b) => a.number - b.number);

export const getLesson = (slug: string) => LESSONS.find((l) => l.slug === slug);

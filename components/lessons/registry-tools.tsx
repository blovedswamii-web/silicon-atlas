"use client";

import type { ComponentType } from "react";
import { BottleneckLab } from "@/components/tools/BottleneckLab";
import { LaptopVsDesktop, PowerCurve, ThermalSim } from "@/components/tools/Efficiency";
import { MisleadingCompare, MythCardsMini } from "@/components/tools/Myths";
import { SpecExplorerCompact } from "@/components/tools/SpecExplorer";
import { UpscalingExplainer, WorkloadFitExplorer } from "@/components/tools/Workloads";
import { BuyMini } from "@/components/buying/BuyingAssistant";

/** Interactive widgets that lesson sections can embed by key (LessonSection.interactive). */
export const REGISTRY_TOOLS: Record<string, ComponentType> = {
  "bottleneck-mini": () => <BottleneckLab compact />,
  upscaling: UpscalingExplainer,
  "power-curve": PowerCurve,
  "laptop-vs-desktop": LaptopVsDesktop,
  "thermal-sim": ThermalSim,
  "myth-cards": MythCardsMini,
  "misleading-compare": MisleadingCompare,
  "spec-explorer": SpecExplorerCompact,
  "buy-mini": BuyMini,
  "workload-fit": () => <WorkloadFitExplorer initial="ai-inference" />,
};

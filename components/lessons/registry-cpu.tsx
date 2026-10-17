"use client";

import type { ComponentType } from "react";
import { ProgramLaunch } from "@/components/cpu/ProgramLaunch";
import { Pipeline } from "@/components/cpu/Pipeline";
import { PerfEquation } from "@/components/cpu/PerfEquation";
import { HybridScheduler } from "@/components/cpu/HybridScheduler";
import { VCache } from "@/components/cpu/VCache";
import { ArmVsX86 } from "@/components/cpu/ArmVsX86";
import { PcieLanes } from "@/components/cpu/PcieLanes";
import { LatencyLadder } from "@/components/memory/LatencyLadder";
import { LatencyVsBandwidth } from "@/components/memory/LatencyVsBandwidth";
import { RamCalculator } from "@/components/memory/RamCalculator";
import { CacheSim } from "@/components/memory/CacheSim";
import { StorageCompare } from "@/components/memory/StorageCompare";

/** Interactive widgets that lesson sections can embed by key (LessonSection.interactive). */
export const REGISTRY_CPU: Record<string, ComponentType> = {
  "program-launch": ProgramLaunch,
  pipeline: Pipeline,
  "perf-equation": PerfEquation,
  "hybrid-scheduler": HybridScheduler,
  vcache: VCache,
  "arm-vs-x86": ArmVsX86,
  "pcie-lanes": PcieLanes,
  "latency-ladder": LatencyLadder,
  "latency-vs-bandwidth": LatencyVsBandwidth,
  "ram-calculator": RamCalculator,
  "cache-sim": CacheSim,
  "storage-compare": StorageCompare,
};

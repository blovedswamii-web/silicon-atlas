"use client";

import type { ComponentType } from "react";
import { ParallelPixels } from "@/components/gpu/ParallelPixels";
import { GpuTerms } from "@/components/gpu/GpuTerms";
import { RasterVsRT } from "@/components/gpu/RasterVsRT";
import { PrecisionFormats } from "@/components/gpu/PrecisionFormats";
import { TflopsReality } from "@/components/gpu/TflopsReality";
import { MatrixTiles } from "@/components/ai/MatrixTiles";
import { SoftwareStack } from "@/components/ai/SoftwareStack";
import { LlmCalculator } from "@/components/ai/LlmCalculator";
import { UnifiedMemoryViz } from "@/components/memory/UnifiedMemoryViz";
import { UnifiedPressure } from "@/components/memory/UnifiedPressure";

/** Interactive widgets that lesson sections can embed by key (LessonSection.interactive). */
export const REGISTRY_GPU: Record<string, ComponentType> = {
  "parallel-pixels": ParallelPixels,
  "gpu-terms": GpuTerms,
  "raster-vs-rt": RasterVsRT,
  "precision-formats": PrecisionFormats,
  "tflops-reality": TflopsReality,
  "matrix-tiles": MatrixTiles,
  "unified-memory-viz": UnifiedMemoryViz,
  "memory-pressure": UnifiedPressure,
  "software-stack": SoftwareStack,
  "llm-calculator": LlmCalculator,
};

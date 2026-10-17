"use client";

import type { ComponentType } from "react";
import { PlatformExplorer } from "@/components/architecture/PlatformExplorer";
import { SideBySide } from "@/components/architecture/SideBySide";
import { RunProgram } from "@/components/simulations/RunProgram";

/** Interactive widgets that lesson sections can embed by key (LessonSection.interactive). */
export const REGISTRY_CORE: Record<string, ComponentType> = {
  "arch-explorer": () => <PlatformExplorer />,
  "arch-explorer-apple": () => <PlatformExplorer initial="apple-silicon" />,
  "pc-vs-apple": () => <SideBySide />,
  "run-program": () => <RunProgram embedded />,
  "run-program-game": () => <RunProgram embedded defaultWorkload="game" />,
};

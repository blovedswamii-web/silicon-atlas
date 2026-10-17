"use client";

import type { ComponentType } from "react";
import { ScopeLadder } from "@/components/companies/ScopeLadder";
import { ArchCompare } from "@/components/companies/ArchCompare";
import { CompanyMatrix } from "@/components/companies/CompanyMatrix";
import { NameDecoder } from "@/components/companies/NameDecoder";
import { GenerationTimeline } from "@/components/companies/GenerationTimeline";
import { SpecAnatomy } from "@/components/companies/SpecAnatomy";
import { PlatformCompare } from "@/components/comparisons/PlatformCompare";

/** Interactive widgets that lesson sections can embed by key (LessonSection.interactive). */
export const REGISTRY_COMPANIES: Record<string, ComponentType> = {
  "scope-ladder": ScopeLadder,
  "arch-compare": ArchCompare,
  "company-matrix": CompanyMatrix,
  "name-decoder": NameDecoder,
  "generation-timeline": GenerationTimeline,
  "generation-timeline-apple": () => <GenerationTimeline initialFamily="apple" />,
  "generation-timeline-zen": () => <GenerationTimeline initialFamily="zen" />,
  "generation-timeline-rdna": () => <GenerationTimeline initialFamily="rdna" />,
  "generation-timeline-nvidia": () => <GenerationTimeline initialFamily="nvidia" />,
  "generation-timeline-intel": () => <GenerationTimeline initialFamily="intel-cpu" />,
  "spec-anatomy": SpecAnatomy,
  "platform-compare": PlatformCompare,
};

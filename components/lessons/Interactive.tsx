"use client";

import { REGISTRY_CORE } from "./registry-core";
import { REGISTRY_CPU } from "./registry-cpu";
import { REGISTRY_GPU } from "./registry-gpu";
import { REGISTRY_COMPANIES } from "./registry-companies";
import { REGISTRY_TOOLS } from "./registry-tools";

const REGISTRY = { ...REGISTRY_CORE, ...REGISTRY_CPU, ...REGISTRY_GPU, ...REGISTRY_COMPANIES, ...REGISTRY_TOOLS };

export const INTERACTIVE_KEYS = Object.keys(REGISTRY);

export function Interactive({ id }: { id: string }) {
  const C = REGISTRY[id];
  if (!C) {
    return (
      <div className="rounded-xl border border-dashed border-line p-6 text-center font-mono text-xs text-dim">
        interactive “{id}” not registered
      </div>
    );
  }
  return <C />;
}

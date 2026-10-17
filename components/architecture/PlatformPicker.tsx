"use client";

import clsx from "clsx";
import { PLATFORMS } from "@/data/platforms";
import { COMPANY_VAR } from "@/components/ui/primitives";

/** Card-style platform chooser. Shows CPU/GPU vendor colour chips so the combination is legible. */
export function PlatformPicker({
  value,
  onChange,
  ids,
  className,
}: {
  value: string;
  onChange: (id: string) => void;
  ids?: string[];
  className?: string;
}) {
  const list = ids ? PLATFORMS.filter((p) => ids.includes(p.id)) : PLATFORMS;
  return (
    <div className={clsx("scroll-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0", className)}>
      {list.map((p) => {
        const active = p.id === value;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            aria-pressed={active}
            className={clsx(
              "shrink-0 rounded-xl border px-3 py-2 text-left transition-colors",
              active ? "border-line-strong bg-panel-3" : "border-line bg-panel hover:border-line-strong",
            )}
          >
            <div className="flex items-center gap-1.5">
              {p.generic ? (
                <span className="h-2 w-2 rounded-full bg-dim" />
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full" style={{ background: COMPANY_VAR[p.cpuVendor] }} />
                  {p.gpuVendor !== p.cpuVendor && <span className="h-2 w-2 rounded-full" style={{ background: COMPANY_VAR[p.gpuVendor] }} />}
                </>
              )}
              <span className={clsx("text-sm font-medium", active ? "text-fg" : "text-muted")}>{p.short}</span>
            </div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-dim">
              {p.memoryModel === "discrete" ? "RAM + VRAM" : p.memoryModel === "unified" ? "Unified memory" : "Shared RAM"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

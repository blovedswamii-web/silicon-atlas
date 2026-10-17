"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useId } from "react";

export interface SegOption<T extends string> {
  value: T;
  label: React.ReactNode;
  color?: string;
}

/** Accessible segmented control with an animated selection pill. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
  ariaLabel,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={clsx(
        "inline-flex max-w-full flex-wrap gap-0.5 rounded-xl border border-line bg-panel-2 p-0.5",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              "relative rounded-[10px] font-medium transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              active ? "text-fg" : "text-dim hover:text-muted",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-[10px] border border-line-strong bg-panel-3"
                style={o.color ? { borderColor: `color-mix(in oklab, ${o.color} 45%, var(--line-strong))` } : undefined}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: o.color }} />}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

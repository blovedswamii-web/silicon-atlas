"use client";

import clsx from "clsx";

/** Labelled form row. Use `asLabel` when wrapping a single native control (e.g. Select); otherwise it's a named group. */
export function Field({
  label,
  children,
  hint,
  asLabel = false,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  asLabel?: boolean;
}) {
  const inner = (
    <>
      <span className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-dim">{hint}</span>}
    </>
  );
  return asLabel ? (
    <label className="block">{inner}</label>
  ) : (
    <div role="group" aria-label={label} className="block">
      {inner}
    </div>
  );
}

export function Select<T extends string | number>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div className={clsx("relative", className)}>
      <select
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const match = options.find((o) => String(o.value) === raw);
          if (match) onChange(match.value);
        }}
        className="w-full appearance-none rounded-lg border border-line bg-panel-2 py-2 pl-3 pr-8 text-sm text-fg outline-none transition-colors hover:border-line-strong focus:border-accent"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-dim" width="10" height="10" viewBox="0 0 10 10" aria-hidden>
        <path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

/** Pill-style chips for choosing one option among many (wraps on mobile). */
export function Chips<T extends string>({
  value,
  onChange,
  options,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; color?: string }[];
  size?: "sm" | "md";
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              "flex items-center gap-1.5 rounded-full border transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              active ? "border-line-strong bg-panel-3 text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg",
            )}
            style={active && o.color ? { borderColor: `color-mix(in oklab, ${o.color} 55%, var(--line-strong))` } : undefined}
          >
            {o.color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: o.color }} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  ariaLabel: string;
}) {
  return (
    <input
      type="range"
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[var(--accent)]"
    />
  );
}

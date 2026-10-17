import clsx from "clsx";
import { Kicker } from "@/components/ui/primitives";

/** Shared chrome for the CPU/memory interactives: title bar, controls slot, body, footnote. */
export function Frame({
  kicker,
  title,
  controls,
  children,
  footer,
  className,
}: {
  kicker: string;
  title: React.ReactNode;
  controls?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("overflow-hidden rounded-2xl border border-line bg-panel shadow-panel", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <Kicker>{kicker}</Kicker>
          <div className="mt-1 text-[15px] font-semibold tracking-tight text-fg">{title}</div>
        </div>
        {controls && <div className="flex flex-wrap items-center gap-2">{controls}</div>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      {footer && <div className="border-t border-line bg-panel-2 px-4 py-3 text-xs leading-relaxed text-dim sm:px-5">{footer}</div>}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
}: {
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  display?: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs text-muted">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-fg">{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-[var(--accent)]"
      />
    </label>
  );
}

export function Btn({
  children,
  onClick,
  active,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active ? "border-line-strong bg-panel-3 text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Log10 position helper used by several log-scale charts. */
export function logPos(v: number, min: number, max: number): number {
  return (Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
}

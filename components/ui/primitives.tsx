import clsx from "clsx";
import type { CompanyId, NodeKind, Scope } from "@/data/schema";

export const KIND_VAR: Record<NodeKind, string> = {
  cpu: "var(--k-cpu)",
  gpu: "var(--k-gpu)",
  accel: "var(--k-accel)",
  memory: "var(--k-memory)",
  vram: "var(--k-vram)",
  cache: "var(--k-cache)",
  storage: "var(--k-storage)",
  interconnect: "var(--k-interconnect)",
  power: "var(--k-power)",
  cooling: "var(--k-cooling)",
  display: "var(--k-display)",
  software: "var(--k-software)",
  network: "var(--k-network)",
};

export const COMPANY_VAR: Record<CompanyId, string> = {
  apple: "var(--c-apple)",
  amd: "var(--c-amd)",
  nvidia: "var(--c-nvidia)",
  intel: "var(--c-intel)",
};

export const COMPANY_NAME: Record<CompanyId, string> = {
  apple: "Apple",
  amd: "AMD",
  nvidia: "NVIDIA",
  intel: "Intel",
};

export function Panel({
  children,
  className,
  as: As = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <As className={clsx("rounded-2xl border border-line bg-panel shadow-panel", className)}>{children}</As>
  );
}

export function Kicker({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim"
      style={color ? { color } : undefined}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16">
      <Kicker>{kicker}</Kicker>
      <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold tracking-tight text-fg sm:text-5xl">
        {title}
      </h1>
      {lede && <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted sm:text-lg">{lede}</p>}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}

export function Section({
  id,
  kicker,
  title,
  lede,
  children,
  className,
}: {
  id?: string;
  kicker?: string;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={clsx("mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6", className)}>
      {(kicker || title) && (
        <div className="mb-6">
          {kicker && <Kicker>{kicker}</Kicker>}
          {title && <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h2>}
          {lede && <p className="mt-3 max-w-3xl text-pretty leading-relaxed text-muted">{lede}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider",
        className,
      )}
      style={{
        color: color ?? "var(--fg-muted)",
        borderColor: color ? `color-mix(in oklab, ${color} 40%, transparent)` : "var(--line-strong)",
        background: color ? `color-mix(in oklab, ${color} 10%, transparent)` : "transparent",
      }}
    >
      {children}
    </span>
  );
}

export function KindDot({ kind, size = 8 }: { kind: NodeKind; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: KIND_VAR[kind] }}
    />
  );
}

export function CompanyTag({ company }: { company: CompanyId }) {
  return (
    <Badge color={COMPANY_VAR[company]}>
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: COMPANY_VAR[company] }} />
      {COMPANY_NAME[company]}
    </Badge>
  );
}

const SCOPE_TEXT: Record<Scope, string> = {
  chip: "Chip",
  component: "Component",
  system: "System",
  platform: "Platform",
};

/** Reminds the reader what level of thing is being compared. Appears throughout the site. */
export function ScopeTag({ scope }: { scope: Scope }) {
  return <Badge>{SCOPE_TEXT[scope]}</Badge>;
}

export function ApproxBadge({ label = "Educational approximation" }: { label?: string }) {
  return (
    <Badge color="var(--warn)" className="normal-case tracking-normal">
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
        <path d="M5 1 9.2 8.6H.8Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 4v2.2M5 7.3v.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {label}
    </Badge>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "warn" | "myth" | "good";
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const color = { info: "var(--accent)", warn: "var(--warn)", myth: "var(--bad)", good: "var(--good)" }[tone];
  const label = { info: "Note", warn: "Careful", myth: "Common misconception", good: "Key idea" }[tone];
  return (
    <div
      className={clsx("rounded-xl border p-4", className)}
      style={{
        borderColor: `color-mix(in oklab, ${color} 30%, var(--line))`,
        background: `color-mix(in oklab, ${color} 6%, var(--panel))`,
      }}
    >
      <div className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color }}>
        {title ?? label}
      </div>
      <div className="mt-1.5 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

/** 0–10 meter used for demand / pressure / fit displays. */
export function Meter({
  value,
  max = 10,
  color = "var(--accent)",
  label,
  right,
}: {
  value: number;
  max?: number;
  color?: string;
  label?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {(label || right) && (
        <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted">
          <span>{label}</span>
          <span className="font-mono text-dim">{right}</span>
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-panel-3">
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel-2 p-3">
      <div className="font-mono text-[10.5px] uppercase tracking-wider text-dim">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-fg">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-dim">{hint}</div>}
    </div>
  );
}

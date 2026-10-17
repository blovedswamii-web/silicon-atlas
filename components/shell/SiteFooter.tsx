import Link from "next/link";
import { NAV } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(5,1fr)]">
        <div>
          <div className="text-sm font-semibold text-fg">Silicon Atlas</div>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-dim">
            An independent, vendor-neutral guide to how computers work. Diagrams are educational models, not hardware
            simulators. Product figures carry sources — verify them before you buy.
          </p>
        </div>
        {NAV.map((g) => (
          <div key={g.id}>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{g.label}</div>
            <ul className="mt-2 space-y-1.5">
              {g.items.map((it) => (
                <li key={it.href}>
                  <Link href={it.href} className="text-xs text-muted hover:text-fg">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/lib/nav";
import { DepthToggle } from "@/components/ui/Depth";
import { usePrefs } from "./Providers";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-fg">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <rect x="5" y="5" width="16" height="16" rx="3.5" fill="none" stroke="var(--fg)" strokeWidth="1.4" />
        <rect x="9" y="9" width="8" height="8" rx="1.5" fill="var(--accent)" />
        {[8, 13, 18].map((p) => (
          <g key={p} stroke="var(--fg-dim)" strokeWidth="1.2" strokeLinecap="round">
            <path d={`M${p} 1.5v2.5M${p} 22v2.5M1.5 ${p}h2.5M22 ${p}h2.5`} />
          </g>
        ))}
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">Silicon Atlas</span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = usePrefs();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      {theme === "dark" ? (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.1 1.1M11.9 11.9 13 13M3 13l1.1-1.1M11.9 4.1 13 3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(null), setMobile(false));
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const groupActive = (id: string) =>
    NAV.find((g) => g.id === id)?.items.some((i) => (i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-xl">
      <div ref={navRef} className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {NAV.map((g) => (
            <div key={g.id} className="relative">
              <button
                onClick={() => setOpen(open === g.id ? null : g.id)}
                aria-expanded={open === g.id}
                className={clsx(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  groupActive(g.id) ? "text-fg" : "text-muted hover:text-fg",
                  open === g.id && "bg-panel-2",
                )}
              >
                {g.label}
                <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden className={clsx("transition-transform", open === g.id && "rotate-180")}>
                  <path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
              <AnimatePresence>
                {open === g.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 top-full mt-2 w-[22rem] rounded-2xl border border-line bg-panel p-1.5 shadow-panel"
                  >
                    {g.items.map((it) => (
                      <Link
                        key={it.href}
                        href={it.href}
                        className={clsx(
                          "block rounded-xl px-3 py-2.5 transition-colors hover:bg-panel-2",
                          pathname === it.href && "bg-panel-2",
                        )}
                      >
                        <div className="text-sm font-medium text-fg">{it.label}</div>
                        <div className="mt-0.5 text-xs leading-snug text-dim">{it.blurb}</div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <DepthToggle />
          </div>
          <ThemeToggle />
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted lg:hidden"
            onClick={() => setMobile((m) => !m)}
            aria-label="Open menu"
            aria-expanded={mobile}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
              <path d={mobile ? "M3 3l10 10M13 3 3 13" : "M2 4h12M2 8h12M2 12h12"} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="scroll-thin max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-line bg-bg lg:hidden"
          >
            <div className="px-4 py-4">
              <div className="mb-4 sm:hidden">
                <DepthToggle />
              </div>
              {NAV.map((g) => (
                <div key={g.id} className="mb-4">
                  <div className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{g.label}</div>
                  {g.items.map((it) => (
                    <Link key={it.href} href={it.href} className="block rounded-lg px-2 py-2 text-sm text-muted hover:bg-panel-2 hover:text-fg">
                      {it.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

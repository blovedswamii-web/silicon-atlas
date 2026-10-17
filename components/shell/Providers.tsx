"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Depth } from "@/data/schema";

type Theme = "dark" | "light";

interface Prefs {
  theme: Theme;
  setTheme: (t: Theme) => void;
  depth: Depth;
  setDepth: (d: Depth) => void;
}

const PrefsContext = createContext<Prefs | null>(null);

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — preference just won't persist */
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [depth, setDepthState] = useState<Depth>("simple");

  useEffect(() => {
    setThemeState(read("hw-theme", ["dark", "light"] as const, "dark"));
    setDepthState(read("hw-depth", ["simple", "technical", "deep"] as const, "simple"));
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    write("hw-theme", t);
  }, []);

  const setDepth = useCallback((d: Depth) => {
    setDepthState(d);
    write("hw-depth", d);
  }, []);

  return <PrefsContext.Provider value={{ theme, setTheme, depth, setDepth }}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside <Providers>");
  return ctx;
}

/** Inline script that applies the saved theme before first paint (no flash). */
export const THEME_BOOTSTRAP = `try{var t=localStorage.getItem('hw-theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

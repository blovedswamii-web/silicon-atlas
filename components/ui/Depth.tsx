"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Depth, Layered } from "@/data/schema";
import { usePrefs } from "@/components/shell/Providers";
import { Segmented } from "./Segmented";
import { Rich } from "./Rich";

export const DEPTH_OPTIONS: { value: Depth; label: string }[] = [
  { value: "simple", label: "Simple" },
  { value: "technical", label: "Technical" },
  { value: "deep", label: "Deep Dive" },
];

/** Global depth switch — every LayeredText on the page follows it. */
export function DepthToggle({ size = "sm" }: { size?: "sm" | "md" }) {
  const { depth, setDepth } = usePrefs();
  return <Segmented ariaLabel="Explanation depth" size={size} options={DEPTH_OPTIONS} value={depth} onChange={setDepth} />;
}

/** Renders the Simple / Technical / Deep Dive version of a text, following the global depth. */
export function LayeredText({ text, showToggle = false }: { text: Layered; showToggle?: boolean }) {
  const { depth } = usePrefs();
  return (
    <div>
      {showToggle && (
        <div className="mb-3">
          <DepthToggle />
        </div>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={depth}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          <Rich text={text[depth]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

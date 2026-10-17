"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SPEC_LISTINGS } from "@/data/comparisons";
import { Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";

/** Hover or tap each part of a product listing to see what it tells you — and what it doesn't. */
export function SpecAnatomy() {
  const [listingId, setListingId] = useState(SPEC_LISTINGS[0].id);
  const listing = SPEC_LISTINGS.find((l) => l.id === listingId)!;
  const firstExplained = listing.segments.findIndex((s) => s.explain);
  const [seg, setSeg] = useState(firstExplained);
  const active = listing.segments[seg]?.explain ? listing.segments[seg] : listing.segments[firstExplained];

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <Segmented
          size="sm"
          ariaLabel="Listing"
          options={SPEC_LISTINGS.map((l) => ({ value: l.id, label: l.label }))}
          value={listingId}
          onChange={(v) => {
            setListingId(v);
            setSeg(SPEC_LISTINGS.find((l) => l.id === v)!.segments.findIndex((s) => s.explain));
          }}
        />
        <span className="text-xs text-dim">{listing.context}</span>
      </div>

      <div className="p-4 sm:p-6">
        <div className="rounded-xl border border-line bg-panel-2 p-4 font-mono text-[15px] leading-loose text-fg sm:text-base">
          {listing.segments.map((s, i) =>
            s.explain ? (
              <button
                key={i}
                onMouseEnter={() => setSeg(i)}
                onFocus={() => setSeg(i)}
                onClick={() => setSeg(i)}
                className={clsx(
                  "rounded-md px-1 py-0.5 underline decoration-dotted underline-offset-4 transition-colors",
                  seg === i ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-fg decoration-accent" : "decoration-dim hover:bg-panel-3",
                )}
              >
                {s.text}
              </button>
            ) : (
              <span key={i} className="text-dim">
                {s.text}
              </span>
            ),
          )}
        </div>

        <AnimatePresence mode="wait">
          {active?.explain && (
            <motion.div
              key={listingId + seg}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-4"
            >
              <div className="font-mono text-sm text-fg">“{active.text}”</div>
              <p className="mt-1 text-sm text-muted">{active.explain.what}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <div className="rounded-xl border border-line p-3">
                  <Kicker color="var(--good)">Tells you</Kicker>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{active.explain.tells}</p>
                </div>
                <div className="rounded-xl border border-line p-3">
                  <Kicker color="var(--bad)">Doesn&apos;t tell you</Kicker>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{active.explain.doesnt}</p>
                </div>
                <div className="rounded-xl border border-line p-3">
                  <Kicker color="var(--accent)">Ask instead</Kicker>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{active.explain.ask}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Panel>
  );
}

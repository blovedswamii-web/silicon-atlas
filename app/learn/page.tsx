import Link from "next/link";
import type { Metadata } from "next";
import { LESSONS } from "@/data/lessons";
import { KIND_VAR, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Lessons", description: "18 lessons from instructions to buying decisions." };

const ARCS = [
  { title: "How a computer works", range: [1, 8] },
  { title: "How the companies build it", range: [9, 14] },
  { title: "How to decide", range: [15, 18] },
];

export default function LearnIndex() {
  return (
    <>
      <PageHeader
        kicker="Curriculum"
        title="Eighteen lessons, three levels each."
        lede="Every lesson can be read Simple, Technical or Deep Dive — switch at any time with the control in the header. Start anywhere; the lessons link to each other and to the interactive tools."
      />
      <div className="mx-auto max-w-6xl space-y-12 px-4 pb-10 sm:px-6">
        {ARCS.map((arc) => (
          <section key={arc.title}>
            <h2 className="mb-4 text-lg font-semibold text-fg">{arc.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LESSONS.filter((l) => l.number >= arc.range[0] && l.number <= arc.range[1]).map((l) => (
                <Link
                  key={l.slug}
                  href={`/learn/${l.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-line-strong"
                >
                  <div className="absolute inset-x-0 top-0 h-px" style={{ background: KIND_VAR[l.kind], opacity: 0.6 }} />
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs" style={{ color: KIND_VAR[l.kind] }}>
                      {String(l.number).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[11px] text-dim">{l.minutes} min</span>
                  </div>
                  <div className="mt-3 font-medium text-fg">{l.title}</div>
                  <p className="mt-1.5 text-sm leading-snug text-dim">{l.subtitle}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

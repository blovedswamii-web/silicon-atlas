import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LESSONS, getLesson } from "@/data/lessons";
import { getMisconception } from "@/data/misconceptions";
import { ALL_ROUTES } from "@/lib/nav";
import { LayeredText, DepthToggle } from "@/components/ui/Depth";
import { Callout, KIND_VAR, Kicker, Panel } from "@/components/ui/primitives";
import { Interactive } from "@/components/lessons/Interactive";
import { QuizCard } from "@/components/lessons/QuizCard";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = getLesson(slug);
  return l ? { title: `${l.number}. ${l.title}`, description: l.subtitle } : {};
}

function relatedLink(ref: string) {
  const route = ALL_ROUTES.find((r) => r.href === ref);
  if (route) return { href: route.href, label: route.label };
  const l = getLesson(ref);
  if (l) return { href: `/learn/${l.slug}`, label: `${l.number}. ${l.title}` };
  return null;
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const idx = LESSONS.findIndex((l) => l.slug === slug);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const color = KIND_VAR[lesson.kind];
  const myths = (lesson.misconceptions ?? []).map(getMisconception).filter((m) => !!m);
  const related = (lesson.related ?? []).map(relatedLink).filter((r) => !!r);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid gap-10 pt-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:pt-14">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <Link href="/learn" className="text-xs text-dim hover:text-fg">
              ← All lessons
            </Link>
            <ol className="mt-4 space-y-1 border-l border-line">
              {lesson.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-xs text-muted hover:border-fg hover:text-fg">
                    {s.title}
                  </a>
                </li>
              ))}
              {lesson.quiz && (
                <li>
                  <a href="#quiz" className="-ml-px block border-l border-transparent py-1 pl-3 text-xs text-muted hover:border-fg hover:text-fg">
                    Quiz
                  </a>
                </li>
              )}
            </ol>
          </div>
        </aside>

        <article className="min-w-0 max-w-3xl">
          <Kicker color={color}>
            Lesson {String(lesson.number).padStart(2, "0")} · {lesson.minutes} min
          </Kicker>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{lesson.title}</h1>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-muted">{lesson.subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel-2 px-4 py-3">
            <span className="text-xs text-dim">Explain it to me at the level of</span>
            <DepthToggle />
          </div>

          {lesson.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-20 pt-12">
              <h2 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">{s.title}</h2>
              <div className="mt-4">
                <LayeredText text={s.body} />
              </div>
              {s.interactive && (
                <div className="mt-6 -mx-1 sm:-mx-4 lg:-mr-24">
                  <Interactive id={s.interactive} />
                </div>
              )}
              {s.callout && (
                <Callout className="mt-6" tone={s.callout.tone} title={s.callout.title}>
                  {s.callout.text}
                </Callout>
              )}
            </section>
          ))}

          {myths.length > 0 && (
            <section className="pt-12">
              <h2 className="text-xl font-semibold tracking-tight text-fg">Misconceptions this lesson clears up</h2>
              <div className="mt-4 grid gap-3">
                {myths.map((m) => (
                  <Panel key={m.id} className="p-4">
                    <div className="text-sm font-medium text-fg">“{m.claim}”</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{m.short}</p>
                  </Panel>
                ))}
              </div>
              <Link href="/myths" className="mt-3 inline-block text-sm text-accent">
                All myths & misleading numbers →
              </Link>
            </section>
          )}

          {lesson.quiz && (
            <section id="quiz" className="scroll-mt-20 pt-12">
              <QuizCard quiz={lesson.quiz} />
            </section>
          )}

          {related.length > 0 && (
            <section className="pt-12">
              <Kicker>Go further</Kicker>
              <div className="mt-3 flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link key={r.href} href={r.href} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:border-line-strong hover:text-fg">
                    {r.label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <nav className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
            {prev ? (
              <Link href={`/learn/${prev.slug}`} className="rounded-xl border border-line p-4 hover:border-line-strong">
                <div className="text-xs text-dim">← Previous</div>
                <div className="mt-1 text-sm font-medium text-fg">{prev.title}</div>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/learn/${next.slug}`} className="rounded-xl border border-line p-4 text-right hover:border-line-strong">
                <div className="text-xs text-dim">Next →</div>
                <div className="mt-1 text-sm font-medium text-fg">{next.title}</div>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}

"use client";

import clsx from "clsx";
import { useState } from "react";
import type { Quiz } from "@/data/schema";
import { Kicker, Panel } from "@/components/ui/primitives";

export function QuizCard({ quiz }: { quiz: Quiz }) {
  const [picked, setPicked] = useState<Record<string, number>>({});
  const answered = Object.keys(picked).length;
  const correct = quiz.questions.filter((q) => picked[q.id] === q.answer).length;

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <Kicker>Check your understanding</Kicker>
        <span className="font-mono text-xs text-dim">
          {correct}/{quiz.questions.length} correct · {answered} answered
        </span>
      </div>
      <ol className="mt-4 space-y-6">
        {quiz.questions.map((q, qi) => {
          const p = picked[q.id];
          const done = p !== undefined;
          return (
            <li key={q.id}>
              <div className="text-sm font-medium text-fg">
                {qi + 1}. {q.prompt}
              </div>
              <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                {q.choices.map((c, ci) => {
                  const isAnswer = ci === q.answer;
                  const isPicked = ci === p;
                  return (
                    <button
                      key={ci}
                      disabled={done}
                      onClick={() => setPicked((s) => ({ ...s, [q.id]: ci }))}
                      className={clsx(
                        "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        !done && "border-line text-muted hover:border-line-strong hover:text-fg",
                        done && isAnswer && "border-[color-mix(in_oklab,var(--good)_50%,transparent)] bg-[color-mix(in_oklab,var(--good)_10%,transparent)] text-fg",
                        done && isPicked && !isAnswer && "border-[color-mix(in_oklab,var(--bad)_50%,transparent)] bg-[color-mix(in_oklab,var(--bad)_8%,transparent)] text-fg",
                        done && !isAnswer && !isPicked && "border-line text-dim",
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              {done && <p className="mt-2 text-sm leading-relaxed text-muted">{q.explain}</p>}
            </li>
          );
        })}
      </ol>
      {answered > 0 && (
        <button onClick={() => setPicked({})} className="mt-5 text-xs text-dim underline underline-offset-4 hover:text-fg">
          Reset quiz
        </button>
      )}
    </Panel>
  );
}

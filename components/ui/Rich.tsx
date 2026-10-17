import Link from "next/link";
import { Fragment } from "react";

/**
 * Renders lightweight inline markup used in /data content:
 *   **bold**, `code`, [label](/path or https://url)
 * Paragraphs are separated by a blank line. Lines starting with "- " become a list.
 */
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function inline(text: string, keyBase: string) {
  return text.split(TOKEN).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={key}>{part.slice(1, -1)}</code>;
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      const [, label, href] = m;
      return href.startsWith("/") ? (
        <Link key={key} href={href}>
          {label}
        </Link>
      ) : (
        <a key={key} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function Rich({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className={`prose-hw ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.trim().slice(2), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={bi}>{inline(block.replace(/\n/g, " "), `${bi}`)}</p>;
      })}
    </div>
  );
}

/** Single-line variant without paragraph wrapping. */
export function RichInline({ text }: { text: string }) {
  return <>{inline(text, "i")}</>;
}

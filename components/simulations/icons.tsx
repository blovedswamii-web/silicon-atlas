/** Minimal line icons for workloads. 20×20, currentColor. */
const PATHS: Record<string, string> = {
  llm: "M4 5h12v8H9l-3 3v-3H4z M7 9h6",
  game: "M5 7h10a3 3 0 0 1 3 3v1a3 3 0 0 1-5.2 2H7.2A3 3 0 0 1 2 11v-1a3 3 0 0 1 3-3z M6 9.5v2M5 10.5h2M13 10h.01M15 11h.01",
  browser: "M3 4h14v12H3z M3 7.5h14 M5.5 5.8h.01M7.5 5.8h.01",
  video: "M3 5h14v10H3z M8.5 7.8v4.4l3.8-2.2z",
  code: "M7 6l-4 4 4 4M13 6l4 4-4 4M11 4.5l-2 11",
  render: "M10 3l6 3.5v7L10 17l-6-3.5v-7z M10 10l6-3.5M10 10v7M10 10L4 6.5",
  edit: "M3 6h14v9H3z M3 9h14 M6 6V4M10 6V4M14 6V4 M7 12h3",
  train: "M4 15l4-5 3 3 5-7 M13 6h3v3",
};

export function WorkloadIcon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name] ?? PATHS.code} />
    </svg>
  );
}

# Silicon Atlas

An interactive, vendor-neutral website that teaches how computers actually work — and what you are buying when you compare CPUs, GPUs, memory, storage and whole platforms from Apple, AMD, NVIDIA and Intel.

The central idea: understand what a component does, what its specifications mean, how each company designs differently, and how that changes real-world behaviour. The site does **not** rank companies or simulate benchmarks; it builds intuition about **compute, memory, data movement, software, power and architecture**.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all routes are statically generated)
npm run typecheck
```

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion · hand-written SVG/Canvas.

## What's in it

| Area | Routes |
| --- | --- |
| Explore | `/` interactive computer (PC ↔ Apple Silicon, click-to-zoom) · `/platforms` Platform Architecture Explorer · `/run` **Run a Program** · `/map` System Map |
| Learn | `/learn` + 18 lessons at `/learn/[slug]` · `/memory` · `/unified-memory` · `/parallel` · `/efficiency` |
| Companies | `/companies`, `/companies/[id]` · `/compare` · `/generations` · `/names` |
| AI | `/ai` (hardware + software stacks) · `/llm` (LLM memory calculator) |
| Tools | `/bottleneck-lab` · `/buy` · `/workloads` · `/specs` · `/myths` · `/hardware` · `/glossary` |

Every explanation exists at three levels — **Simple → Technical → Deep Dive** — switched globally from the header (persisted per browser).

## Architecture

```
app/                     Routes (server components that compose client widgets)
components/
  shell/                 Header, footer, theme + depth providers
  ui/                    Design-system primitives (Panel, Section, Badge, Segmented, LayeredText, Rich, …)
  architecture/          ArchDiagram engine, Platform Explorer, Side-by-side, System Map
  computer/              Homepage interactive computer artwork
  simulations/           Run a Program
  cpu/ memory/ gpu/ ai/  Topic interactives
  comparisons/ companies/ buying/ tools/ glossary/
  lessons/               Lesson renderer support: interactive registry, quiz
data/                    All content and hardware data (no UI code)
  schema.ts              Shared types: Manufacturer, Architecture, Platform, Workload, Product,
                         SpecDefinition, Concept, Lesson, Quiz, Misconception, Comparison, SoftwareStack…
  platforms.ts           Architecture graphs for 7 platforms (built by two layout builders)
  workloads.ts           Role-based workload flows for Run a Program
  lessons/               One file per lesson
  products.ts            Hardware database with sources
lib/
  graph.ts               Orthogonal edge routing, BFS path-finding, packet keyframes
  flow.ts                Resolves a workload step (role → role) into nodes, edges and an animated packet
  nav.ts                 Single source of truth for site structure
```

### Key design decisions

- **Content is data.** UI components never hardcode product or vendor facts. Lessons, glossary, myths, spec explanations, comparisons, workloads and products are typed records in `data/`.
- **Workloads are written against roles, not parts.** A step like `vram → gpu` resolves to the card's VRAM on a discrete PC and to unified memory on Apple Silicon (via role fallbacks in `lib/graph.ts`). Steps can be limited to a memory model (`only: ["discrete"]`), which is how the PCIe upload step appears on PCs and not on SoCs. Adding a workload means adding data, not code.
- **Vendor names are tokens.** Workload text uses `{gpu}`, `{matrix}`, `{computeApi}`, `{upscaler}`, `{mem}`; each platform supplies its own names (Tensor Cores / XMX / Neural Engine…).
- **Lessons embed interactives by key** (`LessonSection.interactive`), resolved through `components/lessons/registry-*.tsx`.
- **Scope is explicit.** Records carry `scope: chip | component | system | platform` so the UI can keep an M-series SoC from being compared with a single graphics card.
- **Honesty markers.** Approximations carry an "Educational approximation" badge; product numbers carry `Source { url, lastUpdated, status }`. `status: "compiled"` means the value was entered from reference knowledge and must be verified against the source before being relied on.

### Design system

Tokens live in `app/globals.css` as CSS variables (dark default, light via `data-theme`), mapped into Tailwind with `@theme inline`. Every diagram uses the same component-kind palette (`--k-cpu`, `--k-gpu`, `--k-accel`, `--k-memory`, `--k-vram`, `--k-cache`, `--k-storage`, `--k-interconnect`, `--k-power`, …). Company colours (`--c-apple`, `--c-amd`, `--c-nvidia`, `--c-intel`) are used only for small identification tags, never as page themes. Typography: Geist Sans + Geist Mono.

## Adding content

- **A lesson section:** edit `data/lessons/<slug>.ts`; to embed a widget, set `interactive` to a registered key.
- **A workload:** add to `data/workloads.ts` with role-based `steps`, a `demands` profile, `notes` per memory model/platform and `facts`.
- **A platform:** add to `data/platforms.ts` using `discreteLayout` or `socLayout`, with engine names and tradeoffs.
- **A product:** add to `data/products.ts` with at least one `Source`. Do not invent specs.

## Roadmap (Phase 4)

- Replace `status: "compiled"` product data with values verified against manufacturer pages, with an automated freshness check.
- Historical generations database expansion; current-product ingestion pipeline with source URLs and timestamps.
- Benchmark integrations only where licensing permits, always shown separately from architectural explanations.
- Personalised buying recommendations that persist a user's profile.

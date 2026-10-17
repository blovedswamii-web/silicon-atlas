/**
 * Shared schemas for all educational content and hardware data.
 *
 * Rule of the codebase: UI components never hardcode product- or vendor-specific
 * facts. They render records that conform to these types, which live in /data.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type CompanyId = "apple" | "amd" | "nvidia" | "intel";

/** The three teaching levels used everywhere on the site. */
export type Depth = "simple" | "technical" | "deep";

/**
 * Text written at three levels. Each string may contain several paragraphs
 * separated by a blank line, and lightweight inline markup:
 *   **bold**, `code`, [link text](/internal/path)
 */
export interface Layered {
  simple: string;
  technical: string;
  deep: string;
}

/**
 * The four scopes that hardware comparisons must keep separate.
 * An Apple M-series chip is a whole SoC/platform; a GeForce card is one component.
 */
export type Scope = "chip" | "component" | "system" | "platform";

/** Visual category used for consistent colour-coding in every diagram. */
export type NodeKind =
  | "cpu"
  | "gpu"
  | "accel"
  | "memory"
  | "vram"
  | "cache"
  | "storage"
  | "interconnect"
  | "power"
  | "cooling"
  | "display"
  | "software"
  | "network";

/** How compute engines see memory on a platform. */
export type MemoryModel =
  | "discrete" // CPU has system RAM; GPU has its own VRAM across PCIe
  | "unified" // CPU, GPU and accelerators share one large on-package pool (Apple, Strix Halo, GB10)
  | "integrated-shared"; // integrated GPU borrows part of ordinary system RAM

/** Every claim that is a measured or published number must carry provenance. */
export interface Source {
  label: string;
  url: string;
  /** ISO date this value was last checked against the source. */
  lastUpdated: string;
  /** "verified" = checked against the source; "compiled" = entered from reference knowledge, re-verify before relying on it. */
  status: "verified" | "compiled";
}

export interface Range {
  min: number;
  max: number;
  unit: string;
}

// ---------------------------------------------------------------------------
// Companies & architectures
// ---------------------------------------------------------------------------

export interface ProductLine {
  name: string; // "GeForce RTX", "Ryzen", "M-series"
  scope: Scope;
  kind: NodeKind;
  market: string; // "Consumer desktop & laptop GPUs"
  description: string;
}

export interface KeyTech {
  term: string;
  explain: string;
  conceptId?: string; // glossary/concept link
}

export interface Manufacturer {
  id: CompanyId;
  name: string;
  tagline: string; // neutral, one-line: what they build
  summary: Layered;
  productLines: ProductLine[];
  keyTech: KeyTech[];
  strengths: string[];
  limitations: string[];
  softwareStack: string[]; // ids from software stacks
  isa: string[]; // "ARM64", "x86-64"
}

export interface Architecture {
  id: string; // "zen5", "blackwell", "rdna4", "m4"
  company: CompanyId;
  name: string;
  family: string; // "Zen", "RDNA", "Apple Silicon", "Core"
  kind: "cpu" | "gpu" | "soc" | "npu";
  year: number;
  processNode?: string;
  changes: { area: string; what: string }[];
  source?: Source;
}

// ---------------------------------------------------------------------------
// Platform architecture graphs (Platform Explorer, Run a Program, System Map)
// ---------------------------------------------------------------------------

/** Logical role a node plays. Workload flows are written against roles, not node ids. */
export type NodeRole =
  | "storage"
  | "sysmem"
  | "cache"
  | "cpu"
  | "pcie"
  | "gpu"
  | "vram"
  | "npu"
  | "media"
  | "display"
  | "fabric"
  | "network";

export interface ArchNode {
  id: string;
  label: string;
  sublabel?: string;
  kind: NodeKind;
  role?: NodeRole;
  /** Layout in a 1000 x 600 viewBox. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** A container (e.g. "SoC package") is drawn behind its children. */
  container?: boolean;
  conceptId?: string;
}

export type EdgeKind = "memory-bus" | "pcie" | "fabric" | "storage-bus" | "display" | "network";

export interface ArchEdge {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  label?: string;
  /** Override the coordinate of a straight orthogonal edge (x for vertical, y for horizontal). */
  at?: number;
}

export interface Platform {
  id: string;
  name: string;
  short: string;
  memoryModel: MemoryModel;
  cpuVendor: CompanyId;
  gpuVendor: CompanyId;
  scope: Scope;
  /** A vendor-neutral archetype rather than a specific brand combination. */
  generic?: boolean;
  summary: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  /** Which node fills each logical role on this platform. */
  roles: Partial<Record<NodeRole, string>>;
  /** Vendor-specific names for compute engines, so workload text stays generic. */
  engines: {
    gpu: string;
    matrix: string;
    npu?: string;
    media: string;
    computeApi: string;
    graphicsApi: string;
    upscaler: string;
    /** What the GPU's working memory is called here: "VRAM", "unified memory", "shared system RAM". */
    gpuMemory: string;
  };
  traits: { label: string; value: string }[];
  advantages: string[];
  disadvantages: string[];
}

// ---------------------------------------------------------------------------
// Workloads & "Run a Program"
// ---------------------------------------------------------------------------

export type StepKind = "load" | "copy" | "compute" | "sync" | "output";

export interface FlowStep {
  from: NodeRole;
  to: NodeRole;
  kind: StepKind;
  /** Short label. May contain {gpu} {matrix} {npu} {media} {computeApi} {graphicsApi} {upscaler} {mem} tokens. */
  label: string;
  detail: string;
  /** Restrict this step to some memory models (e.g. the PCIe copy only exists on "discrete"). */
  only?: MemoryModel[];
}

/** 0 = irrelevant, 10 = dominant demand. Used by Bottleneck Lab and the buying assistant. */
export interface DemandProfile {
  cpuSingle: number;
  cpuMulti: number;
  gpuRaster: number;
  gpuCompute: number;
  matrix: number;
  memCapacity: number;
  memBandwidth: number;
  vramCapacity: number;
  storage: number;
  media: number;
  software: number;
  power: number;
}

export interface Workload {
  id: string;
  name: string;
  verb: string; // "Run an LLM"
  icon: string; // key into the icon set
  summary: string;
  steps: FlowStep[];
  demands: DemandProfile;
  /** Notes keyed by memory model or platform id, surfaced next to the animation. */
  notes: Partial<Record<MemoryModel | string, string>>;
  /** Architecture questions answered per memory model ("Where do the weights live?"). */
  facts?: { q: string; a: Partial<Record<MemoryModel, string>> }[];
  takeaway: string;
}

/** Why a platform may suit a workload — never "X wins". */
export interface WorkloadFit {
  workload: string;
  platform: CompanyId | "pc-discrete" | "apple" | "pc-igpu";
  reasons: string[];
  caveats: string[];
}

// ---------------------------------------------------------------------------
// Hardware database
// ---------------------------------------------------------------------------

export interface SpecValue {
  key: string; // matches a SpecDefinition id
  value: string | number;
  unit?: string;
}

export interface Product {
  id: string;
  company: CompanyId;
  name: string;
  family: string;
  scope: Scope;
  kind: "cpu" | "gpu" | "soc" | "apu";
  architecture: string; // Architecture id
  formFactor: "desktop" | "laptop" | "both" | "workstation";
  releaseYear: number;
  specs: SpecValue[];
  sources: Source[];
  notes?: string;
}

// ---------------------------------------------------------------------------
// Specifications explained
// ---------------------------------------------------------------------------

export interface SpecDefinition {
  id: string; // "cuda-cores", "clock-speed", "vram"
  name: string;
  appliesTo: ("cpu" | "gpu" | "memory" | "storage" | "soc" | "npu" | "psu")[];
  vendorSpecific?: CompanyId;
  whatItIs: string;
  whyItExists: string;
  whyItMatters: string;
  whenItMatters: string;
  whenItDoesnt: string;
  crossBrand: { verdict: "yes" | "partly" | "no"; explain: string };
  misconception: string;
}

// ---------------------------------------------------------------------------
// Learning content
// ---------------------------------------------------------------------------

export interface Concept {
  id: string;
  term: string;
  aka?: string[];
  category:
    | "cpu"
    | "gpu"
    | "memory"
    | "storage"
    | "interconnect"
    | "ai"
    | "power"
    | "software"
    | "platform"
    | "marketing";
  short: string; // one sentence
  body: Layered;
  vendorTerms?: Partial<Record<CompanyId, string>>;
  related?: string[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer: number; // index into choices
  explain: string;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface Misconception {
  id: string;
  claim: string;
  verdict: "false" | "misleading" | "sometimes";
  short: string;
  explanation: string;
  /** What to look at instead. */
  instead: string;
  related?: string[];
}

export interface MisleadingComparison {
  id: string;
  left: string;
  right: string;
  looksLike: string;
  reality: string;
  questions: string[]; // the questions a buyer should ask
}

export interface LessonSection {
  id: string;
  title: string;
  body: Layered;
  /** Key of an interactive component in the lesson registry. */
  interactive?: string;
  callout?: { tone: "info" | "warn" | "myth" | "good"; title: string; text: string };
}

export interface Lesson {
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  kind: NodeKind;
  minutes: number;
  sections: LessonSection[];
  quiz?: Quiz;
  misconceptions?: string[]; // Misconception ids
  related?: string[]; // routes or lesson slugs
}

// ---------------------------------------------------------------------------
// Comparisons
// ---------------------------------------------------------------------------

export interface ComparisonRow {
  id: string;
  label: string;
  values: Record<string, string>; // keyed by platform/profile id
  meaning: string; // WHAT THIS MEANS
}

export interface Comparison {
  id: string;
  title: string;
  columns: { id: string; label: string; company?: CompanyId }[];
  rows: ComparisonRow[];
}

// ---------------------------------------------------------------------------
// Software ecosystems
// ---------------------------------------------------------------------------

export interface SoftwareLayer {
  layer: "hardware" | "driver" | "api" | "library" | "framework" | "application";
  name: string;
  detail: string;
}

export interface SoftwareStack {
  id: string;
  company: CompanyId;
  domain: "ai" | "graphics" | "media" | "general";
  name: string;
  layers: SoftwareLayer[];
  maturity: string;
  notes: string[];
}

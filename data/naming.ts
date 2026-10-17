import type { CompanyId } from "@/data/schema";

/**
 * Naming decoder rules. Each family parses a product name into tokens and
 * explains what each token GENERALLY communicates. Naming conventions change
 * between generations — the warnings are as important as the decoding.
 */

export type TokenRole = "brand" | "tier" | "generation" | "sku" | "suffix" | "variant" | "form";

export interface NameToken {
  text: string;
  role: TokenRole;
  label: string;
  meaning: string;
}

export interface DecodeResult {
  family: string;
  company: CompanyId;
  scope: "chip" | "component" | "platform";
  tokens: NameToken[];
  warnings: string[];
}

interface FamilyRule {
  id: string;
  company: CompanyId;
  family: string;
  examples: string[];
  decode: (name: string) => DecodeResult | null;
}

const ROLE_LABEL: Record<TokenRole, string> = {
  brand: "Brand",
  tier: "Tier",
  generation: "Generation",
  sku: "Model / SKU",
  suffix: "Suffix",
  variant: "Variant",
  form: "Form factor",
};
export const roleLabel = (r: TokenRole) => ROLE_LABEL[r];

const NV_GEN: Record<string, string> = {
  "20": "RTX 20 series — Turing (2018), the first RTX generation.",
  "30": "RTX 30 series — Ampere (2020).",
  "40": "RTX 40 series — Ada Lovelace (2022).",
  "50": "RTX 50 series — Blackwell (2025).",
};

const NV_TIER: Record<string, string> = {
  "90": "Flagship tier: the largest consumer configuration of the generation.",
  "80": "High-end tier, below the flagship.",
  "70": "Upper-mainstream tier.",
  "60": "Mainstream tier — the volume segment.",
  "50": "Entry tier.",
};

const rtx: FamilyRule = {
  id: "rtx",
  company: "nvidia",
  family: "NVIDIA GeForce RTX",
  examples: ["RTX 5090", "RTX 5080", "RTX 5070 Ti", "RTX 5090 Laptop GPU", "RTX 4060"],
  decode(name) {
    const m = name.match(/^(?:nvidia\s+)?(?:geforce\s+)?(rtx)\s*(\d{2})(\d{2})\s*(ti\s+super|ti|super)?\s*(laptop(?:\s+gpu)?|mobile)?$/i);
    if (!m) return null;
    const [, brand, gen, tier, variant, laptop] = m;
    const tokens: NameToken[] = [
      { text: brand.toUpperCase(), role: "brand", label: "GeForce RTX", meaning: "NVIDIA's GPU brand since 2018. 'RTX' signals hardware ray tracing (RT Cores) and Tensor Cores." },
      { text: gen, role: "generation", label: "Generation", meaning: NV_GEN[gen] ?? "Generation number — higher is newer, but a newer generation's lower tier isn't automatically faster than an older higher tier." },
      { text: tier, role: "tier", label: "Tier", meaning: NV_TIER[tier] ?? "Position in the line-up." },
    ];
    if (variant) tokens.push({ text: variant.replace(/\s+/g, " ").toUpperCase(), role: "variant", label: "Variant", meaning: "Ti / SUPER mark a stronger configuration within the same tier (more enabled units and/or faster memory). The size of the step varies by generation." });
    if (laptop) tokens.push({ text: "Laptop GPU", role: "form", label: "Laptop", meaning: "A laptop GPU with the same name is a different product: often a smaller chip, less VRAM, and a power limit chosen by the laptop maker. It is not a desktop card in a laptop." });
    const warnings = [
      "Tier numbers are positioning, not a performance scale: the gap between a 70 and a 90 isn't '20 units' of anything, and it differs every generation.",
      "Compare within a generation; across generations, check reviews for the specific workload.",
    ];
    if (laptop) warnings.unshift("Laptop GPU performance depends heavily on the power limit (TGP) and cooling of the specific laptop — two laptops with the same GPU name can differ a lot.");
    return { family: "NVIDIA GeForce RTX", company: "nvidia", scope: "component", tokens, warnings };
  },
};

const radeon: FamilyRule = {
  id: "radeon",
  company: "amd",
  family: "AMD Radeon RX",
  examples: ["RX 9070 XT", "RX 9070", "RX 7900 XTX", "RX 7600"],
  decode(name) {
    const m = name.match(/^(?:amd\s+)?(?:radeon\s+)?(rx)\s*(\d)(\d{3})\s*(xtx|xt|gre)?$/i);
    if (!m) return null;
    const [, brand, gen, rest, variant] = m;
    const newScheme = Number(gen) >= 9;
    const tierText = newScheme ? rest.slice(1) : rest[0];
    const tokens: NameToken[] = [
      { text: brand.toUpperCase(), role: "brand", label: "Radeon RX", meaning: "AMD's consumer gaming GPU brand." },
      { text: gen, role: "generation", label: "Series", meaning: gen === "9" ? "RX 9000 series — RDNA 4 (2025). AMD skipped '8000' for desktop cards." : gen === "7" ? "RX 7000 series — RDNA 3 (2022)." : gen === "6" ? "RX 6000 series — RDNA 2 (2020)." : "Series number — higher is newer." },
      {
        text: rest,
        role: "tier",
        label: "Tier",
        meaning: newScheme
          ? `With RX 9000, AMD switched to a two-digit tier ('${tierText}') that lines up with the competitor's tier naming — '070' here is tier ${tierText}.`
          : `In RX 6000/7000 naming, the first digit after the series ('${tierText}') is the tier: 9 = top, 8, 7, 6 = mainstream.`,
      },
    ];
    if (variant) tokens.push({ text: variant.toUpperCase(), role: "variant", label: "Variant", meaning: variant.toLowerCase() === "xtx" ? "XTX: the top configuration of a chip." : variant.toLowerCase() === "xt" ? "XT: a higher-clocked / more-enabled version than the non-XT card." : "GRE: a cut-down variant, originally a regional edition." });
    return {
      family: "AMD Radeon RX",
      company: "amd",
      scope: "component",
      tokens,
      warnings: [
        "AMD changed the meaning of the digits between RX 7000 and RX 9000 — the same position in the name means different things in different years.",
        "A Radeon card is one component. Compare it with other graphics cards, not with a whole Mac.",
      ],
    };
  },
};

const RYZEN_TIER: Record<string, string> = {
  "9": "Ryzen 9: top consumer tier, typically the most cores.",
  "7": "Ryzen 7: high-end tier.",
  "5": "Ryzen 5: mainstream tier.",
  "3": "Ryzen 3: entry tier.",
};

const RYZEN_SUFFIX: Record<string, string> = {
  X3D: "X3D: 3D V-Cache — an extra stacked L3 cache die. Big gains in cache-sensitive work (many games), little elsewhere.",
  X: "X: higher clocks / power limits than the non-X part.",
  XT: "XT: a refresh with slightly higher clocks.",
  G: "G: desktop chip with a stronger integrated GPU (APU).",
  F: "F: no integrated graphics.",
  HX: "HX: highest-power laptop class, essentially desktop silicon for large laptops.",
  HS: "HS: high-performance laptop chip tuned for thinner designs.",
  H: "H: high-performance laptop chip.",
  U: "U: low-power laptop chip for thin and light designs.",
  GE: "GE: lower-power desktop APU.",
};

const ryzen: FamilyRule = {
  id: "ryzen",
  company: "amd",
  family: "AMD Ryzen",
  examples: ["Ryzen 9 9950X3D", "Ryzen 7 9800X3D", "Ryzen 5 9600X", "Ryzen 7 7840U"],
  decode(name) {
    const m = name.match(/^(?:amd\s+)?ryzen\s+(\d)\s+(\d)(\d)(\d{2})\s*(x3d|xt|x|ge|g|f|hx|hs|h|u)?$/i);
    if (!m) return null;
    const [, tier, series, pos, sku, suffix] = m;
    const tokens: NameToken[] = [
      { text: "Ryzen", role: "brand", label: "Ryzen", meaning: "AMD's consumer x86 CPU brand (Zen cores)." },
      { text: tier, role: "tier", label: "Tier", meaning: RYZEN_TIER[tier] ?? "Market tier." },
      { text: series, role: "generation", label: "Series", meaning: series === "9" ? "9000 series — Zen 5 on desktop." : series === "7" ? "7000 series — Zen 4 on desktop; on laptops the 7000 range mixed several Zen generations." : series === "5" ? "5000 series — Zen 3 on desktop (laptop 5000 parts mixed Zen 2 and Zen 3)." : "Series — higher is newer." },
      { text: pos + sku, role: "sku", label: "Model", meaning: `Position within the series. On AMD's 2023+ laptop scheme the third digit encodes the Zen generation (e.g. 7840U → '4' = Zen 4); on desktop the digits are mostly positioning.` },
    ];
    if (suffix) tokens.push({ text: suffix.toUpperCase(), role: "suffix", label: "Suffix", meaning: RYZEN_SUFFIX[suffix.toUpperCase()] ?? "Suffix." });
    return {
      family: "AMD Ryzen",
      company: "amd",
      scope: "chip",
      tokens,
      warnings: [
        "Ryzen 9 vs Ryzen 7 tells you tier, not which is faster for you: a Ryzen 7 X3D can beat a Ryzen 9 in games and lose in rendering.",
        "Laptop and desktop chips with similar numbers can be different generations — check the Zen generation.",
      ],
    };
  },
};

const ryzenAI: FamilyRule = {
  id: "ryzen-ai",
  company: "amd",
  family: "AMD Ryzen AI",
  examples: ["Ryzen AI 9 HX 370", "Ryzen AI Max+ 395", "Ryzen AI 7 350"],
  decode(name) {
    const m = name.match(/^(?:amd\s+)?ryzen\s+ai\s+(max\+?|9|7|5)\s*(hx|pro)?\s*(\d)(\d{2})$/i);
    if (!m) return null;
    const [, tier, cls, series, sku] = m;
    const isMax = tier.toLowerCase().startsWith("max");
    const tokens: NameToken[] = [
      { text: "Ryzen AI", role: "brand", label: "Ryzen AI", meaning: "Laptop chips (Zen 5 era) that include an XDNA NPU for on-device AI." },
      { text: tier.toUpperCase().replace("MAX", "Max"), role: "tier", label: "Tier", meaning: isMax ? "Max / Max+: a much larger integrated GPU and a 256-bit memory bus with up to 128 GB of shared memory." : `Tier ${tier} — positioning within the Ryzen AI line.` },
    ];
    if (cls) tokens.push({ text: cls.toUpperCase(), role: "suffix", label: "Class", meaning: cls.toLowerCase() === "hx" ? "HX: higher power envelope / top bin." : "PRO: business features (manageability, security)." });
    tokens.push({ text: series + sku, role: "sku", label: "Model", meaning: `The '${series}00' range identifies the generation/series; the remaining digits position the SKU.` });
    return {
      family: "AMD Ryzen AI",
      company: "amd",
      scope: "chip",
      tokens,
      warnings: [
        "NPU TOPS figures in these names' marketing use low-precision formats and are not comparable with GPU TFLOPS.",
        "Laptop performance depends on the power limit the laptop maker sets.",
      ],
    };
  },
};

const INTEL_SUFFIX: Record<string, string> = {
  K: "K: unlocked multiplier — overclockable desktop part.",
  KF: "KF: unlocked and no integrated graphics (needs a graphics card).",
  F: "F: no integrated graphics.",
  KS: "KS: special-edition, highest-binned K part.",
  T: "T: low-power desktop part.",
  H: "H: high-performance laptop chip.",
  HX: "HX: highest-power laptop class, desktop-derived silicon.",
  U: "U: low-power laptop chip.",
  P: "P: mid-power thin-and-light laptop chip.",
  V: "V: Lunar Lake — laptop chip with memory on the package (capacity fixed at purchase).",
};

const coreUltra: FamilyRule = {
  id: "core-ultra",
  company: "intel",
  family: "Intel Core Ultra",
  examples: ["Core Ultra 9 285K", "Core Ultra 7 265K", "Core Ultra 7 258V", "Core Ultra 9 275HX"],
  decode(name) {
    const m = name.match(/^(?:intel\s+)?core\s+ultra\s+(x)?(\d)\s+(\d)(\d{2})\s*(kf|k|f|hx|h|u|v|t)?$/i);
    if (!m) return null;
    const [, x, tier, series, sku, suffix] = m;
    const tokens: NameToken[] = [
      { text: "Core Ultra", role: "brand", label: "Core Ultra", meaning: "Intel's tile-based client CPU brand (from Meteor Lake, 2023), with Xe graphics and an NPU." },
    ];
    if (x) tokens.push({ text: "X", role: "variant", label: "X", meaning: "On some Series 3 laptop parts, an X before the tier marks the larger integrated-GPU configuration." });
    tokens.push(
      { text: tier, role: "tier", label: "Tier", meaning: `Core Ultra ${tier}: ${tier === "9" ? "top tier" : tier === "7" ? "high-end tier" : tier === "5" ? "mainstream tier" : "tier"}.` },
      { text: series, role: "generation", label: "Series", meaning: series === "1" ? "Series 1 — Meteor Lake (laptops)." : series === "2" ? "Series 2 — Lunar Lake (V) or Arrow Lake (K/S/H/HX)." : series === "3" ? "Series 3 — Panther Lake." : "Series — higher is newer." },
      { text: sku, role: "sku", label: "Model", meaning: "Position within the series." },
    );
    if (suffix) tokens.push({ text: suffix.toUpperCase(), role: "suffix", label: "Suffix", meaning: INTEL_SUFFIX[suffix.toUpperCase()] ?? "Suffix." });
    return {
      family: "Intel Core Ultra",
      company: "intel",
      scope: "chip",
      tokens,
      warnings: [
        "Within one 'series', the suffix can mean an entirely different chip design: a 258V (Lunar Lake) and a 265K (Arrow Lake) are different architectures, packages and power classes.",
        "Intel's naming moved from 'Core i9-14900K' to 'Core Ultra 9 285K' — tier numbers survived, everything else changed.",
      ],
    };
  },
};

const coreI: FamilyRule = {
  id: "core-i",
  company: "intel",
  family: "Intel Core (i-series)",
  examples: ["Core i9-14900K", "Core i5-13400F", "Core i7-12700H"],
  decode(name) {
    const m = name.match(/^(?:intel\s+)?core\s+i(\d)[-\s]?(1\d)(\d{3})\s*(ks|kf|k|f|hx|h|u|p|t)?$/i);
    if (!m) return null;
    const [, tier, gen, sku, suffix] = m;
    const tokens: NameToken[] = [
      { text: "Core", role: "brand", label: "Core", meaning: "Intel's long-running x86 CPU brand." },
      { text: `i${tier}`, role: "tier", label: "Tier", meaning: `i${tier}: ${tier === "9" ? "top" : tier === "7" ? "high-end" : tier === "5" ? "mainstream" : "entry"} tier.` },
      { text: gen, role: "generation", label: "Generation", meaning: gen === "12" ? "12th gen — Alder Lake, first hybrid P/E design." : gen === "13" ? "13th gen — Raptor Lake." : gen === "14" ? "14th gen — Raptor Lake refresh." : `${gen}th generation.` },
      { text: sku, role: "sku", label: "Model", meaning: "Position within the generation." },
    ];
    if (suffix) tokens.push({ text: suffix.toUpperCase(), role: "suffix", label: "Suffix", meaning: INTEL_SUFFIX[suffix.toUpperCase()] ?? "Suffix." });
    return {
      family: "Intel Core (i-series)",
      company: "intel",
      scope: "chip",
      tokens,
      warnings: ["14th gen desktop was a refresh of 13th gen — a new generation number doesn't always mean a new architecture."],
    };
  },
};

const appleM: FamilyRule = {
  id: "apple-m",
  company: "apple",
  family: "Apple M-series",
  examples: ["M5", "M5 Pro", "M5 Max", "M4 Max", "M3 Ultra"],
  decode(name) {
    const m = name.match(/^(?:apple\s+)?m(\d+)\s*(pro|max|ultra)?$/i);
    if (!m) return null;
    const [, gen, tier] = m;
    const t = (tier ?? "").toLowerCase();
    const tierMeaning: Record<string, string> = {
      "": "Base chip: MacBook Air, base MacBook Pro, iMac, Mac mini, iPad. The smallest die of the generation.",
      pro: "Pro: a larger die — more CPU and GPU cores, a wider memory bus (more bandwidth) and higher memory ceilings.",
      max: "Max: a much larger GPU, wider memory bus still, more media engines, and the largest single-die memory configurations.",
      ultra: "Ultra: two Max-class dies joined by a high-bandwidth die-to-die connection, presented to software as one chip. Not offered every generation.",
    };
    const tokens: NameToken[] = [
      { text: "M", role: "brand", label: "Apple M-series", meaning: "Apple's Mac-class SoC family: CPU, GPU, Neural Engine, media engines and memory controllers in one chip, with unified memory on the package." },
      { text: gen, role: "generation", label: "Generation", meaning: `Generation ${gen}. Each generation updates the CPU and GPU core designs; Apple has shipped roughly one per year since M1 (2020).` },
      { text: tier ? tier[0].toUpperCase() + tier.slice(1).toLowerCase() : "(base)", role: "tier", label: "Tier", meaning: tierMeaning[t] },
    ];
    return {
      family: "Apple M-series",
      company: "apple",
      scope: "platform",
      tokens,
      warnings: [
        "The same tier ships in several configurations (e.g. different GPU-core counts and memory bandwidths). Check the exact core count and memory, not just the name.",
        "An M-series chip is a whole SoC — compare a Mac with a whole PC or laptop, not with one graphics card.",
        "A base chip of a newer generation can beat an older Pro in some tasks and lose in others; tiers and generations both matter.",
      ],
    };
  },
};

const arc: FamilyRule = {
  id: "arc",
  company: "intel",
  family: "Intel Arc",
  examples: ["Arc B580", "Arc B570", "Arc A770", "Arc A380"],
  decode(name) {
    const m = name.match(/^(?:intel\s+)?arc\s+([abcd])(\d)(\d{2})$/i);
    if (!m) return null;
    const [, letter, tier, sku] = m;
    const genName: Record<string, string> = { a: "Alchemist (2022)", b: "Battlemage (2024)", c: "Celestial (roadmap)", d: "Druid (roadmap)" };
    return {
      family: "Intel Arc",
      company: "intel",
      scope: "component",
      tokens: [
        { text: "Arc", role: "brand", label: "Arc", meaning: "Intel's discrete GPU brand (Xe architecture)." },
        { text: letter.toUpperCase(), role: "generation", label: "Generation", meaning: `Generations are alphabetical: ${letter.toUpperCase()} = ${genName[letter.toLowerCase()]}.` },
        { text: tier, role: "tier", label: "Tier", meaning: `${tier}: ${Number(tier) >= 7 ? "highest tier of that generation" : Number(tier) >= 5 ? "mainstream tier" : "entry tier"}.` },
        { text: sku, role: "sku", label: "Model", meaning: "Position within the tier." },
      ],
      warnings: ["Arc performance has changed significantly with driver updates — reviews from launch may not reflect current behaviour."],
    };
  },
};

export const NAME_FAMILIES: FamilyRule[] = [rtx, radeon, ryzenAI, ryzen, coreUltra, coreI, appleM, arc];

export function decodeName(input: string): DecodeResult | null {
  const name = input.trim().replace(/\s+/g, " ");
  if (!name) return null;
  for (const f of NAME_FAMILIES) {
    const r = f.decode(name);
    if (r) return r;
  }
  return null;
}

export const NAME_EXAMPLES: { company: CompanyId; names: string[] }[] = [
  { company: "nvidia", names: rtx.examples },
  { company: "amd", names: [...ryzen.examples.slice(0, 3), ...ryzenAI.examples.slice(0, 2), ...radeon.examples.slice(0, 2)] },
  { company: "intel", names: [...coreUltra.examples, "Core i9-14900K", ...arc.examples.slice(0, 2)] },
  { company: "apple", names: appleM.examples },
];

export const GLOBAL_NAMING_WARNINGS = [
  "Marketing naming conventions change — sometimes every generation. Decode the name, then confirm with the spec sheet.",
  "Model numbers are not a linear performance scale. A '90' isn't 12.5% faster than an '80', and 285 vs 265 says nothing proportional.",
  "Laptop and desktop parts can share a name while being different chips at very different power levels.",
];

import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "reading-specs",
  number: 16,
  title: "How to read specifications",
  subtitle: "Every number on a spec sheet answers one narrow question. Learn which question — and which ones it can't answer.",
  kind: "software",
  minutes: 11,
  sections: [
    {
      id: "anatomy",
      title: "Anatomy of a listing",
      body: {
        simple:
          "A product listing is a string of numbers and names: chip, graphics, memory, storage, screen. Each one tells you **something** — and leaves out something important.\n\nHover over each part of the listings below to see what it tells you, what it doesn't, and what to ask instead.",
        technical:
          "A spec line typically mixes four kinds of information:\n\n- **identity** (product names: tier, generation, variant)\n- **capacity** (GB of RAM/VRAM, TB of storage) — hard limits on what fits\n- **rates** (GHz, GB/s, TFLOPS, TOPS) — usually peak values under specific conditions\n- **interfaces and features** (PCIe 5.0, DDR5, AV1, ray tracing) — what's supported, not how fast\n\nCapacity specs are the most trustworthy for buying decisions: if a model needs 20 GB and you have 16, it doesn't fit. Rate specs are the most misleading in isolation.",
        deep:
          "The most important missing information is almost always **sustained behaviour under your workload**: the power limit actually configured, the cooling, how clocks behave after ten minutes, whether software uses the special hardware, and where the bottleneck sits. Spec sheets describe components; your experience comes from the whole system. Use specs to narrow candidates, then use measurements in comparable workloads to decide.",
      },
      interactive: "spec-anatomy",
    },
    {
      id: "seven",
      title: "Seven questions for every spec",
      body: {
        simple:
          "For any number you see, ask:\n\n- **What is it?**\n- **Why does it exist?**\n- **Why does it matter?**\n- **When does it matter** — for which tasks?\n- **When doesn't it?**\n- **Can I compare this number across brands?**\n- **What's the common misconception?**\n\nThe [Spec Decoder](/specs) answers these for every common spec.",
        technical:
          "Take **boost clock**: it's the highest frequency a core may reach (what); it exists because chips can run faster when power and temperature allow (why); it affects single-threaded speed (why it matters); it matters for lightly threaded, latency-sensitive work like many games and UI (when); it matters less for all-core sustained loads where clocks drop to the power limit (when not); across brands, no — work per clock differs (cross-brand); and the misconception is that more GHz means faster, full stop.\n\nThe same seven questions turn every spec into a decision tool instead of a scoreboard.",
        deep:
          "Most specs are conditional: \"up to\" clocks, \"peak\" TFLOPS, \"sequential\" SSD speeds, \"rated\" TDP. Each condition is a lever for marketing. When a spec has an implied condition, write the condition down: at which precision, with sparsity or not, at what power, single core or all cores, sequential or random, burst or sustained. If you can't find the condition, treat the number as a ceiling, not an expectation.",
      },
    },
    {
      id: "units",
      title: "Units that don't cross brands",
      body: {
        simple:
          "Some numbers are only meaningful **within one company's products**:\n\n- NVIDIA **CUDA cores**\n- AMD **stream processors** and **compute units**\n- Intel **Xe cores**\n- Apple **GPU cores**\n\nEach company draws the line around a \"core\" differently, so 10,000 CUDA cores vs 40 Apple GPU cores tells you nothing about which is faster.",
        technical:
          "These units differ in what they contain: an Apple GPU core or Intel Xe core is a large block with many ALUs; a CUDA core or stream processor is roughly one FP32 lane. Even within one vendor, definitions change: Ampere doubled FP32 lanes per SM; RDNA 3 added dual-issue. Cross-vendor, use measured performance in the workload you care about.\n\nSimilarly, **TOPS** (AI) figures vary by precision (INT8 vs FP8 vs FP4), sparsity, and which engine is counted (NPU only, or NPU + GPU + CPU). Two TOPS numbers are only comparable when those conditions match.",
        deep:
          "Some specs *do* compare across brands because they're physical quantities: memory capacity (GB), memory bandwidth (GB/s), power (W), PCIe generation and lane count. Even these need context — bandwidth shared by CPU and GPU (unified) vs dedicated to the GPU (VRAM); power rated as TDP vs measured board power. GHz is a physical quantity too, but what's done per cycle differs, so it compares poorly across architectures.",
      },
      callout: { tone: "warn", title: "Can I compare this across brands?", text: "Memory capacity, bandwidth and watts: mostly yes, with context. Core and unit counts: no. GHz: not across architectures. TOPS/TFLOPS: only at matching precision and conditions." },
    },
    {
      id: "peak",
      title: "Peak vs sustained",
      body: {
        simple:
          "Many specs describe the **best case**: the highest clock speed, the most operations per second. Real use often runs below that, especially in thin laptops or long tasks where the chip heats up.\n\nWhen you see \"up to\", read it as \"no more than\".",
        technical:
          "Boost clocks are opportunistic; under sustained all-core load, chips settle to the clock their **power limit** and **cooling** allow. Laptop GPUs and CPUs vary by the power limits each manufacturer configures. Peak TFLOPS assume every unit is busy every cycle at a specific precision; real workloads achieve a fraction depending on memory bandwidth and software. SSD speeds are quoted for large sequential transfers; random access and sustained writes can be far slower.",
        deep:
          "A useful mental model is the **roofline**: performance is capped by either compute throughput or memory bandwidth, whichever you hit first for a given arithmetic intensity (operations per byte). Many real workloads — LLM token generation, many games at high resolution — are bandwidth-bound, so a bigger TFLOPS number changes nothing. Specs that describe the roof you're not under are irrelevant to you.",
      },
    },
    {
      id: "names",
      title: "Names are not specs",
      body: {
        simple:
          "Product names tell you the brand, the tier and the generation. They don't tell you speed — and the rules change between generations. Decode the name, then check the real specs.",
        technical:
          "Watch for: laptop and desktop parts sharing names; suffixes that denote different silicon (Intel V vs K); tier schemes changing (AMD RX 7000 → 9000); refresh generations with new numbers but the same architecture; and binned variants within one Apple tier.",
        deep:
          "Treat a name as a database key: it lets you look up the real configuration. Everything you'd use to decide — cores, memory, bandwidth, power, features — lives in the spec sheet and in measurements, not in the digits.",
      },
      interactive: "name-decoder",
    },
  ],
  quiz: {
    id: "reading-specs-quiz",
    questions: [
      {
        id: "q1",
        prompt: "Which spec is most directly comparable across brands?",
        choices: ["CUDA cores vs stream processors", "Memory capacity in GB", "Apple GPU cores vs Xe cores", "Boost clock in GHz across architectures"],
        answer: 1,
        explain: "GB is a physical quantity — though whether memory is shared or dedicated still matters.",
      },
      {
        id: "q2",
        prompt: "A chip is advertised at '1,000 AI TOPS'. What should you ask first?",
        choices: ["What colour is it?", "At what precision, and with sparsity or without?", "How many fans?", "Nothing, TOPS are universal"],
        answer: 1,
        explain: "TOPS figures vary hugely with precision (FP4 vs INT8 vs FP16) and with sparsity assumptions.",
      },
      {
        id: "q3",
        prompt: "'Up to 5.7 GHz' most accurately means…",
        choices: ["The chip always runs at 5.7 GHz", "The highest clock under favourable conditions, typically on few cores", "The average clock", "The memory speed"],
        answer: 1,
        explain: "Boost clocks are opportunistic peaks. Sustained all-core clocks are set by power limits and cooling.",
      },
    ],
  },
  misconceptions: ["ghz-faster", "more-cuda-better", "apple-cores-vs-cuda", "pcie5-ssd-doubles", "psu-consumes"],
  related: ["/specs", "/names", "/myths", "/hardware", "comparing-brands"],
};

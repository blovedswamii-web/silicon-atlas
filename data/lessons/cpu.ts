import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "cpu",
  number: 2,
  title: "CPU fundamentals",
  subtitle: "Instructions, pipelines, clocks, IPC, cores, caches and power — and why GHz and core counts never tell the whole story.",
  kind: "cpu",
  minutes: 16,
  sections: [
    {
      id: "what",
      title: "What a CPU actually does",
      body: {
        simple: `The CPU is the computer's general-purpose worker. It runs the operating system, your apps' logic, game rules and physics, web pages, spreadsheets — anything that involves lots of decisions.

It works through instructions one small step at a time, but extremely fast: a modern core can complete several instructions in each of its billions of clock ticks per second. It keeps the values it's working on in tiny, ultra-fast storage slots called **registers**, and does arithmetic in units called **ALUs** (arithmetic logic units).`,
        technical: `A **core** contains: a front end that fetches and decodes instructions and predicts branches; **registers** (the architectural ones software sees, plus hundreds of physical registers used for renaming); execution units — integer **ALUs**, floating-point/**SIMD** vector units, load/store units, branch units; and private **L1/L2 caches**. A **memory controller**, usually on the CPU die or package, connects to DRAM.

CPUs are optimised for **latency**: making a single thread of dependent, branchy work finish as fast as possible. That's the opposite of a GPU, which is optimised for **throughput** across thousands of simple, parallel threads — see [CPU vs GPU](/parallel).`,
        deep: `A high-performance core spends most of its transistors not on arithmetic but on keeping arithmetic busy: branch predictors, large reorder buffers and schedulers (to find independent work), register renaming (to remove false dependencies), prefetchers, TLBs, and multi-level caches. An integer add is cheap; knowing which add to do next, and having its operands ready, is expensive.

Vector units extend this: x86 cores implement SSE/AVX/AVX-512 (support varies by product), ARM cores implement NEON and, on some designs, SVE/SVE2 or Apple's matrix extensions. Vector width and how well software uses it can matter more than core count for media, scientific and some AI workloads.`,
      },
    },
    {
      id: "pipeline",
      title: "Fetch, decode, execute — the pipeline",
      body: {
        simple: `Executing an instruction has stages: **fetch** it, **decode** it (work out what it means), **execute** it, touch **memory** if needed, and **write back** the result. Like a car assembly line, the CPU works on several instructions at once, each in a different stage.

Problems happen when an instruction needs a result that isn't ready yet (it has to wait), or when the CPU guesses wrong about which way an "if" goes (it throws away the guessed work). Try both below.`,
        technical: `**Pipelining** overlaps stages so that, ideally, one instruction completes per cycle per pipeline. **Hazards** break the ideal: data hazards (a dependent instruction must wait — forwarding paths shorten the wait), control hazards (branches), and structural hazards (two instructions need the same unit).

**Branch prediction** guesses a branch's direction before it's resolved so fetch never stalls; modern predictors are right well over 95% of the time on typical code, but each misprediction flushes everything fetched after the branch. **Superscalar** cores issue several instructions per cycle; **out-of-order** execution lets independent instructions bypass stalled ones, while in-order **retirement** keeps the program's visible behaviour correct.`,
        deep: `The cost of a mispredict scales with pipeline depth and width: a 4-wide core with a ~15-cycle redirect penalty can lose ~60 instruction slots per mispredict. That is why predictors have grown into large, multi-component structures (TAGE-style tables, loop predictors, indirect-target predictors) and why branch-heavy code (interpreters, game logic, compilers) rewards predictor quality.

Out-of-order windows of several hundred µops let cores keep working past a cache miss — but only if there is independent work. Pointer-chasing code (linked lists, tree traversals) serialises on memory latency no matter how wide the core is. This is the limit wider cores cannot escape, and why cache size and memory latency remain central (see [memory hierarchy](/learn/memory-hierarchy)).`,
      },
      interactive: "pipeline",
    },
    {
      id: "clock-ipc",
      title: "Clock speed, IPC — and why GHz misleads",
      body: {
        simple: `**Clock speed** (GHz) is how many ticks per second the core runs: 5 GHz = five billion ticks. **IPC** (instructions per cycle) is how much work the core gets done per tick.

Performance is roughly **IPC × clock speed** for one core. Two chips at 5 GHz can differ a lot in speed because one does more per tick. A chip at 4.4 GHz can beat one at 5.6 GHz. GHz only compares fairly between chips with the same core design.`,
        technical: `For a single thread: **time = instructions ÷ (IPC × frequency)**. IPC is not a fixed spec — it depends on the workload's branch behaviour, cache hit rates, dependency chains and vector usage. Vendors quote "IPC uplift" for new architectures as an average over a chosen benchmark suite.

Clock speeds are also not fixed. **Base** clocks are guaranteed under a power limit; **boost** clocks are opportunistic and depend on how many cores are active, temperature, and the configured power limits. A laptop and a desktop with the same chip name can sustain very different clocks (see [Performance per watt](/efficiency)).`,
        deep: `Frequency costs power super-linearly. Dynamic power scales roughly with **C·V²·f**, and higher frequencies need higher voltage, so the last few hundred MHz can cost a disproportionate amount of power and heat. Designers therefore choose between "wide and slower" (more IPC, lower clocks — favoured in power-limited designs) and "narrower and faster" (higher clocks) points, with real designs mixing both.

This is why comparing **5 GHz Intel vs 5 GHz AMD vs 4.5 GHz Apple** says almost nothing alone: the microarchitectures, cache hierarchies, process nodes and power budgets differ. Compare measured performance on workloads like yours.`,
      },
      interactive: "perf-equation",
      callout: {
        tone: "myth",
        title: "Myth: more GHz = faster CPU",
        text: "Only within the same core design. Across architectures, IPC differences routinely outweigh clock differences of 20% or more.",
      },
    },
    {
      id: "cores",
      title: "Cores, threads, SMT — and P-cores vs E-cores",
      body: {
        simple: `A **core** is a complete worker. More cores let the computer do more things at once — but only if the work can be split up. Many tasks (much of a game's main loop, a lot of everyday apps) can't use many cores well, so they care more about how fast one core is.

Some chips mix two kinds of cores: big **performance cores** for demanding work and small **efficiency cores** for background tasks, saving power. Watch the scheduler send work to each type below.`,
        technical: `**Threads** are the OS's units of work. **SMT** (simultaneous multithreading; Intel calls it Hyper-Threading) lets one core run two threads by sharing its execution resources — useful when one thread stalls. It typically adds a modest amount of throughput, not double. Apple's cores and recent Intel desktop P-cores don't use SMT; AMD's Zen cores do.

**Hybrid** designs (Apple since M1, Intel since 12th-gen Core, many Arm phone chips) pair performance cores with efficiency cores. Efficiency cores do less per cycle but use far less power and area, so several of them add multi-threaded throughput efficiently and handle background work without waking big cores. The OS scheduler — guided on Apple by app-declared QoS classes and on Intel by Thread Director hints — decides placement.

**Amdahl's law** limits the benefit of more cores: if 30% of a task is serial, no number of cores can make it more than ~3.3× faster.`,
        deep: `Scheduling across heterogeneous cores is hard: the OS must predict whether a thread is latency-critical, whether migrating it is worth the cache warm-up cost, and how placement interacts with power and thermal limits. Misplacement shows up as stutter (a game thread landing on an E-core) or wasted battery (background work on P-cores).

AMD's alternative approach on some mobile chips uses **compact "c" cores** (e.g. Zen 5c): the same microarchitecture and ISA features as full cores, physically denser and clocked lower. Because the cores are architecturally identical, scheduling is simpler — the difference is mainly frequency and cache.

Core counts across vendors are therefore not directly comparable either: "16 cores" might mean 16 identical SMT cores, or 8 P + 8 E cores of very different capability.`,
      },
      interactive: "hybrid-scheduler",
    },
    {
      id: "vcache",
      title: "Cache — and why AMD stacks more of it",
      body: {
        simple: `A trip to RAM takes hundreds of CPU ticks, so CPUs keep copies of recently used data in small, fast memories called **caches**: L1 (tiny, fastest), L2, and L3 (biggest, shared).

AMD's **X3D** chips stack an extra layer of cache on the processor. Some games run noticeably faster because their important data suddenly fits in cache. But many apps don't benefit, because their data either already fit or is too big or used only once.`,
        technical: `Cache helps when a workload re-uses a **working set** that fits. Games often repeatedly touch large, scattered world state (entities, physics, AI, draw lists) — exactly the pattern where tripling L3 from 32 MB to 96 MB turns many DRAM misses into L3 hits. Rendering, video encoding and many compute tasks stream through data once, so prefetchers already hide latency and extra cache adds little.

The **3D V-Cache** die is bonded directly to the compute die with through-silicon vias. Earlier generations stacked it on top, which hindered heat removal and led to lower clock and voltage limits; newer generations place it beneath the compute die so the cores sit nearer the cooler.`,
        deep: `Two subtleties:

- **GPU-bound vs CPU-bound.** At high resolutions the GPU usually limits frame rate, hiding CPU differences. X3D advantages show most at lower resolutions or high frame-rate targets, and in simulation-heavy games.
- **Topology.** On multi-die desktop parts, cache attached to one compute die is local to that die's cores; the OS and game must keep latency-sensitive threads there to benefit, which is a scheduling problem in its own right.

More broadly: last-level cache size is a lever every vendor pulls differently — Apple's large shared L2s and system-level cache, Intel's L3 slices, AMD's per-die L3 plus V-Cache, and GPUs' growing L2/Infinity Cache. Compare effects on your workload, not megabyte totals.`,
      },
      interactive: "vcache",
    },
    {
      id: "arm-x86",
      title: "ARM vs x86, without the slogans",
      body: {
        simple: `Apple's Macs use **ARM**-based chips; Intel and AMD make **x86** chips. You'll hear "ARM is efficient, x86 is powerful." That's a slogan, not a rule.

The instruction set is like the language a CPU speaks. How fast and efficient a chip is depends far more on how it's built, how much power it's allowed, how it was manufactured, and how well the software is optimised for it.`,
        technical: `x86-64 has variable-length instructions (1–15 bytes) and decades of backward compatibility; ARM64 uses fixed 4-byte instructions and a cleaner register model. Fixed-length decoding makes very wide front ends simpler, which is one reason wide ARM cores emerged. But x86 designs use micro-op caches and predecode to sustain wide issue, and both translate to internal µops.

Performance and efficiency are dominated by: **microarchitecture**, **process node**, **power budget and clocks**, **cache hierarchy**, **memory system**, **SoC integration**, and **software/compiler maturity**. Apple's laptop efficiency comes from all of these together, not from ARM alone; ARM server chips and low-power x86 laptop chips show that both ISAs span wide ranges.`,
        deep: `Studies that hold other factors constant generally find the ISA's direct contribution to power and performance is small relative to microarchitecture and implementation choices. Where ISA does matter: decode complexity and its power at very wide issue; memory-ordering models (x86's stronger ordering vs ARM's weaker one, which matters for emulation — Apple added a hardware TSO mode to help Rosetta 2); and ecosystem — which binaries, drivers, games, anti-cheat systems and SIMD-optimised libraries exist natively.

For buyers, the practical ARM-vs-x86 question is usually **software compatibility**, not speed: do your apps, games, plug-ins and tools run natively?`,
      },
      interactive: "arm-vs-x86",
      callout: {
        tone: "myth",
        title: "Two myths at once",
        text: "“ARM is always slower than x86” and “ARM is always more efficient than x86” are both false. Specific chips win specific comparisons, for reasons mostly unrelated to the instruction set.",
      },
    },
    {
      id: "power",
      title: "Power, heat and the memory controller",
      body: {
        simple: `Every operation uses electricity and makes heat. A CPU can only run as fast as its cooling and power limits allow — that's why the same chip can be slower in a thin laptop than in a desktop.

The CPU also contains the **memory controller**, the part that talks to RAM. How many memory channels it has, and how fast, decides how quickly data can reach the cores.`,
        technical: `Chips are given **power limits** (Intel: PL1/PL2, "base" and "turbo" power; AMD: PPT/TDP; laptops: OEM-configured). Within those limits, boost algorithms raise clocks until they hit power, current or temperature ceilings. **Thermal throttling** reduces clocks when cooling can't keep up.

The **integrated memory controller** defines memory type (DDR5, LPDDR5X), channel count and bus width — and therefore peak bandwidth. Desktop sockets typically offer two 64-bit DDR5 channels (~80–100 GB/s); workstation/server sockets offer many more; SoCs with on-package LPDDR use much wider buses (see the [RAM lesson](/learn/ram)).`,
        deep: `Efficiency curves are steep: running a core at, say, 70% of its maximum frequency can use well under half the power. That's why laptops at 25 W can deliver a large fraction of a desktop chip's single-threaded performance but fall far behind in sustained multi-threaded work, and why "performance per watt" must always be quoted at a specified power level — see [Performance per watt](/efficiency).

Packaging is increasingly part of the CPU story: AMD's chiplets (compute dies plus an I/O die joined by Infinity Fabric), Intel's tiles connected through Foveros and EMIB packaging, and Apple's monolithic SoCs (and die-to-die "Ultra" fusion) each trade cost, yield, latency and power differently.`,
      },
    },
  ],
  quiz: {
    id: "q-cpu",
    questions: [
      {
        id: "q1",
        prompt: "Two CPUs both run at 5 GHz. What determines which is faster on a given task?",
        choices: ["Nothing — same GHz means same speed", "Mainly IPC on that task, plus cores the task can use", "The brand", "The amount of RAM installed"],
        answer: 1,
        explain: "Single-thread performance ≈ IPC × clock. At equal clocks, IPC (which depends on design and workload) decides; for parallel tasks, usable cores matter too.",
      },
      {
        id: "q2",
        prompt: "What happens when a branch is mispredicted?",
        choices: ["The program crashes", "Instructions fetched after it are flushed and the pipeline refills", "The CPU asks the OS for help", "Nothing; the guess is always corrected for free"],
        answer: 1,
        explain: "Speculatively fetched work is discarded, costing many cycles — more on wider, deeper cores.",
      },
      {
        id: "q3",
        prompt: "Why do chips include efficiency cores?",
        choices: ["They are faster than performance cores", "They provide multi-threaded throughput and background capacity at much lower power and area", "To run a different instruction set", "Only for marketing core counts"],
        answer: 1,
        explain: "E-cores do less per cycle but use far less power and silicon, so they handle background work cheaply and add throughput for parallel jobs.",
      },
      {
        id: "q4",
        prompt: "Which workload is MOST likely to benefit from AMD's 3D V-Cache?",
        choices: ["Exporting a long video", "A game with large, randomly accessed world state at 1080p", "Copying files", "A GPU-bound 4K game"],
        answer: 1,
        explain: "Extra L3 helps when a re-used working set fits in 96 MB but not 32 MB — common in games when the CPU is the limit. Streaming workloads and GPU-bound scenarios see little change.",
      },
      {
        id: "q5",
        prompt: "What usually matters most when deciding between an ARM Mac and an x86 PC?",
        choices: ["ARM is always slower", "x86 is always less efficient", "Whether your software runs natively and well on each", "The number of letters in the ISA name"],
        answer: 2,
        explain: "Speed and efficiency depend mostly on the specific chip; compatibility with your apps, games and tools is the practical ISA question.",
      },
    ],
  },
  misconceptions: ["ghz-faster", "more-cores-faster", "arm-slower", "arm-efficient"],
  related: ["/parallel", "/efficiency", "memory-hierarchy", "amd", "intel", "apple-silicon"],
};

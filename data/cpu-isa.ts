/** Content for the ARM vs x86 explainer. Qualitative by design — there is no honest single number for "how much the ISA matters". */

export interface IsaFactor {
  id: string;
  name: string;
  isaRelated: "yes" | "partly" | "no";
  what: string;
}

export const ISA_FACTORS: IsaFactor[] = [
  { id: "isa", name: "Instruction set (ARM64 vs x86-64)", isaRelated: "yes", what: "The vocabulary software is compiled into. Affects decoder complexity and some code density, but modern cores of both kinds translate instructions into internal micro-operations anyway." },
  { id: "uarch", name: "Microarchitecture", isaRelated: "no", what: "How the core is built: how many instructions it can track in flight, how many execution units it has, how it schedules them. Two chips with the same ISA can differ by 2× here." },
  { id: "width", name: "Execution width", isaRelated: "partly", what: "How many instructions can be decoded and executed per cycle. Fixed-length ARM instructions make very wide decoders somewhat easier; x86 designs use micro-op caches to keep up." },
  { id: "bp", name: "Branch prediction", isaRelated: "no", what: "Guessing which way code will go. Better predictors keep wide pipelines fed and waste less work on flushes." },
  { id: "cache", name: "Cache sizes & latency", isaRelated: "no", what: "How often the core waits for memory. Large, fast caches (or stacked cache) can matter more than anything else for some workloads." },
  { id: "node", name: "Process technology", isaRelated: "no", what: "The manufacturing node (e.g. TSMC N3 vs N4, Intel 18A). Newer nodes give more transistors and less power per operation — a big part of any generation's efficiency gain." },
  { id: "power", name: "Power budget & clocks", isaRelated: "no", what: "A chip designed for 20 W makes different choices from one designed for 250 W. Pushing clocks higher costs power super-linearly." },
  { id: "memory", name: "Memory system", isaRelated: "no", what: "Memory bandwidth, latency and how close DRAM sits to the chip (on-package vs DIMMs)." },
  { id: "integration", name: "SoC integration", isaRelated: "no", what: "Which accelerators share the die and how data moves between them: GPU, NPU, media engines, unified memory." },
  { id: "compiler", name: "Compiler & software", isaRelated: "partly", what: "How well the code is optimised for a target: vector instructions used, libraries tuned, native vs translated (e.g. emulation layers)." },
  { id: "os", name: "OS scheduling & power management", isaRelated: "no", what: "How aggressively the OS parks cores, picks P- or E-cores, and ramps clocks." },
  { id: "workload", name: "The workload itself", isaRelated: "no", what: "Branchy code, pointer chasing, vector math, or I/O-bound tasks reward different parts of a design." },
];

export interface IsaScenario {
  id: string;
  label: string;
  dominant: string[];
  why: string;
}

export const ISA_SCENARIOS: IsaScenario[] = [
  {
    id: "laptop",
    label: "Thin laptop on battery",
    dominant: ["power", "node", "integration", "os", "uarch"],
    why: "Battery life is mostly decided by how little power the chip burns while idle or lightly loaded and how efficiently it runs at modest clocks. Process node, power management, SoC integration and core design dominate. ARM laptops have often led here — but x86 laptop chips designed around low power (rather than desktop parts scaled down) have narrowed the gap considerably.",
  },
  {
    id: "gaming",
    label: "Desktop gaming",
    dominant: ["cache", "uarch", "bp", "power", "compiler", "workload"],
    why: "Games are latency-sensitive and branchy, with large working sets. Cache (see 3D V-Cache), branch prediction and high clocks matter most — plus whether the game is native to the platform at all. Software availability, not ISA efficiency, is the biggest reason gaming PCs are x86.",
  },
  {
    id: "server",
    label: "Datacenter server",
    dominant: ["power", "memory", "node", "uarch", "compiler"],
    why: "Throughput per watt and per rack, memory bandwidth and core count dominate. ARM server chips and x86 server chips both compete well; the choice is often about software ecosystem, licensing and total cost.",
  },
  {
    id: "dev",
    label: "Compiling code",
    dominant: ["uarch", "cache", "memory", "workload", "os"],
    why: "Compilation is highly parallel and branchy, and benefits from many strong cores, good caches and fast storage. Whether you use x86 or ARM matters far less than how many good cores you have and how well they're fed.",
  },
];

/** Example machine code. Encodings are real x86-64 and AArch64 encodings of these instructions. */
export const X86_BYTES: { asm: string; bytes: string[] }[] = [
  { asm: "mov rbx, rax", bytes: ["48", "89", "C3"] },
  { asm: "add rax, 1", bytes: ["48", "83", "C0", "01"] },
  { asm: "nop (5-byte)", bytes: ["0F", "1F", "44", "00", "00"] },
  { asm: "ret", bytes: ["C3"] },
];

export const ARM_BYTES: { asm: string; bytes: string[] }[] = [
  { asm: "mov x19, x0", bytes: ["F3", "03", "00", "AA"] },
  { asm: "add x0, x0, #1", bytes: ["00", "04", "00", "91"] },
  { asm: "nop", bytes: ["1F", "20", "03", "D5"] },
  { asm: "ret", bytes: ["C0", "03", "5F", "D6"] },
];

import type { Lesson } from "@/data/schema";

export const lesson: Lesson = {
  slug: "run-a-program",
  number: 1,
  title: "What happens when you run a program?",
  subtitle: "Follow one double-click from your mouse to the pixels on screen — and meet every part of the computer along the way.",
  kind: "software",
  minutes: 9,
  sections: [
    {
      id: "instructions",
      title: "A program is a very long list of tiny instructions",
      body: {
        simple: `A program — a browser, a game, a spreadsheet — is ultimately a file full of extremely simple instructions: **add these two numbers**, **copy this value from memory**, **if this number is zero, jump over there**. Each one does almost nothing. A computer feels powerful because it performs billions of them every second.

Running a program means getting those instructions and the data they work on from where they are stored (your SSD) to where they can be executed (the CPU), and getting the results back out to you — usually as pixels on a screen.`,
        technical: `A compiled program is **machine code**: binary-encoded instructions for a specific **instruction set architecture (ISA)** such as x86-64 (Intel and AMD) or ARM64 (Apple Silicon, most phones, many servers). An instruction typically names an operation and its operands — registers, an immediate value, or a memory address.

The executable file also contains data (strings, constants), a list of the shared libraries it depends on, and metadata telling the operating system's **loader** how to map it into memory. Interpreted and JIT-compiled languages (Python, JavaScript, Java) add a layer: a runtime that is itself machine code reads your program and either interprets it or compiles it to machine code on the fly.

Either way, the hardware only ever executes machine code for its own ISA. That is why an app built for x86 cannot run natively on an ARM chip without being recompiled or translated (Apple's Rosetta 2 and Windows on ARM's emulation layers do this translation).`,
        deep: `Modern cores don't execute ISA instructions directly. The front end **fetches** bytes, **decodes** them, and — on both x86 and ARM designs — breaks them into internal **micro-operations (µops)**. A large out-of-order back end then renames registers, schedules µops whenever their inputs are ready, executes them on many parallel units, and **retires** results in original program order so software sees the sequential semantics it expects.

That gap between the programmer's model ("one instruction after another") and the hardware's reality ("hundreds of instructions in flight, speculatively, out of order") is where most CPU performance comes from — and also where vulnerability classes like Spectre came from.

The ISA is a contract, not an implementation. Apple, AMD, Intel, Qualcomm and others build very different machines behind similar contracts. Keep that in mind whenever someone attributes a performance difference purely to "ARM vs x86" — see [the CPU lesson](/learn/cpu#arm-x86).`,
      },
    },
    {
      id: "launch",
      title: "From double-click to pixels",
      body: {
        simple: `When you open an app, many parts of the computer cooperate in sequence. The **operating system** is the manager: it decides what runs where. The **SSD** holds the app's files. **RAM** holds whatever is in use right now. The **CPU** runs the instructions. The **GPU** draws what you see.

Step through the launch below. Then switch to **Apple Silicon** and watch step 7: the GPU reads directly from the same memory the CPU used, instead of needing its own copy.`,
        technical: `The sequence is roughly: input interrupt → shell asks the kernel to create a process → the loader maps the executable and its shared libraries → **demand paging** pulls code and data from storage into RAM as it is touched → the CPU fetches and executes through its cache hierarchy → **system calls** request OS services → the app's UI framework submits GPU command buffers → a **compositor** blends windows → the display controller scans out the frame.

Notice how much of this is about **moving data** rather than computing. The SSD copies pages into RAM via **DMA** (direct memory access); caches move lines from RAM to the core; on a discrete-GPU PC, textures cross **PCIe** into VRAM.`,
        deep: `Two details explain a lot of real-world behaviour:

- **The page cache.** The OS keeps recently read file data in otherwise unused RAM. A second launch of the same app often reads almost nothing from the SSD. This is a big reason "unused RAM is wasted RAM" — and why measured "free memory" on a healthy system looks low.
- **Cold vs warm micro-architectural state.** On first execution, instruction caches, TLBs (address-translation caches) and branch predictors are empty for this code. Start-up paths therefore run at a fraction of the IPC the same core achieves in a warmed-up loop. Benchmarks that run a task once and benchmarks that loop it can rank chips differently.

On a discrete GPU, resources are typically created in system memory and uploaded, or written to a CPU-visible staging buffer and copied by the GPU's DMA engines over PCIe. Technologies like Resizable BAR widen the CPU's window into VRAM but don't remove the PCIe hop. On unified-memory designs, the same physical pages can be mapped by both CPU and GPU.`,
      },
      interactive: "program-launch",
    },
    {
      id: "layers",
      title: "Hardware alone doesn't run anything",
      body: {
        simple: `Between your app and the chips there are layers of software: the **operating system** (macOS, Windows, Linux), **drivers** that know how to talk to each piece of hardware, and **frameworks** that apps use to draw, play sound or run AI models.

This matters when buying: a fast chip with poor drivers or no support from the software you use can be slower in practice than a "weaker" chip with excellent software support.`,
        technical: `A typical stack: **hardware → firmware → OS kernel → drivers → system APIs (graphics, compute, media) → frameworks/engines → application**. Graphics APIs include DirectX 12 and Vulkan (Windows/Linux) and Metal (Apple). Compute stacks include CUDA (NVIDIA), ROCm/HIP (AMD), oneAPI (Intel) and Metal (Apple).

Each layer can make or break performance. A game engine may have a heavily tuned DirectX path and a less mature Metal path; a machine-learning framework may ship optimised kernels for one vendor's GPUs first. See [AI compute & software](/ai) for why this matters so much for AI.`,
        deep: `The OS is also the arbiter of shared resources: it schedules threads onto cores (including choosing between performance and efficiency cores — see [the CPU lesson](/learn/cpu#cores)), manages virtual memory and decides when to compress or swap pages, sets CPU/GPU power states, and enforces isolation between processes.

This is why identical hardware can behave differently across operating systems, OS versions, driver versions and power plans. When comparing systems, it's worth asking "measured under what software?" as often as "with what hardware?".`,
      },
      callout: {
        tone: "info",
        title: "A useful mental model",
        text: "Every workload is some mix of compute (doing operations), memory (holding data), data movement (getting data to the compute) and software (deciding how it all happens). Most of this site is about how different computers balance those four.",
      },
    },
    {
      id: "same-program",
      title: "Same program, different computers",
      body: {
        simple: `Run the same app on a gaming PC and on a MacBook and the steps are similar, but the **route the data takes** differs. A PC with a graphics card has two separate memories — one for the CPU, one for the GPU — connected by a cable-like link called PCIe. A Mac with Apple Silicon has one shared memory for everything.

Neither is simply "better". Each design makes some things easier and others harder. The [Run a Program](/run) tool lets you run games, video exports and AI models on different architectures and watch where the data goes.`,
        technical: `Architectural differences that change the route:

- **Memory model:** discrete (system RAM + VRAM over PCIe) vs unified (one pool) vs integrated-shared (an integrated GPU borrowing part of system RAM).
- **Specialised engines:** media encoders/decoders, neural processing units, tensor/matrix units — present on most modern chips, but with different capabilities and software access.
- **Power budget:** a 30 W laptop chip and a 600 W desktop GPU make different tradeoffs even when running identical code.

These differences are why [Platform Explorer](/platforms) presents whole systems, not single parts.`,
        deep: `It helps to ask four questions of any workload on any machine:

- **Where do the bytes live?** On SSD, in system RAM, in VRAM, in unified memory — and do they fit?
- **How do they move?** Over which links, how often, with what bandwidth and latency?
- **What computes on them?** Scalar CPU cores, SIMD units, GPU shader cores, matrix engines, an NPU, a fixed-function media block?
- **What software chooses all of the above?** Driver, API, framework, and how well each is optimised for this hardware.

The rest of the curriculum gives you the vocabulary to answer each one. [Bottleneck Lab](/bottleneck-lab) puts the questions together.`,
      },
    },
  ],
  quiz: {
    id: "q-run",
    questions: [
      {
        id: "q1",
        prompt: "When you launch an app, how does its code typically get from the SSD into RAM?",
        choices: ["The CPU copies every byte before running anything", "Pages are loaded on demand when first touched (page faults), via DMA", "The GPU streams it", "It runs directly from the SSD"],
        answer: 1,
        explain: "The loader maps the file; pages come into RAM on demand when touched, copied by the SSD controller using DMA. Code never executes directly from the SSD.",
      },
      {
        id: "q2",
        prompt: "Why is the second launch of an app often noticeably faster?",
        choices: ["The CPU overclocks itself", "Much of the app is still in the OS page cache in RAM", "The SSD remembers it in its own CPU", "Apps run in a simpler mode the second time"],
        answer: 1,
        explain: "The OS keeps recently read file data in spare RAM. A second launch reads much less from storage, and RAM is roughly a thousand times faster than an SSD.",
      },
      {
        id: "q3",
        prompt: "On a PC with a discrete GPU, what must happen before the GPU can use an image the CPU loaded?",
        choices: ["Nothing — they share memory", "The image is typically uploaded across PCIe into VRAM", "The image must be saved to the SSD first", "The display controller converts it"],
        answer: 1,
        explain: "A discrete GPU has its own VRAM. Data it needs repeatedly is uploaded over PCIe. On unified-memory designs the GPU can read the same memory the CPU wrote.",
      },
      {
        id: "q4",
        prompt: "Which statement about machine code is true?",
        choices: ["Any CPU can run any program's machine code", "Machine code targets a specific instruction set, like x86-64 or ARM64", "Only GPUs run machine code", "Machine code is the same as Python"],
        answer: 1,
        explain: "Machine code is encoded for a particular ISA. Running x86 apps on an ARM chip requires recompiling or translation (e.g. Rosetta 2).",
      },
    ],
  },
  misconceptions: ["more-ram-faster", "ghz-faster", "unified-same-as-ram"],
  related: ["/run", "/platforms", "cpu", "memory-hierarchy", "/memory"],
};

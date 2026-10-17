import type { CompanyId } from "@/data/schema";

/**
 * Workload fit: WHY a platform may suit a workload, plus caveats.
 * Never "company X wins". Each entry is editable data; keep reasons concrete and checkable.
 */

export interface FitEntry {
  platform: CompanyId;
  reasons: string[];
  caveats: string[];
}

export interface FitWorkload {
  id: string;
  name: string;
  summary: string;
  dependsOn: string[];
  fits: FitEntry[];
  /** One-line rule of thumb. */
  bottomLine: string;
}

export const FIT_PLATFORM_LABEL: Record<CompanyId, string> = {
  apple: "Apple Silicon Mac",
  nvidia: "PC with NVIDIA GPU",
  amd: "AMD (Ryzen CPU / Radeon GPU)",
  intel: "Intel (Core CPU / Arc GPU)",
};

export const FIT_WORKLOADS: FitWorkload[] = [
  {
    id: "gaming",
    name: "Gaming",
    summary: "Real-time rendering at high frame rates, on top of a game engine that also simulates the world on the CPU.",
    dependsOn: ["GPU performance", "CPU single-thread & cache", "Drivers", "Graphics API support", "Game optimisation", "VRAM", "Ray tracing", "Upscaling"],
    fits: [
      {
        platform: "nvidia",
        reasons: ["Broad Windows game compatibility and mature drivers.", "Strong ray-tracing hardware; DLSS integrated in many titles.", "Widest range of GPU tiers, from entry to flagship."],
        caveats: ["Lower tiers can be VRAM-limited in recent games.", "Laptop variants have much lower power limits than desktop cards with the same name."],
      },
      {
        platform: "amd",
        reasons: ["Radeon GPUs are competitive in rasterised performance per price in many segments; FSR is widely integrated.", "Ryzen X3D CPUs' extra cache can significantly lift frame rates in cache-sensitive games.", "AMD GPUs power current consoles, so many engines are well tuned for the architecture family."],
        caveats: ["Ray-tracing performance has historically trailed NVIDIA at similar tiers, narrowing in newer generations.", "Upscaler feature availability varies by game and GPU generation."],
      },
      {
        platform: "intel",
        reasons: ["Arc GPUs target value segments with useful VRAM amounts and XeSS support.", "Core CPUs offer strong single-thread performance for game logic."],
        caveats: ["No current high-end Arc tier.", "Driver consistency in older DirectX titles has historically lagged, improving over time."],
      },
      {
        platform: "apple",
        reasons: ["A growing set of native Metal titles; MetalFX upscaling where integrated.", "Consistent performance unplugged on laptops."],
        caveats: ["Much smaller native game library; many Windows games need translation layers or don't run (notably some anti-cheat titles).", "GPU tiers are tied to the chip you buy and can't be upgraded."],
      },
    ],
    bottomLine: "For broad game compatibility, a Windows PC with a discrete GPU is the conventional choice; the GPU tier should match your resolution.",
  },
  {
    id: "blender",
    name: "Blender",
    summary: "Modelling, animation and Cycles/EEVEE rendering. Final renders are dominated by the GPU path tracer.",
    dependsOn: ["GPU compute & ray tracing", "GPU-accessible memory (scene size)", "Render backend support", "CPU for simulation/modifiers"],
    fits: [
      { platform: "nvidia", reasons: ["Cycles' OptiX backend uses RT cores; long the most mature and fastest path.", "CUDA is supported by many add-ons and other renderers."], caveats: ["Complex scenes can exceed consumer VRAM."] },
      { platform: "amd", reasons: ["Cycles supports HIP (and HIP RT) on supported Radeon GPUs.", "High-core-count Ryzen CPUs help simulations and CPU rendering."], caveats: ["Check that your GPU is supported by the current HIP backend."] },
      { platform: "intel", reasons: ["Cycles supports Arc GPUs via oneAPI."], caveats: ["Fewer high-tier GPU options."] },
      { platform: "apple", reasons: ["Cycles' Metal backend, with hardware ray tracing on newer M-series GPUs.", "Large unified memory can hold scenes too big for consumer VRAM."], caveats: ["Peak render throughput generally below high-end discrete GPUs."] },
    ],
    bottomLine: "Match render backend support and GPU memory to your scenes; ray-tracing hardware matters for Cycles.",
  },
  {
    id: "rendering3d",
    name: "3D rendering, CAD & game development",
    summary: "Production renderers, CAD packages and game engines each have their own hardware and OS requirements.",
    dependsOn: ["Application & OS support", "GPU tier & VRAM", "CPU cores (CPU renderers, compiling shaders/builds)", "Certified drivers (some CAD)"],
    fits: [
      { platform: "nvidia", reasons: ["Several production renderers are CUDA/OptiX-first or CUDA-only.", "Professional (workstation) driver and card options."], caveats: ["Workstation cards carry a large price premium."] },
      { platform: "amd", reasons: ["High-core-count CPUs (Ryzen, Threadripper) suit CPU renderers and engine builds."], caveats: ["Some GPU renderers don't support Radeon."] },
      { platform: "intel", reasons: ["Widely validated CPU platform for CAD software."], caveats: ["Check renderer support for Arc GPUs."] },
      { platform: "apple", reasons: ["Strong for apps with native Metal support; required for Apple-platform development."], caveats: ["Many CAD and engineering apps are Windows-only."] },
    ],
    bottomLine: "Start from your application's supported-hardware list, then size GPU memory and cores.",
  },
  {
    id: "video",
    name: "Video editing",
    summary: "Decoding multiple streams, applying effects and grading, then encoding exports.",
    dependsOn: ["Hardware codec support for your footage", "Media engines", "GPU for effects", "CPU cores", "Fast storage", "Memory capacity"],
    fits: [
      { platform: "apple", reasons: ["Media engines with hardware ProRes support are tightly integrated with Final Cut Pro, DaVinci Resolve and Premiere.", "Good performance on battery in laptops."], caveats: ["Some codecs/bit depths may still fall back to software.", "Storage and memory fixed at purchase — buy enough for footage and caches."] },
      { platform: "nvidia", reasons: ["NVENC/NVDEC and CUDA-accelerated effects are widely supported.", "Strong GPU effects performance in Resolve."], caveats: ["Some 4:2:2 10-bit formats have only recently gained hardware decode support; check your GPU generation."] },
      { platform: "intel", reasons: ["Quick Sync is widely supported for decode/encode, including many 10-bit formats.", "Useful even alongside a discrete GPU."], caveats: ["Effects performance depends on the GPU you pair it with."] },
      { platform: "amd", reasons: ["Multi-core Ryzen CPUs help exports and software decode.", "Radeon hardware encode/decode is supported by major editors."], caveats: ["Effect acceleration support varies by application."] },
    ],
    bottomLine: "Check which codecs your camera records and whether they're hardware-decoded on the platform.",
  },
  {
    id: "programming",
    name: "Programming",
    summary: "Editors, browsers, containers, compilers and test suites — mostly CPU, memory and storage.",
    dependsOn: ["CPU multi-core (builds)", "CPU single-thread (responsiveness)", "RAM capacity", "SSD", "OS & toolchain fit", "Battery (laptops)"],
    fits: [
      { platform: "apple", reasons: ["Unix-based macOS, long battery life with sustained performance.", "Required for iOS/macOS development."], caveats: ["x86-only containers or tools need emulation.", "RAM is fixed — containers and IDEs grow."] },
      { platform: "amd", reasons: ["High core counts for large builds; strong Linux support.", "Upgradeable RAM on desktops."], caveats: ["Laptop battery life varies widely by model."] },
      { platform: "intel", reasons: ["Broadly compatible x86 platform; strong single-thread performance.", "Modern laptop chips have improved efficiency."], caveats: ["Hybrid cores rely on OS scheduling; most toolchains handle it well."] },
      { platform: "nvidia", reasons: ["Essential if you develop CUDA software or GPU-accelerated apps."], caveats: ["For general programming the GPU matters little; NVIDIA doesn't make the CPU in typical PCs."] },
    ],
    bottomLine: "Prioritise RAM, CPU cores and the operating system your target platform needs.",
  },
  {
    id: "ai-inference",
    name: "AI inference (local LLMs, image generation)",
    summary: "Running trained models. Fitting the model in GPU-accessible memory comes first; bandwidth then governs speed.",
    dependsOn: ["GPU-accessible memory capacity", "Memory bandwidth", "Framework support", "Matrix compute (prompt processing)"],
    fits: [
      { platform: "nvidia", reasons: ["Every major inference engine targets CUDA first.", "High-end cards pair Tensor Cores with very high memory bandwidth."], caveats: ["Consumer VRAM caps model size (larger models need multiple GPUs or offloading)."] },
      { platform: "apple", reasons: ["Large unified memory configurations can hold models far beyond consumer VRAM.", "MLX and llama.cpp's Metal backend are well optimised."], caveats: ["Bandwidth and compute generally below high-end NVIDIA cards, so fitting ≠ fast.", "Large memory configurations are expensive and fixed."] },
      { platform: "amd", reasons: ["Radeon cards can offer good VRAM per price; ROCm and Vulkan backends work in popular tools.", "Large-memory APUs (Ryzen AI Max-class) can hold bigger models."], caveats: ["Check ROCm support for your exact GPU and OS."] },
      { platform: "intel", reasons: ["OpenVINO, oneAPI and Vulkan backends support Arc GPUs and NPUs.", "Value-tier Arc cards with useful VRAM."], caveats: ["Fewer tools target Intel first; performance varies by backend."] },
    ],
    bottomLine: "Size memory to the model first, then compare bandwidth and software support.",
  },
  {
    id: "ai-training",
    name: "AI training",
    summary: "Training or fine-tuning models needs memory for weights, gradients, optimiser state and activations, plus massive matrix throughput.",
    dependsOn: ["Matrix throughput", "GPU memory capacity", "Software ecosystem (CUDA, ROCm…)", "Multi-GPU interconnect", "Memory bandwidth"],
    fits: [
      { platform: "nvidia", reasons: ["CUDA, cuDNN and NCCL are the default targets for PyTorch, JAX and research code.", "Most tutorials, papers and libraries assume it."], caveats: ["Consumer VRAM limits model size; datacenter GPUs are expensive."] },
      { platform: "amd", reasons: ["PyTorch supports ROCm on supported GPUs; Instinct accelerators are used in large deployments.", "Radeon VRAM per price can help fine-tuning."], caveats: ["Some custom CUDA kernels and libraries need porting (HIP) or alternatives."] },
      { platform: "apple", reasons: ["PyTorch MPS and MLX support training and fine-tuning, with large unified memory available.", "Convenient for experimentation on a laptop."], caveats: ["Throughput generally below high-end NVIDIA GPUs; no CUDA-only libraries; limited multi-machine scaling."] },
      { platform: "intel", reasons: ["PyTorch XPU backend and oneAPI support Arc and datacenter GPUs."], caveats: ["Younger ecosystem; fewer projects test on it."] },
    ],
    bottomLine: "Software compatibility dominates. Confirm your exact training stack runs before buying.",
  },
  {
    id: "music",
    name: "Music production",
    summary: "Real-time audio processing with low, consistent latency: plugins, virtual instruments and sample libraries.",
    dependsOn: ["CPU single-thread & real-time consistency", "RAM (sample libraries)", "Audio driver quality", "Plugin & DAW OS support", "Quiet cooling"],
    fits: [
      { platform: "apple", reasons: ["Core Audio provides low-latency audio without third-party drivers; quiet, efficient laptops.", "Logic Pro is Mac-only."], caveats: ["Check plugins run natively on Apple Silicon."] },
      { platform: "amd", reasons: ["Strong multi-core performance for large projects; upgradeable RAM on desktops."], caveats: ["Audio latency depends on interface drivers (ASIO) on Windows."] },
      { platform: "intel", reasons: ["Widely validated by DAW and plugin vendors."], caveats: ["Hybrid core scheduling occasionally needs DAW updates/settings."] },
      { platform: "nvidia", reasons: ["GPU is mostly irrelevant for audio work."], caveats: ["A loud high-power GPU can add noise in a studio."] },
    ],
    bottomLine: "Prioritise CPU real-time performance, RAM for samples, quiet cooling, and DAW/plugin support.",
  },
  {
    id: "battery",
    name: "Battery-powered laptop use",
    summary: "Getting real work done unplugged: efficiency at light and moderate loads, and performance that doesn't collapse off the charger.",
    dependsOn: ["Performance per watt", "Idle/light-load power", "Display power", "Battery capacity", "Hardware video decode", "OS power management"],
    fits: [
      { platform: "apple", reasons: ["Apple Silicon's performance per watt lets MacBooks sustain performance on battery with long runtimes."], caveats: ["The tradeoff is fixed configurations and macOS."] },
      { platform: "intel", reasons: ["Recent efficiency-focused Core Ultra laptop chips have improved battery life significantly."], caveats: ["Results vary heavily by laptop design and power settings."] },
      { platform: "amd", reasons: ["Ryzen laptop chips offer strong efficiency in many designs."], caveats: ["Battery life depends on the laptop's display, battery size and tuning."] },
      { platform: "nvidia", reasons: ["Switchable graphics lets laptops power down the discrete GPU for light tasks."], caveats: ["Gaming or GPU work on battery drains quickly and often runs at reduced performance."] },
    ],
    bottomLine: "Look for independent battery tests of the exact laptop under work like yours.",
  },
  {
    id: "scientific",
    name: "Scientific computing",
    summary: "Simulations, data analysis and numerical methods — often double-precision (FP64) and memory-bandwidth-bound.",
    dependsOn: ["FP64 throughput (if needed)", "Memory bandwidth & capacity", "Library support (BLAS, CUDA, MPI)", "CPU cores & vector units"],
    fits: [
      { platform: "nvidia", reasons: ["CUDA libraries (cuBLAS, cuFFT, cuSPARSE) and broad scientific-code support.", "Datacenter GPUs offer strong FP64."], caveats: ["Consumer GeForce cards have much lower FP64 rates than datacenter parts."] },
      { platform: "amd", reasons: ["EPYC/Threadripper CPUs with many cores and memory channels; Instinct GPUs power major supercomputers.", "ROCm supports many HPC libraries."], caveats: ["Consumer Radeon FP64 is also limited."] },
      { platform: "intel", reasons: ["Xeon CPUs with AVX-512/AMX, oneMKL and mature compilers."], caveats: ["Check whether your code benefits from those instruction sets."] },
      { platform: "apple", reasons: ["High memory bandwidth and capacity in a quiet desktop or laptop; Accelerate framework for linear algebra."], caveats: ["Apple GPUs don't offer high FP64 throughput; many HPC codes target Linux clusters."] },
    ],
    bottomLine: "Know your precision (FP64 vs FP32), whether you're bandwidth- or compute-bound, and which libraries you depend on.",
  },
];

/** What gaming depends on — used by the gaming deep-dive. */
export const GAMING_FACTORS: { t: string; d: string }[] = [
  { t: "GPU performance", d: "Draws every frame. Sets the ceiling at higher resolutions and settings." },
  { t: "CPU performance", d: "Runs game logic, physics, AI and draw-call submission. Sets the ceiling at high frame rates." },
  { t: "Drivers", d: "Translate the game's API calls for your GPU. Mature drivers mean fewer bugs and better per-game tuning." },
  { t: "API support", d: "Games target DirectX, Vulkan or Metal. Your OS and GPU must support the API natively or through translation." },
  { t: "Game optimisation", d: "Engines are tuned for particular hardware (often consoles, which use AMD GPUs). Some games favour certain architectures." },
  { t: "VRAM", d: "Holds textures and render targets. Running out causes stutter and texture pop-in, especially at 4K." },
  { t: "Memory bandwidth", d: "Feeds the GPU's shader units; matters more at higher resolutions. Large on-chip caches reduce the need." },
  { t: "Ray tracing", d: "Realistic lighting that is very expensive; dedicated RT hardware and denoisers make it feasible." },
  { t: "Upscaling & frame generation", d: "Render fewer pixels and reconstruct the rest; insert generated frames for smoother motion." },
];

export const UPSCALERS: { name: string; company: CompanyId; how: string; runsOn: string }[] = [
  { name: "DLSS", company: "nvidia", how: "Neural-network temporal upscaling; frame generation and ray reconstruction on newer versions.", runsOn: "NVIDIA RTX GPUs (Tensor Cores). Some features need newer generations." },
  { name: "FSR", company: "amd", how: "Earlier versions: hand-tuned temporal/spatial algorithms. FSR 4: machine-learning based.", runsOn: "Earlier versions run on many vendors' GPUs and consoles; FSR 4 targets newer Radeon GPUs." },
  { name: "XeSS", company: "intel", how: "Neural-network temporal upscaling, with frame generation in newer versions.", runsOn: "Best path on Intel XMX hardware; a fallback path runs on other GPUs." },
  { name: "MetalFX", company: "apple", how: "Spatial and temporal upscaling (plus frame interpolation in newer releases) via Metal.", runsOn: "Apple Silicon Macs (and other Apple devices) in games that integrate it." },
];

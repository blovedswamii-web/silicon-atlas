import type { CompanyId, SoftwareStack } from "@/data/schema";

/**
 * Hardware → driver → API → library → framework → application, per vendor.
 * Support details change quickly; the notes describe the shape of each ecosystem,
 * and readers should check each project's own support matrix before buying.
 */
export const SOFTWARE_STACKS: SoftwareStack[] = [
  // ------------------------------------------------------------------ AI
  {
    id: "nvidia-ai",
    company: "nvidia",
    domain: "ai",
    name: "CUDA ecosystem",
    layers: [
      {
        layer: "hardware",
        name: "GeForce RTX / RTX PRO / data-center GPUs",
        detail:
          "Streaming Multiprocessors with CUDA cores for general parallel math and Tensor Cores for matrix math. The same programming model spans a laptop GPU and a data-center accelerator.",
      },
      {
        layer: "driver",
        name: "NVIDIA driver (Windows, Linux)",
        detail:
          "Loads work onto the GPU, manages VRAM and exposes the CUDA driver API. On Linux the driver version also determines which CUDA versions you can run.",
      },
      {
        layer: "api",
        name: "CUDA",
        detail:
          "NVIDIA's proprietary compute platform (since 2007): a C++-based language, compiler (nvcc), runtime and tooling. Code written for CUDA runs only on NVIDIA GPUs.",
      },
      {
        layer: "library",
        name: "cuBLAS · cuDNN · NCCL · TensorRT",
        detail:
          "Hand-tuned building blocks: matrix multiply (cuBLAS), neural-network primitives (cuDNN), multi-GPU communication (NCCL) and an inference optimiser/compiler (TensorRT). Frameworks call these instead of writing kernels from scratch.",
      },
      {
        layer: "framework",
        name: "PyTorch · JAX · TensorFlow",
        detail:
          "CUDA is the default, most-tested backend for mainstream ML frameworks. New research code very often assumes it.",
      },
      {
        layer: "application",
        name: "Training scripts, vLLM, TensorRT-LLM, llama.cpp, ComfyUI…",
        detail:
          "Most open-source AI projects ship CUDA support first, and many ship it only. This breadth — not just raw hardware speed — is a large part of NVIDIA's position in AI.",
      },
    ],
    maturity: "The most mature and widely targeted AI software ecosystem, built up over nearly two decades.",
    notes: [
      "Consumer GeForce and professional cards run the same CUDA code; differences are mostly VRAM capacity, drivers and multi-GPU features.",
      "Lock-in cuts both ways: CUDA code does not run natively on other vendors' hardware, which is why portability layers (HIP, SYCL, Triton, ONNX) exist.",
    ],
  },
  {
    id: "apple-ai",
    company: "apple",
    domain: "ai",
    name: "Metal · MLX · Core ML",
    layers: [
      {
        layer: "hardware",
        name: "Apple SoC: GPU · Neural Engine · CPU",
        detail:
          "Three different engines can run ML work, all reading the same unified memory: the GPU (general parallel compute; M5-generation GPU cores add dedicated neural accelerators), the Neural Engine (efficient fixed-function-style inference, used mainly through Core ML) and the CPU (with matrix extensions, used through Accelerate).",
      },
      {
        layer: "driver",
        name: "macOS (built-in GPU driver)",
        detail:
          "There is no separate driver to install — the GPU driver ships with macOS, so OS version determines which Metal features are available.",
      },
      {
        layer: "api",
        name: "Metal",
        detail:
          "Apple's graphics and compute API. ML frameworks on the Mac ultimately submit Metal compute work to the GPU.",
      },
      {
        layer: "library",
        name: "Metal Performance Shaders (MPS / MPSGraph) · Accelerate",
        detail:
          "Optimised kernels for matrix math, convolutions and graphs on the GPU (MPS) and on the CPU (Accelerate/BNNS).",
      },
      {
        layer: "framework",
        name: "MLX · PyTorch (MPS backend) · Core ML",
        detail:
          "MLX is Apple's open-source array framework designed around unified memory. PyTorch can target the GPU through its MPS backend (coverage of operators has grown but is not identical to CUDA). Core ML is the deployment path that can schedule work onto the Neural Engine.",
      },
      {
        layer: "application",
        name: "mlx-lm, LM Studio, Ollama / llama.cpp (Metal), apps using Core ML",
        detail:
          "Local inference of large language models is well supported. Large-scale training and CUDA-only research code are the weaker spots.",
      },
    ],
    maturity: "Strong for local inference and on-device ML; a smaller ecosystem than CUDA for research and training.",
    notes: [
      "The Neural Engine is not directly programmable like a GPU — developers reach it through Core ML, which decides what runs where.",
      "Unified memory lets large models be loaded without a separate VRAM limit, but throughput depends on the chip's memory bandwidth and GPU size.",
    ],
  },
  {
    id: "amd-ai",
    company: "amd",
    domain: "ai",
    name: "ROCm ecosystem",
    layers: [
      {
        layer: "hardware",
        name: "Instinct (CDNA) · Radeon (RDNA) · Ryzen AI (XDNA NPU)",
        detail:
          "AMD builds two GPU architecture lines: CDNA for data-center Instinct accelerators (matrix cores, huge HBM capacity) and RDNA for Radeon graphics cards (with AI accelerators since RDNA 3). Ryzen AI laptop chips also include an XDNA NPU.",
      },
      {
        layer: "driver",
        name: "amdgpu (Linux) · Adrenalin (Windows)",
        detail: "Kernel driver plus user-space runtime. ROCm historically targeted Linux first.",
      },
      {
        layer: "api",
        name: "ROCm · HIP",
        detail:
          "ROCm is AMD's open-source compute platform. HIP is a C++ API deliberately close to CUDA, so CUDA code can often be translated (hipify) and compiled for AMD GPUs.",
      },
      {
        layer: "library",
        name: "rocBLAS / hipBLASLt · MIOpen · RCCL · MIGraphX",
        detail: "AMD's counterparts to cuBLAS, cuDNN, NCCL and TensorRT.",
      },
      {
        layer: "framework",
        name: "PyTorch on ROCm · JAX · ONNX Runtime",
        detail:
          "PyTorch publishes ROCm builds; on ROCm, PyTorch's `cuda` device name maps to the AMD GPU so much code runs unchanged.",
      },
      {
        layer: "application",
        name: "vLLM (ROCm), llama.cpp (HIP/Vulkan), Ollama, training code",
        detail:
          "Many popular projects support ROCm, but support often arrives later than CUDA, and custom CUDA kernels in a project may have no AMD equivalent yet.",
      },
    ],
    maturity:
      "Rapidly maturing; strongest on Instinct data-center GPUs and on Linux. Consumer Radeon support depends on the specific GPU and OS — check the official ROCm compatibility list.",
    notes: [
      "The question for an AMD GPU is not only 'how fast?' but 'is my exact GPU + OS + framework version on the support matrix?'.",
      "Vulkan-based runtimes (e.g. llama.cpp's Vulkan backend) give a vendor-neutral fallback for inference.",
    ],
  },
  {
    id: "intel-ai",
    company: "intel",
    domain: "ai",
    name: "oneAPI · OpenVINO",
    layers: [
      {
        layer: "hardware",
        name: "Core Ultra CPU + GPU + NPU · Arc GPUs · Xeon",
        detail:
          "Intel spreads AI across engines: Xe GPUs with XMX matrix engines, NPUs in Core Ultra laptop chips, and Xeon CPUs with AMX matrix extensions for server inference.",
      },
      {
        layer: "driver",
        name: "Intel graphics & NPU drivers",
        detail: "Separate drivers expose the GPU (Level Zero / OpenCL) and the NPU.",
      },
      {
        layer: "api",
        name: "oneAPI (SYCL / Level Zero) · OpenCL",
        detail:
          "oneAPI is Intel's open, standards-based programming model; SYCL is a Khronos C++ standard that can, in principle, target other vendors' hardware too.",
      },
      {
        layer: "library",
        name: "oneDNN · oneMKL",
        detail: "Optimised deep-learning and math kernels for Intel CPUs and GPUs.",
      },
      {
        layer: "framework",
        name: "OpenVINO · PyTorch (XPU backend)",
        detail:
          "OpenVINO converts and optimises trained models for inference across Intel CPU, GPU and NPU. PyTorch includes an `xpu` device for Intel GPUs.",
      },
      {
        layer: "application",
        name: "OpenVINO GenAI, llama.cpp (SYCL/Vulkan), apps using Windows ML / ONNX",
        detail: "Strongest in deployment/inference; a smaller footprint in research training.",
      },
    ],
    maturity: "Inference-focused and improving; broad CPU support, growing GPU and NPU support.",
    notes: [
      "OpenVINO's strength is deploying one model across whichever Intel engine a laptop or server has.",
      "NPU TOPS numbers matter only for software that actually targets the NPU.",
    ],
  },
  // ------------------------------------------------------------ Graphics
  {
    id: "nvidia-graphics",
    company: "nvidia",
    domain: "graphics",
    name: "GeForce graphics stack",
    layers: [
      { layer: "hardware", name: "GeForce RTX GPU", detail: "Shader cores, RT cores for ray tracing, Tensor Cores used by DLSS, NVENC/NVDEC video engines." },
      { layer: "driver", name: "Game Ready / Studio drivers", detail: "Drivers often ship game-specific optimisations and fixes." },
      { layer: "api", name: "DirectX 12 · Vulkan · OpenGL", detail: "Cross-vendor graphics APIs games are written against." },
      { layer: "library", name: "DLSS · Reflex · NVENC SDK", detail: "Vendor technologies a game must integrate: DLSS upscaling / frame generation, latency reduction, hardware encoding." },
      { layer: "framework", name: "Game engines (Unreal, Unity, in-house)", detail: "Engines abstract the API and decide which vendor features to support." },
      { layer: "application", name: "Games, 3D apps, streaming tools", detail: "Windows PC games broadly target DirectX 12 / Vulkan on all three PC GPU vendors." },
    ],
    maturity: "Very broad game and creative-app support on Windows.",
    notes: ["DLSS requires an RTX GPU and per-game integration."],
  },
  {
    id: "amd-graphics",
    company: "amd",
    domain: "graphics",
    name: "Radeon graphics stack",
    layers: [
      { layer: "hardware", name: "Radeon RDNA GPU", detail: "Compute Units with Ray Accelerators; recent generations add AI accelerators; VCN video engine." },
      { layer: "driver", name: "Adrenalin driver", detail: "Includes game optimisations and features such as driver-level upscaling." },
      { layer: "api", name: "DirectX 12 · Vulkan · OpenGL", detail: "Same cross-vendor APIs as other PC GPUs." },
      { layer: "library", name: "FSR · AMF", detail: "FidelityFX Super Resolution upscaling / frame generation (earlier versions open and cross-vendor; newest versions use RDNA 4's AI hardware) and the AMF media framework." },
      { layer: "framework", name: "Game engines", detail: "Consoles (PlayStation, Xbox) use AMD GPUs, so engines are well-tuned for the architecture." },
      { layer: "application", name: "Games, 3D apps", detail: "Broad Windows game compatibility." },
    ],
    maturity: "Broad game support; creative-app GPU acceleration varies by application.",
    notes: ["FSR's earlier versions run on GPUs from any vendor; the newest ML-based version targets recent Radeon hardware."],
  },
  {
    id: "intel-graphics",
    company: "intel",
    domain: "graphics",
    name: "Arc graphics stack",
    layers: [
      { layer: "hardware", name: "Arc / Xe GPU", detail: "Xe cores with XMX engines and ray-tracing units; strong Xe media engine." },
      { layer: "driver", name: "Intel Arc driver", detail: "Rapidly improved since Arc launched; older DirectX 9/11 titles were historically the weak spot." },
      { layer: "api", name: "DirectX 12 · Vulkan", detail: "Arc was designed primarily around modern APIs." },
      { layer: "library", name: "XeSS · Quick Sync", detail: "XeSS AI upscaling (uses XMX on Arc, a fallback path on other GPUs) and Quick Sync video encode/decode." },
      { layer: "framework", name: "Game engines", detail: "Support follows DX12/Vulkan engine support." },
      { layer: "application", name: "Games, video editing, streaming", detail: "Quick Sync is widely supported in video software." },
    ],
    maturity: "Newest of the three PC GPU stacks; modern-API games and media workloads are its strengths.",
    notes: ["Intel integrated graphics in Core / Core Ultra CPUs share this driver and media engine."],
  },
  {
    id: "apple-graphics",
    company: "apple",
    domain: "graphics",
    name: "Metal graphics stack",
    layers: [
      { layer: "hardware", name: "Apple GPU (in the SoC)", detail: "Tile-based deferred renderer; hardware ray tracing from M3 onward; media engines with ProRes support." },
      { layer: "driver", name: "macOS", detail: "Driver updates arrive with OS updates." },
      { layer: "api", name: "Metal", detail: "The only modern native graphics API on macOS; DirectX and Vulkan games must be ported or translated." },
      { layer: "library", name: "MetalFX · VideoToolbox", detail: "MetalFX upscaling / frame interpolation and hardware video encode/decode." },
      { layer: "framework", name: "Game engines with Metal backends", detail: "Unity and Unreal support Metal; Apple's Game Porting Toolkit helps developers evaluate Windows games." },
      { layer: "application", name: "Native Mac games, creative apps", detail: "Creative apps are well supported; the Mac game catalogue is much smaller than Windows'." },
    ],
    maturity: "Excellent integration for creative apps; game library limited by porting effort rather than raw GPU capability alone.",
    notes: ["Anti-cheat systems and DirectX-only engines keep many popular Windows games off macOS."],
  },
];

export const getStack = (id: string) => SOFTWARE_STACKS.find((s) => s.id === id);

export const stacksFor = (domain: SoftwareStack["domain"]) => SOFTWARE_STACKS.filter((s) => s.domain === domain);

export const AI_STACK_ORDER: CompanyId[] = ["nvidia", "apple", "amd", "intel"];

"use client";

import { useEffect, useMemo, useState } from "react";
import { Kicker, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Segmented";

type V = [number, number];
const CAM: V = [40, 160];
const PLANE_X = 130;
const PX = 12;
const PLANE_TOP = 70;
const PX_H = 15;
const LIGHT: V = [585, 40];
const SPHERE = { c: [360, 150] as V, r: 46 };
const TRI: V[] = [
  [470, 250],
  [540, 150],
  [575, 262],
];
const GROUND_Y = 280;

const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1];
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1]);
  return [a[0] / l, a[1] / l];
};

function hitCircle(o: V, d: V): number | null {
  const oc = sub(o, SPHERE.c);
  const b = dot(oc, d);
  const c = dot(oc, oc) - SPHERE.r ** 2;
  const h = b * b - c;
  if (h < 0) return null;
  const t = -b - Math.sqrt(h);
  return t > 0.5 ? t : null;
}

function hitSeg(o: V, d: V, a: V, b: V): number | null {
  const e = sub(b, a);
  const den = d[0] * e[1] - d[1] * e[0];
  if (Math.abs(den) < 1e-9) return null;
  const w = sub(a, o);
  const t = (w[0] * e[1] - w[1] * e[0]) / den;
  const u = (w[0] * d[1] - w[1] * d[0]) / den;
  return t > 0.5 && u >= 0 && u <= 1 ? t : null;
}

type Obj = "sphere" | "tri" | "ground";

function trace(o: V, d: V): { t: number; obj: Obj } | null {
  let best: { t: number; obj: Obj } | null = null;
  const consider = (t: number | null, obj: Obj) => {
    if (t !== null && (!best || t < best.t)) best = { t, obj };
  };
  consider(hitCircle(o, d), "sphere");
  for (let i = 0; i < 3; i++) consider(hitSeg(o, d, TRI[i], TRI[(i + 1) % 3]), "tri");
  consider(hitSeg(o, d, [PLANE_X, GROUND_Y], [640, GROUND_Y]), "ground");
  return best;
}

const OBJ_COLOR: Record<Obj, string> = { sphere: "var(--k-cpu)", tri: "var(--k-accel)", ground: "var(--k-interconnect)" };

const project = (p: V) => CAM[1] + ((p[1] - CAM[1]) * (PLANE_X - CAM[0])) / (p[0] - CAM[0]);

function pixelCenter(i: number): V {
  return [PLANE_X, PLANE_TOP + PX_H * i + PX_H / 2];
}

export function RasterVsRT() {
  const [mode, setMode] = useState<"raster" | "rt">("raster");
  const [step, setStep] = useState(0);

  const rays = useMemo(
    () =>
      Array.from({ length: PX }, (_, i) => {
        const pc = pixelCenter(i);
        const d = norm(sub(pc, CAM));
        const h = trace(CAM, d);
        if (!h) return { pc, hit: null as V | null, obj: null as Obj | null, lit: false };
        const hit: V = [CAM[0] + d[0] * h.t, CAM[1] + d[1] * h.t];
        const toL = sub(LIGHT, hit);
        const dl = norm(toL);
        const sh = trace(hit, dl);
        const lit = !sh || sh.t > Math.hypot(toL[0], toL[1]);
        return { pc, hit, obj: h.obj, lit };
      }),
    [],
  );

  // Raster: coverage of the two objects on the image plane.
  const coverage = useMemo(() => {
    const triYs = TRI.map(project);
    const sph = Array.from({ length: 64 }, (_, k) => {
      const a = (k / 64) * Math.PI * 2;
      return project([SPHERE.c[0] + Math.cos(a) * SPHERE.r, SPHERE.c[1] + Math.sin(a) * SPHERE.r]);
    });
    return {
      tri: [Math.min(...triYs), Math.max(...triYs)] as [number, number],
      sphere: [Math.min(...sph), Math.max(...sph)] as [number, number],
    };
  }, []);

  const maxStep = mode === "raster" ? 3 : PX;
  useEffect(() => {
    setStep(0);
  }, [mode]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(maxStep);
      return;
    }
    const id = setInterval(() => setStep((s) => (s >= maxStep + 2 ? 0 : s + 1)), mode === "raster" ? 1300 : 550);
    return () => clearInterval(id);
  }, [mode, maxStep]);

  const pixelState = (i: number): { color: string; opacity: number } | null => {
    const y = pixelCenter(i)[1];
    if (mode === "raster") {
      if (step < 2) return null;
      // depth test: sphere is nearer than the triangle along these rays
      const inS = y >= coverage.sphere[0] && y <= coverage.sphere[1];
      const inT = y >= coverage.tri[0] && y <= coverage.tri[1];
      if (inS) return { color: OBJ_COLOR.sphere, opacity: step >= 3 ? 0.9 : 0.35 };
      if (inT) return { color: OBJ_COLOR.tri, opacity: step >= 3 ? 0.9 : 0.35 };
      if (step >= 3 && rays[i].obj === "ground") return { color: OBJ_COLOR.ground, opacity: 0.6 };
      return null;
    }
    if (i >= step) return null;
    const r = rays[i];
    if (!r.obj) return null;
    return { color: OBJ_COLOR[r.obj], opacity: r.lit ? 0.95 : 0.3 };
  };

  const rasterCaption = [
    "1 · Vertex stage: each triangle's corners are transformed into screen space.",
    "2 · Projection: corners land on the image plane.",
    "3 · Rasterization: find which pixels each shape covers (the nearest one wins the depth test).",
    "4 · Pixel shading: colour each covered pixel. Shadows and reflections must be approximated with extra tricks.",
  ];

  return (
    <Panel className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>Two ways to make an image · side view</Kicker>
        <Segmented
          size="sm"
          ariaLabel="Rendering method"
          value={mode}
          onChange={setMode}
          options={[
            { value: "raster", label: "Rasterization" },
            { value: "rt", label: "Ray tracing" },
          ]}
        />
      </div>

      <div className="scroll-thin mt-4 overflow-x-auto">
        <svg viewBox="0 0 640 300" className="w-full min-w-[520px]" role="img" aria-label="Side view of a camera, image plane and scene">
          <line x1={PLANE_X} y1={GROUND_Y} x2={640} y2={GROUND_Y} stroke="var(--k-interconnect)" strokeWidth={1.5} />
          <circle cx={SPHERE.c[0]} cy={SPHERE.c[1]} r={SPHERE.r} fill="color-mix(in oklab, var(--k-cpu) 18%, transparent)" stroke="var(--k-cpu)" />
          <polygon points={TRI.map((p) => p.join(",")).join(" ")} fill="color-mix(in oklab, var(--k-accel) 18%, transparent)" stroke="var(--k-accel)" />
          {/* light */}
          <circle cx={LIGHT[0]} cy={LIGHT[1]} r={9} fill="var(--warn)" opacity={0.9} />
          <text x={LIGHT[0] - 14} y={LIGHT[1] + 26} className="diagram-mono" fontSize={10}>
            light
          </text>
          {/* camera */}
          <path d={`M${CAM[0] - 18} ${CAM[1] - 10}h18l8-6v32l-8-6h-18z`} fill="var(--panel-3)" stroke="var(--fg-dim)" />
          <text x={CAM[0] - 22} y={CAM[1] + 34} className="diagram-mono" fontSize={10}>
            camera
          </text>

          {/* raster projection lines */}
          {mode === "raster" &&
            step >= 1 &&
            [...TRI, [SPHERE.c[0], SPHERE.c[1] - SPHERE.r] as V, [SPHERE.c[0], SPHERE.c[1] + SPHERE.r] as V].map((p, k) => (
              <g key={k}>
                <line x1={p[0]} y1={p[1]} x2={CAM[0] + 8} y2={CAM[1]} stroke="var(--fg-dim)" strokeWidth={0.8} strokeDasharray="3 4" />
                <circle cx={PLANE_X} cy={project(p)} r={3} fill={k < 3 ? "var(--k-accel)" : "var(--k-cpu)"} />
              </g>
            ))}
          {mode === "raster" &&
            TRI.map((p, k) => <circle key={k} cx={p[0]} cy={p[1]} r={3.5} fill="var(--k-accel)" opacity={step >= 0 ? 1 : 0} />)}

          {/* ray tracing rays */}
          {mode === "rt" &&
            rays.slice(0, step).map((r, i) =>
              r.hit ? (
                <g key={i} opacity={i === step - 1 ? 1 : 0.35}>
                  <line x1={CAM[0] + 8} y1={CAM[1]} x2={r.hit[0]} y2={r.hit[1]} stroke="var(--accent)" strokeWidth={1} />
                  <line
                    x1={r.hit[0]}
                    y1={r.hit[1]}
                    x2={LIGHT[0]}
                    y2={LIGHT[1]}
                    stroke={r.lit ? "var(--warn)" : "var(--bad)"}
                    strokeWidth={0.9}
                    strokeDasharray="4 3"
                  />
                  <circle cx={r.hit[0]} cy={r.hit[1]} r={2.5} fill="var(--accent)" />
                </g>
              ) : null,
            )}

          {/* image plane pixels */}
          {Array.from({ length: PX }, (_, i) => {
            const st = pixelState(i);
            return (
              <rect
                key={i}
                x={PLANE_X - 7}
                y={PLANE_TOP + i * PX_H}
                width={14}
                height={PX_H - 1}
                rx={2}
                fill={st ? st.color : "var(--panel-3)"}
                fillOpacity={st ? st.opacity : 1}
                stroke="var(--line-strong)"
                strokeWidth={0.8}
              />
            );
          })}
          <text x={PLANE_X - 18} y={PLANE_TOP - 10} className="diagram-mono" fontSize={10}>
            image (pixels)
          </text>
        </svg>
      </div>

      <div className="mt-3 min-h-[3rem] text-sm leading-relaxed text-muted">
        {mode === "raster"
          ? rasterCaption[Math.min(step, 3)]
          : step === 0
            ? "For every pixel, shoot a ray from the camera into the scene…"
            : `Ray ${Math.min(step, PX)} of ${PX}: find the nearest hit, then shoot a shadow ray toward the light. Dashed red = blocked → the pixel is in shadow.`}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-panel-2 p-4">
          <div className="text-sm font-semibold text-fg">Rasterization</div>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Asks <em>&ldquo;for each triangle, which pixels does it cover?&rdquo;</em> Extremely fast and what GPUs were originally built for. Shadows,
            reflections and indirect light are faked with shadow maps, screen-space tricks and pre-baked lighting.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-panel-2 p-4">
          <div className="text-sm font-semibold text-fg">Ray tracing</div>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Asks <em>&ldquo;for each pixel, what does light actually hit?&rdquo;</em> Physically natural shadows and reflections, but each ray must search
            a scene of millions of triangles. Dedicated RT hardware speeds up that search; games use few rays per pixel plus denoising and upscaling.
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-dim">
        Real-time games are usually <strong className="text-muted">hybrid</strong>: rasterize the image, then trace rays for selected effects. Offline renderers (e.g. Blender
        Cycles) trace many rays per pixel and use GPU compute — where RT hardware and VRAM capacity both matter.
      </p>
    </Panel>
  );
}

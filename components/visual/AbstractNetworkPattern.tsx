import type { PatternVariant } from "@/lib/visual/seed-from-string";
import { cn } from "@/lib/utils/cn";

interface AbstractNetworkPatternProps {
  variant: PatternVariant;
  className?: string;
  /** 0–1 — dezente Überlagerung */
  opacity?: number;
}

/** Abstrakte Community-/Netzwerk-Visuals — SVG, keine Stockfotos */
export function AbstractNetworkPattern({
  variant,
  className,
  opacity = 0.45,
}: AbstractNetworkPatternProps) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{ opacity }}
    >
      <defs>
        <radialGradient id="unze-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {variant === "network" && <NetworkPattern />}
      {variant === "orbit" && <OrbitPattern />}
      {variant === "mesh" && <MeshPattern />}
      {variant === "cluster" && <ClusterPattern />}
    </svg>
  );
}

function NetworkPattern() {
  const nodes = [
    [80, 60],
    [160, 40],
    [240, 70],
    [320, 50],
    [120, 120],
    [200, 130],
    [280, 110],
    [360, 140],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [0, 4],
    [1, 4],
    [2, 5],
    [3, 7],
    [4, 5],
    [5, 6],
    [6, 7],
    [2, 6],
  ];

  return (
    <g stroke="white" strokeWidth="1.2" strokeOpacity="0.35" fill="none">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
        />
      ))}
      {nodes.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="14" fill="url(#unze-glow)" />
          <circle cx={cx} cy={cy} r="5" fill="white" fillOpacity="0.55" />
        </g>
      ))}
    </g>
  );
}

function OrbitPattern() {
  return (
    <g fill="none" stroke="white" strokeOpacity="0.3">
      <circle cx="200" cy="100" r="55" strokeWidth="1" />
      <circle cx="200" cy="100" r="32" strokeWidth="0.8" strokeDasharray="4 6" />
      <circle cx="255" cy="100" r="6" fill="white" fillOpacity="0.5" stroke="none" />
      <circle cx="200" cy="68" r="4" fill="white" fillOpacity="0.4" stroke="none" />
      <circle cx="168" cy="118" r="5" fill="white" fillOpacity="0.45" stroke="none" />
      <circle cx="200" cy="100" r="10" fill="url(#unze-glow)" stroke="none" />
      <circle cx="200" cy="100" r="4" fill="white" fillOpacity="0.7" stroke="none" />
    </g>
  );
}

function MeshPattern() {
  const cols = 6;
  const rows = 3;
  const points: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      points.push([40 + c * 56, 40 + r * 55]);
    }
  }

  return (
    <g stroke="white" strokeOpacity="0.22" fill="none" strokeWidth="0.8">
      {points.map(([x, y], i) => {
        if (i % cols < cols - 1) {
          const next = points[i + 1];
          return <line key={`h-${i}`} x1={x} y1={y} x2={next[0]} y2={next[1]} />;
        }
        return null;
      })}
      {points.map(([x, y], i) => {
        if (i + cols < points.length) {
          const below = points[i + cols];
          return <line key={`v-${i}`} x1={x} y1={y} x2={below[0]} y2={below[1]} />;
        }
        return null;
      })}
      {points.map(([x, y], i) => (
        <circle key={`n-${i}`} cx={x} cy={y} r="3" fill="white" fillOpacity="0.35" stroke="none" />
      ))}
    </g>
  );
}

function ClusterPattern() {
  const clusters = [
    { cx: 90, cy: 90, r: 28 },
    { cx: 210, cy: 70, r: 34 },
    { cx: 310, cy: 120, r: 26 },
  ];

  return (
    <g>
      {clusters.map((c, i) => (
        <g key={i}>
          <circle
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            fill="white"
            fillOpacity="0.06"
            stroke="white"
            strokeOpacity="0.25"
          />
          <circle cx={c.cx} cy={c.cy} r="5" fill="white" fillOpacity="0.55" />
          {[0, 72, 144, 216, 288].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = c.cx + Math.cos(rad) * (c.r * 0.55);
            const y = c.cy + Math.sin(rad) * (c.r * 0.55);
            return (
              <circle key={deg} cx={x} cy={y} r="3" fill="white" fillOpacity="0.35" />
            );
          })}
        </g>
      ))}
    </g>
  );
}

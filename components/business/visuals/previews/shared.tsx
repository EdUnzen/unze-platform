import type { ReactNode } from "react";

/** Gemeinsame Mini-UI-Bausteine für realistische Vorschauen (Server-sicher). */

export function PreviewShell({
  bare = false,
  title,
  children,
  dark = false,
}: {
  bare?: boolean;
  title?: string;
  children: ReactNode;
  dark?: boolean;
}) {
  if (bare) {
    return <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f8fafc]">{children}</div>;
  }
  return (
    <AppWindowChrome title={title} dark={dark}>
      {children}
    </AppWindowChrome>
  );
}

export function AppWindowChrome({
  title,
  children,
  dark = false,
}: {
  title?: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className={`flex h-full flex-col ${dark ? "bg-gray-950" : "bg-[#f8fafc]"}`}>
      <div
        className={`flex shrink-0 items-center gap-2 border-b px-3 py-2 ${
          dark ? "border-white/10 bg-gray-900" : "border-gray-200/80 bg-white"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        {title ? (
          <span
            className={`ml-2 truncate text-[9px] font-medium ${
              dark ? "text-white/40" : "text-gray-400"
            }`}
          >
            {title}
          </span>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

export function Sparkline({ color = "#00C853" }: { color?: string }) {
  return (
    <svg viewBox="0 0 48 16" className="h-3 w-12" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,12 8,8 16,10 24,4 32,6 40,2 48,5"
      />
    </svg>
  );
}

export function AreaChart({ uid = "area-default" }: { uid?: string }) {
  const gradientId = `area-fill-${uid}`;

  return (
    <svg viewBox="0 0 200 60" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C853" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00C853" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,45 L20,38 L40,42 L60,28 L80,32 L100,18 L120,24 L140,12 L160,20 L180,8 L200,14 L200,60 L0,60 Z"
        fill={`url(#${gradientId})`}
      />
      <polyline
        fill="none"
        stroke="#00C853"
        strokeWidth="2"
        points="0,45 20,38 40,42 60,28 80,32 100,18 120,24 140,12 160,20 180,8 200,14"
      />
    </svg>
  );
}

export function MeshHeroBg({ uid = "mesh-default" }: { uid?: string }) {
  const patternId = `mesh-grid-${uid}`;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950" />
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#00C853]/20 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-32 w-48 rounded-full bg-indigo-500/15 blur-2xl" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 400 200">
        <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
        <rect width="400" height="200" fill={`url(#${patternId})`} />
      </svg>
      <div className="absolute bottom-4 right-6 h-24 w-32 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="p-2">
          <div className="h-1.5 w-10 rounded bg-[#00C853]/60" />
          <div className="mt-2 h-8 w-full rounded bg-gradient-to-t from-[#00C853]/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export function StatusPill({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "gray";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/10",
    gray: "bg-gray-100 text-gray-600 ring-gray-500/10",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-semibold ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

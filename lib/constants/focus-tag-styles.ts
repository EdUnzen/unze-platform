/** Farben für Community-Fokus-Tags (Orientierung, kein neues Feature). */
const FOCUS_TAG_STYLES: Record<string, string> = {
  netzwerk: "border-blue-200/80 bg-blue-50 text-blue-800",
  networking: "border-blue-200/80 bg-blue-50 text-blue-800",
  marketing: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
  investments: "border-amber-200/80 bg-amber-50 text-amber-900",
  investment: "border-amber-200/80 bg-amber-50 text-amber-900",
  finanzen: "border-amber-200/80 bg-amber-50 text-amber-900",
  events: "border-orange-200/80 bg-orange-50 text-orange-900",
  event: "border-orange-200/80 bg-orange-50 text-orange-900",
  fitness: "border-red-200/80 bg-red-50 text-red-800",
  sport: "border-red-200/80 bg-red-50 text-red-800",
  gaming: "border-violet-200/80 bg-violet-50 text-violet-900",
  technologie: "border-cyan-200/80 bg-cyan-50 text-cyan-900",
  technology: "border-cyan-200/80 bg-cyan-50 text-cyan-900",
  business: "border-slate-200/80 bg-slate-100 text-slate-800",
  kreativität: "border-rose-200/80 bg-rose-50 text-rose-800",
  lifestyle: "border-pink-200/80 bg-pink-50 text-pink-900",
  bildung: "border-indigo-200/80 bg-indigo-50 text-indigo-900",
  community: "border-unze-green/30 bg-unze-green-muted/60 text-unze-green-dark",
};

const FALLBACK_STYLES = [
  "border-sky-200/80 bg-sky-50 text-sky-800",
  "border-teal-200/80 bg-teal-50 text-teal-800",
  "border-lime-200/80 bg-lime-50 text-lime-900",
] as const;

function normalizeKey(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function getFocusTagStyle(tag: string): string {
  const key = normalizeKey(tag);
  if (FOCUS_TAG_STYLES[key]) return FOCUS_TAG_STYLES[key];
  for (const [pattern, style] of Object.entries(FOCUS_TAG_STYLES)) {
    if (key.includes(pattern)) return style;
  }
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) % FALLBACK_STYLES.length;
  return FALLBACK_STYLES[hash]!;
}

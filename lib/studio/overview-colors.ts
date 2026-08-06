import type { StudioInquiryStatus } from "@/lib/studio/types";

export type StageTheme = {
  section: string;
  header: string;
  card: string;
  cardHover: string;
  count: string;
  label: string;
  dot: string;
  filterActive: string;
  filterIdle: string;
};

export const LEAD_STATUS_THEMES: Record<
  StudioInquiryStatus | "zahlung_ausstehend",
  StageTheme
> = {
  neue_anfrage: {
    section: "border-l-4 border-l-blue-500",
    header: "bg-blue-50/60",
    card: "border-blue-200/80 bg-blue-50",
    cardHover: "hover:border-blue-300 hover:bg-blue-100/70",
    count: "text-blue-900",
    label: "text-blue-800",
    dot: "bg-blue-500",
    filterActive: "bg-blue-600 text-white ring-2 ring-blue-200",
    filterIdle: "bg-blue-50 text-blue-800 ring-1 ring-blue-200/80 hover:bg-blue-100",
  },
  zahlung_ausstehend: {
    section: "border-l-4 border-l-orange-500",
    header: "bg-orange-50/60",
    card: "border-orange-200/80 bg-orange-50",
    cardHover: "hover:border-orange-300 hover:bg-orange-100/70",
    count: "text-orange-950",
    label: "text-orange-900",
    dot: "bg-orange-500",
    filterActive: "bg-orange-600 text-white ring-2 ring-orange-200",
    filterIdle: "bg-orange-50 text-orange-900 ring-1 ring-orange-200/80 hover:bg-orange-100",
  },
  kontaktiert: {
    section: "border-l-4 border-l-amber-500",
    header: "bg-amber-50/60",
    card: "border-amber-200/80 bg-amber-50",
    cardHover: "hover:border-amber-300 hover:bg-amber-100/70",
    count: "text-amber-950",
    label: "text-amber-900",
    dot: "bg-amber-500",
    filterActive: "bg-amber-600 text-white ring-2 ring-amber-200",
    filterIdle: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80 hover:bg-amber-100",
  },
  angebot: {
    section: "border-l-4 border-l-violet-500",
    header: "bg-violet-50/60",
    card: "border-violet-200/80 bg-violet-50",
    cardHover: "hover:border-violet-300 hover:bg-violet-100/70",
    count: "text-violet-950",
    label: "text-violet-900",
    dot: "bg-violet-500",
    filterActive: "bg-violet-600 text-white ring-2 ring-violet-200",
    filterIdle: "bg-violet-50 text-violet-900 ring-1 ring-violet-200/80 hover:bg-violet-100",
  },
  abgeschlossen: {
    section: "border-l-4 border-l-emerald-500",
    header: "bg-emerald-50/60",
    card: "border-emerald-200/80 bg-emerald-50",
    cardHover: "hover:border-emerald-300 hover:bg-emerald-100/70",
    count: "text-emerald-950",
    label: "text-emerald-900",
    dot: "bg-emerald-500",
    filterActive: "bg-emerald-600 text-white ring-2 ring-emerald-200",
    filterIdle: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80 hover:bg-emerald-100",
  },
  abgelehnt: {
    section: "border-l-4 border-l-gray-400",
    header: "bg-gray-50/60",
    card: "border-gray-200 bg-gray-50",
    cardHover: "hover:border-gray-300 hover:bg-gray-100",
    count: "text-gray-800",
    label: "text-gray-700",
    dot: "bg-gray-400",
    filterActive: "bg-gray-600 text-white ring-2 ring-gray-200",
    filterIdle: "bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100",
  },
};

export const QUOTE_STATUS_THEMES: Record<
  "draft" | "sent" | "accepted" | "paid" | "rejected",
  StageTheme
> = {
  draft: {
    section: "border-l-4 border-l-slate-400",
    header: "bg-slate-50/60",
    card: "border-slate-200 bg-slate-50",
    cardHover: "hover:border-slate-300 hover:bg-slate-100",
    count: "text-slate-900",
    label: "text-slate-700",
    dot: "bg-slate-400",
    filterActive: "bg-slate-600 text-white ring-2 ring-slate-200",
    filterIdle: "bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100",
  },
  sent: {
    section: "border-l-4 border-l-sky-500",
    header: "bg-sky-50/60",
    card: "border-sky-200 bg-sky-50",
    cardHover: "hover:border-sky-300 hover:bg-sky-100",
    count: "text-sky-950",
    label: "text-sky-800",
    dot: "bg-sky-500",
    filterActive: "bg-sky-600 text-white ring-2 ring-sky-200",
    filterIdle: "bg-sky-50 text-sky-800 ring-1 ring-sky-200 hover:bg-sky-100",
  },
  accepted: {
    section: "border-l-4 border-l-indigo-500",
    header: "bg-indigo-50/60",
    card: "border-indigo-200 bg-indigo-50",
    cardHover: "hover:border-indigo-300 hover:bg-indigo-100",
    count: "text-indigo-950",
    label: "text-indigo-800",
    dot: "bg-indigo-500",
    filterActive: "bg-indigo-600 text-white ring-2 ring-indigo-200",
    filterIdle: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200 hover:bg-indigo-100",
  },
  paid: {
    section: "border-l-4 border-l-emerald-500",
    header: "bg-emerald-50/60",
    card: "border-emerald-200 bg-emerald-50",
    cardHover: "hover:border-emerald-300 hover:bg-emerald-100",
    count: "text-emerald-950",
    label: "text-emerald-800",
    dot: "bg-emerald-500",
    filterActive: "bg-emerald-600 text-white ring-2 ring-emerald-200",
    filterIdle: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100",
  },
  rejected: {
    section: "border-l-4 border-l-rose-400",
    header: "bg-rose-50/60",
    card: "border-rose-200 bg-rose-50",
    cardHover: "hover:border-rose-300 hover:bg-rose-100",
    count: "text-rose-900",
    label: "text-rose-800",
    dot: "bg-rose-400",
    filterActive: "bg-rose-600 text-white ring-2 ring-rose-200",
    filterIdle: "bg-rose-50 text-rose-800 ring-1 ring-rose-200 hover:bg-rose-100",
  },
};

export const ANALYSIS_STAGE_THEMES: Record<
  "payment_pending" | "in_progress" | "completed",
  StageTheme
> = {
  payment_pending: LEAD_STATUS_THEMES.zahlung_ausstehend,
  in_progress: LEAD_STATUS_THEMES.kontaktiert,
  completed: LEAD_STATUS_THEMES.abgeschlossen,
};

export const KPI_THEMES = {
  leads: "border-blue-200 bg-gradient-to-br from-blue-50 to-white",
  today: "border-sky-200 bg-gradient-to-br from-sky-50 to-white",
  clients: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-white",
  open: "border-orange-200 bg-gradient-to-br from-orange-50 to-white",
  income: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
  mrr: "border-violet-200 bg-gradient-to-br from-violet-50 to-white",
} as const;

export const SECTION_THEMES = {
  today: "border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 to-white",
  finance: "border-l-4 border-l-teal-500",
  revenue: "border-l-4 border-l-emerald-500",
  activity: "border-l-4 border-l-gray-400",
  system: "border-l-4 border-l-slate-500",
  clients: "border-l-4 border-l-indigo-500",
  leads: "border-l-4 border-l-blue-500",
} as const;

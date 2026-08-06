import { STUDIO_INQUIRY_STATUS_LABELS } from "@/lib/studio/constants";
import { formatEuroCents } from "@/lib/business/pricing-utils";
import type {
  ContractReminderRow,
  DomainReminderRow,
  PaymentOverviewRow,
} from "@/lib/studio/overview";
import type { StudioInquiry, StudioInquiryStatus } from "@/lib/studio/types";
import type { StudioQuote } from "@/lib/studio/quote-types";

export type TodayActionKind =
  | "lead"
  | "analysis_payment"
  | "quote_payment"
  | "contract"
  | "domain";

export type TodayActionItem = {
  id: string;
  kind: TodayActionKind;
  title: string;
  subtitle: string;
  href: string;
  mailtoHref?: string;
};

export type PipelineStage = {
  status: StudioInquiryStatus | "zahlung_ausstehend";
  label: string;
  count: number;
  href: string;
};

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  analysis: "Analyse",
  quick: "Schnellanfrage",
  project: "Projekt",
  contact: "Kontakt",
};

export function inquiryTypeLabel(type: string): string {
  return INQUIRY_TYPE_LABELS[type] ?? type;
}

export function formatInquiryDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function inquiryDisplayName(inq: StudioInquiry): string {
  return inq.company ?? inq.contactName ?? inq.contactEmail;
}

function analysisTierLabel(inq: StudioInquiry): string | null {
  if (inq.inquiryType !== "analysis") return null;
  const tier = inq.answers?.tier;
  if (typeof tier !== "string") return null;
  const labels: Record<string, string> = {
    quick: "Quick",
    business: "Business",
    premium: "Premium",
  };
  return labels[tier] ?? tier;
}

export function inquirySubtitle(inq: StudioInquiry): string {
  const parts = [inquiryTypeLabel(inq.inquiryType)];
  const tier = analysisTierLabel(inq);
  if (tier) parts.push(tier);
  parts.push(formatInquiryDate(inq.createdAt));
  return parts.join(" · ");
}

export function isOpenInquiryStatus(status: string): boolean {
  return ["neue_anfrage", "kontaktiert", "angebot", "zahlung_ausstehend"].includes(status);
}

export function buildPipeline(inquiries: StudioInquiry[]): PipelineStage[] {
  const counts = {
    neue_anfrage: 0,
    zahlung_ausstehend: 0,
    kontaktiert: 0,
    angebot: 0,
    abgeschlossen: 0,
  };

  for (const inq of inquiries) {
    if (inq.status === "zahlung_ausstehend") {
      counts.zahlung_ausstehend += 1;
    } else if (inq.status === "neue_anfrage") {
      counts.neue_anfrage += 1;
    } else if (inq.status === "kontaktiert") {
      counts.kontaktiert += 1;
    } else if (inq.status === "angebot") {
      counts.angebot += 1;
    } else if (inq.status === "abgeschlossen") {
      counts.abgeschlossen += 1;
    }
  }

  return [
    {
      status: "neue_anfrage",
      label: STUDIO_INQUIRY_STATUS_LABELS.neue_anfrage,
      count: counts.neue_anfrage,
      href: "/studio/app?status=neue_anfrage",
    },
    {
      status: "zahlung_ausstehend",
      label: "Zahlung offen",
      count: counts.zahlung_ausstehend,
      href: "/studio/app?status=zahlung_ausstehend",
    },
    {
      status: "kontaktiert",
      label: STUDIO_INQUIRY_STATUS_LABELS.kontaktiert,
      count: counts.kontaktiert,
      href: "/studio/app?status=kontaktiert",
    },
    {
      status: "angebot",
      label: STUDIO_INQUIRY_STATUS_LABELS.angebot,
      count: counts.angebot,
      href: "/studio/app?status=angebot",
    },
    {
      status: "abgeschlossen",
      label: STUDIO_INQUIRY_STATUS_LABELS.abgeschlossen,
      count: counts.abgeschlossen,
      href: "/studio/app?status=abgeschlossen",
    },
  ];
}

export function buildTodayActions(input: {
  inquiries: StudioInquiry[];
  payments: PaymentOverviewRow[];
  contractReminders: ContractReminderRow[];
  domainReminders: DomainReminderRow[];
  buildPaymentMailto: (row: PaymentOverviewRow) => string;
  buildContractMailto: (row: ContractReminderRow) => string;
  buildDomainMailto: (row: DomainReminderRow) => string;
}): TodayActionItem[] {
  const items: TodayActionItem[] = [];

  for (const inq of input.inquiries) {
    if (inq.status === "neue_anfrage") {
      items.push({
        id: `lead-${inq.id}`,
        kind: "lead",
        title: `Neuer Lead: ${inquiryDisplayName(inq)}`,
        subtitle: `${inquiryTypeLabel(inq.inquiryType)} · ${inq.referenceId}`,
        href: `/studio/app/inquiries/${inq.id}`,
      });
    }
    if (inq.status === "zahlung_ausstehend") {
      const tier = analysisTierLabel(inq);
      items.push({
        id: `analysis-pay-${inq.id}`,
        kind: "analysis_payment",
        title: `Analyse — Zahlung ausstehend: ${inquiryDisplayName(inq)}`,
        subtitle: [tier, inq.referenceId].filter(Boolean).join(" · "),
        href: `/studio/app/inquiries/${inq.id}`,
      });
    }
  }

  for (const row of input.payments.slice(0, 5)) {
    items.push({
      id: `quote-${row.quote.id}`,
      kind: "quote_payment",
      title: `Angebot offen: ${row.quote.company ?? row.quote.customerName ?? row.quote.referenceId}`,
      subtitle: `${formatEuroCents(row.openCents)} offen · ${row.quote.referenceId}`,
      href: `/studio/app/angebote/${row.quote.id}`,
      mailtoHref: input.buildPaymentMailto(row),
    });
  }

  for (const row of input.contractReminders.slice(0, 3)) {
    items.push({
      id: `contract-${row.contract.id}-${row.reason}`,
      kind: "contract",
      title: `Vertrag: ${row.client.companyName}`,
      subtitle: `${row.contract.title} · in ${row.daysLeft} Tag${row.daysLeft === 1 ? "" : "en"}`,
      href: `/studio/app/kunden/${row.client.id}`,
      mailtoHref: input.buildContractMailto(row),
    });
  }

  for (const row of input.domainReminders.slice(0, 3)) {
    items.push({
      id: `domain-${row.domain.id}`,
      kind: "domain",
      title: `Domain: ${row.domain.domain}`,
      subtitle: `${row.client.companyName} · in ${row.daysLeft} Tag${row.daysLeft === 1 ? "" : "en"}`,
      href: `/studio/app/kunden/${row.client.id}`,
      mailtoHref: input.buildDomainMailto(row),
    });
  }

  const kindOrder: Record<TodayActionKind, number> = {
    lead: 0,
    analysis_payment: 1,
    quote_payment: 2,
    contract: 3,
    domain: 4,
  };

  return items.sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]).slice(0, 12);
}

export type AnalysisPipelineStage = {
  id: "payment_pending" | "in_progress" | "completed";
  label: string;
  count: number;
  hint: string;
  href: string;
};

export type StudioRevenueSnapshot = {
  contractMrrCents: number;
  hostingMrrCents: number;
  totalMrrCents: number;
  activeContractCount: number;
  managedDomainCount: number;
};

export function monthlyCentsFromContract(
  amountCents: number | null,
  billingCycle: string | null,
): number {
  if (amountCents == null || amountCents <= 0) return 0;
  if (billingCycle === "monthly") return amountCents;
  if (billingCycle === "yearly") return Math.round(amountCents / 12);
  return 0;
}

export function buildAnalysisPipeline(inquiries: StudioInquiry[]): AnalysisPipelineStage[] {
  const analysis = inquiries.filter((i) => i.inquiryType === "analysis");

  const paymentPending = analysis.filter((i) => i.status === "zahlung_ausstehend").length;
  const inProgress = analysis.filter((i) =>
    ["neue_anfrage", "kontaktiert", "angebot"].includes(i.status),
  ).length;
  const completed = analysis.filter((i) => i.status === "abgeschlossen").length;

  return [
    {
      id: "payment_pending",
      label: "Zahlung offen",
      count: paymentPending,
      hint: "Quick / Business / Premium",
      href: "/studio/app?status=zahlung_ausstehend&type=analysis",
    },
    {
      id: "in_progress",
      label: "In Bearbeitung",
      count: inProgress,
      hint: "Auswertung & Bericht",
      href: "/studio/app?type=analysis&open=1",
    },
    {
      id: "completed",
      label: "Abgeschlossen",
      count: completed,
      hint: "Bericht übergeben",
      href: "/studio/app?status=abgeschlossen&type=analysis",
    },
  ];
}

export type ActivityFeedItem = {
  id: string;
  kind: "lead" | "payment" | "quote";
  title: string;
  subtitle: string;
  at: string;
  href: string;
};

export type SystemStatusItem = {
  id: "supabase" | "stripe" | "analytics";
  label: string;
  ok: boolean;
  hint: string;
};

export function buildActivityFeed(input: {
  inquiries: StudioInquiry[];
  quotes: StudioQuote[];
}): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];

  for (const inq of input.inquiries.slice(0, 20)) {
    items.push({
      id: `lead-${inq.id}`,
      kind: "lead",
      title: `Lead: ${inquiryDisplayName(inq)}`,
      subtitle: `${inquiryTypeLabel(inq.inquiryType)} · ${inq.referenceId}`,
      at: inq.createdAt,
      href: `/studio/app/inquiries/${inq.id}`,
    });
  }

  for (const quote of input.quotes) {
    if (quote.paidAt) {
      items.push({
        id: `pay-${quote.id}`,
        kind: "payment",
        title: `Zahlung: ${quote.company ?? quote.customerName ?? quote.referenceId}`,
        subtitle: `${formatEuroCents(quote.amountPaidCents)} · ${quote.referenceId}`,
        at: quote.paidAt,
        href: `/studio/app/angebote/${quote.id}`,
      });
    } else if (quote.status === "sent" && quote.updatedAt) {
      items.push({
        id: `quote-${quote.id}`,
        kind: "quote",
        title: `Angebot versendet: ${quote.referenceId}`,
        subtitle: quote.company ?? quote.customerName ?? quote.customerEmail,
        at: quote.updatedAt,
        href: `/studio/app/angebote/${quote.id}`,
      });
    }
  }

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);
}

export type LeadTypeBreakdownRow = {
  type: string;
  label: string;
  total: number;
  open: number;
};

export type QuotePipelineStage = {
  status: "draft" | "sent" | "accepted" | "paid" | "rejected";
  label: string;
  count: number;
  href: string;
};

export type PeriodSnapshot = {
  leadsToday: number;
  leadsWeek: number;
  leadsMonth: number;
  paymentsWeekCents: number;
  paymentsMonthCents: number;
  openQuotesCount: number;
};

export type FinanceOverview = {
  openTotalCents: number;
  paidMonthCents: number;
  paid30dCents: number;
  mrrCents: number;
  avgQuoteCents: number | null;
};

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function isOnOrAfter(iso: string, cutoffIso: string): boolean {
  return iso >= cutoffIso;
}

export function buildLeadTypeBreakdown(inquiries: StudioInquiry[]): LeadTypeBreakdownRow[] {
  const map = new Map<string, { total: number; open: number }>();

  for (const inq of inquiries) {
    const current = map.get(inq.inquiryType) ?? { total: 0, open: 0 };
    current.total += 1;
    if (isOpenInquiryStatus(inq.status)) current.open += 1;
    map.set(inq.inquiryType, current);
  }

  return Array.from(map.entries())
    .map(([type, counts]) => ({
      type,
      label: inquiryTypeLabel(type),
      total: counts.total,
      open: counts.open,
    }))
    .sort((a, b) => b.total - a.total);
}

const QUOTE_STATUS_LABELS: Record<QuotePipelineStage["status"], string> = {
  draft: "Entwurf",
  sent: "Versendet",
  accepted: "Angenommen",
  paid: "Bezahlt",
  rejected: "Abgelehnt",
};

export function buildQuotePipeline(quotes: StudioQuote[]): QuotePipelineStage[] {
  const counts: Record<QuotePipelineStage["status"], number> = {
    draft: 0,
    sent: 0,
    accepted: 0,
    paid: 0,
    rejected: 0,
  };

  for (const quote of quotes) {
    if (quote.status in counts) {
      counts[quote.status as QuotePipelineStage["status"]] += 1;
    }
  }

  return (["draft", "sent", "accepted", "paid"] as const).map((status) => ({
    status,
    label: QUOTE_STATUS_LABELS[status],
    count: counts[status],
    href: `/studio/app/angebote?status=${status}`,
  }));
}

export function buildPeriodSnapshot(input: {
  inquiries: StudioInquiry[];
  quotes: StudioQuote[];
  payments: PaymentOverviewRow[];
}): PeriodSnapshot {
  const todayStart = isoDaysAgo(0);
  const weekStart = isoDaysAgo(7);
  const monthStart = isoDaysAgo(30);

  let leadsToday = 0;
  let leadsWeek = 0;
  let leadsMonth = 0;

  for (const inq of input.inquiries) {
    if (isOnOrAfter(inq.createdAt, todayStart)) leadsToday += 1;
    if (isOnOrAfter(inq.createdAt, weekStart)) leadsWeek += 1;
    if (isOnOrAfter(inq.createdAt, monthStart)) leadsMonth += 1;
  }

  let paymentsWeekCents = 0;
  let paymentsMonthCents = 0;

  for (const quote of input.quotes) {
    if (!quote.paidAt) continue;
    if (isOnOrAfter(quote.paidAt, weekStart)) paymentsWeekCents += quote.amountPaidCents;
    if (isOnOrAfter(quote.paidAt, monthStart)) paymentsMonthCents += quote.amountPaidCents;
  }

  const openQuotesCount = input.payments.length;

  return {
    leadsToday,
    leadsWeek,
    leadsMonth,
    paymentsWeekCents,
    paymentsMonthCents,
    openQuotesCount,
  };
}

export function buildFinanceOverview(input: {
  payments: PaymentOverviewRow[];
  quotes: StudioQuote[];
  paidMonthCents: number;
  mrrCents: number;
}): FinanceOverview {
  const openTotalCents = input.payments.reduce((sum, row) => sum + row.openCents, 0);
  const monthStart = isoDaysAgo(30);

  const paid30dCents = input.quotes
    .filter((q) => q.paidAt && isOnOrAfter(q.paidAt, monthStart))
    .reduce((sum, q) => sum + q.amountPaidCents, 0);

  const paidQuotes = input.quotes.filter(
    (q) => q.paymentStatus === "paid" || q.amountPaidCents >= q.chargeTotalCents,
  );
  const avgQuoteCents =
    paidQuotes.length > 0
      ? Math.round(
          paidQuotes.reduce((sum, q) => sum + q.amountPaidCents, 0) / paidQuotes.length,
        )
      : null;

  return {
    openTotalCents,
    paidMonthCents: input.paidMonthCents,
    paid30dCents,
    mrrCents: input.mrrCents,
    avgQuoteCents,
  };
}

export type RevenueTrendBar = {
  key: string;
  label: string;
  cents: number;
  isCurrent: boolean;
};

export type RevenueTrend = {
  bars: RevenueTrendBar[];
  total30dCents: number;
  total90dCents: number;
  maxCents: number;
};

function startOfWeekMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function buildRevenueTrend(quotes: StudioQuote[], weeks = 12): RevenueTrend {
  const now = new Date();
  const buckets: RevenueTrendBar[] = [];

  for (let i = weeks - 1; i >= 0; i -= 1) {
    const weekStart = startOfWeekMonday(now);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const label = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short" }).format(weekStart);
    buckets.push({
      key: weekStart.toISOString().slice(0, 10),
      label,
      cents: 0,
      isCurrent: i === 0,
    });
  }

  const day90 = isoDaysAgo(90);
  const day30 = isoDaysAgo(30);
  let total30dCents = 0;
  let total90dCents = 0;

  for (const quote of quotes) {
    if (!quote.paidAt) continue;
    const paid = quote.amountPaidCents;
    if (isOnOrAfter(quote.paidAt, day90)) total90dCents += paid;
    if (isOnOrAfter(quote.paidAt, day30)) total30dCents += paid;

    const paidAt = new Date(quote.paidAt);
    for (const bucket of buckets) {
      const start = new Date(`${bucket.key}T00:00:00`);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      if (paidAt >= start && paidAt < end) {
        bucket.cents += paid;
        break;
      }
    }
  }

  const maxCents = Math.max(...buckets.map((b) => b.cents), 1);

  return { bars: buckets, total30dCents, total90dCents, maxCents };
}

export const STUDIO_QUICK_LINKS = [
  { href: "/business", label: "Business-Start", external: false },
  { href: "/business/analyse", label: "Analyse-Seite", external: false },
  { href: "/business/kontakt", label: "Kontakt", external: false },
  { href: "/studio/app", label: "Alle Leads", external: false },
  { href: "/studio/app/kunden/neu", label: "Neuer Kunde", external: false },
  { href: "/studio/app/angebote", label: "Angebote", external: false },
] as const;

import { formatEuroCents } from "@/lib/business/pricing-utils";
import type { ClientContract, ClientDomain, StudioClient } from "@/lib/studio/client-types";
import { listStudioClients } from "@/lib/studio/clients";
import { listStudioInquiries } from "@/lib/studio/inquiries";
import { listStudioQuotes } from "@/lib/studio/quotes";
import type { StudioQuote } from "@/lib/studio/quote-types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductOverviewCard } from "@/lib/studio/product-metrics";
import { getStudioProductOverviews } from "@/lib/studio/product-metrics";
import type { StudioInquiry } from "@/lib/studio/types";
import type {
  ActivityFeedItem,
  AnalysisPipelineStage,
  FinanceOverview,
  LeadTypeBreakdownRow,
  PeriodSnapshot,
  PipelineStage,
  QuotePipelineStage,
  RevenueTrend,
  StudioRevenueSnapshot,
  SystemStatusItem,
  TodayActionItem,
} from "@/lib/studio/overview-extras";
import {
  buildActivityFeed,
  buildAnalysisPipeline,
  buildFinanceOverview,
  buildLeadTypeBreakdown,
  buildPeriodSnapshot,
  buildPipeline,
  buildQuotePipeline,
  buildRevenueTrend,
  buildTodayActions,
  monthlyCentsFromContract,
} from "@/lib/studio/overview-extras";
import { isSiteAnalyticsAvailable } from "@/lib/studio/site-analytics";
import {
  buildContractReminderMailto,
  buildDomainReminderMailto,
  buildPaymentReminderMailto,
} from "@/lib/studio/outreach";

export type PaymentBucket = "paid" | "partial" | "open";

export type PaymentOverviewRow = {
  quote: StudioQuote;
  bucket: PaymentBucket;
  openCents: number;
};

export type ContractReminderRow = {
  client: Pick<StudioClient, "id" | "companyName" | "contactEmail" | "contactName">;
  contract: ClientContract;
  reason: "billing_due" | "contract_ending";
  dueDate: string;
  daysLeft: number;
};

export type DomainReminderRow = {
  client: Pick<StudioClient, "id" | "companyName" | "contactEmail" | "contactName">;
  domain: ClientDomain;
  daysLeft: number;
};

export type StudioOverview = {
  stats: {
    openLeads: number;
    activeClients: number;
    openPayments: number;
    partialPayments: number;
    paidThisMonthCents: number;
    contractReminders: number;
    domainReminders: number;
    totalMrrCents: number;
  };
  payments: PaymentOverviewRow[];
  recentPaid: StudioQuote[];
  contractReminders: ContractReminderRow[];
  domainReminders: DomainReminderRow[];
  products: ProductOverviewCard[];
  analyticsConnected: boolean;
  analyticsSource: string;
  todayActions: TodayActionItem[];
  pipeline: PipelineStage[];
  recentInquiries: StudioInquiry[];
  revenue: StudioRevenueSnapshot;
  analysisPipeline: AnalysisPipelineStage[];
  recentActivity: ActivityFeedItem[];
  systemStatus: SystemStatusItem[];
  leadTypes: LeadTypeBreakdownRow[];
  quotePipeline: QuotePipelineStage[];
  period: PeriodSnapshot;
  finance: FinanceOverview;
  recentClients: StudioClient[];
  revenueTrend: RevenueTrend;
};

function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function startOfMonthISO(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export function classifyQuotePayment(quote: StudioQuote): PaymentOverviewRow | null {
  const total = quote.chargeTotalCents;
  const paid = quote.amountPaidCents;

  if (quote.paymentStatus === "paid" || paid >= total) {
    return null;
  }

  if (paid > 0) {
    return { quote, bucket: "partial", openCents: total - paid };
  }

  if (["draft", "sent", "accepted"].includes(quote.status)) {
    return { quote, bucket: "open", openCents: total };
  }

  return null;
}

async function fetchContractReminders(): Promise<ContractReminderRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const billingUntil = addDaysISO(14);
  const endingUntil = addDaysISO(30);
  const today = addDaysISO(0);

  const { data, error } = await admin
    .schema("studio")
    .from("client_contracts")
    .select(
      "id, client_id, title, contract_type, amount_cents, billing_cycle, starts_at, ends_at, next_billing_at, notes, clients!inner(id, company_name, contact_email, contact_name, status)",
    );

  if (error || !data) return [];

  const rows: ContractReminderRow[] = [];

  for (const raw of data as Record<string, unknown>[]) {
    const clientRaw = raw.clients as Record<string, unknown>;
    if (clientRaw.status !== "active") continue;

    const client = {
      id: clientRaw.id as string,
      companyName: clientRaw.company_name as string,
      contactEmail: clientRaw.contact_email as string,
      contactName: (clientRaw.contact_name as string | null) ?? null,
    };

    const contract: ClientContract = {
      id: raw.id as string,
      clientId: raw.client_id as string,
      title: raw.title as string,
      contractType: raw.contract_type as ClientContract["contractType"],
      amountCents: (raw.amount_cents as number | null) ?? null,
      billingCycle: (raw.billing_cycle as ClientContract["billingCycle"]) ?? null,
      startsAt: (raw.starts_at as string | null) ?? null,
      endsAt: (raw.ends_at as string | null) ?? null,
      nextBillingAt: (raw.next_billing_at as string | null) ?? null,
      notes: (raw.notes as string | null) ?? null,
    };

    if (contract.nextBillingAt && contract.nextBillingAt >= today && contract.nextBillingAt <= billingUntil) {
      rows.push({
        client,
        contract,
        reason: "billing_due",
        dueDate: contract.nextBillingAt,
        daysLeft: daysUntil(contract.nextBillingAt),
      });
    }

    if (contract.endsAt && contract.endsAt >= today && contract.endsAt <= endingUntil) {
      rows.push({
        client,
        contract,
        reason: "contract_ending",
        dueDate: contract.endsAt,
        daysLeft: daysUntil(contract.endsAt),
      });
    }
  }

  return rows.sort((a, b) => a.daysLeft - b.daysLeft);
}

async function fetchDomainReminders(): Promise<DomainReminderRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const until = addDaysISO(60);
  const today = addDaysISO(0);

  const { data, error } = await admin
    .schema("studio")
    .from("client_domains")
    .select(
      "id, client_id, domain, registrar, expires_at, auto_renew, notes, clients!inner(id, company_name, contact_email, contact_name, status)",
    )
    .not("expires_at", "is", null)
    .gte("expires_at", today)
    .lte("expires_at", until)
    .order("expires_at");

  if (error || !data) return [];

  return (data as Record<string, unknown>[])
    .filter((raw) => (raw.clients as { status: string }).status === "active")
    .map((raw) => {
      const clientRaw = raw.clients as Record<string, unknown>;
      const expiresAt = raw.expires_at as string;
      return {
        client: {
          id: clientRaw.id as string,
          companyName: clientRaw.company_name as string,
          contactEmail: clientRaw.contact_email as string,
          contactName: (clientRaw.contact_name as string | null) ?? null,
        },
        domain: {
          id: raw.id as string,
          clientId: raw.client_id as string,
          domain: raw.domain as string,
          registrar: (raw.registrar as string | null) ?? null,
          expiresAt,
          autoRenew: Boolean(raw.auto_renew),
          notes: (raw.notes as string | null) ?? null,
        },
        daysLeft: daysUntil(expiresAt),
      };
    });
}

async function fetchRevenueSnapshot(): Promise<StudioRevenueSnapshot> {
  const admin = createAdminClient();
  const empty: StudioRevenueSnapshot = {
    contractMrrCents: 0,
    hostingMrrCents: 0,
    totalMrrCents: 0,
    activeContractCount: 0,
    managedDomainCount: 0,
  };
  if (!admin) return empty;

  const today = addDaysISO(0);

  const [contractsRes, hostingRes, domainsRes] = await Promise.all([
    admin
      .schema("studio")
      .from("client_contracts")
      .select("amount_cents, billing_cycle, ends_at, clients!inner(status)")
      .eq("clients.status", "active"),
    admin
      .schema("studio")
      .from("client_hosting")
      .select("monthly_cents, clients!inner(status)")
      .eq("clients.status", "active"),
    admin
      .schema("studio")
      .from("client_domains")
      .select("id, clients!inner(status)")
      .eq("clients.status", "active"),
  ]);

  let contractMrrCents = 0;
  let activeContractCount = 0;

  for (const raw of (contractsRes.data ?? []) as Record<string, unknown>[]) {
    const endsAt = raw.ends_at as string | null;
    if (endsAt && endsAt < today) continue;
    const mrr = monthlyCentsFromContract(
      (raw.amount_cents as number | null) ?? null,
      (raw.billing_cycle as string | null) ?? null,
    );
    if (mrr > 0) {
      contractMrrCents += mrr;
      activeContractCount += 1;
    }
  }

  let hostingMrrCents = 0;
  for (const raw of (hostingRes.data ?? []) as Record<string, unknown>[]) {
    const monthly = (raw.monthly_cents as number | null) ?? 0;
    if (monthly > 0) hostingMrrCents += monthly;
  }

  const managedDomainCount = (domainsRes.data ?? []).length;

  return {
    contractMrrCents,
    hostingMrrCents,
    totalMrrCents: contractMrrCents + hostingMrrCents,
    activeContractCount,
    managedDomainCount,
  };
}

async function fetchSystemStatus(): Promise<SystemStatusItem[]> {
  const admin = createAdminClient();
  let supabaseOk = false;

  if (admin) {
    const { error } = await admin
      .schema("studio")
      .from("inquiries")
      .select("id", { head: true, count: "exact" });
    supabaseOk = !error;
  }

  const stripeOk = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const analyticsOk = isSiteAnalyticsAvailable();

  return [
    {
      id: "supabase",
      label: "Supabase",
      ok: supabaseOk,
      hint: supabaseOk ? "Studio-Schema erreichbar" : "Admin-Client oder DB nicht verfügbar",
    },
    {
      id: "stripe",
      label: "Stripe",
      ok: stripeOk,
      hint: stripeOk ? "Secret Key konfiguriert" : "STRIPE_SECRET_KEY fehlt",
    },
    {
      id: "analytics",
      label: "Analytics",
      ok: analyticsOk,
      hint: analyticsOk ? "Business-Traffic aktiv" : "Noch nicht verbunden",
    },
  ];
}

export async function getStudioOverview(): Promise<StudioOverview> {
  const monthStart = startOfMonthISO();

  const [inquiries, clients, quotes, contractReminders, domainReminders, productData, revenue, systemStatus] =
    await Promise.all([
    listStudioInquiries(100),
    listStudioClients(200),
    listStudioQuotes(100),
    fetchContractReminders(),
    fetchDomainReminders(),
    getStudioProductOverviews(),
    fetchRevenueSnapshot(),
    fetchSystemStatus(),
  ]);

  const openLeads = inquiries.filter((i) =>
    ["neue_anfrage", "kontaktiert", "angebot", "zahlung_ausstehend"].includes(i.status),
  ).length;

  const payments = quotes
    .map(classifyQuotePayment)
    .filter((p): p is PaymentOverviewRow => p != null)
    .sort((a, b) => b.openCents - a.openCents);

  const recentPaid = quotes
    .filter((q) => q.paymentStatus === "paid" || q.amountPaidCents >= q.chargeTotalCents)
    .sort((a, b) => (b.paidAt ?? b.updatedAt).localeCompare(a.paidAt ?? a.updatedAt))
    .slice(0, 8);

  const paidThisMonthCents = quotes
    .filter((q) => q.paidAt && q.paidAt >= monthStart)
    .reduce((sum, q) => sum + q.amountPaidCents, 0);

  const todayActions = buildTodayActions({
    inquiries,
    payments,
    contractReminders,
    domainReminders,
    buildPaymentMailto: buildPaymentReminderMailto,
    buildContractMailto: buildContractReminderMailto,
    buildDomainMailto: buildDomainReminderMailto,
  });

  const period = buildPeriodSnapshot({ inquiries, quotes, payments });
  const finance = buildFinanceOverview({
    payments,
    quotes,
    paidMonthCents: paidThisMonthCents,
    mrrCents: revenue.totalMrrCents,
  });

  const recentClients = [...clients]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return {
    stats: {
      openLeads,
      activeClients: clients.length,
      openPayments: payments.filter((p) => p.bucket === "open").length,
      partialPayments: payments.filter((p) => p.bucket === "partial").length,
      paidThisMonthCents,
      contractReminders: contractReminders.length,
      domainReminders: domainReminders.length,
      totalMrrCents: revenue.totalMrrCents,
    },
    payments,
    recentPaid,
    contractReminders,
    domainReminders,
    products: productData.products,
    analyticsConnected: productData.analyticsConnected,
    analyticsSource: productData.analyticsSource,
    todayActions,
    pipeline: buildPipeline(inquiries),
    recentInquiries: inquiries.slice(0, 8),
    revenue,
    analysisPipeline: buildAnalysisPipeline(inquiries),
    recentActivity: buildActivityFeed({ inquiries, quotes }),
    systemStatus,
    leadTypes: buildLeadTypeBreakdown(inquiries),
    quotePipeline: buildQuotePipeline(quotes),
    period,
    finance,
    recentClients,
    revenueTrend: buildRevenueTrend(quotes),
  };
}

export function formatOpenAmount(row: PaymentOverviewRow): string {
  return formatEuroCents(row.openCents);
}

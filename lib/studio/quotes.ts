import type { ProjectEstimate } from "@/lib/business/project-estimate.service";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateChargeTotal,
  type PaymentPhase,
  type PaymentPlanId,
  PAYMENT_PLANS,
} from "@/lib/studio/payment-plans";
import type {
  QuoteLineItem,
  QuoteStatus,
  StudioQuote,
} from "@/lib/studio/quote-types";

interface QuoteRow {
  id: string;
  inquiry_id: string | null;
  reference_id: string;
  status: string;
  title: string | null;
  customer_name: string | null;
  customer_email: string;
  company: string | null;
  subtotal_cents: number;
  tax_rate: number;
  tax_cents: number;
  total_cents: number;
  payment_plan: string;
  charge_total_cents: number | null;
  amount_paid_cents: number;
  payment_phase: string;
  installment_count: number | null;
  installments_paid: number;
  valid_until: string | null;
  notes: string | null;
  line_items: QuoteLineItem[];
  estimate_snapshot: Record<string, unknown> | null;
  stripe_checkout_session_id: string | null;
  stripe_subscription_id: string | null;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

const QUOTE_SELECT =
  "id, inquiry_id, reference_id, status, title, customer_name, customer_email, company, subtotal_cents, tax_rate, tax_cents, total_cents, payment_plan, charge_total_cents, amount_paid_cents, payment_phase, installment_count, installments_paid, valid_until, notes, line_items, estimate_snapshot, stripe_checkout_session_id, stripe_subscription_id, payment_status, paid_at, created_at, updated_at";

function mapQuote(row: QuoteRow): StudioQuote {
  const paymentPlan = (row.payment_plan ?? "full") as PaymentPlanId;
  return {
    id: row.id,
    inquiryId: row.inquiry_id,
    referenceId: row.reference_id,
    status: row.status as QuoteStatus,
    title: row.title,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    company: row.company,
    subtotalCents: row.subtotal_cents,
    taxRate: Number(row.tax_rate),
    taxCents: row.tax_cents,
    totalCents: row.total_cents,
    paymentPlan,
    chargeTotalCents: row.charge_total_cents ?? row.total_cents,
    amountPaidCents: row.amount_paid_cents ?? 0,
    paymentPhase: (row.payment_phase ?? "unpaid") as PaymentPhase,
    installmentCount: row.installment_count,
    installmentsPaid: row.installments_paid ?? 0,
    validUntil: row.valid_until,
    notes: row.notes,
    lineItems: row.line_items ?? [],
    estimateSnapshot: row.estimate_snapshot,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    paymentStatus: row.payment_status as StudioQuote["paymentStatus"],
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function calculateQuoteTotals(
  lineItems: QuoteLineItem[],
  taxRate = 19,
): { subtotalCents: number; taxCents: number; totalCents: number } {
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCents,
    0,
  );
  const taxCents = Math.round(subtotalCents * (taxRate / 100));
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

export function estimateToLineItems(estimate: ProjectEstimate): QuoteLineItem[] {
  return estimate.lineItems.map((item) => ({
    label: item.label,
    quantity: 1,
    unitCents: item.amountCents,
  }));
}

function paymentPlanFields(totalCents: number, planId: PaymentPlanId = "full") {
  const plan = PAYMENT_PLANS[planId];
  const chargeTotalCents = calculateChargeTotal(totalCents, planId);
  return {
    payment_plan: planId,
    charge_total_cents: chargeTotalCents,
    installment_count: plan.installmentCount > 0 ? plan.installmentCount : null,
    installments_paid: 0,
    amount_paid_cents: 0,
    payment_phase: "unpaid" as PaymentPhase,
  };
}

export async function listStudioQuotes(limit = 50): Promise<StudioQuote[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .schema("studio")
    .from("quotes")
    .select(QUOTE_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("[studio/quotes] list failed:", error?.message);
    return [];
  }

  return (data as QuoteRow[]).map(mapQuote);
}

export async function getStudioQuoteById(id: string): Promise<StudioQuote | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("quotes")
    .select(QUOTE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error("[studio/quotes] get failed:", error?.message);
    return null;
  }

  return mapQuote(data as QuoteRow);
}

export async function getQuotesByInquiryId(inquiryId: string): Promise<StudioQuote[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .schema("studio")
    .from("quotes")
    .select(QUOTE_SELECT)
    .eq("inquiry_id", inquiryId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as QuoteRow[]).map(mapQuote);
}

export async function createQuoteFromInquiry(input: {
  inquiryId: string;
  customerName: string | null;
  customerEmail: string;
  company: string | null;
  inquiryReferenceId: string;
  estimate: ProjectEstimate;
}): Promise<StudioQuote | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const lineItems = estimateToLineItems(input.estimate);
  const { subtotalCents, taxCents, totalCents } = calculateQuoteTotals(lineItems);

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);

  const row = {
    inquiry_id: input.inquiryId,
    title: `Angebot ${input.inquiryReferenceId}`,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    company: input.company,
    subtotal_cents: subtotalCents,
    tax_rate: 19,
    tax_cents: taxCents,
    total_cents: totalCents,
    valid_until: validUntil.toISOString().slice(0, 10),
    notes: input.estimate.disclaimer,
    line_items: lineItems,
    estimate_snapshot: input.estimate,
    status: "draft",
    payment_status: "unpaid",
    ...paymentPlanFields(totalCents, "full"),
  };

  const { data, error } = await admin
    .schema("studio")
    .from("quotes")
    .insert(row)
    .select(QUOTE_SELECT)
    .single();

  if (error || !data) {
    console.error("[studio/quotes] create failed:", error?.message);
    return null;
  }

  return mapQuote(data as QuoteRow);
}

export async function updateStudioQuote(
  id: string,
  patch: {
    title?: string;
    notes?: string;
    lineItems?: QuoteLineItem[];
    status?: QuoteStatus;
    validUntil?: string;
  },
): Promise<StudioQuote | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const existing = await getStudioQuoteById(id);
  if (!existing) return null;

  const lineItems = patch.lineItems ?? existing.lineItems;
  const { subtotalCents, taxCents, totalCents } = calculateQuoteTotals(
    lineItems,
    existing.taxRate,
  );

  const chargeTotalCents = calculateChargeTotal(totalCents, existing.paymentPlan);

  const { data, error } = await admin
    .schema("studio")
    .from("quotes")
    .update({
      title: patch.title ?? existing.title,
      notes: patch.notes ?? existing.notes,
      line_items: lineItems,
      subtotal_cents: subtotalCents,
      tax_cents: taxCents,
      total_cents: totalCents,
      charge_total_cents: chargeTotalCents,
      status: patch.status ?? existing.status,
      valid_until: patch.validUntil ?? existing.validUntil,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(QUOTE_SELECT)
    .single();

  if (error || !data) {
    console.error("[studio/quotes] update failed:", error?.message);
    return null;
  }

  return mapQuote(data as QuoteRow);
}

export async function updateQuotePaymentPlan(
  id: string,
  planId: PaymentPlanId,
): Promise<StudioQuote | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const existing = await getStudioQuoteById(id);
  if (!existing) return null;

  if (existing.amountPaidCents > 0) {
    console.error("[studio/quotes] cannot change plan after payment started");
    return null;
  }

  const planFields = paymentPlanFields(existing.totalCents, planId);

  const { data, error } = await admin
    .schema("studio")
    .from("quotes")
    .update({
      ...planFields,
      payment_status: "unpaid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(QUOTE_SELECT)
    .single();

  if (error || !data) return null;
  return mapQuote(data as QuoteRow);
}

export async function markQuotePaymentPending(
  id: string,
  stripeSessionId: string,
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .schema("studio")
    .from("quotes")
    .update({
      stripe_checkout_session_id: stripeSessionId,
      payment_status: "pending",
      payment_phase: "pending",
      status: "sent",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return !error;
}

export async function markQuoteInstallmentStarted(input: {
  quoteId: string;
  stripeSessionId: string;
  subscriptionId: string;
}): Promise<StudioQuote | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("quotes")
    .update({
      stripe_checkout_session_id: input.stripeSessionId,
      stripe_subscription_id: input.subscriptionId,
      payment_status: "partial",
      payment_phase: "pending",
      status: "sent",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.quoteId)
    .select(QUOTE_SELECT)
    .single();

  if (error || !data) return null;
  return mapQuote(data as QuoteRow);
}

export async function recordQuotePayment(input: {
  quoteId: string;
  stripeSessionId: string;
  amountCents: number;
  step: "full" | "deposit" | "final" | "installment";
}): Promise<StudioQuote | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const existing = await getStudioQuoteById(input.quoteId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const amountPaidCents = existing.amountPaidCents + input.amountCents;
  const isComplete = amountPaidCents >= existing.chargeTotalCents;

  let paymentPhase: PaymentPhase = existing.paymentPhase;
  let paymentStatus: StudioQuote["paymentStatus"] = existing.paymentStatus;

  if (input.step === "deposit") {
    paymentPhase = "deposit_paid";
    paymentStatus = "partial";
  } else if (isComplete) {
    paymentPhase = "completed";
    paymentStatus = "paid";
  } else if (input.step === "installment") {
    paymentStatus = "partial";
  }

  const installmentsPaid =
    input.step === "installment"
      ? existing.installmentsPaid + 1
      : existing.installmentsPaid;

  const installmentComplete =
    existing.installmentCount !== null &&
    installmentsPaid >= existing.installmentCount;

  if (installmentComplete) {
    paymentPhase = "completed";
    paymentStatus = "paid";
  }

  const { data, error } = await admin
    .schema("studio")
    .from("quotes")
    .update({
      amount_paid_cents: amountPaidCents,
      payment_phase: installmentComplete || isComplete ? "completed" : paymentPhase,
      payment_status: installmentComplete || isComplete ? "paid" : paymentStatus,
      status: installmentComplete || isComplete ? "paid" : existing.status,
      paid_at: installmentComplete || isComplete ? now : existing.paidAt,
      installments_paid: installmentsPaid,
      stripe_checkout_session_id: input.stripeSessionId,
      updated_at: now,
    })
    .eq("id", input.quoteId)
    .select(QUOTE_SELECT)
    .single();

  if (error || !data) {
    console.error("[studio/quotes] record payment failed:", error?.message);
    return null;
  }

  const quote = mapQuote(data as QuoteRow);

  if ((installmentComplete || isComplete) && quote.inquiryId) {
    await admin
      .schema("studio")
      .from("inquiries")
      .update({ status: "abgeschlossen", updated_at: now })
      .eq("id", quote.inquiryId);
  }

  return quote;
}

/** @deprecated — use recordQuotePayment */
export async function markQuotePaid(input: {
  quoteId: string;
  stripeSessionId: string;
}): Promise<StudioQuote | null> {
  const quote = await getStudioQuoteById(input.quoteId);
  if (!quote) return null;
  return recordQuotePayment({
    quoteId: input.quoteId,
    stripeSessionId: input.stripeSessionId,
    amountCents: quote.chargeTotalCents - quote.amountPaidCents,
    step: "full",
  });
}

export async function listPaidQuotes(limit = 50): Promise<StudioQuote[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .schema("studio")
    .from("quotes")
    .select(QUOTE_SELECT)
    .eq("payment_status", "paid")
    .order("paid_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as QuoteRow[]).map(mapQuote);
}

export async function getQuoteBySubscriptionId(subscriptionId: string): Promise<StudioQuote | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio")
    .from("quotes")
    .select(QUOTE_SELECT)
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (error || !data) return null;
  return mapQuote(data as QuoteRow);
}

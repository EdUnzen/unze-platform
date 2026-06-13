import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PaymentUpsertInput = {
  userId: string;
  communityId: string;
  groupId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeInvoiceId?: string | null;
  amountCents: number;
  currency?: string;
  paymentKind?: "one_time" | "subscription_invoice";
  status?: "pending" | "succeeded" | "failed" | "refunded";
  description?: string | null;
  metadata?: Record<string, unknown>;
};

function getDb() {
  return createAdminClient() ?? null;
}

export async function insertPaymentRecord(input: PaymentUpsertInput) {
  const supabase = getDb();
  if (!supabase) return { error: "Service Role nicht konfiguriert" };

  const { error } = await supabase.from("community_payments").insert({
    user_id: input.userId,
    community_id: input.communityId,
    group_id: input.groupId ?? null,
    stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    stripe_invoice_id: input.stripeInvoiceId ?? null,
    amount_cents: input.amountCents,
    currency: input.currency ?? "eur",
    payment_kind: input.paymentKind ?? "one_time",
    status: input.status ?? "pending",
    description: input.description ?? null,
    metadata: input.metadata ?? {},
  });

  return { error: error?.message ?? null };
}

export async function updatePaymentBySessionId(
  sessionId: string,
  patch: Partial<{
    status: string;
    stripePaymentIntentId: string;
    stripeInvoiceId: string;
  }>,
) {
  const supabase = getDb();
  if (!supabase) return;

  const payload: Record<string, unknown> = {};
  if (patch.status) payload.status = patch.status;
  if (patch.stripePaymentIntentId) {
    payload.stripe_payment_intent_id = patch.stripePaymentIntentId;
  }
  if (patch.stripeInvoiceId) payload.stripe_invoice_id = patch.stripeInvoiceId;

  await supabase
    .from("community_payments")
    .update(payload)
    .eq("stripe_checkout_session_id", sessionId);
}

export async function fetchPaymentByPaymentIntentId(paymentIntentId: string) {
  const supabase = getDb();
  if (!supabase) return null;

  const { data } = await supabase
    .from("community_payments")
    .select("user_id, community_id, payment_kind, status")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  return data;
}

export async function updatePaymentByPaymentIntentId(
  paymentIntentId: string,
  status: "refunded" | "failed" | "succeeded",
) {
  const supabase = getDb();
  if (!supabase) return { error: "Service Role nicht konfiguriert" };

  const { error } = await supabase
    .from("community_payments")
    .update({ status })
    .eq("stripe_payment_intent_id", paymentIntentId);

  return { error: error?.message ?? null };
}

export async function paymentExistsForInvoice(
  stripeInvoiceId: string,
): Promise<boolean> {
  const supabase = getDb();
  if (!supabase) return false;

  const { data } = await supabase
    .from("community_payments")
    .select("id")
    .eq("stripe_invoice_id", stripeInvoiceId)
    .maybeSingle();

  return Boolean(data);
}

export type SubscriptionPaymentTimestamps = {
  lastSuccessfulPaymentAt: string | null;
  lastFailedPaymentAt: string | null;
};

/** Letzte erfolgreiche / fehlgeschlagene Abo-Zahlung je Nutzer in einer Community */
export async function getSubscriptionPaymentTimestampsByCommunity(
  communityId: string,
): Promise<Map<string, SubscriptionPaymentTimestamps>> {
  const supabase = getDb();
  const map = new Map<string, SubscriptionPaymentTimestamps>();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from("community_payments")
    .select("user_id, status, created_at")
    .eq("community_id", communityId)
    .eq("payment_kind", "subscription_invoice")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[payment.repository] payment timestamps:", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const userId = row.user_id as string;
    if (!map.has(userId)) {
      map.set(userId, { lastSuccessfulPaymentAt: null, lastFailedPaymentAt: null });
    }
    const entry = map.get(userId)!;
    if (row.status === "succeeded" && !entry.lastSuccessfulPaymentAt) {
      entry.lastSuccessfulPaymentAt = row.created_at as string;
    }
    if (row.status === "failed" && !entry.lastFailedPaymentAt) {
      entry.lastFailedPaymentAt = row.created_at as string;
    }
  }

  return map;
}

export async function getUserPayments(userId: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_payments")
    .select(
      `
      *,
      community:communities (slug, title),
      group:community_groups (title)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[payment.repository] user payments:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCommunityPaymentsForCreator(
  communityId: string,
  sinceIso?: string,
) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("community_payments")
    .select("*")
    .eq("community_id", communityId)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false });

  if (sinceIso) {
    query = query.gte("created_at", sinceIso);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[payment.repository] community payments:", error.message);
    return [];
  }

  return data ?? [];
}

export async function sumMonthlyRevenueCents(communityId: string): Promise<number> {
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const payments = await getCommunityPaymentsForCreator(
    communityId,
    since.toISOString(),
  );

  return payments.reduce((sum, p) => sum + ((p.amount_cents as number) ?? 0), 0);
}

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SubscriptionStatus } from "@/types/database";
import type Stripe from "stripe";

export type SubscriptionUpsertInput = {
  userId: string;
  communityId: string;
  groupId?: string | null;
  status: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  planInterval?: string | null;
  amountCents?: number | null;
  currency?: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  canceledAt?: string | null;
  cancelAtPeriodEnd?: boolean;
};

function getDb() {
  return createAdminClient() ?? null;
}

export async function upsertSubscriptionFromStripe(
  input: SubscriptionUpsertInput,
): Promise<{ error: string | null }> {
  const supabase = getDb();
  if (!supabase) return { error: "Service Role nicht konfiguriert" };

  const payload = {
    user_id: input.userId,
    community_id: input.communityId,
    group_id: input.groupId ?? null,
    status: input.status,
    stripe_customer_id: input.stripeCustomerId ?? null,
    stripe_subscription_id: input.stripeSubscriptionId ?? null,
    stripe_price_id: input.stripePriceId ?? null,
    plan_interval: input.planInterval ?? null,
    amount_cents: input.amountCents ?? null,
    currency: input.currency ?? "eur",
    current_period_start: input.currentPeriodStart ?? null,
    current_period_end: input.currentPeriodEnd ?? null,
    canceled_at: input.canceledAt ?? null,
    cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
  };

  const { error } = await supabase.from("subscriptions").upsert(payload, {
    onConflict: "user_id,community_id",
  });

  return { error: error?.message ?? null };
}

export async function findSubscriptionByStripeId(stripeSubscriptionId: string) {
  const supabase = getDb();
  if (!supabase) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  return data;
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    default:
      return "inactive";
  }
}

export function isActiveSubscriptionStatus(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing";
}

export async function hasActiveCommunitySubscription(
  userId: string,
  communityId: string,
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("community_id", communityId)
    .maybeSingle();

  if (error || !data) return false;
  return isActiveSubscriptionStatus(data.status as SubscriptionStatus);
}

export async function getUserSubscriptions(userId: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `
      *,
      community:communities (slug, title),
      group:community_groups (title)
    `,
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[subscription.repository] user subs:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCommunitySubscriptionsForCreator(communityId: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `
      id,
      user_id,
      status,
      plan_interval,
      amount_cents,
      current_period_end,
      canceled_at,
      cancel_at_period_end,
      group:community_groups (title),
      profile:profiles!subscriptions_user_id_fkey (display_name, username)
    `,
    )
    .eq("community_id", communityId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[subscription.repository] community subs:", error.message);
    return [];
  }

  return data ?? [];
}

export async function countSubscriptionsByStatus(communityId: string) {
  const supabase = await createClient();
  if (!supabase) {
    return { active: 0, canceled: 0, expiring: 0 };
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("status, cancel_at_period_end")
    .eq("community_id", communityId);

  let active = 0;
  let canceled = 0;
  let expiring = 0;

  for (const row of data ?? []) {
    if (row.status === "active" || row.status === "trialing") {
      active += 1;
      if (row.cancel_at_period_end) expiring += 1;
    }
    if (row.status === "canceled") canceled += 1;
  }

  return { active, canceled, expiring };
}

export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  const supabase = getDb();
  if (!supabase) return false;

  const { data } = await supabase
    .from("stripe_webhook_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();

  return Boolean(data);
}

export async function markWebhookEventProcessed(
  eventId: string,
  eventType: string,
): Promise<void> {
  const supabase = getDb();
  if (!supabase) return;

  await supabase.from("stripe_webhook_events").upsert({
    event_id: eventId,
    event_type: eventType,
    processed_at: new Date().toISOString(),
  });
}

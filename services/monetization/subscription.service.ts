/**
 * Stripe-Vorbereitung — architecture/modules/MONETIZATION_SYSTEM.md
 * Keine aktive Stripe-Integration in dieser Phase.
 */

import { createClient } from "@/lib/supabase/server";
import type { SubscriptionStatus } from "@/types/database";

export interface SubscriptionPrep {
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  communityId: string;
}

export async function getSubscriptionForCommunity(
  userId: string,
  communityId: string,
): Promise<SubscriptionPrep | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select("status, stripe_customer_id, stripe_subscription_id, community_id")
    .eq("user_id", userId)
    .eq("community_id", communityId)
    .maybeSingle();

  if (!data) return null;

  const row = data as {
    status: SubscriptionStatus;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    community_id: string;
  };

  return {
    status: row.status,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    communityId: row.community_id,
  };
}

/** Platzhalter für spätere Stripe-Checkout-Session */
export async function prepareCheckout(_communityId: string) {
  return {
    ready: false,
    message:
      "Stripe-Integration folgt in Phase 4. Schema (subscriptions) ist vorbereitet.",
  };
}

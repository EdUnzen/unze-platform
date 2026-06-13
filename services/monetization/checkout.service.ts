import { getAppUrl } from "@/lib/env";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants/revenue";
import { planIntervalToStripe } from "@/lib/monetization/plans";
import { getStripeClient } from "@/lib/stripe/server";
import { isStripeConfigured } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { insertPaymentRecord } from "@/services/monetization/payment.repository";
import type { BillingPlanInterval } from "@/types/billing";
import type Stripe from "stripe";

async function getCommunityCheckoutContext(communityId: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: community } = await supabase
    .from("communities")
    .select(
      `
      id,
      slug,
      title,
      creator_id,
      monetization_enabled,
      stripe_product_id,
      stripe_price_monthly_id,
      stripe_price_semiannual_id,
      stripe_price_yearly_id,
      price_monthly_cents,
      price_semiannual_cents,
      price_yearly_cents
    `,
    )
    .eq("id", communityId)
    .maybeSingle();

  if (!community) return null;

  const { data: creatorProfile } = await supabase
    .from("creator_profiles")
    .select("stripe_connect_account_id, stripe_connect_onboarding_complete")
    .eq("user_id", community.creator_id)
    .maybeSingle();

  return {
    community,
    connectAccountId:
      (creatorProfile?.stripe_connect_account_id as string) ?? null,
    connectReady: Boolean(creatorProfile?.stripe_connect_onboarding_complete),
  };
}

function getPriceIdForInterval(
  community: Record<string, unknown>,
  interval: BillingPlanInterval,
): string | null {
  switch (interval) {
    case "month":
      return (community.stripe_price_monthly_id as string) ?? null;
    case "semiannual":
      return (community.stripe_price_semiannual_id as string) ?? null;
    case "year":
      return (community.stripe_price_yearly_id as string) ?? null;
    default:
      return null;
  }
}

function connectSubscriptionData(connectAccountId: string | null) {
  if (!connectAccountId) return undefined;
  return {
    transfer_data: { destination: connectAccountId },
    application_fee_percent: PLATFORM_FEE_PERCENT,
  };
}

function connectPaymentData(connectAccountId: string | null, amountCents: number) {
  if (!connectAccountId) return undefined;
  const fee = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
  return {
    application_fee_amount: fee,
    transfer_data: { destination: connectAccountId },
  };
}

export async function createCommunitySubscriptionCheckout(input: {
  userId: string;
  userEmail: string;
  communityId: string;
  interval: Exclude<BillingPlanInterval, "one_time">;
  returnPath?: string;
}): Promise<{ url: string | null; error: string | null }> {
  if (!isStripeConfigured()) {
    return { url: null, error: "Stripe nicht konfiguriert" };
  }

  const stripe = await getStripeClient();
  if (!stripe) return { url: null, error: "Stripe nicht konfiguriert" };

  const ctx = await getCommunityCheckoutContext(input.communityId);
  if (!ctx) return { url: null, error: "Community nicht gefunden" };
  if (!ctx.community.monetization_enabled) {
    return { url: null, error: "Monetarisierung nicht aktiv" };
  }

  const priceId = getPriceIdForInterval(ctx.community, input.interval);
  if (!priceId) {
    return {
      url: null,
      error: "Kein Stripe-Preis für dieses Intervall — Creator muss Preise speichern.",
    };
  }

  const base = getAppUrl();
  const returnPath = input.returnPath ?? `/community/${ctx.community.slug}`;

  const checkoutMetadata = {
    unze_subscriber_id: input.userId,
    unze_community_id: input.communityId,
    unze_plan_interval: input.interval,
    unze_checkout_type: "community_subscription",
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: input.userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      ...connectSubscriptionData(ctx.connectAccountId),
      metadata: checkoutMetadata,
    },
    success_url: `${base}/profile/billing?success=1&community=${ctx.community.slug}`,
    cancel_url: `${base}${returnPath}?checkout=cancel`,
    metadata: checkoutMetadata,
  });

  return { url: session.url, error: null };
}

export async function createGroupOneTimeCheckout(input: {
  userId: string;
  userEmail: string;
  communityId: string;
  communitySlug: string;
  groupId: string;
  groupSlug: string;
  groupTitle: string;
  priceCents: number;
  stripePriceId?: string | null;
  bookingSlotId?: string;
  bookingSlotLabel?: string;
}): Promise<{ url: string | null; error: string | null }> {
  if (!isStripeConfigured()) {
    return { url: null, error: "Stripe nicht konfiguriert" };
  }

  const stripe = await getStripeClient();
  if (!stripe) return { url: null, error: "Stripe nicht konfiguriert" };

  const ctx = await getCommunityCheckoutContext(input.communityId);
  const connectAccountId = ctx?.connectAccountId ?? null;
  const base = getAppUrl();

  const lineItem = input.stripePriceId
    ? { price: input.stripePriceId, quantity: 1 }
    : {
        price_data: {
          currency: "eur",
          unit_amount: input.priceCents,
          product_data: {
            name: input.groupTitle,
            description: `Dienstleistung · ${ctx?.community.title ?? "Community"}`,
          },
        },
        quantity: 1,
      };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.userEmail,
    line_items: [lineItem],
    payment_intent_data: connectPaymentData(connectAccountId, input.priceCents),
    success_url: `${base}/profile/billing?success=1`,
    cancel_url: `${base}/community/${input.communitySlug}/group/${input.groupSlug}?checkout=cancel`,
    metadata: {
      unze_subscriber_id: input.userId,
      unze_community_id: input.communityId,
      unze_group_id: input.groupId,
      unze_checkout_type: "group_one_time",
      ...(input.bookingSlotId
        ? { unze_booking_slot_id: input.bookingSlotId }
        : {}),
      ...(input.bookingSlotLabel
        ? { unze_booking_slot_label: input.bookingSlotLabel }
        : {}),
    },
  });

  await insertPaymentRecord({
    userId: input.userId,
    communityId: input.communityId,
    groupId: input.groupId,
    stripeCheckoutSessionId: session.id,
    amountCents: input.priceCents,
    status: "pending",
    description: input.groupTitle,
  });

  return { url: session.url, error: null };
}

export async function createCustomerPortalSession(input: {
  userId: string;
  returnPath?: string;
}): Promise<{ url: string | null; error: string | null }> {
  if (!isStripeConfigured()) {
    return { url: null, error: "Stripe nicht konfiguriert" };
  }

  const stripe = await getStripeClient();
  if (!stripe) return { url: null, error: "Stripe nicht konfiguriert" };

  const supabase = await createClient();
  if (!supabase) return { url: null, error: "Supabase nicht konfiguriert" };

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", input.userId)
    .not("stripe_customer_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const customerId = sub?.stripe_customer_id as string | null;
  if (!customerId) {
    return { url: null, error: "Kein Stripe-Kunde gefunden — zuerst Abo abschließen." };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getAppUrl()}${input.returnPath ?? "/profile/billing"}`,
  });

  return { url: session.url, error: null };
}

export async function syncCommunityStripePrices(input: {
  communityId: string;
  communityTitle: string;
  prices: {
    monthlyCents?: number | null;
    semiannualCents?: number | null;
    yearlyCents?: number | null;
  };
}): Promise<{ error: string | null }> {
  if (!isStripeConfigured()) {
    return { error: "Stripe nicht konfiguriert" };
  }

  const stripe = await getStripeClient();
  const supabase = await createClient();
  if (!stripe || !supabase) return { error: "Konfiguration fehlt" };

  const stripeClient = stripe;
  const supabaseClient = supabase;

  const { data: community } = await supabaseClient
    .from("communities")
    .select("stripe_product_id")
    .eq("id", input.communityId)
    .maybeSingle();

  let productId = community?.stripe_product_id as string | null;
  if (!productId) {
    const product = await stripeClient.products.create({
      name: input.communityTitle,
      metadata: { unze_community_id: input.communityId },
    });
    productId = product.id;
  }

  const updates: Record<string, unknown> = {
    stripe_product_id: productId,
    price_monthly_cents: input.prices.monthlyCents ?? null,
    price_semiannual_cents: input.prices.semiannualCents ?? null,
    price_yearly_cents: input.prices.yearlyCents ?? null,
  };

  async function ensurePrice(
    cents: number | null | undefined,
    interval: Exclude<BillingPlanInterval, "one_time">,
    column: string,
  ) {
    if (!cents || cents <= 0) {
      updates[column] = null;
      return;
    }
    const stripeInterval = planIntervalToStripe(interval)!;
    const price = await stripeClient.prices.create({
      product: productId!,
      currency: "eur",
      unit_amount: cents,
      recurring: stripeInterval,
    });
    updates[column] = price.id;
  }

  await ensurePrice(input.prices.monthlyCents, "month", "stripe_price_monthly_id");
  await ensurePrice(
    input.prices.semiannualCents,
    "semiannual",
    "stripe_price_semiannual_id",
  );
  await ensurePrice(input.prices.yearlyCents, "year", "stripe_price_yearly_id");

  const { error } = await supabaseClient
    .from("communities")
    .update(updates)
    .eq("id", input.communityId);

  return { error: error?.message ?? null };
}

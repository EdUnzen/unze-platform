import { calculateRevenueSplit } from "@/lib/revenue/calculate-split";
import { getStripeClient } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  insertPaymentRecord,
  updatePaymentBySessionId,
} from "@/services/monetization/payment.repository";
import {
  findSubscriptionByStripeId,
  isWebhookEventProcessed,
  mapStripeSubscriptionStatus,
  markWebhookEventProcessed,
  upsertSubscriptionFromStripe,
} from "@/services/monetization/subscription.repository";
import { fetchReferralByReferredUser } from "@/services/referral/referral.repository";
import { insertSandboxLedgerEntry } from "@/services/referral/referral.repository";
import type Stripe from "stripe";

function subscriptionPeriodUnix(subscription: Stripe.Subscription): {
  start: number | null;
  end: number | null;
} {
  const item = subscription.items.data[0] as
    | { current_period_start?: number; current_period_end?: number }
    | undefined;
  const legacy = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  return {
    start: item?.current_period_start ?? legacy.current_period_start ?? null,
    end: item?.current_period_end ?? legacy.current_period_end ?? null,
  };
}

async function upsertFromStripeSubscription(
  subscription: Stripe.Subscription,
  metadata?: Record<string, string>,
) {
  const meta = { ...subscription.metadata, ...metadata };
  let userId = meta.unze_subscriber_id;
  let communityId = meta.unze_community_id;

  if (!userId || !communityId) {
    const existing = await findSubscriptionByStripeId(subscription.id);
    if (!existing) return;
    userId = existing.user_id as string;
    communityId = existing.community_id as string;
  }

  const item = subscription.items.data[0];
  const price = item?.price;
  const period = subscriptionPeriodUnix(subscription);

  await upsertSubscriptionFromStripe({
    userId,
    communityId,
    groupId: meta.unze_group_id || null,
    status: mapStripeSubscriptionStatus(subscription.status),
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: price?.id ?? null,
    planInterval: meta.unze_plan_interval ?? price?.recurring?.interval ?? null,
    amountCents: price?.unit_amount ?? null,
    currency: price?.currency ?? "eur",
    currentPeriodStart: period.start
      ? new Date(period.start * 1000).toISOString()
      : null,
    currentPeriodEnd: period.end
      ? new Date(period.end * 1000).toISOString()
      : null,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const userId = meta.unze_subscriber_id;
  const communityId = meta.unze_community_id;
  const checkoutType = meta.unze_checkout_type;

  if (session.mode === "subscription" && session.subscription && userId && communityId) {
    const stripe = await getStripeClient();
    if (!stripe) return;

    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;

    const subscription = await stripe.subscriptions.retrieve(subId);
    await upsertFromStripeSubscription(subscription, meta);

    if (session.amount_total && session.amount_total > 0) {
      await recordLedgerFromSession(session, userId, communityId);
    }
    return;
  }

  if (checkoutType === "group_one_time" && userId && communityId) {
    await updatePaymentBySessionId(session.id, {
      status: "succeeded",
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
    });

    const grossCents = session.amount_total ?? 0;
    if (grossCents > 0) {
      await recordLedgerFromSession(session, userId, communityId);
    }
    return;
  }

  // Legacy sandbox checkout (creator test)
  const creatorUserId = meta.unze_user_id;
  const grossCents = session.amount_total ?? 0;
  if (creatorUserId && grossCents > 0 && meta.sandbox === "true") {
    await recordLedgerFromSession(session, creatorUserId, communityId);
  }
}

async function recordLedgerFromSession(
  session: Stripe.Checkout.Session,
  creatorUserId: string,
  communityId?: string,
) {
  const grossCents = session.amount_total ?? 0;
  const referral = await fetchReferralByReferredUser(creatorUserId);
  const hasReferrer = referral?.status === "active";
  const split = calculateRevenueSplit(grossCents, { hasActiveReferrer: hasReferrer });

  await insertSandboxLedgerEntry({
    communityId: communityId ?? undefined,
    creatorUserId,
    referrerUserId: hasReferrer ? referral!.referrer_user_id : null,
    grossAmountCents: split.grossCents,
    platformFeeCents: split.platformFeeCents,
    netPlatformCents: split.netPlatformCents,
    referrerShareCents: split.referrerShareCents,
  });
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const legacy = invoice as Stripe.Invoice & {
    subscription?: string | { id: string } | null;
  };
  const sub = legacy.subscription;
  if (sub) {
    return typeof sub === "string" ? sub : sub.id;
  }
  const lineSub = invoice.lines?.data?.[0]?.subscription;
  if (!lineSub) return null;
  return typeof lineSub === "string" ? lineSub : lineSub.id;
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(invoice);
  if (!subId) return;

  const stripe = await getStripeClient();
  if (!stripe) return;

  const subscription = await stripe.subscriptions.retrieve(subId);
  await upsertFromStripeSubscription(subscription);

  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

  const supabase = createAdminClient();
  if (!supabase || !customerId) return;

  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("user_id, community_id, group_id")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();

  if (subRow && invoice.amount_paid) {
    await insertPaymentRecord({
      userId: subRow.user_id as string,
      communityId: subRow.community_id as string,
      groupId: (subRow.group_id as string) ?? null,
      stripeInvoiceId: invoice.id,
      amountCents: invoice.amount_paid,
      paymentKind: "subscription_invoice",
      status: "succeeded",
      description: invoice.description ?? "Abo-Zahlung",
    });
  }
}

export async function handleStripeWebhookEvent(
  event: Stripe.Event,
): Promise<void> {
  if (await isWebhookEventProcessed(event.id)) return;

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertFromStripeSubscription(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await upsertFromStripeSubscription(event.data.object as Stripe.Subscription);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoiceSubscriptionId(invoice);
      if (subId) {
        const stripe = await getStripeClient();
        if (stripe) {
          const subscription = await stripe.subscriptions.retrieve(subId);
          await upsertFromStripeSubscription(subscription);
        }
      }
      break;
    }
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const userId = account.metadata?.unze_user_id;
      if (userId && account.details_submitted && account.charges_enabled) {
        const supabase = createAdminClient();
        if (supabase) {
          await supabase
            .from("creator_profiles")
            .update({ stripe_connect_onboarding_complete: true })
            .eq("user_id", userId);
        }
      }
      break;
    }
    default:
      break;
  }

  await markWebhookEventProcessed(event.id, event.type);
}

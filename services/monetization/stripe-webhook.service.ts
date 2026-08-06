import { calculateRevenueSplit } from "@/lib/revenue/calculate-split";
import { getStripeClient } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncMembershipForSubscription } from "@/services/monetization/membership-sync.service";
import { queueMemberRemovalTask } from "@/services/lifecycle/removal-task.service";
import { softRemoveMemberByUserInDb } from "@/services/lifecycle/removal-task.repository";
import {
  fetchPaymentByPaymentIntentId,
  insertPaymentRecord,
  paymentExistsForInvoice,
  updatePaymentByPaymentIntentId,
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
import type { SubscriptionStatus } from "@/types/database";
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

async function upsertAndSyncSubscription(
  subscription: Stripe.Subscription,
  metadata?: Record<string, string>,
): Promise<{ userId: string; communityId: string; status: SubscriptionStatus }> {
  const meta = { ...subscription.metadata, ...metadata };
  let userId = meta.unze_subscriber_id;
  let communityId = meta.unze_community_id;

  if (!userId || !communityId) {
    const existing = await findSubscriptionByStripeId(subscription.id);
    if (!existing) {
      throw new Error(
        `Subscription ${subscription.id} ohne Metadaten und ohne DB-Zeile`,
      );
    }
    userId = existing.user_id as string;
    communityId = existing.community_id as string;
  }

  const item = subscription.items.data[0];
  const price = item?.price;
  const period = subscriptionPeriodUnix(subscription);
  const status = mapStripeSubscriptionStatus(subscription.status);

  const { error } = await upsertSubscriptionFromStripe({
    userId,
    communityId,
    groupId: meta.unze_group_id || null,
    status,
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

  if (error) {
    throw new Error(`Subscription-Upsert fehlgeschlagen: ${error}`);
  }

  await syncMembershipForSubscription({
    userId,
    communityId,
    status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEnd: period.end
      ? new Date(period.end * 1000).toISOString()
      : null,
  });

  return { userId, communityId, status };
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const userId = meta.unze_subscriber_id;
  const communityId = meta.unze_community_id;
  const checkoutType = meta.unze_checkout_type;

  if (session.mode === "subscription" && session.subscription && userId && communityId) {
    const stripe = await getStripeClient();
    if (!stripe) throw new Error("Stripe nicht konfiguriert");

    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;

    const subscription = await stripe.subscriptions.retrieve(subId);
    await upsertAndSyncSubscription(subscription, meta);

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

  if (checkoutType === "analysis_business") {
    const inquiryId = meta.unze_inquiry_id;
    if (inquiryId && session.payment_status === "paid") {
      const { markAnalysisInquiryPaid } = await import("@/lib/business/analysis-inquiry.service");
      await markAnalysisInquiryPaid({
        inquiryId,
        stripeSessionId: session.id,
      });
    }
    return;
  }

  if (checkoutType === "quote_business") {
    const { handleQuoteCheckoutCompleted } = await import("@/lib/studio/quote-payment.service");
    await handleQuoteCheckoutCompleted(session);
    return;
  }

  if (checkoutType === "shop_business") {
    const metaLine = meta.unze_product_line;
    if (metaLine !== "business") {
      console.warn("[stripe-webhook] shop_business ohne unze_product_line=business — ignoriert");
      return;
    }
    const { handleShopCheckoutCompleted } = await import("@/lib/business/shop-payment.service");
    await handleShopCheckoutCompleted(session);
    return;
  }

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

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(invoice);
  if (!subId) return;

  const stripe = await getStripeClient();
  if (!stripe) throw new Error("Stripe nicht konfiguriert");

  const subscription = await stripe.subscriptions.retrieve(subId);
  const { userId, communityId } = await upsertAndSyncSubscription(subscription);

  if (await paymentExistsForInvoice(invoice.id)) return;

  const supabase = createAdminClient();
  if (!supabase) return;

  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("group_id")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();

  const amountCents = invoice.amount_due ?? invoice.amount_remaining ?? 0;
  if (amountCents <= 0) return;

  const { error } = await insertPaymentRecord({
    userId,
    communityId,
    groupId: (subRow?.group_id as string) ?? null,
    stripeInvoiceId: invoice.id,
    amountCents,
    paymentKind: "subscription_invoice",
    status: "failed",
    description: "Abo-Zahlung fehlgeschlagen",
    metadata: {
      attempt_count: invoice.attempt_count ?? 1,
      billing_reason: invoice.billing_reason ?? null,
    },
  });

  if (error) {
    throw new Error(`Fehlgeschlagene Invoice speichern: ${error}`);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(invoice);
  if (!subId) return;

  const stripe = await getStripeClient();
  if (!stripe) throw new Error("Stripe nicht konfiguriert");

  const subscription = await stripe.subscriptions.retrieve(subId);

  if (subscription.metadata?.unze_quote_id) {
    const { handleQuoteInstallmentInvoicePaid } = await import(
      "@/lib/studio/quote-payment.service"
    );
    await handleQuoteInstallmentInvoicePaid(invoice);
    return;
  }

  if (await paymentExistsForInvoice(invoice.id)) return;

  const { userId, communityId } = await upsertAndSyncSubscription(subscription);

  const supabase = createAdminClient();
  if (!supabase) return;

  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("group_id")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();

  if (invoice.amount_paid) {
    const { error } = await insertPaymentRecord({
      userId,
      communityId,
      groupId: (subRow?.group_id as string) ?? null,
      stripeInvoiceId: invoice.id,
      amountCents: invoice.amount_paid,
      paymentKind: "subscription_invoice",
      status: "succeeded",
      description: invoice.description ?? "Abo-Zahlung",
    });
    if (error) {
      throw new Error(`Invoice-Zahlung speichern fehlgeschlagen: ${error}`);
    }
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntent = charge.payment_intent;
  if (!paymentIntent) return;

  const paymentIntentId =
    typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;

  const payment = await fetchPaymentByPaymentIntentId(paymentIntentId);

  const { error } = await updatePaymentByPaymentIntentId(
    paymentIntentId,
    "refunded",
  );
  if (error) {
    throw new Error(`Refund-Update fehlgeschlagen: ${error}`);
  }

  if (payment?.user_id && payment?.community_id) {
    await softRemoveMemberByUserInDb(
      payment.community_id as string,
      payment.user_id as string,
      payment.user_id as string,
    );
    await queueMemberRemovalTask({
      communityId: payment.community_id as string,
      userId: payment.user_id as string,
      reason: "subscription_ended",
      metadata: { source: "charge.refunded" },
      notifyManagers: true,
    });
  }
}

async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsertAndSyncSubscription(event.data.object as Stripe.Subscription);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const userId = account.metadata?.unze_user_id;
      if (userId && account.details_submitted && account.charges_enabled) {
        const supabase = createAdminClient();
        if (supabase) {
          const { error } = await supabase
            .from("creator_profiles")
            .update({ stripe_connect_onboarding_complete: true })
            .eq("user_id", userId);
          if (error) {
            throw new Error(`Connect-Update fehlgeschlagen: ${error.message}`);
          }
        }
      }
      break;
    }
    default:
      break;
  }
}

export async function handleStripeWebhookEvent(
  event: Stripe.Event,
): Promise<void> {
  if (await isWebhookEventProcessed(event.id)) return;

  try {
    await processWebhookEvent(event);
  } catch (err) {
    console.error("[stripe-webhook]", event.type, event.id, err);
    throw err;
  }

  await markWebhookEventProcessed(event.id, event.type);
}

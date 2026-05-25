/**
 * Billing Service — Stripe-Webhook-ready Event-Emission
 */

import { publishPlatformEvent } from "./event-bus.service";
import { getSubscriptionForCommunity, prepareCheckout } from "@/services/monetization/subscription.service";

export { getSubscriptionForCommunity, prepareCheckout };

export async function recordPaymentSucceeded(input: {
  userId: string;
  communityId: string;
  amountCents?: number;
  currency?: string;
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;
  idempotencyKey?: string;
}) {
  return publishPlatformEvent({
    eventType: "billing.payment_succeeded",
    actorId: input.userId,
    targetUserId: input.userId,
    communityId: input.communityId,
    subjectType: "subscription",
    subjectId: input.stripeSubscriptionId ?? null,
    idempotencyKey: input.idempotencyKey,
    payload: {
      amountCents: input.amountCents,
      currency: input.currency ?? "eur",
      stripePaymentIntentId: input.stripePaymentIntentId,
      stripeSubscriptionId: input.stripeSubscriptionId,
    },
  });
}

export async function recordPaymentFailed(input: {
  userId: string;
  communityId: string;
  reason?: string;
  stripePaymentIntentId?: string;
  idempotencyKey?: string;
}) {
  return publishPlatformEvent({
    eventType: "billing.payment_failed",
    actorId: input.userId,
    targetUserId: input.userId,
    communityId: input.communityId,
    idempotencyKey: input.idempotencyKey,
    notificationBodyOverride: input.reason,
    payload: {
      reason: input.reason,
      stripePaymentIntentId: input.stripePaymentIntentId,
    },
  });
}

/** Stripe Webhook-Einstiegspunkt (später implementieren) */
export async function handleStripeWebhook(_payload: unknown) {
  return {
    handled: false,
    message: "Stripe Webhook-Handler folgt — Events über recordPaymentSucceeded emittieren.",
  };
}

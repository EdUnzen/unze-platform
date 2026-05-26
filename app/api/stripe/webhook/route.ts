import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { getStripeWebhookSecret, isStripeConfigured } from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/server";
import { calculateRevenueSplit } from "@/lib/revenue/calculate-split";
import { fetchReferralByReferredUser } from "@/services/referral/referral.repository";
import { insertSandboxLedgerEntry } from "@/services/referral/referral.repository";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe nicht konfiguriert" }, { status: 503 });
  }

  const stripe = await getStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook nicht konfiguriert" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signatur fehlt" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Ungültige Signatur" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const creatorUserId = session.metadata?.unze_user_id;
    const communityId = session.metadata?.unze_community_id;
    const grossCents = session.amount_total ?? 0;

    if (creatorUserId && grossCents > 0) {
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
  }

  return NextResponse.json({ received: true });
}

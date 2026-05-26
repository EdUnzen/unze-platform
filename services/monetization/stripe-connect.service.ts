import { getAppUrl } from "@/lib/env";
import {
  getStripeMode,
  getStripePublishableKey,
  isStripeConfigured,
} from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import type { CreatorStripeStatus } from "@/types/referral";

export async function getCreatorStripeStatus(
  userId: string,
): Promise<CreatorStripeStatus> {
  const mode = getStripeMode();
  const configured = isStripeConfigured();

  const supabase = await createClient();
  if (!supabase) {
    return {
      configured: false,
      mode: "disabled",
      connectAccountId: null,
      onboardingComplete: false,
      message: "Supabase nicht konfiguriert",
    };
  }

  const { data } = await supabase
    .from("creator_profiles")
    .select("stripe_connect_account_id, stripe_connect_onboarding_complete")
    .eq("user_id", userId)
    .maybeSingle();

  const connectAccountId = (data?.stripe_connect_account_id as string) ?? null;
  const onboardingComplete = Boolean(data?.stripe_connect_onboarding_complete);

  if (!configured) {
    return {
      configured: false,
      mode: "disabled",
      connectAccountId,
      onboardingComplete,
      message:
        "Stripe Sandbox: STRIPE_SECRET_KEY und NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local setzen.",
    };
  }

  return {
    configured: true,
    mode,
    connectAccountId,
    onboardingComplete,
    message:
      mode === "sandbox"
        ? "Stripe Testmodus aktiv — keine Live-Abrechnung."
        : "Stripe Live-Modus — Vorsicht bei echten Zahlungen.",
  };
}

export async function startStripeConnectOnboarding(
  userId: string,
): Promise<{ url: string | null; error: string | null }> {
  const stripe = await getStripeClient();
  if (!stripe) {
    return { url: null, error: "Stripe nicht konfiguriert" };
  }

  const supabase = await createClient();
  if (!supabase) return { url: null, error: "Supabase nicht konfiguriert" };

  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("stripe_connect_account_id")
    .eq("user_id", userId)
    .maybeSingle();

  let accountId = profile?.stripe_connect_account_id as string | null;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "DE",
      capabilities: {
        transfers: { requested: true },
      },
      metadata: { unze_user_id: userId },
    });
    accountId = account.id;

    await supabase.from("creator_profiles").upsert({
      user_id: userId,
      stripe_connect_account_id: accountId,
      stripe_connect_onboarding_complete: false,
    });
  }

  const base = getAppUrl();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${base}/dashboard/referrals?stripe=refresh`,
    return_url: `${base}/dashboard/referrals?stripe=complete`,
    type: "account_onboarding",
  });

  return { url: link.url, error: null };
}

export function getStripePublicConfig() {
  return {
    publishableKey: getStripePublishableKey(),
    mode: getStripeMode(),
    configured: isStripeConfigured(),
  };
}

/** Sandbox Checkout — Testzahlung, kein Live-Geld */
export async function createSandboxCheckoutSession(input: {
  userId: string;
  communityId: string;
  communityTitle: string;
  priceCents?: number;
}): Promise<{ url: string | null; error: string | null }> {
  const stripe = await getStripeClient();
  if (!stripe) {
    return { url: null, error: "Stripe nicht konfiguriert" };
  }

  if (getStripeMode() === "live") {
    return { url: null, error: "Sandbox-Checkout nur im Testmodus verfügbar." };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: input.priceCents ?? 999,
          product_data: {
            name: `UNZE Sandbox · ${input.communityTitle}`,
            description: "Testzahlung — Revenue-Share-Vorschau",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${getAppUrl()}/dashboard/referrals?checkout=success`,
    cancel_url: `${getAppUrl()}/dashboard/referrals?checkout=cancel`,
    metadata: {
      unze_user_id: input.userId,
      unze_community_id: input.communityId,
      sandbox: "true",
    },
  });

  return { url: session.url, error: null };
}

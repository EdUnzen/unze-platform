"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import {
  createCommunitySubscriptionCheckout,
  createCustomerPortalSession,
  createGroupOneTimeCheckout,
  syncCommunityStripePrices,
} from "@/services/monetization/checkout.service";
import { canManageMonetization } from "@/services/community/member.service";
import { fetchCommunityBySlugFromDb } from "@/services/community/community.repository";
import { parseEuroToCents } from "@/lib/monetization/plans";
import type { BillingPlanInterval } from "@/types/billing";
import { redirect } from "next/navigation";

export async function startCommunitySubscriptionCheckoutAction(
  communityId: string,
  slug: string,
  interval: Exclude<BillingPlanInterval, "one_time">,
) {
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Anmelden erforderlich" };

  const { url, error } = await createCommunitySubscriptionCheckout({
    userId: user.id,
    userEmail: user.email,
    communityId,
    interval,
    returnPath: `/community/${slug}`,
  });

  if (error) return { error };
  if (url) redirect(url);
  return { error: "Checkout konnte nicht gestartet werden" };
}

export async function startGroupCheckoutAction(input: {
  communityId: string;
  communitySlug: string;
  groupId: string;
  groupSlug: string;
  groupTitle: string;
  priceCents: number;
  stripePriceId?: string | null;
}) {
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Anmelden erforderlich" };

  const { url, error } = await createGroupOneTimeCheckout({
    userId: user.id,
    userEmail: user.email,
    communityId: input.communityId,
    communitySlug: input.communitySlug,
    groupId: input.groupId,
    groupSlug: input.groupSlug,
    groupTitle: input.groupTitle,
    priceCents: input.priceCents,
    stripePriceId: input.stripePriceId,
  });

  if (error) return { error };
  if (url) redirect(url);
  return { error: "Checkout konnte nicht gestartet werden" };
}

export async function openStripeCustomerPortalAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Anmelden erforderlich" };

  const { url, error } = await createCustomerPortalSession({
    userId: user.id,
    returnPath: "/profile/billing",
  });

  if (error) return { error };
  if (url) redirect(url);
  return { error: "Portal konnte nicht geöffnet werden" };
}

export async function saveCommunityPricingAction(
  slug: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const community = await fetchCommunityBySlugFromDb(slug, user.id);
  if (!community) return { error: "Community nicht gefunden" };

  const allowed = canManageMonetization(community.membership?.role ?? null);
  if (!allowed) return { error: "Keine Berechtigung" };

  const monthlyCents = parseEuroToCents(String(formData.get("priceMonthly") ?? ""));
  const semiannualCents = parseEuroToCents(String(formData.get("priceSemiannual") ?? ""));
  const yearlyCents = parseEuroToCents(String(formData.get("priceYearly") ?? ""));

  const { error } = await syncCommunityStripePrices({
    communityId: community.id,
    communityTitle: community.title,
    prices: {
      monthlyCents,
      semiannualCents,
      yearlyCents,
    },
  });

  if (error) return { error };
  return { success: true };
}

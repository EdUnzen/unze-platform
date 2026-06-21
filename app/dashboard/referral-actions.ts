"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/services/auth/auth.service";
import {
  claimCreatorReferral,
  searchCreatorsForReferral,
} from "@/services/referral/referral.service";
import {
  createSandboxCheckoutSession,
  startStripeConnectOnboarding,
} from "@/services/monetization/stripe-connect.service";

export async function claimReferralAction(referrerUserId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const result = await claimCreatorReferral(user.id, referrerUserId);
  if (result.error) return { error: result.error };

  revalidatePath("/dashboard/crowd-partner");
  return { error: null, status: result.status };
}

export async function searchCreatorsAction(query: string) {
  const user = await getCurrentUser();
  if (!user) return { creators: [], error: "Nicht angemeldet" };

  const creators = await searchCreatorsForReferral(query);
  return {
    creators: creators.filter((c) => c.id !== user.id),
    error: null,
  };
}

export async function startStripeConnectAction() {
  const user = await getCurrentUser();
  if (!user) return { url: null, error: "Nicht angemeldet" };

  const result = await startStripeConnectOnboarding(user.id);
  revalidatePath("/dashboard/crowd-partner");
  return result;
}

export async function createSandboxCheckoutAction(input: {
  communityId: string;
  communityTitle: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { url: null, error: "Nicht angemeldet" };

  const result = await createSandboxCheckoutSession({
    userId: user.id,
    communityId: input.communityId,
    communityTitle: input.communityTitle,
  });
  return result;
}

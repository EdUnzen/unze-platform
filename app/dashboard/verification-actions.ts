"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import {
  getCreatorVerificationStatus,
  getMyVerificationRequests,
  getPendingReviews,
  getVerificationDocumentsForReview,
  reviewVerificationRequest,
  submitCommunityVerification,
  submitCreatorVerification,
  fetchCommunityVerificationRequests,
} from "@/services/verification/verification.service";
import { fetchVerificationRequestById } from "@/services/verification/verification.repository";
import { revalidatePath } from "next/cache";

export async function submitCreatorVerificationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Bitte zuerst anmelden" };

  const verificationType = formData.get("verificationType") as
    | "creator_identity"
    | "creator_business";

  const result = await submitCreatorVerification(
    user.id,
    {
      verificationType,
      businessName: String(formData.get("businessName") ?? "").trim() || undefined,
      businessRegistrationId:
        String(formData.get("businessRegistrationId") ?? "").trim() || undefined,
      notes: String(formData.get("notes") ?? "").trim() || undefined,
    },
    formData,
  );

  if (result.error) return { error: result.error };

  revalidatePath("/verify/creator");
  revalidatePath("/dashboard/verification");
  revalidatePath("/profile");
  return { success: true, requestId: result.requestId };
}

export async function submitCommunityVerificationAction(
  slug: string,
  communityId: string,
  formData: FormData,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Bitte zuerst anmelden" };

  const { community, canAccess } = await getDashboardCommunityAccess(slug, user.id);
  if (!canAccess || !community) return { error: "Kein Zugriff" };

  const result = await submitCommunityVerification(
    user.id,
    {
      communityId,
      notes: String(formData.get("notes") ?? "").trim() || undefined,
    },
    formData,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/verification`);
  return { success: true };
}

export async function reviewVerificationAction(
  requestId: string,
  action: "approve" | "reject" | "reviewing",
  rejectionReason?: string,
  slug?: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  let communityRole = null;
  if (slug) {
    const { community, canAccess } = await getDashboardCommunityAccess(slug, user.id);
    if (canAccess && community) communityRole = community.viewerRole;
  }

  const result = await reviewVerificationRequest({
    requestId,
    reviewerId: user.id,
    action,
    rejectionReason,
    communityRole,
  });

  if (result.error) return { error: result.error };

  revalidatePath("/dashboard/verification");
  if (slug) revalidatePath(`/dashboard/community/${slug}/verification`);
  return { success: true };
}

export async function loadVerificationHubData() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [status, requests, pending] = await Promise.all([
    getCreatorVerificationStatus(user.id),
    getMyVerificationRequests(user.id),
    getPendingReviews(user.id),
  ]);

  return { status, requests, pending, userId: user.id };
}

export async function loadCommunityVerificationData(slug: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { community, canAccess } = await getDashboardCommunityAccess(slug, user.id);
  if (!canAccess || !community) return null;

  const requests = await fetchCommunityVerificationRequests(community.id);
  return { community, requests };
}

export async function loadVerificationDocumentsAction(
  requestId: string,
  slug?: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet", documents: [] };

  const request = await fetchVerificationRequestById(requestId);
  if (!request) return { error: "Antrag nicht gefunden", documents: [] };

  let communityRole = null;
  if (slug) {
    const { community } = await getDashboardCommunityAccess(slug, user.id);
    communityRole = community?.viewerRole ?? null;
  }

  return getVerificationDocumentsForReview({
    requestId,
    accessorId: user.id,
    request,
    communityRole,
  });
}

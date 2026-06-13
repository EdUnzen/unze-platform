"use server";

import { requirePlatformOwner } from "@/services/platform/owner-access.service";
import {
  fetchOwnerVerificationQueue,
  fetchPlatformOverviewStats,
  fetchPlatformReports,
  revokeCommunityVerification,
  revokeCreatorVerification,
  setCommunityPlatformSuspended,
  setCreatorPlatformSuspended,
  updatePlatformReportStatus,
} from "@/services/platform/owner-center.service";
import { reviewVerificationRequest } from "@/services/verification/verification.service";
import { revalidatePath } from "next/cache";

async function guard() {
  return requirePlatformOwner();
}

export async function getOwnerOverviewAction() {
  await guard();
  return fetchPlatformOverviewStats();
}

export async function getOwnerReportsAction(status?: "pending" | "resolved" | "dismissed") {
  await guard();
  return fetchPlatformReports(status);
}

export async function resolveOwnerReportAction(
  reportId: string,
  action: "resolved" | "dismissed",
  note?: string,
) {
  const { user } = await guard();
  const result = await updatePlatformReportStatus({
    reportId,
    status: action,
    reviewedBy: user.id,
    resolutionNote: note,
  });
  if (result.error) return { error: result.error };
  revalidatePath("/owner");
  return { success: true };
}

export async function getOwnerVerificationsAction() {
  await guard();
  return fetchOwnerVerificationQueue();
}

export async function approveOwnerVerificationAction(requestId: string) {
  const { user } = await guard();
  const result = await reviewVerificationRequest({
    requestId,
    reviewerId: user.id,
    action: "approve",
    communityRole: null,
  });
  if (result.error) return { error: result.error };
  revalidatePath("/owner");
  return { success: true };
}

export async function rejectOwnerVerificationAction(requestId: string, reason?: string) {
  const { user } = await guard();
  const result = await reviewVerificationRequest({
    requestId,
    reviewerId: user.id,
    action: "reject",
    rejectionReason: reason,
    communityRole: null,
  });
  if (result.error) return { error: result.error };
  revalidatePath("/owner");
  return { success: true };
}

export async function revokeOwnerVerificationAction(input: {
  subjectType: "user" | "community";
  subjectId: string;
}) {
  await guard();
  const result =
    input.subjectType === "user"
      ? await revokeCreatorVerification(input.subjectId)
      : await revokeCommunityVerification(input.subjectId);
  if (result.error) return { error: result.error };
  revalidatePath("/owner");
  return { success: true };
}

export async function suspendCommunityAction(slug: string) {
  await guard();
  const result = await setCommunityPlatformSuspended(slug, true);
  if (result.error) return { error: result.error };
  revalidatePath("/owner");
  return { success: true, message: `Community „${result.title}“ gesperrt.` };
}

export async function unsuspendCommunityAction(slug: string) {
  await guard();
  const result = await setCommunityPlatformSuspended(slug, false);
  if (result.error) return { error: result.error };
  revalidatePath("/owner");
  return { success: true, message: `Community „${result.title}“ freigegeben.` };
}

export async function suspendCreatorAction(username: string) {
  await guard();
  const result = await setCreatorPlatformSuspended(username, true);
  if (result.error) return { error: result.error };
  revalidatePath("/owner");
  return { success: true, message: `Creator „${result.displayName ?? username}“ gesperrt.` };
}

export async function unsuspendCreatorAction(username: string) {
  await guard();
  const result = await setCreatorPlatformSuspended(username, false);
  if (result.error) return { error: result.error };
  revalidatePath("/owner");
  return { success: true, message: `Creator „${result.displayName ?? username}“ freigegeben.` };
}

"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import {
  createJoinQuestion,
  deleteJoinQuestion,
  getCommunityAccessConfig,
  getCommunityApplications,
  getJoinQuestions,
  getJoinRequestsDashboard,
  reviewJoinApplication,
  updateCommunityAccessSettings,
} from "@/services/access/access.service";
import { loadInviteLinksForDashboard } from "@/app/dashboard/invite-actions";
import { promoteNextWaitlisted } from "@/services/access/invite.service";
import { getAccessPreset } from "@/lib/access/presets";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import {
  canManageAccess,
  canReviewApplications,
  hasCommunityPermission,
} from "@/lib/permissions/community.permissions";
import type {
  CommunityAccessMode,
  CommunityAccessSettingsInput,
  JoinQuestionInput,
  PlatformIdentityType,
} from "@/types/access";
import type { JoinQuestionType } from "@/types/database";
import { revalidatePath } from "next/cache";

async function requireAccessManager(slug: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" as const, ctx: null };

  const { community, canAccess } = await getDashboardCommunityAccess(
    slug,
    user.id,
  );
  if (!canAccess || !community) {
    return { error: "Kein Zugriff" as const, ctx: null };
  }

  return { error: null, ctx: { user, community } };
}

export async function updateAccessSettingsAction(
  slug: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const check = await requireAccessManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  if (!canManageAccess(check.ctx.community.viewerRole)) {
    return { error: "Keine Berechtigung" };
  }

  const memberLimitRaw = String(formData.get("memberLimit") ?? "").trim();
  const minAgeRaw = String(formData.get("minAge") ?? "").trim();
  const requiredPlatforms = formData.getAll("requiredPlatformIds") as PlatformIdentityType[];
  const accessMode = String(formData.get("accessMode") ?? "open") as CommunityAccessMode;
  const preset = getAccessPreset(accessMode);

  const input: CommunityAccessSettingsInput = {
    accessMode,
    visibility: preset.visibility,
    accessStatus: String(formData.get("accessStatus") ?? preset.accessStatus) as CommunityAccessSettingsInput["accessStatus"],
    admissionsPaused: formData.get("admissionsPaused") === "on",
    memberLimit: memberLimitRaw ? parseInt(memberLimitRaw, 10) : null,
    joinApprovalMode: String(formData.get("joinApprovalMode") ?? preset.joinApprovalMode) as CommunityAccessSettingsInput["joinApprovalMode"],
    communityRules: String(formData.get("communityRules") ?? "").trim() || null,
    requireRulesConsent: formData.get("requireRulesConsent") === "on",
    requireAgeVerification: formData.get("requireAgeVerification") === "on",
    minAge: minAgeRaw ? parseInt(minAgeRaw, 10) : null,
    requiredPlatformIds: requiredPlatforms,
    waitlistEnabled: formData.get("waitlistEnabled") === "on",
    autoRejectAtLimit: formData.get("autoRejectAtLimit") === "on",
    autoMessagesEnabled: formData.get("autoMessagesEnabled") !== "off",
    rejoinCooldownDays: String(formData.get("rejoinCooldownDays") ?? "").trim()
      ? parseInt(String(formData.get("rejoinCooldownDays")), 10)
      : null,
    allowRejoinAfterBan: formData.get("allowRejoinAfterBan") === "on",
    paidJoinRequired: formData.get("paidJoinRequired") === "on",
    lifecycleNotes: String(formData.get("lifecycleNotes") ?? "").trim() || null,
  };

  const result = await updateCommunityAccessSettings(
    check.ctx.community.id,
    input,
    check.ctx.community.viewerRole,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/access`);
  revalidatePath(`/community/${slug}`);
  return {};
}

export async function createJoinQuestionAction(
  slug: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const check = await requireAccessManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const input: JoinQuestionInput = {
    questionType: String(formData.get("questionType") ?? "text") as JoinQuestionType,
    label: String(formData.get("label") ?? "").trim(),
    placeholder: String(formData.get("placeholder") ?? "").trim() || undefined,
    options: String(formData.get("options") ?? "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
    isRequired: formData.get("isRequired") === "on",
    sortOrder: parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };

  if (!input.label) return { error: "Frage-Text erforderlich" };

  const result = await createJoinQuestion(
    check.ctx.community.id,
    input,
    check.ctx.community.viewerRole,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/access`);
  revalidatePath(`/community/${slug}`);
  return {};
}

export async function deleteJoinQuestionAction(slug: string, questionId: string) {
  const check = await requireAccessManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await deleteJoinQuestion(
    questionId,
    check.ctx.community.viewerRole,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/access`);
  revalidatePath(`/community/${slug}`);
  return { success: true };
}

export async function reviewApplicationAction(
  slug: string,
  applicationId: string,
  action: "accept" | "reject" | "waitlist",
  rejectionReason?: string,
) {
  const check = await requireAccessManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  if (!canReviewApplications(check.ctx.community.viewerRole)) {
    return { error: "Keine Berechtigung" };
  }

  const result = await reviewJoinApplication({
    applicationId,
    communityId: check.ctx.community.id,
    communitySlug: slug,
    reviewerId: check.ctx.user.id,
    reviewerRole: check.ctx.community.viewerRole,
    action,
    rejectionReason,
  });

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/requests`);
  revalidatePath(`/dashboard/community/${slug}/access`);
  revalidatePath(`/dashboard/community/${slug}/members`);
  revalidatePath(`/community/${slug}`);
  return { success: true, message: action === "accept" ? "Antrag angenommen" : action === "reject" ? "Antrag abgelehnt" : "Auf Warteliste gesetzt" };
}

export async function promoteWaitlistAction(slug: string) {
  const check = await requireAccessManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await promoteNextWaitlisted(
    check.ctx.community.id,
    check.ctx.user.id,
    check.ctx.community.viewerRole,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/requests`);
  revalidatePath(`/dashboard/community/${slug}/access`);
  revalidatePath(`/dashboard/community/${slug}/members`);
  return { success: true, message: "Wartelisten-Platz vergeben" };
}

export async function loadJoinRequestsData(slug: string) {
  const check = await requireAccessManager(slug);
  if (check.error || !check.ctx) return null;

  const canReview = canReviewApplications(check.ctx.community.viewerRole);
  if (!canReview) {
    return {
      applications: [],
      statusCounts: {},
      canReview: false,
    };
  }

  const data = await getJoinRequestsDashboard(
    check.ctx.community.id,
    check.ctx.community.viewerRole,
  );

  const questions = await getJoinQuestions(check.ctx.community.id, true);

  return {
    applications: data.applications,
    statusCounts: data.statusCounts,
    canReview: true,
    questions,
  };
}

export async function loadAccessDashboardData(slug: string) {
  const check = await requireAccessManager(slug);
  if (check.error || !check.ctx) return null;

  const canManage = hasCommunityPermission(
    check.ctx.community.viewerRole,
    "manage_access",
  );
  const canReview = canReviewApplications(check.ctx.community.viewerRole);

  const [config, questions, applicationsResult, inviteData] = await Promise.all([
    getCommunityAccessConfig(check.ctx.community.id),
    canManage ? getJoinQuestions(check.ctx.community.id) : [],
    canReview
      ? getCommunityApplications(check.ctx.community.id, check.ctx.community.viewerRole)
      : { applications: [] },
    canManage ? loadInviteLinksForDashboard(slug) : null,
  ]);

  return {
    community: check.ctx.community,
    config,
    questions,
    applications: applicationsResult.applications,
    inviteLinks: inviteData?.links ?? [],
    canManage,
    canReview,
    canManageInvites: canManage,
  };
}

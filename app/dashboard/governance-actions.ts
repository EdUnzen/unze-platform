"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCommunityAuditLog } from "@/services/governance/audit.service";
import {
  getModerationHistory,
  issueStrike,
  muteMember,
  warnMember,
} from "@/services/governance/moderation.service";
import {
  getCommunityPermissionOverrides,
  setPermissionOverride,
} from "@/services/governance/permission.service";
import {
  getCommunityReports,
  resolveReport,
} from "@/services/governance/report.service";
import {
  archiveCommunity,
  getRemovedMembers,
  pauseCommunity,
  restoreMember,
  softRemoveMember,
} from "@/services/governance/soft-delete.service";
import type { GovernancePermissionKey } from "@/types/governance";
import type { CommunityRole } from "@/types/database";
import { revalidatePath } from "next/cache";

async function requireAccess(slug: string, minCheck?: (role: CommunityRole) => boolean) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" as const, ctx: null };

  const { community, canAccess } = await getDashboardCommunityAccess(slug, user.id);
  if (!canAccess || !community) return { error: "Kein Zugriff" as const, ctx: null };

  if (minCheck && !minCheck(community.viewerRole)) {
    return { error: "Keine Berechtigung" as const, ctx: null };
  }

  return { error: null, ctx: { user, community } };
}

export async function loadModerationData(slug: string) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return null;

  const [reports, history] = await Promise.all([
    getCommunityReports(check.ctx.community.id, check.ctx.community.viewerRole),
    getModerationHistory(check.ctx.community.id, check.ctx.community.viewerRole),
  ]);

  return {
    reports: reports.reports,
    history: history.actions,
    viewerRole: check.ctx.community.viewerRole,
  };
}

export async function resolveReportAction(
  slug: string,
  reportId: string,
  status: "resolved" | "dismissed",
  resolutionNote?: string,
) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await resolveReport({
    reportId,
    communityId: check.ctx.community.id,
    actorId: check.ctx.user.id,
    actorRole: check.ctx.community.viewerRole,
    status,
    resolutionNote,
  });

  if (result.error) return { error: result.error };
  revalidatePath(`/dashboard/community/${slug}/moderation`);
  return { success: true };
}

export async function strikeMemberAction(
  slug: string,
  userId: string,
  reason?: string,
) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await issueStrike({
    communityId: check.ctx.community.id,
    userId,
    actorId: check.ctx.user.id,
    actorRole: check.ctx.community.viewerRole,
    reason,
  });

  if (result.error) return { error: result.error };
  revalidatePath(`/dashboard/community/${slug}/moderation`);
  revalidatePath(`/dashboard/community/${slug}/members`);
  return {
    success: true,
    strikeNumber: "strikeNumber" in result ? result.strikeNumber : undefined,
  };
}

export async function muteMemberAction(
  slug: string,
  userId: string,
  reason?: string,
  durationHours?: number,
) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await muteMember({
    communityId: check.ctx.community.id,
    userId,
    actorId: check.ctx.user.id,
    actorRole: check.ctx.community.viewerRole,
    reason,
    durationHours,
  });

  if (result.error) return { error: result.error };
  revalidatePath(`/dashboard/community/${slug}/moderation`);
  return { success: true };
}

export async function warnMemberAction(slug: string, userId: string, reason?: string) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await warnMember({
    communityId: check.ctx.community.id,
    userId,
    actorId: check.ctx.user.id,
    actorRole: check.ctx.community.viewerRole,
    reason,
  });

  if (result.error) return { error: result.error };
  revalidatePath(`/dashboard/community/${slug}/moderation`);
  return { success: true };
}

export async function loadAuditLogData(slug: string) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return null;

  const { entries } = await getCommunityAuditLog(
    check.ctx.community.id,
    check.ctx.community.viewerRole,
  );

  return { entries, viewerRole: check.ctx.community.viewerRole };
}

export async function loadPermissionOverridesData(slug: string) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return null;

  const { overrides } = await getCommunityPermissionOverrides(
    check.ctx.community.id,
    check.ctx.community.viewerRole,
  );

  return { overrides, viewerRole: check.ctx.community.viewerRole };
}

export async function setPermissionOverrideAction(
  slug: string,
  permissionKey: GovernancePermissionKey,
  role: CommunityRole,
  granted: boolean,
) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await setPermissionOverride({
    communityId: check.ctx.community.id,
    permissionKey,
    role,
    granted,
    actorId: check.ctx.user.id,
    actorRole: check.ctx.community.viewerRole,
  });

  if (result.error) return { error: result.error };
  revalidatePath(`/dashboard/community/${slug}/roles`);
  return { success: true };
}

export async function restoreMemberAction(slug: string, memberId: string, userId: string) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await restoreMember({
    memberId,
    communityId: check.ctx.community.id,
    userId,
    actorId: check.ctx.user.id,
    actorRole: check.ctx.community.viewerRole,
  });

  if (result.error) return { error: result.error };
  revalidatePath(`/dashboard/community/${slug}/members`);
  return { success: true };
}

export async function loadRemovedMembersData(slug: string) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return null;

  const { members } = await getRemovedMembers(
    check.ctx.community.id,
    check.ctx.community.viewerRole,
  );

  return { members };
}

export async function archiveCommunityAction(slug: string) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await archiveCommunity({
    communityId: check.ctx.community.id,
    actorId: check.ctx.user.id,
    actorRole: check.ctx.community.viewerRole,
  });

  if (result.error) return { error: result.error };
  revalidatePath(`/dashboard/community/${slug}`);
  revalidatePath(`/community/${slug}`);
  return { success: true };
}

export async function pauseCommunityAction(slug: string) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await pauseCommunity({
    communityId: check.ctx.community.id,
    actorId: check.ctx.user.id,
    actorRole: check.ctx.community.viewerRole,
  });

  if (result.error) return { error: result.error };
  revalidatePath(`/dashboard/community/${slug}`);
  return { success: true };
}

export async function softRemoveMemberAction(
  slug: string,
  memberId: string,
  userId: string,
  targetRole: CommunityRole,
  reason?: string,
) {
  const check = await requireAccess(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await softRemoveMember({
    memberId,
    communityId: check.ctx.community.id,
    userId,
    actorId: check.ctx.user.id,
    actorRole: check.ctx.community.viewerRole,
    targetRole,
    reason,
  });

  if (result.error) return { error: result.error };
  revalidatePath(`/dashboard/community/${slug}/members`);
  return { success: true };
}

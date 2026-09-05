"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { archiveCommunityBadge, createCommunityBadge, grantBadgeToMember, updateCommunityBadge } from "@/services/badges/badge.service";
import { uploadCredentialIcon } from "@/services/credentials/credential-icon.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { checkCommunityPermission } from "@/services/governance/community-permission-context.service";
import {
  canManageRoles,
  removeMember,
  updateMemberRole,
} from "@/services/community/member.service";
import type { CommunityRole } from "@/types/database";
import type { BadgeType } from "@/types/database";
import type { CredentialCategory } from "@/types/credential";
import { ACTION_MESSAGES } from "@/lib/constants/action-messages";
import { revalidatePath } from "next/cache";

async function requireManager(slug: string) {
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

export async function updateMemberRoleAction(
  slug: string,
  memberId: string,
  newRole: CommunityRole,
) {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  if (!canManageRoles(check.ctx.community.viewerRole)) {
    return { error: "Keine Berechtigung für Rollen" };
  }

  const members = await import("@/services/community/member.service").then((m) =>
    m.getCommunityMembers(check.ctx!.community.id),
  );
  const target = members.find((m) => m.id === memberId);

  const result = await updateMemberRole(
    memberId,
    newRole,
    check.ctx.community.viewerRole,
    target?.role,
    target?.userId
      ? {
          communityId: check.ctx.community.id,
          actorId: check.ctx.user.id,
          userId: target.userId,
          communityTitle: check.ctx.community.title,
          communitySlug: slug,
          roleTitle: target.roleTitle,
        }
      : undefined,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/members`);
  revalidatePath(`/dashboard/community/${slug}/roles`);
  revalidatePath(`/community/${slug}`);
  revalidatePath("/profile/aktivitaet");
  return { success: true, message: ACTION_MESSAGES.roles.updated };
}

export async function updateMemberRoleTitleAction(
  slug: string,
  memberId: string,
  roleTitle: string,
) {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const { updateMemberRoleTitle } = await import(
    "@/services/community/member.service"
  );
  const members = await import("@/services/community/member.service").then((m) =>
    m.getCommunityMembers(check.ctx!.community.id),
  );
  const target = members.find((m) => m.id === memberId);

  const result = await updateMemberRoleTitle(
    memberId,
    roleTitle,
    check.ctx.community.viewerRole,
    target?.userId
      ? {
          communityId: check.ctx.community.id,
          actorId: check.ctx.user.id,
          userId: target.userId,
          communityTitle: check.ctx.community.title,
          communitySlug: slug,
          roleTitle,
          role: target.role,
        }
      : undefined,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/members`);
  revalidatePath(`/community/${slug}`);
  revalidatePath("/profile/aktivitaet");
  return { success: true, message: ACTION_MESSAGES.roles.titleUpdated };
}

export async function removeMemberAction(slug: string, memberId: string) {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const members = await import("@/services/community/member.service").then((m) =>
    m.getCommunityMembers(check.ctx!.community.id),
  );
  const target = members.find((m) => m.id === memberId);

  const result = await removeMember(
    memberId,
    check.ctx.community.viewerRole,
    target?.role,
    check.ctx.user.id,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/members`);
  revalidatePath(`/dashboard/community/${slug}`);
  return { success: true };
}

export async function createBadgeAction(
  slug: string,
  _prev: { error?: string; success?: boolean; message?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean; message?: string }> {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const allowed = await checkCommunityPermission(
    check.ctx.community.id,
    check.ctx.community.viewerRole,
    "create_awards",
  );
  if (!allowed) return { error: "Keine Berechtigung zum Erstellen von Auszeichnungen" };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const badgeType = String(formData.get("badgeType") ?? "permanent") as BadgeType;
  const category = String(formData.get("category") ?? "community_award") as CredentialCategory;
  const earnHint = String(formData.get("earnHint") ?? "").trim();

  if (!name) return { error: "Name erforderlich" };

  let iconUrl: string | null = null;
  const iconFile = formData.get("icon");
  if (iconFile instanceof File && iconFile.size > 0) {
    const buffer = Buffer.from(await iconFile.arrayBuffer());
    const uploaded = await uploadCredentialIcon({
      communityId: check.ctx.community.id,
      userId: check.ctx.user.id,
      buffer,
      fileName: iconFile.name,
      mimeType: iconFile.type || "image/png",
    });
    if (uploaded.error) return { error: uploaded.error };
    iconUrl = uploaded.iconUrl;
  }

  const result = await createCommunityBadge({
    communityId: check.ctx.community.id,
    name,
    description: description || undefined,
    badgeType,
    category,
    iconUrl,
    earnHint: earnHint || null,
  });

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/auszeichnungen`);
  revalidatePath(`/community/${slug}`);
  return { success: true, message: ACTION_MESSAGES.awards.created };
}

export async function updateBadgeAction(
  slug: string,
  badgeId: string,
  _prev: { error?: string; success?: boolean; message?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean; message?: string }> {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const allowed = await checkCommunityPermission(
    check.ctx.community.id,
    check.ctx.community.viewerRole,
    "create_awards",
  );
  if (!allowed) return { error: "Keine Berechtigung zum Bearbeiten von Auszeichnungen" };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const badgeType = String(formData.get("badgeType") ?? "permanent") as BadgeType;
  const category = String(formData.get("category") ?? "community_award") as CredentialCategory;
  const earnHint = String(formData.get("earnHint") ?? "").trim();
  const existingIconUrl = String(formData.get("existingIconUrl") ?? "").trim() || null;

  if (!name) return { error: "Name erforderlich" };

  let iconUrl = existingIconUrl;
  const iconFile = formData.get("icon");
  if (iconFile instanceof File && iconFile.size > 0) {
    const buffer = Buffer.from(await iconFile.arrayBuffer());
    const uploaded = await uploadCredentialIcon({
      communityId: check.ctx.community.id,
      userId: check.ctx.user.id,
      buffer,
      fileName: iconFile.name,
      mimeType: iconFile.type || "image/png",
    });
    if (uploaded.error) return { error: uploaded.error };
    iconUrl = uploaded.iconUrl;
  }

  const result = await updateCommunityBadge({
    badgeId,
    communityId: check.ctx.community.id,
    name,
    description: description || null,
    badgeType,
    category,
    iconUrl,
    earnHint: earnHint || null,
  });

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/auszeichnungen`);
  revalidatePath(`/community/${slug}`);
  return { success: true, message: ACTION_MESSAGES.awards.updated };
}

export async function deleteBadgeAction(slug: string, badgeId: string) {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const allowed = await checkCommunityPermission(
    check.ctx.community.id,
    check.ctx.community.viewerRole,
    "create_awards",
  );
  if (!allowed) return { error: "Keine Berechtigung zum Archivieren von Auszeichnungen" };

  const result = await archiveCommunityBadge(badgeId);
  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/auszeichnungen`);
  revalidatePath(`/community/${slug}`);
  return { success: true, message: ACTION_MESSAGES.awards.archived };
}

export async function grantBadgeAction(
  slug: string,
  badgeId: string,
  userId: string,
  badgeName?: string,
) {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const allowed = await checkCommunityPermission(
    check.ctx.community.id,
    check.ctx.community.viewerRole,
    "grant_awards",
  );
  if (!allowed) return { error: "Keine Berechtigung zum Vergeben von Auszeichnungen" };

  const result = await grantBadgeToMember({
    badgeId,
    userId,
    communityId: check.ctx.community.id,
    grantedBy: check.ctx.user.id,
    badgeName,
    communityTitle: check.ctx.community.title,
    communitySlug: slug,
  });

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/auszeichnungen`);
  revalidatePath(`/dashboard/community/${slug}/members`);
  revalidatePath(`/dashboard/community/${slug}`);
  revalidatePath(`/community/${slug}`);
  revalidatePath("/profile/auszeichnungen");
  revalidatePath("/profile/aktivitaet");
  return { success: true, message: ACTION_MESSAGES.awards.granted };
}

export async function toggleMonetizationPrepAction(
  slug: string,
  enabled: boolean,
) {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  if (check.ctx.community.viewerRole !== "creator") {
    return { error: "Nur Creator können Monetarisierung steuern" };
  }

  const { updateCommunityInDb } = await import(
    "@/services/community/community.repository"
  );

  const updated = await updateCommunityInDb(check.ctx.community.id, {
    monetizationEnabled: enabled,
  });

  if (!updated) return { error: "Speichern fehlgeschlagen" };

  revalidatePath(`/dashboard/community/${slug}/monetization`);
  revalidatePath(`/dashboard/community/${slug}/settings`);
  return { success: true };
}

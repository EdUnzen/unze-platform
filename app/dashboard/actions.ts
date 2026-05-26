"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { createCommunityBadge, deleteCommunityBadge, grantBadgeToMember } from "@/services/badges/badge.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import {
  canManageRoles,
  removeMember,
  updateMemberRole,
} from "@/services/community/member.service";
import type { CommunityRole } from "@/types/database";
import type { BadgeType } from "@/types/database";
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
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/members`);
  revalidatePath(`/dashboard/community/${slug}/roles`);
  return { success: true };
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
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/members`);
  revalidatePath(`/dashboard/community/${slug}`);
  return { success: true };
}

export async function createBadgeAction(
  slug: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const badgeType = String(formData.get("badgeType") ?? "permanent") as BadgeType;

  if (!name) return { error: "Badge-Name erforderlich" };

  const result = await createCommunityBadge({
    communityId: check.ctx.community.id,
    name,
    description: description || undefined,
    badgeType,
  });

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/badges`);
  return {};
}

export async function deleteBadgeAction(slug: string, badgeId: string) {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await deleteCommunityBadge(badgeId);
  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/badges`);
  return { success: true };
}

export async function grantBadgeAction(
  slug: string,
  badgeId: string,
  userId: string,
  badgeName?: string,
) {
  const check = await requireManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await grantBadgeToMember({
    badgeId,
    userId,
    communityId: check.ctx.community.id,
    grantedBy: check.ctx.user.id,
    badgeName,
  });

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/badges`);
  revalidatePath(`/dashboard/community/${slug}/members`);
  return { success: true };
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

"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import {
  banCommunityMember,
  getCommunityRestrictions,
  liftCommunityRestriction,
} from "@/services/lifecycle/restriction.service";
import { canBanMembers } from "@/lib/permissions/community.permissions";
import { getCommunityAccessConfig } from "@/services/access/access.service";
import { revalidatePath } from "next/cache";

async function requireModerator(slug: string) {
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

export async function banMemberAction(
  slug: string,
  memberId: string,
  userId: string,
  reason?: string,
) {
  const check = await requireModerator(slug);
  if (check.error || !check.ctx) return { error: check.error };

  if (!canBanMembers(check.ctx.community.viewerRole)) {
    return { error: "Keine Berechtigung" };
  }

  const config = await getCommunityAccessConfig(check.ctx.community.id);
  const result = await banCommunityMember({
    communityId: check.ctx.community.id,
    userId,
    actorId: check.ctx.user.id,
    actorRole: check.ctx.community.viewerRole,
    reason,
    permanent: true,
    removeMembership: true,
    memberId,
    autoMessagesEnabled: config?.autoMessagesEnabled ?? true,
  });

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/members`);
  revalidatePath(`/dashboard/community/${slug}/access`);
  return { success: true };
}

export async function liftRestrictionAction(slug: string, restrictionId: string) {
  const check = await requireModerator(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await liftCommunityRestriction(
    restrictionId,
    check.ctx.user.id,
    check.ctx.community.viewerRole,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/members`);
  return { success: true };
}

export async function loadRestrictionsData(slug: string) {
  const check = await requireModerator(slug);
  if (check.error || !check.ctx) return null;

  const { restrictions } = await getCommunityRestrictions(
    check.ctx.community.id,
    check.ctx.community.viewerRole,
  );

  return {
    restrictions,
    canBan: canBanMembers(check.ctx.community.viewerRole),
  };
}

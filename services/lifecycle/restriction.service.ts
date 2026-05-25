import {
  canBanMembers,
  hasCommunityPermission,
} from "@/lib/permissions/community.permissions";
import { notifyLifecycleEvent } from "@/lib/access/lifecycle-notifications";
import type { CommunityMemberRestriction, RestrictionType } from "@/types/lifecycle";
import type { CommunityRole } from "@/types/database";
import { removeMemberInDb } from "@/services/community/member.repository";
import {
  createRestrictionInDb,
  fetchActiveRestrictionFromDb,
  fetchRestrictionsForCommunityFromDb,
  liftRestrictionInDb,
} from "./restriction.repository";

export async function checkUserJoinRestriction(
  communityId: string,
  userId: string,
): Promise<string | null> {
  return fetchActiveRestrictionFromDb(communityId, userId);
}

export async function getCommunityRestrictions(
  communityId: string,
  actorRole: CommunityRole,
): Promise<{ error: string | null; restrictions: CommunityMemberRestriction[] }> {
  if (!hasCommunityPermission(actorRole, "view_restrictions")) {
    return { error: "Keine Berechtigung", restrictions: [] };
  }

  const restrictions = await fetchRestrictionsForCommunityFromDb(communityId);
  return { error: null, restrictions };
}

export async function banCommunityMember(input: {
  communityId: string;
  userId: string;
  actorId: string;
  actorRole: CommunityRole;
  reason?: string;
  permanent?: boolean;
  restrictedUntil?: string | null;
  removeMembership?: boolean;
  memberId?: string;
  autoMessagesEnabled?: boolean;
}) {
  if (!canBanMembers(input.actorRole)) {
    return { error: "Keine Berechtigung" };
  }

  const result = await createRestrictionInDb({
    communityId: input.communityId,
    userId: input.userId,
    restrictionType: "ban",
    reason: input.reason ?? "Community-Ausschluss",
    restrictedUntil: input.permanent ? null : input.restrictedUntil,
    createdBy: input.actorId,
  });

  if (result.error) return result;

  if (input.removeMembership && input.memberId) {
    await removeMemberInDb(input.memberId);
  }

  await notifyLifecycleEvent({
    userId: input.userId,
    event: "member_banned",
    communityId: input.communityId,
    bodyOverride: input.reason,
    skipIfDisabled: input.autoMessagesEnabled === false,
  });

  return { error: null };
}

export async function liftCommunityRestriction(
  restrictionId: string,
  actorId: string,
  actorRole: CommunityRole,
) {
  if (!canBanMembers(actorRole)) {
    return { error: "Keine Berechtigung" };
  }

  return liftRestrictionInDb(restrictionId, actorId);
}

export async function blockRemovedMemberRejoin(input: {
  communityId: string;
  userId: string;
  actorId: string;
  actorRole: CommunityRole;
  reason?: string;
}) {
  if (!hasCommunityPermission(input.actorRole, "manage_members")) {
    return { error: "Keine Berechtigung" };
  }

  return createRestrictionInDb({
    communityId: input.communityId,
    userId: input.userId,
    restrictionType: "removed_block",
    reason: input.reason ?? "Erneuter Beitritt nach Entfernung blockiert",
    restrictedUntil: null,
    createdBy: input.actorId,
  });
}

export type { RestrictionType };

import type { BadgeType } from "@/types/database";
import { publishPlatformEvent } from "@/services/platform/event-bus.service";
import {
  createBadgeInDb,
  deleteBadgeInDb,
  fetchBadgesByCommunity,
  fetchUserAwardsForProfile,
  grantBadgeInDb,
} from "./badge.repository";

export type { UserAwardView } from "./badge.repository";

export async function getCommunityBadges(communityId: string) {
  return fetchBadgesByCommunity(communityId);
}

export async function getUserAwards(userId: string) {
  return fetchUserAwardsForProfile(userId);
}

export async function createCommunityBadge(input: {
  communityId: string;
  name: string;
  description?: string;
  badgeType: BadgeType;
}) {
  return createBadgeInDb(input);
}

export async function deleteCommunityBadge(badgeId: string) {
  return deleteBadgeInDb(badgeId);
}

/** Badge an Mitglied vergeben — schreibt user_badges + emittiert Event */
export async function grantBadgeToMember(input: {
  badgeId: string;
  userId: string;
  communityId: string;
  grantedBy: string;
  badgeName?: string;
}) {
  const dbResult = await grantBadgeInDb({
    badgeId: input.badgeId,
    userId: input.userId,
    communityId: input.communityId,
    grantedBy: input.grantedBy,
  });

  if (dbResult.error) return dbResult;

  await publishPlatformEvent({
    eventType: "badge.granted",
    actorId: input.grantedBy,
    targetUserId: input.userId,
    communityId: input.communityId,
    subjectType: "badge",
    subjectId: input.badgeId,
    payload: {
      badgeId: input.badgeId,
      badgeName: input.badgeName,
    },
  });

  return { error: null };
}

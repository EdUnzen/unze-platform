import type { BadgeType } from "@/types/database";
import { publishPlatformEvent } from "@/services/platform/event-bus.service";
import {
  createBadgeInDb,
  deleteBadgeInDb,
  fetchBadgesByCommunity,
} from "./badge.repository";

export async function getCommunityBadges(communityId: string) {
  return fetchBadgesByCommunity(communityId);
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

/** Badge an Mitglied vergeben — DB-Tabelle user_badges folgt; Event wird emittiert */
export async function grantBadgeToMember(input: {
  badgeId: string;
  userId: string;
  communityId: string;
  grantedBy: string;
  badgeName?: string;
}) {
  return publishPlatformEvent({
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
}

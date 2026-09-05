import type { BadgeType } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { buildAwardGrantedNotification } from "@/lib/notifications/personal-milestones";
import { publishPlatformEvent } from "@/services/platform/event-bus.service";
import {
  archiveBadgeInDb,
  createBadgeInDb,
  fetchBadgesByCommunity,
  fetchPublicUserAwards,
  fetchRecentCommunityAwardGrants,
  fetchUserAwardsForProfile,
  grantBadgeInDb,
  updateBadgeInDb,
  updateUserCredentialVisibilityInDb,
} from "./badge.repository";
import {
  fetchCredentialEarnHintsFromEvents,
  resolveEarnHint,
} from "@/services/credentials/credential-earn-hints.service";

export type { UserAwardView, UserAwardVisibility } from "./badge.repository";

export async function getCommunityBadges(communityId: string, activeOnly = true) {
  return fetchBadgesByCommunity(communityId, { activeOnly });
}

export async function getCommunityAvailableAwards(communityId: string) {
  const badges = await fetchBadgesByCommunity(communityId, { activeOnly: true });
  const autoHints = await fetchCredentialEarnHintsFromEvents(
    communityId,
    badges.map((b) => b.id),
  );
  return badges.map((badge) => ({
    ...badge,
    earnHint: resolveEarnHint(badge.id, badge.earnHint, autoHints),
  }));
}

export async function getRecentCommunityAwardGrants(communityId: string, limit = 8) {
  return fetchRecentCommunityAwardGrants(communityId, limit);
}

export async function getUserAwards(userId: string) {
  return fetchUserAwardsForProfile(userId);
}

export async function getPublicUserAwards(userId: string) {
  return fetchPublicUserAwards(userId);
}

export async function updateUserAwardVisibility(
  userId: string,
  userCredentialId: string,
  visibility: "public" | "private",
) {
  return updateUserCredentialVisibilityInDb({
    userId,
    userCredentialId,
    visibility,
  });
}

export async function createCommunityBadge(input: {
  communityId: string;
  name: string;
  description?: string;
  badgeType: BadgeType;
  category?: import("@/types/credential").CredentialCategory;
  iconUrl?: string | null;
  earnHint?: string | null;
}) {
  return createBadgeInDb(input);
}

export async function updateCommunityBadge(input: {
  badgeId: string;
  communityId: string;
  name: string;
  description?: string | null;
  badgeType: BadgeType;
  category?: import("@/types/credential").CredentialCategory;
  iconUrl?: string | null;
  earnHint?: string | null;
}) {
  return updateBadgeInDb(input);
}

/** Archiviert Auszeichnung — bereits vergebene Nachweise bleiben erhalten */
export async function archiveCommunityBadge(badgeId: string) {
  return archiveBadgeInDb(badgeId);
}

/** Badge an Mitglied vergeben — schreibt user_credentials + emittiert Event + Benachrichtigung */
export async function grantBadgeToMember(input: {
  badgeId: string;
  userId: string;
  communityId: string;
  grantedBy: string;
  badgeName?: string;
  communityTitle?: string;
  communitySlug?: string;
}) {
  const dbResult = await grantBadgeInDb({
    badgeId: input.badgeId,
    userId: input.userId,
    communityId: input.communityId,
    grantedBy: input.grantedBy,
  });

  if (dbResult.error) return dbResult;

  const supabase = await createClient();
  let badgeName = input.badgeName?.trim() ?? "";
  let communityTitle = input.communityTitle?.trim() ?? "";
  let communitySlug = input.communitySlug?.trim() ?? "";
  let recipientName = "Mitglied";

  if (supabase) {
    const [profileRes, communityRes, credentialRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, username")
        .eq("id", input.userId)
        .maybeSingle(),
      communityTitle && communitySlug
        ? Promise.resolve({ data: null })
        : supabase
            .from("communities")
            .select("title, slug")
            .eq("id", input.communityId)
            .maybeSingle(),
      badgeName
        ? Promise.resolve({ data: null })
        : supabase
            .from("credentials")
            .select("name")
            .eq("id", input.badgeId)
            .maybeSingle(),
    ]);

    const profile = profileRes.data;
    recipientName =
      (profile?.display_name as string | null)?.trim() ||
      (profile?.username as string | null)?.trim() ||
      recipientName;

    if (!communityTitle && communityRes.data) {
      communityTitle = (communityRes.data.title as string) ?? "";
      communitySlug = (communityRes.data.slug as string) ?? "";
    }

    if (!badgeName && credentialRes.data) {
      badgeName = (credentialRes.data.name as string) ?? "Auszeichnung";
    }
  }

  if (!badgeName) badgeName = "Auszeichnung";
  if (!communityTitle) communityTitle = "Community";

  const copy = buildAwardGrantedNotification({ badgeName, communityTitle });

  await publishPlatformEvent({
    eventType: "badge.granted",
    actorId: input.grantedBy,
    targetUserId: input.userId,
    communityId: input.communityId,
    subjectType: "badge",
    subjectId: input.badgeId,
    notificationTitleOverride: copy.title,
    notificationBodyOverride: copy.body,
    skipHandlers: ["community-activity"],
    payload: {
      badgeId: input.badgeId,
      badgeName,
      recipientName,
      recipientId: input.userId,
      communityTitle,
      communitySlug: communitySlug || undefined,
    },
  });

  return { error: null };
}

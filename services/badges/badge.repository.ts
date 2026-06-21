import { createClient } from "@/lib/supabase/server";
import type { CommunityBadgeView } from "@/types/dashboard";
import type { BadgeType } from "@/types/database";

export async function fetchBadgesByCommunity(
  communityId: string,
): Promise<CommunityBadgeView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("badges")
    .select("id, community_id, name, description, badge_type, icon_url")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[badge.repository] fetch:", error.message);
    return [];
  }

  const badges = data ?? [];
  if (badges.length === 0) return [];

  const badgeIds = badges.map((b) => b.id as string);
  const { data: grants } = await supabase
    .from("user_badges")
    .select("badge_id")
    .in("badge_id", badgeIds);

  const grantCounts: Record<string, number> = {};
  for (const row of grants ?? []) {
    const id = row.badge_id as string;
    grantCounts[id] = (grantCounts[id] ?? 0) + 1;
  }

  return badges.map((badge) => ({
    id: badge.id,
    communityId: badge.community_id,
    name: badge.name,
    description: badge.description,
    badgeType: badge.badge_type as BadgeType,
    iconUrl: badge.icon_url,
    grantedCount: grantCounts[badge.id as string] ?? 0,
  }));
}

export async function createBadgeInDb(input: {
  communityId: string;
  name: string;
  description?: string;
  badgeType: BadgeType;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("badges")
    .insert({
      community_id: input.communityId,
      name: input.name,
      description: input.description ?? null,
      badge_type: input.badgeType,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data?.id };
}

export async function deleteBadgeInDb(
  badgeId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("badges").delete().eq("id", badgeId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function grantBadgeInDb(input: {
  badgeId: string;
  userId: string;
  communityId: string;
  grantedBy: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("user_badges").upsert(
    {
      user_id: input.userId,
      badge_id: input.badgeId,
      community_id: input.communityId,
      granted_by: input.grantedBy,
    },
    { onConflict: "user_id,badge_id" },
  );

  if (error) return { error: error.message };
  return { error: null };
}

export type UserAwardView = {
  id: string;
  badgeId: string;
  name: string;
  badgeType: BadgeType;
  communityId: string;
  communityTitle: string;
  communitySlug: string;
  grantedAt: string;
  grantedByName: string | null;
};

export async function fetchUserAwardsForProfile(
  userId: string,
): Promise<UserAwardView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_badges")
    .select(
      `
      id,
      created_at,
      badge:badges (
        id,
        name,
        badge_type
      ),
      community:communities (
        id,
        title,
        slug
      ),
      granter:profiles!user_badges_granted_by_fkey (
        display_name,
        username
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[badge.repository] profile awards:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const badgeRaw = row.badge;
      const badge = Array.isArray(badgeRaw) ? badgeRaw[0] : badgeRaw;
      const communityRaw = row.community;
      const community = Array.isArray(communityRaw) ? communityRaw[0] : communityRaw;
      const granterRaw = row.granter;
      const granter = Array.isArray(granterRaw) ? granterRaw[0] : granterRaw;
      if (!badge || !community) return null;

      const grantedByName =
        (granter?.display_name as string | null) ??
        (granter?.username as string | null) ??
        null;

      return {
        id: row.id as string,
        badgeId: badge.id as string,
        name: badge.name as string,
        badgeType: badge.badge_type as BadgeType,
        communityId: community.id as string,
        communityTitle: community.title as string,
        communitySlug: community.slug as string,
        grantedAt: row.created_at as string,
        grantedByName,
      };
    })
    .filter((a): a is UserAwardView => Boolean(a));
}

export async function fetchUserBadgesForCommunity(
  communityId: string,
  userIds: string[],
): Promise<Record<string, { id: string; name: string; badgeType: BadgeType }[]>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("user_badges")
    .select(
      `
      user_id,
      badge:badges (
        id,
        name,
        badge_type
      )
    `,
    )
    .eq("community_id", communityId)
    .in("user_id", unique);

  if (error) {
    console.error("[badge.repository] user badges:", error.message);
    return {};
  }

  const result: Record<string, { id: string; name: string; badgeType: BadgeType }[]> = {};
  for (const row of data ?? []) {
    const userId = row.user_id as string;
    const badgeRaw = row.badge;
    const badge = Array.isArray(badgeRaw) ? badgeRaw[0] : badgeRaw;
    if (!badge) continue;
    if (!result[userId]) result[userId] = [];
    result[userId].push({
      id: badge.id as string,
      name: badge.name as string,
      badgeType: badge.badge_type as BadgeType,
    });
  }

  return result;
}

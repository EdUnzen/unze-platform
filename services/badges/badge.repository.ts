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
  const result: CommunityBadgeView[] = [];

  for (const badge of badges) {
    const { count } = await supabase
      .from("user_badges")
      .select("*", { count: "exact", head: true })
      .eq("badge_id", badge.id);

    result.push({
      id: badge.id,
      communityId: badge.community_id,
      name: badge.name,
      description: badge.description,
      badgeType: badge.badge_type as BadgeType,
      iconUrl: badge.icon_url,
      grantedCount: count ?? 0,
    });
  }

  return result;
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

import { mapCommunityRow } from "@/lib/mappers/community.mapper";
import { mapDiscoverGroupRow } from "@/lib/mappers/community.mapper";
import { createClient } from "@/lib/supabase/server";
import type { Community, DiscoverGroup } from "@/types/community";
import type { PlatformCreator } from "@/types/creator";
import type { CommunityWithCreator } from "@/types/database";

function mapProfileRowToCreator(
  profile: Record<string, unknown>,
  communities: Array<{ member_count?: number; category?: string | null }> | null,
): PlatformCreator {
  const creatorProfile = profile.creator_profiles as
    | { headline: string | null }
    | { headline: string | null }[]
    | null;
  const headline = Array.isArray(creatorProfile)
    ? creatorProfile[0]?.headline
    : creatorProfile?.headline;

  let totalMembers = 0;
  let primaryCategory: string | null = null;
  for (const row of communities ?? []) {
    totalMembers += (row.member_count as number) ?? 0;
    if (!primaryCategory && row.category) {
      primaryCategory = row.category as string;
    }
  }

  return {
    id: profile.id as string,
    name:
      (profile.display_name as string) ??
      (profile.username as string) ??
      "Creator",
    username: profile.username as string | null,
    bio: headline ?? null,
    isVerified: Boolean(profile.is_verified),
    avatarUrl: profile.avatar_url as string | null,
    communityCount: communities?.length ?? 0,
    totalMembers,
    primaryCategory,
  };
}

const CREATOR_PROFILE_SELECT = `
  id,
  display_name,
  username,
  avatar_url,
  is_verified,
  creator_profiles (headline)
`;

export async function fetchCreatorByIdFromDb(
  creatorId: string,
): Promise<PlatformCreator | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(CREATOR_PROFILE_SELECT)
    .eq("id", creatorId)
    .eq("is_creator", true)
    .maybeSingle();

  if (error || !profile) {
    if (error) console.error("[creator.repository] byId:", error.message);
    return null;
  }

  const { data: communities } = await supabase
    .from("communities")
    .select("member_count, category")
    .eq("creator_id", creatorId)
    .in("visibility", ["public", "premium"]);

  return mapProfileRowToCreator(profile, communities);
}

export async function fetchCreatorByUsernameFromDb(
  username: string,
): Promise<PlatformCreator | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const normalized = username.trim().toLowerCase();
  if (!normalized) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(CREATOR_PROFILE_SELECT)
    .ilike("username", normalized)
    .eq("is_creator", true)
    .maybeSingle();

  if (error || !profile) {
    if (error) console.error("[creator.repository] byUsername:", error.message);
    return null;
  }

  const { data: communities } = await supabase
    .from("communities")
    .select("member_count, category")
    .eq("creator_id", profile.id)
    .in("visibility", ["public", "premium"]);

  return mapProfileRowToCreator(profile, communities);
}

export async function fetchCreatorCommunitiesFromDb(
  creatorId: string,
): Promise<Community[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("communities")
    .select(
      `
      *,
      creator:profiles!communities_creator_id_fkey (
        id,
        display_name,
        username,
        avatar_url,
        is_verified
      )
    `,
    )
    .eq("creator_id", creatorId)
    .in("visibility", ["public", "premium"])
    .order("member_count", { ascending: false });

  if (error) {
    console.error("[creator.repository] communities:", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    mapCommunityRow(row as CommunityWithCreator),
  );
}

export async function fetchCreatorPublicGroupsFromDb(
  creatorId: string,
): Promise<DiscoverGroup[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: communities } = await supabase
    .from("communities")
    .select("id")
    .eq("creator_id", creatorId)
    .in("visibility", ["public", "premium"]);

  const communityIds = (communities ?? []).map((c) => c.id as string);
  if (communityIds.length === 0) return [];

  const extendedSelect = `
    id,
    community_id,
    slug,
    title,
    description,
    sort_order,
    is_public,
    group_type,
    price_cents,
    rating_avg,
    review_count,
    member_count,
    community:communities!inner (
      slug,
      title,
      platform_type,
      member_count,
      banner_gradient,
      is_verified,
      is_trending,
      discover_enabled,
      visibility,
      category,
      rating_avg,
      review_count,
      monetization_enabled
    )
  `;

  const { data, error } = await supabase
    .from("community_groups")
    .select(extendedSelect)
    .in("community_id", communityIds)
    .eq("is_public", true)
    .order("sort_order", { ascending: true })
    .limit(24);

  if (error) {
    console.error("[creator.repository] groups:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) =>
      mapDiscoverGroupRow(row as Parameters<typeof mapDiscoverGroupRow>[0]),
    )
    .filter((group): group is DiscoverGroup => Boolean(group));
}

export async function fetchDiscoverCreatorsFromDb(
  limit = 20,
): Promise<PlatformCreator[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(CREATOR_PROFILE_SELECT)
    .eq("is_creator", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !profiles?.length) {
    if (error) console.error("[creator.repository]", error.message);
    return [];
  }

  const creatorIds = profiles.map((p) => p.id as string);

  const { data: communities } = await supabase
    .from("communities")
    .select("creator_id, member_count, category")
    .in("creator_id", creatorIds)
    .eq("discover_enabled", true);

  const stats = new Map<
    string,
    { count: number; members: number; category: string | null }
  >();

  for (const row of communities ?? []) {
    const id = row.creator_id as string;
    const prev = stats.get(id) ?? { count: 0, members: 0, category: null };
    stats.set(id, {
      count: prev.count + 1,
      members: prev.members + ((row.member_count as number) ?? 0),
      category: prev.category ?? (row.category as string),
    });
  }

  return profiles.map((row) => {
    const stat = stats.get(row.id as string);
    const creatorProfile = row.creator_profiles as
      | { headline: string | null }
      | { headline: string | null }[]
      | null;
    const headline = Array.isArray(creatorProfile)
      ? creatorProfile[0]?.headline
      : creatorProfile?.headline;

    return {
      id: row.id as string,
      name: (row.display_name as string) ?? (row.username as string) ?? "Creator",
      username: row.username as string | null,
      bio: headline ?? null,
      isVerified: Boolean(row.is_verified),
      avatarUrl: row.avatar_url as string | null,
      communityCount: stat?.count ?? 0,
      totalMembers: stat?.members ?? 0,
      primaryCategory: stat?.category ?? null,
    };
  });
}

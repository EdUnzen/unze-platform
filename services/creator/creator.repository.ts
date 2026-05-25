import { createClient } from "@/lib/supabase/server";
import type { PlatformCreator } from "@/types/creator";

export async function fetchCreatorByIdFromDb(
  creatorId: string,
): Promise<PlatformCreator | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      display_name,
      username,
      avatar_url,
      is_verified,
      creator_profiles (headline)
    `,
    )
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
    .eq("discover_enabled", true);

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

export async function fetchDiscoverCreatorsFromDb(
  limit = 20,
): Promise<PlatformCreator[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      display_name,
      username,
      avatar_url,
      is_verified,
      creator_profiles (headline)
    `,
    )
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
    const creatorProfile = row.creator_profiles as
      | { headline: string | null }
      | { headline: string | null }[]
      | null;
    const headline = Array.isArray(creatorProfile)
      ? creatorProfile[0]?.headline
      : creatorProfile?.headline;
    const stat = stats.get(row.id as string);

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

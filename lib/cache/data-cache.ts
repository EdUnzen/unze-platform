import { mapCommunityRow } from "@/lib/mappers/community.mapper";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";
import type { Community } from "@/types/community";
import type { CommunityWithCreator } from "@/types/database";
import { unstable_cache } from "next/cache";

const DISCOVER_LIST_KEY = "discover-list-v1";

const COMMUNITY_SELECT = `
  *,
  creator:profiles!communities_creator_id_fkey (
    id,
    display_name,
    username,
    avatar_url,
    is_verified
  )
`;

/**
 * Discover-Liste ohne cookies() — darf in unstable_cache laufen.
 * Viewer-Kontext (Follow/Member) wird danach in community.service ergänzt.
 */
async function fetchDiscoverListForCache(): Promise<Community[] | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const query = supabase
    .from("communities")
    .select(COMMUNITY_SELECT)
    .in("visibility", ["public", "premium"])
    .eq("discover_enabled", true)
    .order("member_count", { ascending: false })
    .limit(50);

  let { data, error } = await query;

  const missingDiscoverScore =
    error &&
    (error.code === "42703" ||
      error.message?.includes("discover_score") ||
      error.message?.includes("does not exist"));

  if (missingDiscoverScore) {
    ({ data, error } = await supabase
      .from("communities")
      .select(COMMUNITY_SELECT)
      .in("visibility", ["public", "premium"])
      .eq("discover_enabled", true)
      .order("member_count", { ascending: false })
      .limit(50));
  }

  if (error) {
    console.error("[data-cache] discover list:", error.message);
    return null;
  }

  return (data ?? []).map((row) =>
    mapCommunityRow(row as CommunityWithCreator),
  );
}

/** Öffentliche Discover-Liste (ohne cookies). */
export const getCachedDiscoverList = unstable_cache(
  fetchDiscoverListForCache,
  [DISCOVER_LIST_KEY],
  { revalidate: 60, tags: ["discover"] },
);

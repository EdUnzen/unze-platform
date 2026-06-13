import { createPublicSupabaseClient } from "@/lib/supabase/public-client";
import type { CommunityEvent } from "@/types/event";
import { unstable_cache } from "next/cache";

const DISCOVER_EVENT_SELECT = `
  id,
  community_id,
  group_id,
  slug,
  title,
  starts_at,
  ends_at,
  location,
  cover_url,
  is_public,
  is_featured,
  community:communities!inner (
    slug,
    title,
    platform_type,
    discover_enabled,
    visibility
  ),
  group:community_groups (
    title
  )
`;

function mapDiscoverEventRow(row: Record<string, unknown>): CommunityEvent {
  const communityRaw = row.community as
    | Record<string, unknown>
    | Record<string, unknown>[]
    | null;
  const community = Array.isArray(communityRaw) ? communityRaw[0] : communityRaw;
  const groupRaw = row.group as Record<string, unknown> | Record<string, unknown>[] | null;
  const group = Array.isArray(groupRaw) ? groupRaw[0] : groupRaw;

  return {
    id: row.id as string,
    communityId: row.community_id as string,
    communitySlug: community?.slug as string | undefined,
    communityTitle: community?.title as string | undefined,
    groupId: (row.group_id as string) ?? null,
    groupTitle: (group?.title as string) ?? null,
    slug: row.slug as string,
    title: row.title as string,
    description: "",
    startsAt: row.starts_at as string,
    endsAt: (row.ends_at as string) ?? null,
    location: (row.location as string) ?? null,
    externalUrl: null,
    coverUrl: (row.cover_url as string) ?? null,
    isPublic: Boolean(row.is_public),
    isFeatured: Boolean(row.is_featured),
    platformType: community?.platform_type as string | undefined,
  };
}

/** Öffentliche Discover-Events ohne cookies() — cachebar. */
async function fetchDiscoverEventsForCache(limit = 24): Promise<CommunityEvent[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return [];

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("community_events")
    .select(DISCOVER_EVENT_SELECT)
    .eq("is_public", true)
    .gte("starts_at", now)
    .order("is_featured", { ascending: false })
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    console.error("[discover-events-cache]", error.message);
    return [];
  }

  return (data ?? [])
    .filter((row) => {
      const community = Array.isArray(row.community) ? row.community[0] : row.community;
      return (
        community?.discover_enabled &&
        ["public", "premium"].includes(community.visibility as string)
      );
    })
    .map((row) => mapDiscoverEventRow(row as Record<string, unknown>));
}

export const getCachedDiscoverEvents = unstable_cache(
  async (limit: number) => fetchDiscoverEventsForCache(limit),
  ["discover-events-v1"],
  { revalidate: 60, tags: ["discover", "discover-events"] },
);

export async function getDiscoverEventsCached(limit = 24): Promise<CommunityEvent[]> {
  return getCachedDiscoverEvents(limit);
}

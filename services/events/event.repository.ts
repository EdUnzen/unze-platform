import { createClient } from "@/lib/supabase/server";
import type { CommunityEvent } from "@/types/event";

function mapEventRow(row: Record<string, unknown>): CommunityEvent {
  const communityRaw = row.community as Record<string, unknown> | Record<string, unknown>[] | null;
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
    description: row.description as string,
    startsAt: row.starts_at as string,
    endsAt: (row.ends_at as string) ?? null,
    location: (row.location as string) ?? null,
    externalUrl: (row.external_url as string) ?? null,
    coverUrl: (row.cover_url as string) ?? null,
    isPublic: Boolean(row.is_public),
    isFeatured: Boolean(row.is_featured),
    platformType: community?.platform_type as string | undefined,
  };
}

const EVENT_SELECT = `
  *,
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

export async function fetchCommunityEventsFromDb(
  communityId: string,
  limit = 12,
): Promise<CommunityEvent[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_events")
    .select(EVENT_SELECT)
    .eq("community_id", communityId)
    .eq("is_public", true)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    console.error("[event.repository] community:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapEventRow(row as Record<string, unknown>));
}

export async function fetchDiscoverEventsFromDb(limit = 24): Promise<CommunityEvent[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("community_events")
    .select(EVENT_SELECT)
    .eq("is_public", true)
    .gte("starts_at", now)
    .order("is_featured", { ascending: false })
    .order("starts_at", { ascending: true })
    .limit(limit * 2);

  if (error) {
    if (error.code === "42P01") return [];
    console.error("[event.repository] discover:", error.message);
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
    .slice(0, limit)
    .map((row) => mapEventRow(row as Record<string, unknown>));
}

export async function fetchUpcomingEventsForCommunitiesFromDb(
  communityIds: string[],
  limit = 8,
): Promise<CommunityEvent[]> {
  const unique = [...new Set(communityIds.filter(Boolean))];
  if (unique.length === 0) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("community_events")
    .select(EVENT_SELECT)
    .in("community_id", unique)
    .eq("is_public", true)
    .gte("starts_at", now)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    console.error("[event.repository] upcoming:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapEventRow(row as Record<string, unknown>));
}

export async function countEventsByCommunityIdsFromDb(
  communityIds: string[],
): Promise<Record<string, number>> {
  const unique = [...new Set(communityIds.filter(Boolean))];
  const result: Record<string, number> = {};
  for (const id of unique) result[id] = 0;
  if (unique.length === 0) return result;

  const supabase = await createClient();
  if (!supabase) return result;

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceIso = since.toISOString();

  const { data, error } = await supabase
    .from("community_events")
    .select("community_id")
    .in("community_id", unique)
    .gte("created_at", sinceIso);

  if (error) {
    if (error.code === "42P01") return result;
    return result;
  }

  for (const row of data ?? []) {
    const id = row.community_id as string;
    if (result[id] !== undefined) result[id] += 1;
  }

  return result;
}

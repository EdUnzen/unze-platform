import { createClient } from "@/lib/supabase/server";
import type { CommunityEvent } from "@/types/event";
import type { SupabaseClient } from "@supabase/supabase-js";

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
    checkInCredentialId: (row.check_in_credential_id as string) ?? null,
    checkInGroupId: (row.check_in_group_id as string) ?? null,
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
    if (error.code === "42P01" || error.code === "PGRST205") return [];
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

export async function fetchUpcomingEventsForCommunitiesWithClient(
  supabase: SupabaseClient,
  communityIds: string[],
  limit = 8,
): Promise<CommunityEvent[]> {
  const unique = [...new Set(communityIds.filter(Boolean))];
  if (unique.length === 0) return [];

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

export async function fetchUpcomingEventsForCommunitiesFromDb(
  communityIds: string[],
  limit = 8,
): Promise<CommunityEvent[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  return fetchUpcomingEventsForCommunitiesWithClient(supabase, communityIds, limit);
}

/** Home/PWA: Mitgliedschaften + Follows parallel, dann Events — kein Waterfall nach Community-Liste. */
export async function fetchUpcomingEventsForUserFromDb(
  userId: string,
  limit = 8,
): Promise<CommunityEvent[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const [membersRes, followsRes] = await Promise.all([
    supabase.from("community_members").select("community_id").eq("user_id", userId),
    supabase
      .from("follows")
      .select("target_community_id")
      .eq("follower_id", userId)
      .eq("target_type", "community"),
  ]);

  const ids = new Set<string>();
  for (const row of membersRes.data ?? []) {
    if (row.community_id) ids.add(row.community_id as string);
  }
  for (const row of followsRes.data ?? []) {
    if (row.target_community_id) ids.add(row.target_community_id as string);
  }

  if (ids.size === 0) return [];
  return fetchUpcomingEventsForCommunitiesFromDb([...ids], limit);
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

export async function createCommunityEventInDb(input: {
  communityId: string;
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  externalUrl?: string | null;
  coverUrl?: string | null;
  isPublic?: boolean;
  createdBy?: string | null;
  groupId?: string | null;
}) {
  const supabase = await createClient();
  if (!supabase) return { event: null, error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("community_events")
    .insert({
      community_id: input.communityId,
      group_id: input.groupId ?? null,
      slug: input.slug,
      title: input.title,
      description: input.description,
      starts_at: input.startsAt,
      ends_at: input.endsAt ?? null,
      location: input.location ?? null,
      external_url: input.externalUrl ?? null,
      cover_url: input.coverUrl ?? null,
      is_public: input.isPublic ?? true,
      created_by: input.createdBy ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { event: null, error: error?.message ?? "Event konnte nicht erstellt werden" };
  }

  return { event: mapEventRow(data as Record<string, unknown>), error: null };
}

export async function fetchCommunityEventsAdminFromDb(communityId: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_events")
    .select("*")
    .eq("community_id", communityId)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[event.repository] admin list:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapEventRow(row as Record<string, unknown>));
}

export async function fetchEventByIdOrSlugFromDb(
  communitySlug: string,
  eventIdOrSlug: string,
): Promise<CommunityEvent | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .maybeSingle();

  if (communityError || !community) return null;

  const isUuid = /^[0-9a-f-]{36}$/i.test(eventIdOrSlug);

  let query = supabase
    .from("community_events")
    .select(EVENT_SELECT)
    .eq("community_id", community.id)
    .eq("is_public", true);

  query = isUuid
    ? query.eq("id", eventIdOrSlug)
    : query.eq("slug", eventIdOrSlug);

  const { data, error } = await query.maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    console.error("[event.repository] byIdOrSlug:", error.message);
    return null;
  }

  if (!data) return null;
  return mapEventRow(data as Record<string, unknown>);
}

export async function fetchEventsByIdsFromDb(eventIds: string[]) {
  const unique = [...new Set(eventIds.filter(Boolean))];
  if (unique.length === 0) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_events")
    .select(EVENT_SELECT)
    .in("id", unique)
    .order("starts_at", { ascending: true });

  if (error) {
    if (error.code === "42P01") return [];
    return [];
  }

  return (data ?? []).map((row) => mapEventRow(row as Record<string, unknown>));
}

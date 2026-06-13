import { createClient } from "@/lib/supabase/server";

export type CommunityEntityCounts = {
  regularGroupCount: number;
  serviceGroupCount: number;
  upcomingEventCount: number;
};

/** Leichte Zählung für Stats-Zeile & Level ohne vollständige Gruppen-/Event-Listen */
export async function fetchCommunityEntityCounts(
  communityId: string,
): Promise<CommunityEntityCounts> {
  const supabase = await createClient();
  if (!supabase) {
    return { regularGroupCount: 0, serviceGroupCount: 0, upcomingEventCount: 0 };
  }

  const now = new Date().toISOString();
  const [regularRes, serviceRes, eventsRes] = await Promise.all([
    supabase
      .from("community_groups")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId)
      .eq("is_public", true)
      .neq("group_type", "service"),
    supabase
      .from("community_groups")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId)
      .eq("is_public", true)
      .eq("group_type", "service"),
    supabase
      .from("community_events")
      .select("id", { count: "exact", head: true })
      .eq("community_id", communityId)
      .gte("starts_at", now),
  ]);

  const regularGroupCount = regularRes.error ? 0 : (regularRes.count ?? 0);
  const serviceGroupCount = serviceRes.error ? 0 : (serviceRes.count ?? 0);

  let upcomingEventCount = 0;
  if (!eventsRes.error) {
    upcomingEventCount = eventsRes.count ?? 0;
  } else {
    console.warn("[community-counts] events:", eventsRes.error.message);
  }

  return {
    regularGroupCount,
    serviceGroupCount,
    upcomingEventCount,
  };
}

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
  const [groupsRes, eventsRes] = await Promise.all([
    supabase
      .from("community_groups")
      .select("group_type")
      .eq("community_id", communityId)
      .eq("is_public", true),
    supabase
      .from("community_events")
      .select("id", { count: "exact", head: true })
      .eq("community_id", communityId)
      .gte("starts_at", now),
  ]);

  let regularGroupCount = 0;
  let serviceGroupCount = 0;
  for (const row of groupsRes.data ?? []) {
    if (row.group_type === "service") serviceGroupCount += 1;
    else regularGroupCount += 1;
  }

  return {
    regularGroupCount,
    serviceGroupCount,
    upcomingEventCount: eventsRes.count ?? 0,
  };
}

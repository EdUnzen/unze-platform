import { createClient } from "@/lib/supabase/server";
import { isFeedEnabled } from "@/lib/features/platform-features";
import { countWeeklyEventsByCommunity } from "@/services/events/event.service";

export type CommunityActivityStats = {
  weeklyPostCount: number;
  totalPostCount: number;
  weeklyEventCount?: number;
};

/** Aktivitäts-Metriken — ohne Feed wenn deaktiviert */
export async function getCommunityActivityStats(
  communityIds: string[],
): Promise<Record<string, CommunityActivityStats>> {
  const unique = [...new Set(communityIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const result: Record<string, CommunityActivityStats> = {};
  for (const id of unique) {
    result[id] = { weeklyPostCount: 0, totalPostCount: 0, weeklyEventCount: 0 };
  }

  if (!isFeedEnabled()) {
    const eventCounts = await countWeeklyEventsByCommunity(unique);
    for (const id of unique) {
      result[id].weeklyEventCount = eventCounts[id] ?? 0;
    }
    return result;
  }

  const supabase = await createClient();
  if (!supabase) return result;

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceIso = since.toISOString();

  const [totalRes, weeklyRes] = await Promise.all([
    supabase.from("posts").select("community_id").in("community_id", unique),
    supabase
      .from("posts")
      .select("community_id")
      .in("community_id", unique)
      .gte("created_at", sinceIso),
  ]);

  if (totalRes.error) {
    console.error("[activity-stats] posts:", totalRes.error.message);
    return result;
  }

  for (const row of totalRes.data ?? []) {
    const id = row.community_id as string;
    if (result[id]) result[id].totalPostCount += 1;
  }

  for (const row of weeklyRes.data ?? []) {
    const id = row.community_id as string;
    if (result[id]) result[id].weeklyPostCount += 1;
  }

  return result;
}

export function formatWeeklyActivityLabel(count: number): string | null {
  if (count <= 0) return null;
  if (count === 1) return "1 Beitrag diese Woche";
  return `${count} Beiträge diese Woche`;
}

export function formatWeeklyEventLabel(count: number): string | null {
  if (count <= 0) return null;
  if (count === 1) return "1 Event diese Woche";
  return `${count} Events diese Woche`;
}

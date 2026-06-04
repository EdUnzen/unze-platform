import { createClient } from "@/lib/supabase/server";
import { isFeedEnabled } from "@/lib/features/platform-features";
import { countWeeklyEventsByCommunity } from "@/services/events/event.service";

export type CommunityActivityStats = {
  weeklyPostCount: number;
  totalPostCount: number;
  weeklyEventCount?: number;
};

const POST_BATCH_LIMIT = 5000;

async function countPostsByCommunityBatch(
  communityIds: string[],
  sinceIso?: string,
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const id of communityIds) counts[id] = 0;

  const supabase = await createClient();
  if (!supabase) return counts;

  let query = supabase
    .from("posts")
    .select("community_id")
    .in("community_id", communityIds);

  if (sinceIso) {
    query = query.gte("created_at", sinceIso);
  }

  const { data, error } = await query.limit(POST_BATCH_LIMIT);
  if (error) {
    console.error("[activity-stats] batch:", error.message);
    return counts;
  }

  for (const row of data ?? []) {
    const id = row.community_id as string;
    if (counts[id] !== undefined) counts[id] += 1;
  }

  return counts;
}

/** Aktivitäts-Metriken — Batch statt N× Head-Count (Discover-Performance). */
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

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceIso = since.toISOString();

  const [totalByCommunity, weeklyByCommunity] = await Promise.all([
    countPostsByCommunityBatch(unique),
    countPostsByCommunityBatch(unique, sinceIso),
  ]);

  for (const id of unique) {
    result[id] = {
      ...result[id],
      totalPostCount: totalByCommunity[id] ?? 0,
      weeklyPostCount: weeklyByCommunity[id] ?? 0,
    };
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

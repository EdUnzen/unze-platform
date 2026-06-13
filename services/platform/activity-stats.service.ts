import { createClient } from "@/lib/supabase/server";
import { isFeedEnabled } from "@/lib/features/platform-features";
import { countWeeklyEventsByCommunity } from "@/services/events/event.service";

export type CommunityActivityStats = {
  weeklyPostCount: number;
  totalPostCount: number;
  weeklyEventCount?: number;
};

async function countPostsForCommunity(
  communityId: string,
  sinceIso?: string,
): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  let query = supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);

  if (sinceIso) {
    query = query.gte("created_at", sinceIso);
  }

  const { count, error } = await query;
  if (error) {
    console.error("[activity-stats] count:", error.message);
    return 0;
  }

  return count ?? 0;
}

async function countPostsByCommunityBatch(
  communityIds: string[],
  sinceIso?: string,
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  await Promise.all(
    communityIds.map(async (id) => {
      counts[id] = await countPostsForCommunity(id, sinceIso);
    }),
  );
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

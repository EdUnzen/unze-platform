import { createClient } from "@/lib/supabase/server";

export type CommunityActivityStats = {
  weeklyPostCount: number;
  totalPostCount: number;
};

export async function getCommunityActivityStats(
  communityIds: string[],
): Promise<Record<string, CommunityActivityStats>> {
  const unique = [...new Set(communityIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data, error } = await supabase
    .from("posts")
    .select("community_id, created_at")
    .in("community_id", unique);

  if (error) {
    console.error("[activity-stats] posts:", error.message);
    return {};
  }

  const result: Record<string, CommunityActivityStats> = {};
  for (const id of unique) {
    result[id] = { weeklyPostCount: 0, totalPostCount: 0 };
  }

  for (const row of data ?? []) {
    const communityId = row.community_id as string;
    if (!result[communityId]) continue;
    result[communityId].totalPostCount += 1;
    if (new Date(row.created_at as string) >= since) {
      result[communityId].weeklyPostCount += 1;
    }
  }

  return result;
}

export function formatWeeklyActivityLabel(count: number): string | null {
  if (count <= 0) return null;
  if (count === 1) return "1 Beitrag diese Woche";
  return `${count} Beiträge diese Woche`;
}

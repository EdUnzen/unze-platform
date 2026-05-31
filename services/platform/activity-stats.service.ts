import { createClient } from "@/lib/supabase/server";

export type CommunityActivityStats = {
  weeklyPostCount: number;
  totalPostCount: number;
};

/** Count-basiert — kein Full-Row-Scan mehr */
export async function getCommunityActivityStats(
  communityIds: string[],
): Promise<Record<string, CommunityActivityStats>> {
  const unique = [...new Set(communityIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

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
    return {};
  }

  const result: Record<string, CommunityActivityStats> = {};
  for (const id of unique) {
    result[id] = { weeklyPostCount: 0, totalPostCount: 0 };
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

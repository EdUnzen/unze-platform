import { createClient } from "@/lib/supabase/server";
import type { CommunityDashboardStats } from "@/types/dashboard";

function countByKey(
  rows: Record<string, string | null>[],
  keyField: string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const key = row[keyField];
    if (!key) continue;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/** Batch-Stats für Dashboard — 6 Queries statt N×7 */
export async function fetchBatchCommunityDashboardStats(
  communityIds: string[],
  memberCounts: Record<string, number>,
  engagement: Record<string, { view_count_weekly?: number; share_count?: number }>,
): Promise<{
  stats: Record<string, CommunityDashboardStats>;
  pendingApplications: Record<string, number>;
}> {
  const ids = [...new Set(communityIds.filter(Boolean))];
  const empty = {
    stats: {} as Record<string, CommunityDashboardStats>,
    pendingApplications: {} as Record<string, number>,
  };

  if (ids.length === 0) return empty;

  const supabase = await createClient();
  if (!supabase) return empty;

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceIso = since.toISOString();

  const [
    groupsRes,
    badgesRes,
    postsRes,
    weeklyPostsRes,
    followersRes,
    pendingRes,
  ] = await Promise.all([
    supabase.from("community_groups").select("community_id").in("community_id", ids),
    supabase.from("badges").select("community_id").in("community_id", ids),
    supabase.from("posts").select("community_id").in("community_id", ids),
    supabase
      .from("posts")
      .select("community_id")
      .in("community_id", ids)
      .gte("created_at", sinceIso),
    supabase
      .from("follows")
      .select("target_community_id")
      .eq("target_type", "community")
      .in("target_community_id", ids),
    supabase
      .from("community_join_applications")
      .select("community_id")
      .in("community_id", ids)
      .in("status", ["pending", "waitlisted"]),
  ]);

  const groupCounts = countByKey(groupsRes.data ?? [], "community_id");
  const badgeCounts = countByKey(badgesRes.data ?? [], "community_id");
  const postCounts = countByKey(postsRes.data ?? [], "community_id");
  const weeklyPostCounts = countByKey(weeklyPostsRes.data ?? [], "community_id");
  const followerCounts = countByKey(followersRes.data ?? [], "target_community_id");
  const pendingCounts = countByKey(pendingRes.data ?? [], "community_id");

  const stats: Record<string, CommunityDashboardStats> = {};

  for (const id of ids) {
    stats[id] = {
      memberCount: memberCounts[id] ?? 0,
      groupCount: groupCounts[id] ?? 0,
      postCount: postCounts[id] ?? 0,
      followerCount: followerCounts[id] ?? 0,
      badgeCount: badgeCounts[id] ?? 0,
      weeklyViews: engagement[id]?.view_count_weekly ?? 0,
      shareCount: engagement[id]?.share_count ?? 0,
      weeklyPosts: weeklyPostCounts[id] ?? 0,
    };
  }

  return { stats, pendingApplications: pendingCounts };
}

import {
  computeCommunityLevel,
  type CommunityLevelMetrics,
  type CommunityLevelResult,
} from "@/lib/community/compute-level";
import { createClient } from "@/lib/supabase/server";
import type { Community, CommunityGroup } from "@/types/community";
import type { CommunityEntityCounts } from "./community-counts";

export function levelMetricsFromGroups(
  base: Pick<Community, "rating" | "reviewCount" | "memberCount" | "isVerified">,
  groups: CommunityGroup[],
  upcomingEventCount: number,
  weeklyActivity = 0,
): CommunityLevelMetrics {
  let groupCount = 0;
  let serviceCount = 0;
  for (const g of groups) {
    if (!g.isPublic) continue;
    if (g.groupType === "service") serviceCount += 1;
    else groupCount += 1;
  }
  return {
    rating: base.rating,
    reviewCount: base.reviewCount,
    memberCount: base.memberCount,
    groupCount,
    serviceCount,
    eventCount: upcomingEventCount,
    isVerified: base.isVerified,
    weeklyActivity,
  };
}

export function levelMetricsFromCounts(
  base: Pick<Community, "rating" | "reviewCount" | "memberCount" | "isVerified">,
  counts: CommunityEntityCounts,
  weeklyActivity = 0,
): CommunityLevelMetrics {
  return {
    rating: base.rating,
    reviewCount: base.reviewCount,
    memberCount: base.memberCount,
    groupCount: counts.regularGroupCount,
    serviceCount: counts.serviceGroupCount,
    eventCount: counts.upcomingEventCount,
    isVerified: base.isVerified,
    weeklyActivity,
  };
}

export async function getCommunityLevelMetrics(
  communityId: string,
  base: Pick<Community, "rating" | "reviewCount" | "memberCount" | "isVerified">,
  weeklyActivity = 0,
): Promise<CommunityLevelMetrics> {
  const supabase = await createClient();

  let groupCount = 0;
  let serviceCount = 0;
  let eventCount = 0;

  if (supabase) {
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
        .gte("starts_at", new Date().toISOString()),
    ]);

    if (!groupsRes.error && groupsRes.data) {
      for (const row of groupsRes.data) {
        if (row.group_type === "service") serviceCount += 1;
        else groupCount += 1;
      }
    }
    if (!eventsRes.error) eventCount = eventsRes.count ?? 0;
  }

  return {
    rating: base.rating,
    reviewCount: base.reviewCount,
    memberCount: base.memberCount,
    groupCount,
    serviceCount,
    eventCount,
    isVerified: base.isVerified,
    weeklyActivity,
  };
}

export async function resolveCommunityLevel(
  community: Community,
  weeklyActivity = 0,
): Promise<CommunityLevelResult> {
  const metrics = await getCommunityLevelMetrics(community.id, community, weeklyActivity);
  return computeCommunityLevel(metrics);
}

export function resolveCommunityLevelFromMetrics(
  metrics: CommunityLevelMetrics,
): CommunityLevelResult {
  return computeCommunityLevel(metrics);
}

/** Persistiert berechnetes Level (nach Migration 025) */
export async function persistCommunityLevel(
  communityId: string,
  result: CommunityLevelResult,
): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("communities")
    .update({
      community_level: result.level,
      level_score: result.score,
    })
    .eq("id", communityId);

  if (error?.message?.includes("community_level")) return;
  if (error) console.error("[community-level] persist:", error.message);
}

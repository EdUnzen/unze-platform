import {
  mergeCommunityEngagement,
  mergeGroupEngagement,
} from "@/lib/demo/engagement-metrics";
import { formatWeeklyActivityLabel } from "@/services/platform/activity-stats.service";
import type { CardEngagementMetrics } from "@/types/engagement";
import type { Community } from "@/types/community";
import { getCurrentUser } from "@/services/auth/auth.service";
import {
  fetchNetworkFollowCounts,
  incrementCommunityShareCount,
  incrementCommunityViewCount,
  incrementGroupShareCount,
  incrementPostShareCount,
  incrementPostViewCount,
} from "./engagement.repository";

export async function enrichCommunitiesWithEngagement(
  communities: Community[],
): Promise<Community[]> {
  if (communities.length === 0) return communities;

  const user = await getCurrentUser();
  const networkCounts = user
    ? await fetchNetworkFollowCounts(
        user.id,
        communities.map((c) => c.id),
      )
    : {};

  return communities.map((community) => ({
    ...community,
    engagement: mergeCommunityEngagement(community.slug, {
      weeklyViews: community.viewCountWeekly,
      shareCount: community.shareCount,
      networkFollowCount: networkCounts[community.id],
      isTrending: community.isTrending,
    }),
  }));
}

export async function recordCommunityShare(communityId: string) {
  return incrementCommunityShareCount(communityId);
}

export async function recordGroupShare(groupId: string) {
  return incrementGroupShareCount(groupId);
}

export async function recordPostShare(postId: string) {
  return incrementPostShareCount(postId);
}

export async function recordCommunityPageView(communityId: string) {
  await incrementCommunityViewCount(communityId);
}

export async function recordPostPageView(postId: string) {
  await incrementPostViewCount(postId);
}

export async function buildGroupCardEngagement(input: {
  communitySlug: string;
  groupSlug: string;
  isTrending?: boolean;
  weeklyViews?: number;
  shareCount?: number;
  weeklyPostCount?: number;
  activityLabel?: string;
}): Promise<CardEngagementMetrics> {
  return mergeGroupEngagement(
    input.communitySlug,
    input.groupSlug,
    {
      weeklyViews: input.weeklyViews,
      shareCount: input.shareCount,
      isTrending: input.isTrending,
    },
    {
      activityLabel:
        input.activityLabel ??
        formatWeeklyActivityLabel(input.weeklyPostCount ?? 0) ??
        undefined,
    },
  );
}

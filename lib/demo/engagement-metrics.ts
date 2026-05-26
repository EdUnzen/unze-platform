import type { CardEngagementMetrics } from "@/types/engagement";

/** Demo-Engagement bis DB-Spalten befüllt sind (Demo-Slugs) */
const COMMUNITY_ENGAGEMENT: Record<
  string,
  Pick<CardEngagementMetrics, "weeklyViews" | "shareCount" | "networkFollowCount">
> = {
  "rocket-league-ssl": {
    weeklyViews: 12_400,
    shareCount: 340,
    networkFollowCount: 4,
  },
  "business-circle-dach": {
    weeklyViews: 8_900,
    shareCount: 210,
    networkFollowCount: 3,
  },
  "creator-lounge": {
    weeklyViews: 24_600,
    shareCount: 520,
    networkFollowCount: 5,
  },
};

const GROUP_ENGAGEMENT: Record<
  string,
  Pick<CardEngagementMetrics, "weeklyViews" | "shareCount">
> = {
  "rocket-league-ssl/coaching": { weeklyViews: 4_200, shareCount: 89 },
  "rocket-league-ssl/clips": { weeklyViews: 6_800, shareCount: 142 },
  "business-circle-dach/networking": { weeklyViews: 3_100, shareCount: 76 },
  "creator-lounge/feed": { weeklyViews: 9_400, shareCount: 198 },
};

export function getDemoCommunityEngagement(
  slug: string,
): Pick<CardEngagementMetrics, "weeklyViews" | "shareCount" | "networkFollowCount"> | null {
  return COMMUNITY_ENGAGEMENT[slug] ?? null;
}

export function getDemoGroupEngagement(
  communitySlug: string,
  groupSlug: string,
): Pick<CardEngagementMetrics, "weeklyViews" | "shareCount"> | null {
  return GROUP_ENGAGEMENT[`${communitySlug}/${groupSlug}`] ?? null;
}

export function mergeCommunityEngagement(
  slug: string,
  db: Partial<CardEngagementMetrics>,
  extras?: Partial<CardEngagementMetrics>,
): CardEngagementMetrics {
  const demo = getDemoCommunityEngagement(slug);
  return {
    weeklyViews: db.weeklyViews || demo?.weeklyViews || extras?.weeklyViews,
    shareCount: db.shareCount || demo?.shareCount || extras?.shareCount,
    networkFollowCount:
      (db.networkFollowCount && db.networkFollowCount > 0
        ? db.networkFollowCount
        : undefined) ??
      demo?.networkFollowCount ??
      extras?.networkFollowCount,
    isTrending: extras?.isTrending ?? db.isTrending,
    activityLabel: extras?.activityLabel,
  };
}

export function mergeGroupEngagement(
  communitySlug: string,
  groupSlug: string,
  db: Partial<CardEngagementMetrics>,
  extras?: Partial<CardEngagementMetrics>,
): CardEngagementMetrics {
  const demo = getDemoGroupEngagement(communitySlug, groupSlug);
  return {
    weeklyViews: db.weeklyViews || demo?.weeklyViews || extras?.weeklyViews,
    shareCount: db.shareCount || demo?.shareCount || extras?.shareCount,
    isTrending: extras?.isTrending,
    activityLabel: extras?.activityLabel,
  };
}

import type { CardEngagementMetrics } from "@/types/engagement";

/** Keine Demo-/Fake-Metriken — nur echte DB-Werte, ohne öffentliche Reichweite. */
export function mergeCommunityEngagement(
  _slug: string,
  db: Partial<CardEngagementMetrics>,
  extras?: Partial<CardEngagementMetrics>,
): CardEngagementMetrics {
  return {
    networkFollowCount:
      (db.networkFollowCount && db.networkFollowCount > 0
        ? db.networkFollowCount
        : undefined) ?? extras?.networkFollowCount,
    isTrending: extras?.isTrending ?? db.isTrending,
    activityLabel: extras?.activityLabel,
  };
}

export function mergeGroupEngagement(
  _communitySlug: string,
  _groupSlug: string,
  db: Partial<CardEngagementMetrics>,
  extras?: Partial<CardEngagementMetrics>,
): CardEngagementMetrics {
  return {
    isTrending: extras?.isTrending ?? db.isTrending,
    activityLabel: extras?.activityLabel,
  };
}

/** @deprecated Demo-Metriken entfernt */
export function getDemoCommunityEngagement(_slug: string) {
  return null;
}

/** @deprecated Demo-Metriken entfernt */
export function getDemoGroupEngagement(_communitySlug: string, _groupSlug: string) {
  return null;
}

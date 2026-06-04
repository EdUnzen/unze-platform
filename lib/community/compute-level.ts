import {
  COMMUNITY_LEVELS,
  COMMUNITY_LEVEL_THRESHOLDS,
  type CommunityLevel,
} from "@/lib/constants/community-level";

export type CommunityLevelMetrics = {
  rating: number;
  reviewCount: number;
  memberCount: number;
  groupCount: number;
  serviceCount: number;
  eventCount: number;
  isVerified: boolean;
  weeklyActivity: number;
};

export type CommunityLevelBreakdown = {
  rating: number;
  groups: number;
  offerings: number;
  verification: number;
  members: number;
  activity: number;
};

export type CommunityLevelResult = {
  level: CommunityLevel;
  score: number;
  nextLevel: CommunityLevel | null;
  pointsToNext: number;
  breakdown: CommunityLevelBreakdown;
};

function scoreToLevel(score: number): CommunityLevel {
  let current: CommunityLevel = "bronze";
  for (const level of COMMUNITY_LEVELS) {
    if (score >= COMMUNITY_LEVEL_THRESHOLDS[level]) current = level;
  }
  return current;
}

function nextLevelOf(level: CommunityLevel): CommunityLevel | null {
  const idx = COMMUNITY_LEVELS.indexOf(level);
  if (idx < 0 || idx >= COMMUNITY_LEVELS.length - 1) return null;
  return COMMUNITY_LEVELS[idx + 1];
}

/** Automatische Level-Berechnung — Creator kann nicht manuell setzen */
export function computeCommunityLevel(
  metrics: CommunityLevelMetrics,
): CommunityLevelResult {
  const ratingScore = Math.min(metrics.rating / 5, 1) * 40;
  const groupsScore = Math.min(metrics.groupCount / 5, 1) * 20;
  const offeringsScore =
    Math.min((metrics.serviceCount + metrics.eventCount) / 5, 1) * 15;
  const verificationScore = metrics.isVerified ? 15 : 0;
  const membersScore = Math.min(metrics.memberCount / 100, 1) * 10;
  const activityScore = Math.min(metrics.weeklyActivity / 10, 1) * 5;

  const breakdown: CommunityLevelBreakdown = {
    rating: Math.round(ratingScore),
    groups: Math.round(groupsScore),
    offerings: Math.round(offeringsScore),
    verification: Math.round(verificationScore),
    members: Math.round(membersScore),
    activity: Math.round(activityScore),
  };

  const score = Math.min(
    100,
    Math.round(
      ratingScore +
        groupsScore +
        offeringsScore +
        verificationScore +
        membersScore +
        activityScore,
    ),
  );

  const level = scoreToLevel(score);
  const nextLevel = nextLevelOf(level);
  const pointsToNext = nextLevel
    ? Math.max(0, COMMUNITY_LEVEL_THRESHOLDS[nextLevel] - score)
    : 0;

  return { level, score, nextLevel, pointsToNext, breakdown };
}

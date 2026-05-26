/** Kompakte Engagement-Anzeige für Community- & Gruppen-Cards */

export interface CardEngagementMetrics {
  weeklyViews?: number;
  shareCount?: number;
  /** Nutzer aus Communities, in denen der Viewer aktiv ist */
  networkFollowCount?: number;
  isTrending?: boolean;
  activityLabel?: string;
}

export type ShareTargetType = "community" | "group";

export interface ShareTarget {
  type: ShareTargetType;
  title: string;
  url: string;
  communityId: string;
  groupId?: string;
}

export interface EngagementPill {
  key: string;
  label: string;
  highlight?: boolean;
}

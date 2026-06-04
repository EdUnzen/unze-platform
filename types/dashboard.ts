import type { Community } from "@/types/community";
import type { CommunityRole } from "@/types/database";
import type { BadgeType } from "@/types/database";

export interface CommunityDashboardStats {
  memberCount: number;
  groupCount: number;
  postCount: number;
  followerCount: number;
  badgeCount: number;
  weeklyViews?: number;
  shareCount?: number;
  weeklyPosts?: number;
}

export interface ManagedCommunity extends Community {
  viewerRole: CommunityRole;
  stats: CommunityDashboardStats;
  pendingApplicationCount?: number;
}

export interface CommunityMemberView {
  id: string;
  userId: string;
  role: CommunityRole;
  /** Individuelle Anzeige (z. B. SSL Coach) — technisch Moderator */
  roleTitle: string | null;
  joinedAt: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface CommunityBadgeView {
  id: string;
  communityId: string | null;
  name: string;
  description: string | null;
  badgeType: BadgeType;
  iconUrl: string | null;
  grantedCount: number;
}

export type DashboardTabId =
  | "overview"
  | "members"
  | "access"
  | "requests"
  | "moderation"
  | "audit"
  | "verification"
  | "groups"
  | "roles"
  | "badges"
  | "monetization"
  | "events"
  | "settings";

export interface JoinApplicationView {
  id: string;
  userId: string;
  status: import("@/types/access").JoinApplicationStatus;
  systemMessage: string | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

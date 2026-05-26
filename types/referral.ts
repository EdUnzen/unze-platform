/**
 * Referral & Growth — Vorbereitung (keine DB-Migration in diesem Sprint).
 */

export type ReferralStatus = "pending" | "active" | "converted";

export interface CreatorReferralDraft {
  referrerId: string;
  referredUserId: string;
  communityId?: string;
  status: ReferralStatus;
  createdAt: string;
}

export interface CommunityGrowthSnapshot {
  communityId: string;
  shareCount: number;
  weeklyViews: number;
  memberCount: number;
  followerCount: number;
  shareAttributedGrowth?: number;
}

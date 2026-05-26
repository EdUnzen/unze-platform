/** Creator Referral — optional, kein MLM */

export type ReferralStatus = "pending" | "active" | "conflict" | "revoked";

export interface CreatorReferral {
  id: string;
  referredUserId: string;
  referrerUserId: string;
  status: ReferralStatus;
  conflictNote: string | null;
  createdAt: string;
  updatedAt: string;
  referrerDisplayName?: string | null;
  referrerUsername?: string | null;
  referredDisplayName?: string | null;
}

export interface ReferralSummary {
  myReferral: CreatorReferral | null;
  referralsMade: CreatorReferral[];
  activeCount: number;
  conflictCount: number;
}

export interface RevenueLedgerEntry {
  id: string;
  communityId: string | null;
  creatorUserId: string;
  referrerUserId: string | null;
  grossAmountCents: number;
  platformFeeCents: number;
  netPlatformCents: number;
  referrerShareCents: number;
  currency: string;
  ledgerStatus: "sandbox" | "pending" | "paid" | "void";
  createdAt: string;
}

export interface CreatorStripeStatus {
  configured: boolean;
  mode: "sandbox" | "live" | "disabled";
  connectAccountId: string | null;
  onboardingComplete: boolean;
  message: string;
}

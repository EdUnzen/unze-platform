/** Community Lifecycle — Status, Limits, Bann, Rejoin-Schutz */

export type RestrictionType = "ban" | "cooldown" | "removed_block";

export type LifecycleStatus =
  | "open"
  | "private"
  | "closed"
  | "paused"
  | "archived";

export interface CommunityLifecycleSettings {
  waitlistEnabled: boolean;
  autoRejectAtLimit: boolean;
  autoMessagesEnabled: boolean;
  rejoinCooldownDays: number | null;
  allowRejoinAfterBan: boolean;
  paidJoinRequired: boolean;
  archivedAt: string | null;
  lifecycleNotes: string | null;
}

export interface CommunityMemberRestriction {
  id: string;
  communityId: string;
  userId: string;
  restrictionType: RestrictionType;
  reason: string | null;
  restrictedUntil: string | null;
  createdBy: string | null;
  liftedAt: string | null;
  createdAt: string;
  isActive: boolean;
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
}

export interface JoinApplicationFileMeta {
  questionId: string | null;
  fileName: string;
  mimeType?: string;
  fileSizeBytes?: number;
  storagePath?: string;
  storageBucket?: string;
  publicUrl?: string;
  proofCategory?: import("@/types/storage").ProofCategory;
}

export interface LifecycleSettingsInput {
  waitlistEnabled: boolean;
  autoRejectAtLimit: boolean;
  autoMessagesEnabled: boolean;
  rejoinCooldownDays: number | null;
  allowRejoinAfterBan: boolean;
  paidJoinRequired: boolean;
  lifecycleNotes: string | null;
  accessStatus?: import("@/types/access").CommunityAccessStatus;
}

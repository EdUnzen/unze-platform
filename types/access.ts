import type { CommunityRole } from "@/types/database";

export type CommunityAccessMode =
  | "open"
  | "private"
  | "closed"
  | "invite_only"
  | "premium";

export type CommunityAccessStatus =
  | "open"
  | "closed"
  | "paused"
  | "invite_only"
  | "member_limit_reached"
  | "archived";

export type JoinApprovalMode =
  | "auto_accept"
  | "manual_review"
  | "auto_reject"
  | "waitlist"
  | "invite_required"
  | "paid_unlock";

export type JoinQuestionType =
  | "text"
  | "checkbox"
  | "rules_consent"
  | "age_verification"
  | "file_upload"
  | "image_upload"
  | "age_proof"
  | "identity_proof";

export type PlatformIdentityType =
  | "discord"
  | "whatsapp"
  | "telegram"
  | "facebook"
  | "psn"
  | "epic"
  | "phone"
  | "linkedin"
  | "instagram"
  | "x"
  | "tiktok"
  | "other";

export type JoinApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "withdrawn";

export type JoinApplicationSource = "application" | "invite" | "direct";

export interface CommunityAccessConfig {
  accessMode: CommunityAccessMode;
  accessStatus: CommunityAccessStatus;
  admissionsPaused: boolean;
  memberLimit: number | null;
  joinApprovalMode: JoinApprovalMode;
  communityRules: string | null;
  requireRulesConsent: boolean;
  requireAgeVerification: boolean;
  minAge: number | null;
  requiredPlatformIds: PlatformIdentityType[];
  waitlistEnabled: boolean;
  autoRejectAtLimit: boolean;
  autoMessagesEnabled: boolean;
  rejoinCooldownDays: number | null;
  allowRejoinAfterBan: boolean;
  paidJoinRequired: boolean;
  archivedAt: string | null;
  lifecycleNotes: string | null;
}

export interface JoinQuestion {
  id: string;
  communityId: string;
  questionType: JoinQuestionType;
  label: string;
  placeholder: string | null;
  options: string[];
  isRequired: boolean;
  sortOrder: number;
  config: Record<string, unknown>;
  isActive: boolean;
}

export interface JoinApplicationAnswer {
  questionId: string | null;
  valueText: string | null;
  valueBoolean: boolean | null;
  valueJson: Record<string, unknown> | null;
}

export interface JoinPlatformIdentity {
  platformType: PlatformIdentityType;
  value: string;
}

export interface JoinApplication {
  id: string;
  communityId: string;
  userId: string;
  status: JoinApplicationStatus;
  source: JoinApplicationSource;
  inviteLinkId: string | null;
  systemMessage: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  answers?: JoinApplicationAnswer[];
  platformIdentities?: JoinPlatformIdentity[];
  applicant?: {
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
}

export interface JoinAccessState {
  canJoinDirectly: boolean;
  requiresApplication: boolean;
  requiresInvite: boolean;
  blockReason: string | null;
  existingApplication: JoinApplication | null;
  validInviteCode?: string | null;
  waitlistAtCapacity?: boolean;
  userRestriction: string | null;
}

export interface CommunityInviteLink {
  id: string;
  communityId: string;
  code: string;
  label: string | null;
  createdBy: string;
  assignedRole: CommunityRole;
  expiresAt: string | null;
  maxUses: number | null;
  useCount: number;
  isSingleUse: boolean;
  isActive: boolean;
  bypassClosed: boolean;
  createdAt: string;
  updatedAt: string;
  inviteUrl?: string;
  isExpired?: boolean;
  isExhausted?: boolean;
}

export interface InviteLinkPreview {
  code: string;
  communityId: string;
  communityTitle: string;
  communitySlug: string;
  assignedRole: CommunityRole;
  expiresAt: string | null;
  isValid: boolean;
  invalidReason: string | null;
}

export interface CreateInviteLinkInput {
  label?: string;
  assignedRole?: CommunityRole;
  expiresAt?: string | null;
  maxUses?: number | null;
  isSingleUse?: boolean;
  bypassClosed?: boolean;
}

export interface SubmitJoinApplicationInput {
  communityId: string;
  userId: string;
  answers: JoinApplicationAnswer[];
  platformIdentities: JoinPlatformIdentity[];
  inviteLinkId?: string | null;
  fileProofs?: import("@/types/lifecycle").JoinApplicationFileMeta[];
}

export interface CommunityAccessSettingsInput {
  accessMode: CommunityAccessMode;
  visibility: import("@/types/database").CommunityVisibility;
  accessStatus: CommunityAccessStatus;
  admissionsPaused: boolean;
  memberLimit: number | null;
  joinApprovalMode: JoinApprovalMode;
  communityRules: string | null;
  requireRulesConsent: boolean;
  requireAgeVerification: boolean;
  minAge: number | null;
  requiredPlatformIds: PlatformIdentityType[];
  waitlistEnabled: boolean;
  autoRejectAtLimit: boolean;
  autoMessagesEnabled: boolean;
  rejoinCooldownDays: number | null;
  allowRejoinAfterBan: boolean;
  paidJoinRequired: boolean;
  lifecycleNotes: string | null;
}

export interface JoinQuestionInput {
  questionType: JoinQuestionType;
  label: string;
  placeholder?: string;
  options?: string[];
  isRequired?: boolean;
  sortOrder?: number;
  config?: Record<string, unknown>;
}

/** Rollen mit Anzeigenamen — Owner = creator */
export type GovernanceRole = CommunityRole;

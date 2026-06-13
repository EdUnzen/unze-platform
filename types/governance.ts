import type { CommunityRole } from "@/types/database";

/** Granulare Permission Keys — synchron mit community_permission_definitions */
export type GovernancePermissionKey =
  | "view"
  | "post"
  | "comment"
  | "moderate"
  | "review_applications"
  | "manage_invites"
  | "ban_members"
  | "view_restrictions"
  | "manage_reports"
  | "view_audit_log"
  | "manage_members"
  | "manage_roles"
  | "manage_settings"
  | "manage_access"
  | "manage_join_questions"
  | "manage_permissions"
  | "manage_monetization"
  | "archive_community"
  | "delete_community"
  | "transfer_ownership";

export interface PermissionDefinition {
  key: GovernancePermissionKey;
  label: string;
  description: string;
  defaultMinRole: CommunityRole;
  category: string;
}

export interface PermissionOverride {
  id: string;
  communityId: string;
  permissionKey: GovernancePermissionKey;
  role: CommunityRole;
  granted: boolean;
  updatedAt: string;
}

export type ReportTargetType =
  | "user"
  | "community"
  | "creator"
  | "post"
  | "comment"
  | "group"
  | "event";

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

export interface PlatformReport {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  communityId: string | null;
  reason: string;
  details: string | null;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  reporterDisplayName?: string | null;
  reporterUsername?: string | null;
}

export type ModerationActionType =
  | "warn"
  | "mute"
  | "strike"
  | "ban"
  | "unban"
  | "lift_restriction"
  | "dismiss_report"
  | "restore_member";

export interface ModerationAction {
  id: string;
  communityId: string;
  actorId: string;
  targetUserId: string | null;
  actionType: ModerationActionType;
  reportId: string | null;
  restrictionId: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  actorDisplayName?: string | null;
  targetDisplayName?: string | null;
}

export interface MemberStrike {
  id: string;
  communityId: string;
  userId: string;
  strikeNumber: number;
  reason: string | null;
  issuedBy: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export type AuditCategory =
  | "role_change"
  | "application"
  | "invite"
  | "restriction"
  | "settings"
  | "membership"
  | "moderation"
  | "community_lifecycle"
  | "permission"
  | "verification";

export interface AuditLogEntry {
  id: string;
  communityId: string | null;
  actorId: string | null;
  action: string;
  category: AuditCategory;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  actorDisplayName?: string | null;
}

export type TrustEventType =
  | "verified_member_granted"
  | "verified_member_revoked"
  | "strike_received"
  | "ban_received"
  | "report_filed"
  | "report_resolved"
  | "community_joined"
  | "community_left"
  | "reputation_adjustment"
  | "spam_flag"
  | "scam_flag"
  | "creator_verified"
  | "community_verified"
  | "verification_rejected";

export type TrustFlagType =
  | "spam_suspect"
  | "scam_suspect"
  | "report_spike"
  | "verified"
  | "restricted";

export interface TrustEvent {
  id: string;
  userId: string | null;
  communityId: string | null;
  eventType: TrustEventType;
  delta: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface UserTrustFlag {
  id: string;
  userId: string;
  flagType: TrustFlagType;
  communityId: string | null;
  reason: string | null;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export type NotificationCategory =
  | "application"
  | "moderation"
  | "invite"
  | "community_event"
  | "system";

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  category: NotificationCategory;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  applications: boolean;
  moderation: boolean;
  invites: boolean;
  communityEvents: boolean;
  system: boolean;
  pushEnabled: boolean;
}

export interface SubmitReportInput {
  targetType: ReportTargetType;
  targetId: string;
  communityId?: string | null;
  reason: string;
  details?: string;
}

export interface IssueStrikeInput {
  communityId: string;
  userId: string;
  actorId: string;
  actorRole: CommunityRole;
  reason?: string;
  expiresAt?: string | null;
}

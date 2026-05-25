import { resolveAccessModeFromCommunity } from "@/lib/access/presets";
import type {
  CommunityAccessConfig,
  CommunityAccessMode,
  JoinApplication,
  JoinApplicationAnswer,
  JoinApplicationSource,
  JoinPlatformIdentity,
  JoinQuestion,
} from "@/types/access";
import type {
  CommunityAccessStatus,
  CommunityVisibility,
  JoinApprovalMode,
  JoinApplicationStatus,
  JoinQuestionType,
  PlatformIdentityType,
} from "@/types/database";

export function mapAccessConfigFromRow(row: {
  access_mode?: CommunityAccessMode;
  visibility?: CommunityVisibility;
  access_status?: CommunityAccessStatus;
  admissions_paused?: boolean;
  member_limit?: number | null;
  join_approval_mode?: JoinApprovalMode;
  community_rules?: string | null;
  require_rules_consent?: boolean;
  require_age_verification?: boolean;
  min_age?: number | null;
  required_platform_ids?: PlatformIdentityType[] | unknown;
  waitlist_enabled?: boolean;
  auto_reject_at_limit?: boolean;
  auto_messages_enabled?: boolean;
  rejoin_cooldown_days?: number | null;
  allow_rejoin_after_ban?: boolean;
  paid_join_required?: boolean;
  archived_at?: string | null;
  lifecycle_notes?: string | null;
}): CommunityAccessConfig {
  const platformIds = row.required_platform_ids;
  const accessStatus = row.access_status ?? "open";
  const visibility = row.visibility ?? "public";

  return {
    accessMode: resolveAccessModeFromCommunity({
      accessMode: row.access_mode ?? null,
      visibility,
      accessStatus,
    }),
    accessStatus,
    admissionsPaused: row.admissions_paused ?? false,
    memberLimit: row.member_limit ?? null,
    joinApprovalMode: row.join_approval_mode ?? "auto_accept",
    communityRules: row.community_rules ?? null,
    requireRulesConsent: row.require_rules_consent ?? false,
    requireAgeVerification: row.require_age_verification ?? false,
    minAge: row.min_age ?? null,
    requiredPlatformIds: Array.isArray(platformIds)
      ? (platformIds as PlatformIdentityType[])
      : [],
    waitlistEnabled: row.waitlist_enabled ?? false,
    autoRejectAtLimit: row.auto_reject_at_limit ?? true,
    autoMessagesEnabled: row.auto_messages_enabled ?? true,
    rejoinCooldownDays: row.rejoin_cooldown_days ?? null,
    allowRejoinAfterBan: row.allow_rejoin_after_ban ?? false,
    paidJoinRequired: row.paid_join_required ?? false,
    archivedAt: row.archived_at ?? null,
    lifecycleNotes: row.lifecycle_notes ?? null,
  };
}
export function mapJoinQuestionRow(row: {
  id: string;
  community_id: string;
  question_type: JoinQuestionType;
  label: string;
  placeholder: string | null;
  options: unknown;
  is_required: boolean;
  sort_order: number;
  config: Record<string, unknown> | null;
  is_active: boolean;
}): JoinQuestion {
  return {
    id: row.id,
    communityId: row.community_id,
    questionType: row.question_type,
    label: row.label,
    placeholder: row.placeholder,
    options: Array.isArray(row.options) ? (row.options as string[]) : [],
    isRequired: row.is_required,
    sortOrder: row.sort_order,
    config: row.config ?? {},
    isActive: row.is_active,
  };
}

export function mapJoinApplicationRow(
  row: {
    id: string;
    community_id: string;
    user_id: string;
    status: JoinApplicationStatus;
    source?: JoinApplicationSource | string | null;
    invite_link_id?: string | null;
    system_message: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
  },
  extras?: {
    applicant?: JoinApplication["applicant"];
    answers?: JoinApplicationAnswer[];
    platformIdentities?: JoinPlatformIdentity[];
  },
): JoinApplication {
  return {
    id: row.id,
    communityId: row.community_id,
    userId: row.user_id,
    status: row.status,
    source: (row.source as JoinApplicationSource) ?? "application",
    inviteLinkId: row.invite_link_id ?? null,
    systemMessage: row.system_message,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    applicant: extras?.applicant,
    answers: extras?.answers,
    platformIdentities: extras?.platformIdentities,
  };
}

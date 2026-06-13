import { createClient } from "@/lib/supabase/server";
import {
  mapAccessConfigFromRow,
  mapJoinApplicationRow,
  mapJoinQuestionRow,
} from "@/lib/mappers/access.mapper";
import type {
  CommunityAccessSettingsInput,
  JoinApplication,
  JoinApplicationAnswer,
  JoinApplicationSource,
  JoinPlatformIdentity,
  JoinQuestion,
  JoinQuestionInput,
} from "@/types/access";
import type {
  CommunityAccessStatus,
  CommunityVisibility,
  JoinApplicationStatus,
  PlatformIdentityType,
} from "@/types/database";

export async function fetchAccessConfigFromDb(
  communityId: string,
): Promise<ReturnType<typeof mapAccessConfigFromRow> | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("communities")
    .select(
      "access_mode, visibility, access_status, admissions_paused, member_limit, join_approval_mode, community_rules, require_rules_consent, require_age_verification, min_age, required_platform_ids, waitlist_enabled, auto_reject_at_limit, auto_messages_enabled, rejoin_cooldown_days, allow_rejoin_after_ban, paid_join_required, archived_at, lifecycle_notes",
    )
    .eq("id", communityId)
    .maybeSingle();

  if (error || !data) return null;
  return mapAccessConfigFromRow(data);
}

export async function updateAccessConfigInDb(
  communityId: string,
  input: CommunityAccessSettingsInput,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("communities")
    .update({
      access_mode: input.accessMode,
      visibility: input.visibility,
      access_status: input.accessStatus,
      admissions_paused: input.admissionsPaused,
      member_limit: input.memberLimit,
      join_approval_mode: input.joinApprovalMode,
      community_rules: input.communityRules,
      require_rules_consent: input.requireRulesConsent,
      require_age_verification: input.requireAgeVerification,
      min_age: input.minAge,
      required_platform_ids: input.requiredPlatformIds,
      waitlist_enabled: input.waitlistEnabled,
      auto_reject_at_limit: input.autoRejectAtLimit,
      auto_messages_enabled: input.autoMessagesEnabled,
      rejoin_cooldown_days: input.rejoinCooldownDays,
      allow_rejoin_after_ban: input.allowRejoinAfterBan,
      paid_join_required: input.paidJoinRequired,
      lifecycle_notes: input.lifecycleNotes,
    })
    .eq("id", communityId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchJoinQuestionsFromDb(
  communityId: string,
  activeOnly = false,
): Promise<JoinQuestion[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("community_join_questions")
    .select("*")
    .eq("community_id", communityId)
    .order("sort_order", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[access.repository] fetchJoinQuestions:", error.message);
    return [];
  }

  return (data ?? []).map(mapJoinQuestionRow);
}

export async function createJoinQuestionInDb(
  communityId: string,
  input: JoinQuestionInput,
): Promise<JoinQuestion | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("community_join_questions")
    .insert({
      community_id: communityId,
      question_type: input.questionType,
      label: input.label,
      placeholder: input.placeholder ?? null,
      options: input.options ?? [],
      is_required: input.isRequired ?? true,
      sort_order: input.sortOrder ?? 0,
      config: input.config ?? {},
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[access.repository] createJoinQuestion:", error?.message);
    return null;
  }

  return mapJoinQuestionRow(data);
}

export async function deleteJoinQuestionInDb(
  questionId: string,
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("community_join_questions")
    .delete()
    .eq("id", questionId);

  return !error;
}

export async function fetchUserApplicationFromDb(
  communityId: string,
  userId: string,
): Promise<JoinApplication | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("community_join_applications")
    .select("*")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapJoinApplicationRow(data);
}

export async function fetchApplicationsForCommunityFromDb(
  communityId: string,
  status?: JoinApplicationStatus,
): Promise<JoinApplication[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("community_join_applications")
    .select(
      `
      *,
      profile:profiles!community_join_applications_user_id_fkey (
        display_name,
        username,
        avatar_url
      )
    `,
    )
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[access.repository] fetchApplications:", error.message);
    return [];
  }

  const applicationIds = (data ?? []).map((row) => row.id as string);
  const [answersByApp, identitiesByApp] = await Promise.all([
    fetchApplicationAnswersGrouped(applicationIds),
    fetchApplicationIdentitiesGrouped(applicationIds),
  ]);

  return (data ?? []).map((row) => {
    const rawProfile = row.profile as
      | { display_name: string | null; username: string | null; avatar_url: string | null }
      | { display_name: string | null; username: string | null; avatar_url: string | null }[]
      | null;
    const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;

    return mapJoinApplicationRow(row, {
      applicant: profile
        ? {
            displayName: profile.display_name,
            username: profile.username,
            avatarUrl: profile.avatar_url,
          }
        : undefined,
      answers: answersByApp[row.id as string] ?? [],
      platformIdentities: identitiesByApp[row.id as string] ?? [],
    });
  });
}

async function fetchApplicationAnswersGrouped(
  applicationIds: string[],
): Promise<Record<string, JoinApplicationAnswer[]>> {
  if (applicationIds.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("community_join_application_answers")
    .select("application_id, question_id, value_text, value_boolean, value_json")
    .in("application_id", applicationIds);

  if (error) {
    console.error("[access.repository] fetchAnswers:", error.message);
    return {};
  }

  const grouped: Record<string, JoinApplicationAnswer[]> = {};
  for (const row of data ?? []) {
    const appId = row.application_id as string;
    if (!grouped[appId]) grouped[appId] = [];
    grouped[appId].push({
      questionId: row.question_id as string,
      valueText: row.value_text as string | null,
      valueBoolean: row.value_boolean as boolean | null,
      valueJson: (row.value_json as Record<string, unknown>) ?? null,
    });
  }
  return grouped;
}

async function fetchApplicationIdentitiesGrouped(
  applicationIds: string[],
): Promise<Record<string, JoinPlatformIdentity[]>> {
  if (applicationIds.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("community_join_platform_identities")
    .select("application_id, platform_type, value")
    .in("application_id", applicationIds);

  if (error) {
    console.error("[access.repository] fetchIdentities:", error.message);
    return {};
  }

  const grouped: Record<string, JoinPlatformIdentity[]> = {};
  for (const row of data ?? []) {
    const appId = row.application_id as string;
    if (!grouped[appId]) grouped[appId] = [];
    grouped[appId].push({
      platformType: row.platform_type as JoinPlatformIdentity["platformType"],
      value: row.value as string,
    });
  }
  return grouped;
}

export async function createApplicationInDb(input: {
  communityId: string;
  userId: string;
  status: JoinApplicationStatus;
  systemMessage?: string;
  source?: JoinApplicationSource;
  inviteLinkId?: string | null;
}): Promise<JoinApplication | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("community_join_applications")
    .upsert(
      {
        community_id: input.communityId,
        user_id: input.userId,
        status: input.status,
        source: input.source ?? "application",
        invite_link_id: input.inviteLinkId ?? null,
        system_message: input.systemMessage ?? null,
        reviewed_by: null,
        reviewed_at: null,
        rejection_reason: null,
      },
      { onConflict: "community_id,user_id" },
    )
    .select("*")
    .single();

  if (error || !data) {
    console.error("[access.repository] createApplication:", error?.message);
    return null;
  }

  return mapJoinApplicationRow(data);
}

export async function saveApplicationAnswersInDb(
  applicationId: string,
  answers: JoinApplicationAnswer[],
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  await supabase
    .from("community_join_application_answers")
    .delete()
    .eq("application_id", applicationId);

  const rows = answers.map((a) => ({
    application_id: applicationId,
    question_id:
      a.questionId && !a.questionId.startsWith("__") ? a.questionId : null,
    value_text: a.valueText,
    value_boolean: a.valueBoolean,
    value_json:
      a.questionId?.startsWith("__")
        ? {
            ...(a.valueJson ?? {}),
            virtualQuestion: a.questionId,
            label: "Geburtsdatum",
          }
        : a.valueJson,
  }));

  if (rows.length === 0) return true;

  const { error } = await supabase
    .from("community_join_application_answers")
    .insert(rows);

  return !error;
}

export async function savePlatformIdentitiesInDb(
  applicationId: string,
  identities: JoinPlatformIdentity[],
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const rows = identities.map((i) => ({
    application_id: applicationId,
    platform_type: i.platformType,
    value: i.value,
  }));

  const { error } = await supabase
    .from("community_join_platform_identities")
    .upsert(rows, { onConflict: "application_id,platform_type" });

  return !error;
}

export async function updateApplicationStatusInDb(
  applicationId: string,
  input: {
    status: JoinApplicationStatus;
    reviewedBy?: string;
    rejectionReason?: string;
    systemMessage?: string;
  },
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("community_join_applications")
    .update({
      status: input.status,
      reviewed_by: input.reviewedBy ?? null,
      reviewed_at: new Date().toISOString(),
      rejection_reason: input.rejectionReason ?? null,
      system_message: input.systemMessage ?? null,
    })
    .eq("id", applicationId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function acceptApplicationViaRpc(
  applicationId: string,
  reviewerId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.rpc("accept_join_application", {
    p_application_id: applicationId,
    p_reviewer_id: reviewerId,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function countPendingApplicationsFromDb(
  communityId: string,
): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("community_join_applications")
    .select("id", { count: "exact", head: true })
    .eq("community_id", communityId)
    .in("status", ["pending", "waitlisted"]);

  if (error) return 0;
  return count ?? 0;
}

export async function fetchCommunityAccessRowFromDb(communityId: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("communities")
    .select(
      "id, visibility, member_count, monetization_enabled, access_mode, access_status, admissions_paused, member_limit, join_approval_mode, require_rules_consent, require_age_verification, min_age, required_platform_ids, waitlist_enabled, auto_reject_at_limit, auto_messages_enabled, paid_join_required",
    )
    .eq("id", communityId)
    .maybeSingle();

  return data;
}

export async function hasActiveJoinQuestionsInDb(
  communityId: string,
): Promise<boolean> {
  const questions = await fetchJoinQuestionsFromDb(communityId, true);
  return questions.length > 0;
}

export function resolveJoinBlockReason(input: {
  visibility: string;
  accessStatus: CommunityAccessStatus;
  admissionsPaused: boolean;
  memberCount: number;
  memberLimit: number | null;
  joinApprovalMode: string;
  monetizationEnabled: boolean;
  isMember: boolean;
  hasValidInvite?: boolean;
  hasActiveSubscription?: boolean;
  waitlistEnabled?: boolean;
  autoRejectAtLimit?: boolean;
}): string | null {
  if (input.isMember) return null;

  if (input.hasValidInvite) return null;

  if (input.accessStatus === "archived") {
    return "Community archiviert — keine Beitritte möglich";
  }

  if (input.accessStatus === "closed") {
    return "Community aktuell geschlossen";
  }

  if (input.admissionsPaused || input.accessStatus === "paused") {
    return "Weitere Bewerbungen aktuell pausiert";
  }

  if (
    input.memberLimit !== null &&
    input.memberCount >= input.memberLimit
  ) {
    if (input.waitlistEnabled && !input.autoRejectAtLimit) {
      return null;
    }
    return "Mitgliederlimit erreicht";
  }

  if (input.accessStatus === "member_limit_reached") {
    if (input.waitlistEnabled && !input.autoRejectAtLimit) {
      return null;
    }
    return "Mitgliederlimit erreicht";
  }

  if (
    input.visibility === "premium" &&
    input.monetizationEnabled &&
    !input.hasActiveSubscription
  ) {
    return "Kostenpflichtiger Zugang — Abo erforderlich";
  }

  if (input.accessStatus === "invite_only") {
    return "Nur auf Einladung — gültigen Einladungslink verwenden";
  }

  if (input.joinApprovalMode === "auto_reject") {
    if (input.visibility === "private") {
      return "Nur auf Einladung — Beitritt nicht möglich";
    }
    return "Beitritt derzeit nicht möglich";
  }

  return null;
}

export function resolveJoinAccessState(input: {
  blockReason: string | null;
  joinApprovalMode: string;
  hasQuestions: boolean;
  visibility: string;
  accessStatus: CommunityAccessStatus;
  existingApplication: JoinApplication | null;
  hasValidInvite?: boolean;
  paidJoinRequired?: boolean;
  monetizationEnabled?: boolean;
}): {
  canJoinDirectly: boolean;
  requiresApplication: boolean;
  requiresInvite: boolean;
} {
  if (input.hasValidInvite) {
    return {
      canJoinDirectly: true,
      requiresApplication: false,
      requiresInvite: false,
    };
  }

  const requiresInvite =
    input.joinApprovalMode === "invite_required" ||
    input.accessStatus === "invite_only" ||
    (input.visibility === "private" &&
      input.joinApprovalMode === "auto_reject");

  if (requiresInvite && !input.hasValidInvite) {
    return {
      canJoinDirectly: false,
      requiresApplication: false,
      requiresInvite: true,
    };
  }

  if (
    input.joinApprovalMode === "paid_unlock" ||
    (input.paidJoinRequired && input.monetizationEnabled)
  ) {
    return {
      canJoinDirectly: false,
      requiresApplication: true,
      requiresInvite: false,
    };
  }

  if (input.blockReason) {
    return {
      canJoinDirectly: false,
      requiresApplication: false,
      requiresInvite: false,
    };
  }

  if (input.existingApplication) {
    const active = ["pending", "waitlisted", "accepted"].includes(
      input.existingApplication.status,
    );
    if (active) {
      return {
        canJoinDirectly: false,
        requiresApplication: false,
        requiresInvite: false,
      };
    }
  }

  const needsApplication =
    input.hasQuestions ||
    input.joinApprovalMode !== "auto_accept" ||
    input.visibility === "private";

  if (needsApplication) {
    return {
      canJoinDirectly: false,
      requiresApplication: true,
      requiresInvite: false,
    };
  }

  return {
    canJoinDirectly: true,
    requiresApplication: false,
    requiresInvite: false,
  };
}

export async function fetchCommunityReviewerIdsFromDb(
  communityId: string,
): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("community_members")
    .select("user_id")
    .eq("community_id", communityId)
    .in("role", ["creator", "admin", "moderator"]);

  return (data ?? []).map((r) => r.user_id as string);
}

export async function countApplicationsByStatusFromDb(
  communityId: string,
): Promise<Record<string, number>> {
  const supabase = await createClient();
  if (!supabase) return {};

  const { data } = await supabase
    .from("community_join_applications")
    .select("status")
    .eq("community_id", communityId);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const status = row.status as string;
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}

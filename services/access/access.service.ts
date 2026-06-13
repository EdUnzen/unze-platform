import { getAccessPreset } from "@/lib/access/presets";
import {
  calculateAgeFromBirthDate,
  isVirtualAgeQuestionId,
} from "@/lib/access/join-questions";
import {
  notifyApplicant,
  notifyReviewers,
} from "@/lib/access/lifecycle-notifications";
import { SYSTEM_MESSAGE_TEMPLATES } from "@/lib/constants/access";
import {
  canReviewApplications,
  hasCommunityPermission,
} from "@/lib/permissions/community.permissions";
import { joinCommunityInDb } from "@/services/community/member.repository";
import { checkUserJoinRestriction } from "@/services/lifecycle/restriction.service";
import { persistApplicationProofs } from "@/services/storage/proof.service";
import type {
  CommunityAccessSettingsInput,
  JoinAccessState,
  JoinApplication,
  JoinQuestionInput,
  SubmitJoinApplicationInput,
} from "@/types/access";
import type { CommunityRole } from "@/types/database";
import {
  acceptApplicationViaRpc,
  countApplicationsByStatusFromDb,
  createApplicationInDb,
  createJoinQuestionInDb,
  deleteJoinQuestionInDb,
  fetchAccessConfigFromDb,
  fetchApplicationsForCommunityFromDb,
  fetchCommunityAccessRowFromDb,
  fetchCommunityReviewerIdsFromDb,
  fetchJoinQuestionsFromDb,
  fetchUserApplicationFromDb,
  hasActiveJoinQuestionsInDb,
  resolveJoinAccessState,
  resolveJoinBlockReason,
  saveApplicationAnswersInDb,
  savePlatformIdentitiesInDb,
  updateAccessConfigInDb,
  updateApplicationStatusInDb,
} from "./access.repository";
import { fetchInvitePreviewFromDb } from "./invite.repository";
import { hasActiveCommunitySubscription } from "@/services/monetization/subscription.repository";

export async function getCommunityAccessConfig(communityId: string) {
  return fetchAccessConfigFromDb(communityId);
}

export async function getJoinAccessState(
  communityId: string,
  userId: string | null,
  isMember: boolean,
  inviteCode?: string | null,
): Promise<JoinAccessState> {
  const row = await fetchCommunityAccessRowFromDb(communityId);
  if (!row) {
    return {
      canJoinDirectly: false,
      requiresApplication: false,
      requiresInvite: false,
      blockReason: "Community nicht gefunden",
      existingApplication: null,
      userRestriction: null,
    };
  }

  let hasValidInvite = false;
  if (inviteCode) {
    const preview = await fetchInvitePreviewFromDb(inviteCode);
    hasValidInvite =
      Boolean(preview?.isValid) && preview?.communityId === communityId;
  }

  const hasQuestions = await hasActiveJoinQuestionsInDb(communityId);
  let existingApplication: JoinApplication | null = null;

  if (userId) {
    existingApplication = await fetchUserApplicationFromDb(communityId, userId);
  }

  let restrictionReason: string | null = null;
  if (userId && !isMember) {
    restrictionReason = await checkUserJoinRestriction(communityId, userId);
  }

  const needsSubscriptionCheck =
    Boolean(userId) &&
    !isMember &&
    row.visibility === "premium" &&
    row.monetization_enabled;

  const hasActiveSubscription = needsSubscriptionCheck && userId
    ? await hasActiveCommunitySubscription(userId, communityId)
    : false;

  const blockReason =
    restrictionReason ??
    resolveJoinBlockReason({
      visibility: row.visibility,
      accessStatus: row.access_status,
      admissionsPaused: row.admissions_paused,
      memberCount: row.member_count,
      memberLimit: row.member_limit,
      joinApprovalMode: row.join_approval_mode,
      monetizationEnabled: row.monetization_enabled,
      isMember,
      hasValidInvite,
      hasActiveSubscription,
      waitlistEnabled: row.waitlist_enabled ?? false,
      autoRejectAtLimit: row.auto_reject_at_limit ?? true,
    });

  const atLimit =
    row.member_limit !== null && row.member_count >= row.member_limit;

  let { canJoinDirectly, requiresApplication, requiresInvite } =
    resolveJoinAccessState({
      blockReason,
      joinApprovalMode: row.join_approval_mode,
      hasQuestions,
      visibility: row.visibility,
      accessStatus: row.access_status,
      existingApplication,
      hasValidInvite,
      paidJoinRequired: row.paid_join_required,
      monetizationEnabled: row.monetization_enabled,
    });

  if (atLimit && !hasValidInvite && !isMember) {
    canJoinDirectly = false;
    if (row.waitlist_enabled && !row.auto_reject_at_limit) {
      requiresApplication = true;
    }
  }

  return {
    canJoinDirectly: hasValidInvite ? true : canJoinDirectly,
    requiresApplication,
    requiresInvite,
    blockReason: hasValidInvite ? null : blockReason,
    existingApplication,
    validInviteCode: hasValidInvite ? inviteCode : null,
    waitlistAtCapacity:
      atLimit && row.waitlist_enabled && !row.auto_reject_at_limit,
    userRestriction: restrictionReason,
  };
}

export async function updateCommunityAccessSettings(
  communityId: string,
  input: CommunityAccessSettingsInput,
  actorRole: CommunityRole,
) {
  if (!hasCommunityPermission(actorRole, "manage_access")) {
    return { error: "Keine Berechtigung" };
  }

  const preset = getAccessPreset(input.accessMode);
  const merged: CommunityAccessSettingsInput = {
    ...input,
    visibility: input.visibility ?? preset.visibility,
    accessStatus: input.accessStatus ?? preset.accessStatus,
    joinApprovalMode: input.joinApprovalMode ?? preset.joinApprovalMode,
  };

  return updateAccessConfigInDb(communityId, merged);
}

export async function getApplicationStatusCounts(communityId: string) {
  return countApplicationsByStatusFromDb(communityId);
}

async function notifyReviewersOfNewApplication(
  communityId: string,
  applicantUserId: string,
  autoMessagesEnabled: boolean,
  applicationId: string,
) {
  const reviewerIds = await fetchCommunityReviewerIdsFromDb(communityId);
  await notifyReviewers({
    reviewerIds,
    applicantUserId,
    communityId,
    autoMessagesEnabled,
    applicationId,
  });
}

export async function getJoinQuestions(communityId: string, activeOnly = false) {
  return fetchJoinQuestionsFromDb(communityId, activeOnly);
}

export async function createJoinQuestion(
  communityId: string,
  input: JoinQuestionInput,
  actorRole: CommunityRole,
) {
  if (!hasCommunityPermission(actorRole, "manage_join_questions")) {
    return { error: "Keine Berechtigung", question: null };
  }

  const question = await createJoinQuestionInDb(communityId, input);
  if (!question) return { error: "Frage konnte nicht erstellt werden", question: null };
  return { error: null, question };
}

export async function deleteJoinQuestion(
  questionId: string,
  actorRole: CommunityRole,
) {
  if (!hasCommunityPermission(actorRole, "manage_join_questions")) {
    return { error: "Keine Berechtigung" };
  }

  const ok = await deleteJoinQuestionInDb(questionId);
  if (!ok) return { error: "Löschen fehlgeschlagen" };
  return { error: null };
}

export async function getCommunityApplications(
  communityId: string,
  actorRole: CommunityRole,
  status?: JoinApplication["status"],
) {
  if (!canReviewApplications(actorRole)) {
    return { error: "Keine Berechtigung", applications: [] as JoinApplication[] };
  }

  const applications = await fetchApplicationsForCommunityFromDb(
    communityId,
    status,
  );
  return { error: null, applications };
}

export async function submitJoinApplication(input: SubmitJoinApplicationInput) {
  const row = await fetchCommunityAccessRowFromDb(input.communityId);
  if (!row) return { error: "Community nicht gefunden" };

  const restriction = await checkUserJoinRestriction(
    input.communityId,
    input.userId,
  );
  if (restriction) return { error: restriction };

  const autoMessages = row.auto_messages_enabled ?? true;

  const accessState = await getJoinAccessState(
    input.communityId,
    input.userId,
    false,
  );

  if (accessState.blockReason) {
    return { error: accessState.blockReason };
  }

  if (!accessState.requiresApplication && !accessState.canJoinDirectly) {
    return { error: "Beitritt nicht möglich" };
  }

  const questions = await fetchJoinQuestionsFromDb(input.communityId, true);
  for (const q of questions) {
    if (!q.isRequired) continue;
    const answer = input.answers.find((a) => a.questionId === q.id);
    if (q.questionType === "checkbox" || q.questionType === "rules_consent") {
      if (!answer?.valueBoolean) {
        return { error: `Pflichtfeld: ${q.label}` };
      }
    } else if (
      q.questionType === "file_upload" ||
      q.questionType === "image_upload" ||
      q.questionType === "age_proof" ||
      q.questionType === "identity_proof"
    ) {
      const proof = input.fileProofs?.find((f) => f.questionId === q.id);
      if (!proof?.fileName || !proof.storagePath) {
        return { error: `Nachweis erforderlich: ${q.label}` };
      }
    } else if (!answer?.valueText?.trim()) {
      return { error: `Pflichtfeld: ${q.label}` };
    }
  }

  const requiredPlatforms = Array.isArray(row.required_platform_ids)
    ? row.required_platform_ids
    : [];
  for (const platform of requiredPlatforms) {
    const identity = input.platformIdentities.find(
      (p) => p.platformType === platform,
    );
    if (!identity?.value?.trim()) {
      return { error: `Plattform-ID erforderlich: ${platform}` };
    }
  }

  if (row.require_age_verification && row.min_age) {
    const ageAnswer = input.answers.find((a) => {
      if (isVirtualAgeQuestionId(a.questionId ?? "")) return true;
      const q = questions.find((q) => q.id === a.questionId);
      return q?.questionType === "age_verification";
    });

    if (!ageAnswer?.valueText?.trim()) {
      return {
        error: `Geburtsdatum erforderlich (Mindestalter: ${row.min_age} Jahre)`,
      };
    }

    const birthDate = new Date(ageAnswer.valueText);
    if (Number.isNaN(birthDate.getTime())) {
      return { error: "Ungültiges Geburtsdatum" };
    }

    const age = calculateAgeFromBirthDate(birthDate);
    if (age < row.min_age) {
      return { error: `Mindestalter: ${row.min_age} Jahre` };
    }
  }

  const atLimit =
    row.member_limit !== null && row.member_count >= row.member_limit;

  let status: JoinApplication["status"] = "pending";
  let systemMessage: string | undefined;

  if (atLimit) {
    if (row.waitlist_enabled && !row.auto_reject_at_limit) {
      status = "waitlisted";
      systemMessage = SYSTEM_MESSAGE_TEMPLATES.waitlisted;
    } else if (row.auto_reject_at_limit) {
      status = "rejected";
      systemMessage = SYSTEM_MESSAGE_TEMPLATES.member_limit_reached;
    }
  } else if (row.join_approval_mode === "auto_accept" && questions.length === 0) {
    const direct = await joinCommunityInDb(input.communityId, input.userId);
    if (direct.error) return { error: direct.error };
    await notifyApplicant({
      userId: input.userId,
      event: "application_accepted",
      communityId: input.communityId,
      autoMessagesEnabled: autoMessages,
    });
    return { error: null, application: null, joined: true };
  } else if (row.join_approval_mode === "auto_reject") {
    status = "rejected";
    systemMessage = SYSTEM_MESSAGE_TEMPLATES.auto_rejected;
  } else if (
    row.join_approval_mode === "waitlist" ||
    (row.waitlist_enabled && status === "pending")
  ) {
    status = "waitlisted";
    systemMessage = SYSTEM_MESSAGE_TEMPLATES.waitlisted;
  }

  const application = await createApplicationInDb({
    communityId: input.communityId,
    userId: input.userId,
    status,
    systemMessage,
  });

  if (!application) return { error: "Antrag konnte nicht gespeichert werden" };

  await saveApplicationAnswersInDb(application.id, input.answers);
  if (input.platformIdentities.length > 0) {
    await savePlatformIdentitiesInDb(application.id, input.platformIdentities);
  }
  if (input.fileProofs?.length) {
    await persistApplicationProofs({
      applicationId: application.id,
      uploadedBy: input.userId,
      proofs: input.fileProofs,
    });
  }

  if (status === "rejected") {
    await notifyApplicant({
      userId: input.userId,
      event: "application_rejected",
      communityId: input.communityId,
      bodyOverride: systemMessage,
      data: { applicationId: application.id },
      autoMessagesEnabled: autoMessages,
    });
    return { error: systemMessage ?? "Antrag abgelehnt", application };
  }

  if (status === "waitlisted") {
    await notifyApplicant({
      userId: input.userId,
      event: "application_waitlisted",
      communityId: input.communityId,
      data: { applicationId: application.id },
      autoMessagesEnabled: autoMessages,
    });
  }

  if (status === "pending") {
    await notifyApplicant({
      userId: input.userId,
      event: "application_submitted",
      communityId: input.communityId,
      data: { applicationId: application.id },
      autoMessagesEnabled: autoMessages,
    });
    await notifyReviewersOfNewApplication(
      input.communityId,
      input.userId,
      autoMessages,
      application.id,
    );
  }

  return { error: null, application, joined: false };
}

export async function reviewJoinApplication(input: {
  applicationId: string;
  communityId: string;
  communitySlug?: string;
  reviewerId: string;
  reviewerRole: CommunityRole;
  action: "accept" | "reject" | "waitlist";
  rejectionReason?: string;
}) {
  if (!canReviewApplications(input.reviewerRole)) {
    return { error: "Keine Berechtigung" };
  }

  const application = (
    await fetchApplicationsForCommunityFromDb(input.communityId)
  ).find((a) => a.id === input.applicationId);

  if (!application) return { error: "Antrag nicht gefunden" };

  const autoMessages = await getAutoMessagesFlag(input.communityId);

  if (input.action === "accept") {
    const result = await acceptApplicationViaRpc(
      input.applicationId,
      input.reviewerId,
    );
    if (result.error) return result;

    await notifyApplicant({
      userId: application.userId,
      event: "application_accepted",
      communityId: input.communityId,
      data: {
        applicationId: input.applicationId,
        communitySlug: input.communitySlug,
      },
      autoMessagesEnabled: autoMessages,
    });
    return { error: null };
  }

  const status = input.action === "reject" ? "rejected" : "waitlisted";
  const systemMessage =
    input.action === "reject"
      ? SYSTEM_MESSAGE_TEMPLATES.application_rejected
      : SYSTEM_MESSAGE_TEMPLATES.waitlisted;

  const result = await updateApplicationStatusInDb(input.applicationId, {
    status,
    reviewedBy: input.reviewerId,
    rejectionReason: input.rejectionReason,
    systemMessage,
  });

  if (result.error) return result;

  await notifyApplicant({
    userId: application.userId,
    event:
      input.action === "reject"
        ? "application_rejected"
        : "application_waitlisted",
    communityId: input.communityId,
    bodyOverride: input.rejectionReason ?? systemMessage,
    data: {
      applicationId: input.applicationId,
      communitySlug: input.communitySlug,
    },
    autoMessagesEnabled: autoMessages,
  });

  return { error: null };
}

async function getAutoMessagesFlag(communityId: string): Promise<boolean> {
  const config = await fetchAccessConfigFromDb(communityId);
  return config?.autoMessagesEnabled ?? true;
}

export async function directJoinCommunity(
  communityId: string,
  userId: string,
) {
  const accessState = await getJoinAccessState(communityId, userId, false);

  if (accessState.blockReason) {
    return { error: accessState.blockReason };
  }

  if (!accessState.canJoinDirectly) {
    return { error: "Beitritt erfordert einen Antrag" };
  }

  const result = await joinCommunityInDb(communityId, userId);
  if (result.error) return result;

  const autoMessages = await getAutoMessagesFlag(communityId);
  await notifyApplicant({
    userId,
    event: "application_accepted",
    communityId,
    data: { type: "direct_join" },
    autoMessagesEnabled: autoMessages,
  });

  const { setCommunityActivityPref } = await import(
    "@/services/notifications/community-activity.service"
  );
  await setCommunityActivityPref(userId, communityId, true);

  return { error: null };
}

export async function withdrawJoinApplication(
  applicationId: string,
  userId: string,
  communityId: string,
) {
  const application = await fetchUserApplicationFromDb(communityId, userId);
  if (!application || application.id !== applicationId) {
    return { error: "Antrag nicht gefunden" };
  }

  if (!["pending", "waitlisted"].includes(application.status)) {
    return { error: "Antrag kann nicht zurückgezogen werden" };
  }

  const result = await updateApplicationStatusInDb(applicationId, {
    status: "withdrawn",
    systemMessage: "Antrag zurückgezogen",
  });

  if (result.error) return result;
  return { error: null };
}

export async function getJoinRequestsDashboard(
  communityId: string,
  actorRole: CommunityRole,
  filterStatus?: JoinApplication["status"],
) {
  const [applicationsResult, statusCounts] = await Promise.all([
    getCommunityApplications(communityId, actorRole, filterStatus),
    countApplicationsByStatusFromDb(communityId),
  ]);

  return {
    ...applicationsResult,
    statusCounts,
  };
}

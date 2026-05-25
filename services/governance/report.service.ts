import { canManageReports } from "@/lib/permissions/engine";
import { notifyGovernanceEvent } from "@/lib/notifications/events";
import { logModerationAction } from "@/services/governance/audit.service";
import { publishPlatformEvent } from "@/services/platform/event-bus.service";
import { recordTrustEvent } from "@/services/trust/trust.service";import type {
  PlatformReport,
  ReportStatus,
  SubmitReportInput,
} from "@/types/governance";
import type { CommunityRole } from "@/types/database";
import {
  fetchReportsForCommunityFromDb,
  insertReportInDb,
  updateReportStatusInDb,
} from "./report.repository";

export async function submitReport(
  reporterId: string,
  input: SubmitReportInput,
): Promise<{ error: string | null; id?: string }> {
  if (!input.reason.trim()) {
    return { error: "Bitte einen Grund angeben" };
  }

  const result = await insertReportInDb({
    reporterId,
    targetType: input.targetType,
    targetId: input.targetId,
    communityId: input.communityId,
    reason: input.reason.trim(),
    details: input.details?.trim(),
  });

  if (result.error || !result.id) return result;

  await recordTrustEvent({
    userId: reporterId,
    communityId: input.communityId ?? null,
    eventType: "report_filed",
    delta: 0,
    metadata: { reportId: result.id, targetType: input.targetType },
  });

  if (input.communityId) {
    await publishPlatformEvent({
      eventType: "report.created",
      actorId: reporterId,
      communityId: input.communityId,
      subjectType: input.targetType,
      subjectId: input.targetId,
      payload: {
        reportId: result.id,
        reason: input.reason,
        targetType: input.targetType,
        auditAction: `Meldung eingereicht: ${input.targetType}`,
      },
    });
  }

  return result;
}

export async function getCommunityReports(
  communityId: string,
  actorRole: CommunityRole,
  status?: ReportStatus,
): Promise<{ error: string | null; reports: PlatformReport[] }> {
  if (!canManageReports(actorRole)) {
    return { error: "Keine Berechtigung", reports: [] };
  }

  const reports = await fetchReportsForCommunityFromDb(communityId, status);
  return { error: null, reports };
}

export async function resolveReport(input: {
  reportId: string;
  communityId: string;
  actorId: string;
  actorRole: CommunityRole;
  status: "resolved" | "dismissed";
  resolutionNote?: string;
  notifyTargetUserId?: string;
}) {
  if (!canManageReports(input.actorRole)) {
    return { error: "Keine Berechtigung" };
  }

  const result = await updateReportStatusInDb(input.reportId, {
    status: input.status,
    reviewedBy: input.actorId,
    resolutionNote: input.resolutionNote,
  });

  if (result.error) return result;

  await logModerationAction({
    communityId: input.communityId,
    actorId: input.actorId,
    action: input.status === "resolved" ? "Meldung bearbeitet" : "Meldung abgewiesen",
    targetUserId: input.notifyTargetUserId,
    metadata: { reportId: input.reportId, resolutionNote: input.resolutionNote },
  });

  if (input.notifyTargetUserId) {
    await notifyGovernanceEvent({
      userId: input.notifyTargetUserId,
      category: "moderation",
      event: input.status === "resolved" ? "report_resolved" : "report_dismissed",
      communityId: input.communityId,
      body: input.resolutionNote,
    });
  }

  return { error: null };
}

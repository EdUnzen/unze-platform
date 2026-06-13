import { hasCommunityPermission } from "@/lib/permissions/engine";
import { logModerationAction } from "@/services/governance/audit.service";
import { fetchCommunityReviewerIdsFromDb } from "@/services/access/access.repository";
import { dispatchNotification } from "@/services/notifications/notification-center.service";
import type { CommunityRole } from "@/types/database";
import type { MemberRemovalReason } from "@/types/removal";
import {
  confirmRemovalTaskInDb,
  countPendingRemovalTasksFromDb,
  fetchPendingRemovalTasksFromDb,
  fetchRemovalTaskByIdFromDb,
  upsertPendingRemovalTaskInDb,
} from "./removal-task.repository";

import { memberRemovalReasonLabels } from "@/lib/lifecycle/removal-labels";

async function notifyManagersOfRemovalTask(input: {
  communityId: string;
  userId: string;
  reason: MemberRemovalReason;
  displayName?: string | null;
}) {
  const reviewerIds = await fetchCommunityReviewerIdsFromDb(input.communityId);
  const label =
    input.displayName?.trim() ||
    "Ein Mitglied";

  for (const managerId of reviewerIds) {
    if (managerId === input.userId) continue;

    await dispatchNotification({
      userId: managerId,
      category: "system",
      title: "Zu entfernen",
      body: `${label}: ${memberRemovalReasonLabels[input.reason]}`,
      data: {
        type: "member_removal_pending",
        communityId: input.communityId,
        subjectUserId: input.userId,
        reason: input.reason,
      },
    });
  }
}

export async function queueMemberRemovalTask(input: {
  communityId: string;
  userId: string;
  memberId?: string | null;
  reason: MemberRemovalReason;
  metadata?: Record<string, unknown>;
  notifyManagers?: boolean;
  displayName?: string | null;
}): Promise<{ error: string | null; taskId?: string }> {
  const { error, taskId, created } = await upsertPendingRemovalTaskInDb(input);
  if (error) return { error };

  if (created && input.notifyManagers !== false) {
    await notifyManagersOfRemovalTask({
      communityId: input.communityId,
      userId: input.userId,
      reason: input.reason,
      displayName: input.displayName,
    });
  }

  return { error: null, taskId };
}

export async function getPendingRemovalTasks(
  communityId: string,
  actorRole: CommunityRole,
) {
  if (!hasCommunityPermission(actorRole, "manage_members")) {
    return { error: "Keine Berechtigung", tasks: [] };
  }

  const tasks = await fetchPendingRemovalTasksFromDb(communityId);
  return { error: null, tasks };
}

export async function countPendingRemovalTasks(communityId: string) {
  return countPendingRemovalTasksFromDb(communityId);
}

export async function confirmMemberRemovalTask(input: {
  taskId: string;
  communityId: string;
  actorId: string;
  actorRole: CommunityRole;
}): Promise<{ error: string | null }> {
  if (!hasCommunityPermission(input.actorRole, "manage_members")) {
    return { error: "Keine Berechtigung" };
  }

  const task = await fetchRemovalTaskByIdFromDb(input.taskId);
  if (!task || task.community_id !== input.communityId) {
    return { error: "Aufgabe nicht gefunden" };
  }
  if (task.status !== "pending") {
    return { error: "Aufgabe bereits erledigt" };
  }

  const result = await confirmRemovalTaskInDb(input.taskId, input.actorId);
  if (result.error) return result;

  await logModerationAction({
    communityId: input.communityId,
    actorId: input.actorId,
    action: "Entfernung bestätigt (Zu entfernen)",
    targetUserId: task.user_id as string,
    metadata: { reason: task.reason, taskId: input.taskId },
  });

  return { error: null };
}

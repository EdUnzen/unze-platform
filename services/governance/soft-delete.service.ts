import { hasCommunityPermission } from "@/lib/permissions/engine";
import { logLifecycleAction, logModerationAction } from "@/services/governance/audit.service";
import { notifyGovernanceEvent } from "@/lib/notifications/events";
import type { CommunityRole } from "@/types/database";
import {
  archiveCommunityInDb,
  fetchRemovedMembersFromDb,
  pauseCommunityInDb,
  restoreMemberInDb,
  softDeleteCommunityInDb,
  softRemoveMemberInDb,
} from "./soft-delete.repository";

export async function softRemoveMember(input: {
  memberId: string;
  communityId: string;
  userId: string;
  actorId: string;
  actorRole: CommunityRole;
  targetRole: CommunityRole;
  reason?: string;
}) {
  if (!hasCommunityPermission(input.actorRole, "manage_members")) {
    return { error: "Keine Berechtigung" };
  }

  if (input.targetRole === "creator") {
    return { error: "Creator kann nicht entfernt werden" };
  }

  const result = await softRemoveMemberInDb(input.memberId, input.actorId);
  if (result.error) return result;

  await logModerationAction({
    communityId: input.communityId,
    actorId: input.actorId,
    action: "Mitglied soft-entfernt",
    targetUserId: input.userId,
    metadata: { reason: input.reason },
  });

  return { error: null };
}

export async function restoreMember(input: {
  memberId: string;
  communityId: string;
  userId: string;
  actorId: string;
  actorRole: CommunityRole;
}) {
  if (!hasCommunityPermission(input.actorRole, "manage_members")) {
    return { error: "Keine Berechtigung" };
  }

  const result = await restoreMemberInDb(input.memberId);
  if (result.error) return result;

  await logModerationAction({
    communityId: input.communityId,
    actorId: input.actorId,
    action: "Mitglied wiederhergestellt",
    targetUserId: input.userId,
  });

  await notifyGovernanceEvent({
    userId: input.userId,
    category: "community_event",
    event: "member_restored",
    communityId: input.communityId,
  });

  return { error: null };
}

export async function archiveCommunity(input: {
  communityId: string;
  actorId: string;
  actorRole: CommunityRole;
}) {
  if (!hasCommunityPermission(input.actorRole, "archive_community")) {
    return { error: "Keine Berechtigung" };
  }

  const result = await archiveCommunityInDb(input.communityId);
  if (result.error) return result;

  await logLifecycleAction({
    communityId: input.communityId,
    actorId: input.actorId,
    action: "Community archiviert",
  });

  return { error: null };
}

export async function pauseCommunity(input: {
  communityId: string;
  actorId: string;
  actorRole: CommunityRole;
}) {
  if (!hasCommunityPermission(input.actorRole, "archive_community")) {
    return { error: "Keine Berechtigung" };
  }

  const result = await pauseCommunityInDb(input.communityId);
  if (result.error) return result;

  await logLifecycleAction({
    communityId: input.communityId,
    actorId: input.actorId,
    action: "Community pausiert",
  });

  return { error: null };
}

export async function softDeleteCommunity(input: {
  communityId: string;
  actorId: string;
  actorRole: CommunityRole;
}) {
  if (!hasCommunityPermission(input.actorRole, "delete_community")) {
    return { error: "Keine Berechtigung" };
  }

  const result = await softDeleteCommunityInDb(input.communityId, input.actorId);
  if (result.error) return result;

  await logLifecycleAction({
    communityId: input.communityId,
    actorId: input.actorId,
    action: "Community soft-gelöscht",
  });

  return { error: null };
}

export async function getRemovedMembers(
  communityId: string,
  actorRole: CommunityRole,
) {
  if (!hasCommunityPermission(actorRole, "manage_members")) {
    return { error: "Keine Berechtigung", members: [] };
  }

  const members = await fetchRemovedMembersFromDb(communityId);
  return { error: null, members };
}

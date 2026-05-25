import { hasCommunityPermission } from "@/lib/permissions/engine";
import type { AuditCategory, AuditLogEntry } from "@/types/governance";
import type { CommunityRole } from "@/types/database";
import {
  fetchAuditLogsFromDb,
  insertAuditLogInDb,
} from "./audit.repository";

export async function logAuditEvent(input: {
  communityId?: string | null;
  actorId?: string | null;
  action: string;
  category: AuditCategory;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return insertAuditLogInDb(input);
}

export async function getCommunityAuditLog(
  communityId: string,
  actorRole: CommunityRole,
  limit = 50,
): Promise<{ error: string | null; entries: AuditLogEntry[] }> {
  if (!hasCommunityPermission(actorRole, "view_audit_log")) {
    return { error: "Keine Berechtigung", entries: [] };
  }

  const entries = await fetchAuditLogsFromDb(communityId, limit);
  return { error: null, entries };
}

/** Convenience helpers für häufige Audit-Events */
export async function logRoleChange(input: {
  communityId: string;
  actorId: string;
  memberId: string;
  userId: string;
  fromRole: string;
  toRole: string;
}) {
  return logAuditEvent({
    communityId: input.communityId,
    actorId: input.actorId,
    action: `Rolle geändert: ${input.fromRole} → ${input.toRole}`,
    category: "role_change",
    targetType: "member",
    targetId: input.memberId,
    metadata: { userId: input.userId, fromRole: input.fromRole, toRole: input.toRole },
  });
}

export async function logInviteAction(input: {
  communityId: string;
  actorId: string;
  action: string;
  inviteId?: string;
  metadata?: Record<string, unknown>;
}) {
  return logAuditEvent({
    communityId: input.communityId,
    actorId: input.actorId,
    action: input.action,
    category: "invite",
    targetType: "invite_link",
    targetId: input.inviteId,
    metadata: input.metadata,
  });
}

export async function logApplicationAction(input: {
  communityId: string;
  actorId: string;
  action: string;
  applicationId: string;
  metadata?: Record<string, unknown>;
}) {
  return logAuditEvent({
    communityId: input.communityId,
    actorId: input.actorId,
    action: input.action,
    category: "application",
    targetType: "join_application",
    targetId: input.applicationId,
    metadata: input.metadata,
  });
}

export async function logModerationAction(input: {
  communityId: string;
  actorId: string;
  action: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
}) {
  return logAuditEvent({
    communityId: input.communityId,
    actorId: input.actorId,
    action: input.action,
    category: "moderation",
    targetType: "user",
    targetId: input.targetUserId,
    metadata: input.metadata,
  });
}

export async function logLifecycleAction(input: {
  communityId: string;
  actorId: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  return logAuditEvent({
    communityId: input.communityId,
    actorId: input.actorId,
    action: input.action,
    category: "community_lifecycle",
    targetType: "community",
    targetId: input.communityId,
    metadata: input.metadata,
  });
}

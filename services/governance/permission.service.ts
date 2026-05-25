import { canManagePermissions } from "@/lib/permissions/engine";
import { logAuditEvent } from "@/services/governance/audit.service";
import type {
  GovernancePermissionKey,
  PermissionOverride,
} from "@/types/governance";
import type { CommunityRole } from "@/types/database";
import {
  deletePermissionOverrideInDb,
  fetchPermissionOverridesFromDb,
  upsertPermissionOverrideInDb,
} from "./permission.repository";

export async function getCommunityPermissionOverrides(
  communityId: string,
  actorRole: CommunityRole,
): Promise<{ error: string | null; overrides: PermissionOverride[] }> {
  if (!canManagePermissions(actorRole)) {
    return { error: "Keine Berechtigung", overrides: [] };
  }

  const overrides = await fetchPermissionOverridesFromDb(communityId);
  return { error: null, overrides };
}

export async function setPermissionOverride(input: {
  communityId: string;
  permissionKey: GovernancePermissionKey;
  role: CommunityRole;
  granted: boolean;
  actorId: string;
  actorRole: CommunityRole;
}) {
  if (!canManagePermissions(input.actorRole)) {
    return { error: "Keine Berechtigung" };
  }

  const result = await upsertPermissionOverrideInDb({
    communityId: input.communityId,
    permissionKey: input.permissionKey,
    role: input.role,
    granted: input.granted,
    updatedBy: input.actorId,
  });

  if (result.error) return result;

  await logAuditEvent({
    communityId: input.communityId,
    actorId: input.actorId,
    action: `Recht ${input.granted ? "gewährt" : "entzogen"}: ${input.permissionKey} → ${input.role}`,
    category: "permission",
    targetType: "permission_override",
    metadata: {
      permissionKey: input.permissionKey,
      role: input.role,
      granted: input.granted,
    },
  });

  return { error: null };
}

export async function removePermissionOverride(
  overrideId: string,
  communityId: string,
  actorId: string,
  actorRole: CommunityRole,
) {
  if (!canManagePermissions(actorRole)) {
    return { error: "Keine Berechtigung" };
  }

  const result = await deletePermissionOverrideInDb(overrideId);
  if (result.error) return result;

  await logAuditEvent({
    communityId,
    actorId,
    action: "Rechte-Override entfernt",
    category: "permission",
    targetType: "permission_override",
    targetId: overrideId,
  });

  return { error: null };
}

export async function loadEffectivePermissions(
  communityId: string,
  role: CommunityRole,
): Promise<PermissionOverride[]> {
  return fetchPermissionOverridesFromDb(communityId);
}

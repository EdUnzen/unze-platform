import {
  getDefaultMinRole,
  PERMISSION_DEFINITIONS,
  ROLE_RANK,
} from "@/lib/permissions/definitions";
import type {
  GovernancePermissionKey,
  PermissionOverride,
} from "@/types/governance";
import type { CommunityRole } from "@/types/database";

export type { GovernancePermissionKey as CommunityPermission };

/**
 * Permission Engine — granulare Rechte mit optionalen Community-Overrides.
 * Sync-Auflösung für Hot Paths; Overrides via resolveCommunityPermission().
 */
export function resolvePermissionFromRole(
  role: CommunityRole | null | undefined,
  permission: GovernancePermissionKey,
  overrides?: PermissionOverride[],
): boolean {
  if (!role) return permission === "view";

  const override = overrides?.find(
    (o) => o.permissionKey === permission && o.role === role,
  );
  if (override !== undefined) return override.granted;

  const minRole = getDefaultMinRole(permission);
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

export function hasCommunityPermission(
  role: CommunityRole | null | undefined,
  permission: GovernancePermissionKey,
  overrides?: PermissionOverride[],
): boolean {
  return resolvePermissionFromRole(role, permission, overrides);
}

export function getRoleRank(role: CommunityRole): number {
  return ROLE_RANK[role];
}

export function canManageCommunity(
  role: CommunityRole | null | undefined,
  overrides?: PermissionOverride[],
): boolean {
  return hasCommunityPermission(role, "manage_settings", overrides);
}

export function canModerateCommunity(
  role: CommunityRole | null | undefined,
  overrides?: PermissionOverride[],
): boolean {
  return hasCommunityPermission(role, "moderate", overrides);
}

export function canReviewApplications(
  role: CommunityRole | null | undefined,
  overrides?: PermissionOverride[],
): boolean {
  return hasCommunityPermission(role, "review_applications", overrides);
}

export function canBanMembers(
  role: CommunityRole | null | undefined,
  overrides?: PermissionOverride[],
): boolean {
  return hasCommunityPermission(role, "ban_members", overrides);
}

export function canManageAccess(
  role: CommunityRole | null | undefined,
  overrides?: PermissionOverride[],
): boolean {
  return hasCommunityPermission(role, "manage_access", overrides);
}

export function canManageReports(
  role: CommunityRole | null | undefined,
  overrides?: PermissionOverride[],
): boolean {
  return hasCommunityPermission(role, "manage_reports", overrides);
}

export function canViewAuditLog(
  role: CommunityRole | null | undefined,
  overrides?: PermissionOverride[],
): boolean {
  return hasCommunityPermission(role, "view_audit_log", overrides);
}

export function canManagePermissions(
  role: CommunityRole | null | undefined,
  overrides?: PermissionOverride[],
): boolean {
  return hasCommunityPermission(role, "manage_permissions", overrides);
}

export function canCreateAwards(
  role: CommunityRole | null | undefined,
  overrides?: PermissionOverride[],
): boolean {
  return hasCommunityPermission(role, "create_awards", overrides);
}

export function canGrantAwards(
  role: CommunityRole | null | undefined,
  overrides?: PermissionOverride[],
): boolean {
  return hasCommunityPermission(role, "grant_awards", overrides);
}

export function isCommunityCreator(role: CommunityRole | null | undefined): boolean {
  return role === "creator";
}

export function isCommunityOwner(role: CommunityRole | null | undefined): boolean {
  return role === "creator";
}

export function canAssignRole(
  actorRole: CommunityRole,
  targetRole: CommunityRole,
  newRole: CommunityRole,
  overrides?: PermissionOverride[],
): boolean {
  if (!hasCommunityPermission(actorRole, "manage_roles", overrides)) return false;
  if (newRole === "creator" || targetRole === "creator") return false;
  if (ROLE_RANK[actorRole] <= ROLE_RANK[targetRole]) return false;
  if (ROLE_RANK[actorRole] <= ROLE_RANK[newRole]) return false;
  return true;
}

export function canRemoveMember(
  actorRole: CommunityRole,
  targetRole: CommunityRole,
  overrides?: PermissionOverride[],
): boolean {
  if (!hasCommunityPermission(actorRole, "manage_members", overrides)) return false;
  if (targetRole === "creator") return false;
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}

/** Alle effektiven Rechte einer Rolle inkl. Overrides */
export function resolveEffectivePermissions(
  role: CommunityRole,
  overrides: PermissionOverride[] = [],
): GovernancePermissionKey[] {
  return PERMISSION_DEFINITIONS.filter((def) =>
    resolvePermissionFromRole(role, def.key, overrides),
  ).map((def) => def.key);
}

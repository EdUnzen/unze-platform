/**
 * Community Permissions — re-exportiert Permission Engine für Abwärtskompatibilität.
 * Neue Imports: @/lib/permissions/engine oder @/lib/permissions/definitions
 */
export {
  hasCommunityPermission,
  canManageCommunity,
  canModerateCommunity,
  canReviewApplications,
  canBanMembers,
  canManageAccess,
  canManageReports,
  canViewAuditLog,
  canManagePermissions,
  canCreateAwards,
  canGrantAwards,
  isCommunityCreator,
  isCommunityOwner,
  canAssignRole,
  canRemoveMember,
  getRoleRank,
  resolveEffectivePermissions,
  resolvePermissionFromRole,
  type CommunityPermission,
} from "@/lib/permissions/engine";

export {
  PERMISSION_DEFINITIONS,
  getPermissionsByCategory,
  getPermissionsForRole,
  ROLE_RANK,
} from "@/lib/permissions/definitions";

import { hasCommunityPermission } from "@/lib/permissions/engine";
import type { GovernancePermissionKey } from "@/types/governance";
import type { CommunityRole } from "@/types/database";
import { fetchPermissionOverridesFromDb } from "./permission.repository";

export async function checkCommunityPermission(
  communityId: string,
  role: CommunityRole | null | undefined,
  permission: GovernancePermissionKey,
): Promise<boolean> {
  if (!role) return false;
  const overrides = await fetchPermissionOverridesFromDb(communityId);
  return hasCommunityPermission(role, permission, overrides);
}

export async function loadCommunityPermissionChecks(
  communityId: string,
  role: CommunityRole | null | undefined,
) {
  const overrides = await fetchPermissionOverridesFromDb(communityId);
  return {
    overrides,
    has: (permission: GovernancePermissionKey) =>
      hasCommunityPermission(role, permission, overrides),
  };
}

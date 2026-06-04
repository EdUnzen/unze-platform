import { hasCommunityPermission, canAssignRole, canRemoveMember } from "@/lib/permissions/community.permissions";
import { notifyGovernanceEvent } from "@/lib/notifications/events";
import { grantVerifiedMemberTrust } from "@/services/trust/trust.service";
import type { CommunityRole } from "@/types/database";
import { directJoinCommunity } from "@/services/access/access.service";
import {
  fetchMembership,
  fetchMembersWithProfiles,
  leaveCommunityInDb,
  removeMemberInDb,
  updateMemberRoleInDb,
  updateMemberRoleTitleInDb,
} from "./member.repository";

export async function getMembership(communityId: string, userId: string) {
  const member = await fetchMembership(communityId, userId);
  return {
    isMember: Boolean(member),
    role: member?.role ?? null,
  };
}

export async function getCommunityMembers(communityId: string) {
  return fetchMembersWithProfiles(communityId);
}

export async function updateMemberRoleTitle(
  memberId: string,
  roleTitle: string | null,
  actorRole: CommunityRole,
): Promise<{ error: string | null }> {
  if (!hasCommunityPermission(actorRole, "manage_roles")) {
    return { error: "Keine Berechtigung" };
  }
  return updateMemberRoleTitleInDb(memberId, roleTitle);
}

export async function updateMemberRole(
  memberId: string,
  role: CommunityRole,
  actorRole: CommunityRole,
  targetRole?: CommunityRole,
  context?: {
    communityId?: string;
    actorId?: string;
    userId?: string;
  },
) {
  if (!hasCommunityPermission(actorRole, "manage_roles")) {
    return { error: "Keine Berechtigung" };
  }
  if (role === "creator") {
    return { error: "Creator-Rolle ist geschützt" };
  }
  if (targetRole && !canAssignRole(actorRole, targetRole, role)) {
    return { error: "Keine Berechtigung für diese Rollenänderung" };
  }

  const result = await updateMemberRoleInDb(memberId, role);
  if (result.error) return result;

  if (context?.communityId && context.actorId && targetRole) {
    if (context.userId) {
      await notifyGovernanceEvent({
        userId: context.userId,
        category: "community_event",
        event: "role_changed",
        communityId: context.communityId,
        actorId: context.actorId,
        subjectType: "member",
        subjectId: memberId,
        body: `Neue Rolle: ${role}`,
        data: {
          auditAction: `Rolle geändert: ${targetRole} → ${role}`,
          fromRole: targetRole,
          toRole: role,
          userId: context.userId,
        },
      });

      if (role === "verified_member") {
        await grantVerifiedMemberTrust({
          userId: context.userId,
          communityId: context.communityId,
          actorId: context.actorId,
        });
      }
    }
  }

  return result;
}

export async function removeMember(
  memberId: string,
  actorRole: CommunityRole,
  targetRole?: CommunityRole,
) {
  if (!hasCommunityPermission(actorRole, "manage_members")) {
    return { error: "Keine Berechtigung" };
  }
  if (targetRole && !canRemoveMember(actorRole, targetRole)) {
    return { error: "Keine Berechtigung zum Entfernen" };
  }
  return removeMemberInDb(memberId);
}

export async function joinCommunity(
  communityId: string,
  userId: string,
  visibility: "public" | "private" | "premium" | "hidden",
) {
  if (visibility === "hidden") {
    return { error: "Community nicht auffindbar." };
  }

  const existing = await fetchMembership(communityId, userId);
  if (existing) {
    return { error: null, alreadyMember: true };
  }

  return directJoinCommunity(communityId, userId);
}

export async function leaveCommunity(
  communityId: string,
  userId: string,
  role: CommunityRole | null,
) {
  if (role === "creator") {
    return { error: "Creator kann die Community nicht verlassen." };
  }
  if (!role) {
    return { error: "Du bist kein Mitglied." };
  }
  return leaveCommunityInDb(communityId, userId);
}

export function canEditCommunity(role: CommunityRole | null | undefined): boolean {
  return hasCommunityPermission(role ?? null, "manage_settings");
}

export function canManageRoles(role: CommunityRole | null | undefined): boolean {
  return hasCommunityPermission(role ?? null, "manage_roles");
}

export function canManageMonetization(
  role: CommunityRole | null | undefined,
): boolean {
  return hasCommunityPermission(role ?? null, "manage_monetization");
}

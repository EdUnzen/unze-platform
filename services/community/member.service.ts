import { hasCommunityPermission, canAssignRole, canRemoveMember } from "@/lib/permissions/community.permissions";
import {
  buildRoleChangedNotification,
  buildRoleTitleChangedNotification,
} from "@/lib/notifications/personal-milestones";
import { notifyGovernanceEvent } from "@/lib/notifications/events";
import { grantVerifiedMemberTrust } from "@/services/trust/trust.service";
import type { CommunityRole } from "@/types/database";
import { directJoinCommunity } from "@/services/access/access.service";
import {
  fetchMembership,
  fetchMembersWithProfiles,
  leaveCommunityInDb,
  updateMemberRoleInDb,
  updateMemberRoleTitleInDb,
} from "./member.repository";
import { softRemoveMemberInDb } from "@/services/governance/soft-delete.repository";
import { queueMemberRemovalTask } from "@/services/lifecycle/removal-task.service";

type MemberNotificationContext = {
  communityId: string;
  actorId: string;
  userId: string;
  communityTitle?: string;
  communitySlug?: string;
  roleTitle?: string | null;
};

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
  context?: MemberNotificationContext & { role?: CommunityRole | null },
): Promise<{ error: string | null }> {
  if (!hasCommunityPermission(actorRole, "manage_roles")) {
    return { error: "Keine Berechtigung" };
  }

  const result = await updateMemberRoleTitleInDb(memberId, roleTitle);
  if (result.error) return result;

  if (context?.communityId && context.actorId && context.userId) {
    const copy = buildRoleTitleChangedNotification({
      communityTitle: context.communityTitle ?? "Community",
      roleTitle: roleTitle ?? "",
      role: context.role,
    });

    await notifyGovernanceEvent({
      userId: context.userId,
      category: "community_event",
      event: "role_changed",
      communityId: context.communityId,
      actorId: context.actorId,
      subjectType: "member",
      subjectId: memberId,
      title: copy.title,
      body: copy.body,
      data: {
        auditAction: roleTitle
          ? `Anzeigetitel gesetzt: ${roleTitle}`
          : "Anzeigetitel entfernt",
        roleTitle,
        communityTitle: context.communityTitle,
        communitySlug: context.communitySlug,
        userId: context.userId,
      },
    });
  }

  return result;
}

export async function updateMemberRole(
  memberId: string,
  role: CommunityRole,
  actorRole: CommunityRole,
  targetRole?: CommunityRole,
  context?: MemberNotificationContext,
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

  if (context?.communityId && context.actorId && context.userId && targetRole) {
    const copy = buildRoleChangedNotification({
      communityTitle: context.communityTitle ?? "Community",
      toRole: role,
      fromRole: targetRole,
      roleTitle: context.roleTitle,
    });

    await notifyGovernanceEvent({
      userId: context.userId,
      category: "community_event",
      event: "role_changed",
      communityId: context.communityId,
      actorId: context.actorId,
      subjectType: "member",
      subjectId: memberId,
      title: copy.title,
      body: copy.body,
      data: {
        auditAction: `Rolle geändert: ${targetRole} → ${role}`,
        fromRole: targetRole,
        toRole: role,
        roleTitle: context.roleTitle,
        communityTitle: context.communityTitle,
        communitySlug: context.communitySlug,
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

  return result;
}

export async function removeMember(
  memberId: string,
  actorRole: CommunityRole,
  targetRole?: CommunityRole,
  actorId?: string,
) {
  if (!hasCommunityPermission(actorRole, "manage_members")) {
    return { error: "Keine Berechtigung" };
  }
  if (targetRole && !canRemoveMember(actorRole, targetRole)) {
    return { error: "Keine Berechtigung zum Entfernen" };
  }
  if (!actorId) return { error: "Actor fehlt" };
  return softRemoveMemberInDb(memberId, actorId);
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

  const direct = await directJoinCommunity(communityId, userId);
  if (direct.error) return { error: direct.error };
  if (direct.alreadyMember) return { error: null, alreadyMember: true };
  return { error: null };
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

  const result = await leaveCommunityInDb(communityId, userId);
  if (result.error) return result;

  await queueMemberRemovalTask({
    communityId,
    userId,
    memberId: result.memberId ?? null,
    reason: "user_left",
  });

  return { error: null };
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

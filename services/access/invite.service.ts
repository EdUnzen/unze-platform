import { notifyApplicant } from "@/lib/access/lifecycle-notifications";
import { SYSTEM_MESSAGE_TEMPLATES } from "@/lib/constants/access";
import { hasCommunityPermission } from "@/lib/permissions/community.permissions";
import type {
  CommunityInviteLink,
  CreateInviteLinkInput,
  InviteLinkPreview,
} from "@/types/access";
import type { CommunityRole } from "@/types/database";
import {
  createInviteLinkInDb,
  deactivateInviteLinkInDb,
  fetchInviteLinksFromDb,
  fetchInvitePreviewFromDb,
  promoteWaitlistedViaRpc,
  redeemInviteViaRpc,
} from "./invite.repository";

function withInviteUrl(link: CommunityInviteLink, baseUrl?: string): CommunityInviteLink {
  const origin = baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://unze.app";
  return {
    ...link,
    inviteUrl: `${origin.replace(/\/$/, "")}/invite/${link.code}`,
  };
}

export async function getCommunityInviteLinks(
  communityId: string,
  actorRole: CommunityRole,
): Promise<{ error: string | null; links: CommunityInviteLink[] }> {
  if (!hasCommunityPermission(actorRole, "manage_invites")) {
    return { error: "Keine Berechtigung", links: [] };
  }

  const links = await fetchInviteLinksFromDb(communityId);
  return {
    error: null,
    links: links.map((l) => withInviteUrl(l)),
  };
}

export async function createCommunityInviteLink(
  communityId: string,
  createdBy: string,
  actorRole: CommunityRole,
  input: CreateInviteLinkInput,
) {
  if (!hasCommunityPermission(actorRole, "manage_invites")) {
    return { error: "Keine Berechtigung", link: null };
  }

  if (input.assignedRole === "creator") {
    return { error: "Creator-Rolle nicht erlaubt", link: null };
  }

  const link = await createInviteLinkInDb(communityId, createdBy, input);
  if (!link) return { error: "Link konnte nicht erstellt werden", link: null };

  return { error: null, link: withInviteUrl(link) };
}

export async function deactivateCommunityInviteLink(
  inviteId: string,
  actorRole: CommunityRole,
) {
  if (!hasCommunityPermission(actorRole, "manage_invites")) {
    return { error: "Keine Berechtigung" };
  }

  const ok = await deactivateInviteLinkInDb(inviteId);
  if (!ok) return { error: "Deaktivieren fehlgeschlagen" };
  return { error: null };
}

export async function getInviteLinkPreview(
  code: string,
): Promise<InviteLinkPreview | null> {
  return fetchInvitePreviewFromDb(code);
}

export async function redeemCommunityInvite(code: string, userId: string) {
  const preview = await fetchInvitePreviewFromDb(code);
  if (!preview) return { error: "Einladungslink ungültig" };
  if (!preview.isValid) {
    return { error: preview.invalidReason ?? "Einladungslink ungültig" };
  }

  const result = await redeemInviteViaRpc(code, userId);
  if (result.error) return { error: result.error };

  const status = result.result?.status;
  if (status === "joined") {
    await notifyApplicant({
      userId,
      event: "invite_accepted",
      communityId: result.result?.communityId ?? preview.communityId,
      bodyOverride: `Du bist der Community als ${result.result?.role ?? "Mitglied"} beigetreten.`,
      data: { type: "invite_redeemed", code },
      autoMessagesEnabled: true,
    });
    return {
      error: null,
      joined: true,
      slug: result.result?.slug,
      role: result.result?.role,
    };
  }

  if (status === "already_member") {
    return {
      error: null,
      joined: true,
      alreadyMember: true,
      slug: result.result?.slug,
    };
  }

  return { error: "Einlösung fehlgeschlagen" };
}

export async function promoteNextWaitlisted(
  communityId: string,
  reviewerId: string,
  actorRole: CommunityRole,
) {
  if (!hasCommunityPermission(actorRole, "review_applications")) {
    return { error: "Keine Berechtigung" };
  }

  const result = await promoteWaitlistedViaRpc(communityId, reviewerId);
  if (result.error) {
    if (result.error.includes("Mitgliederlimit")) {
      return { error: SYSTEM_MESSAGE_TEMPLATES.member_limit_reached };
    }
    return result;
  }

  if (result.application) {
    const autoMessages = true;
    await notifyApplicant({
      userId: result.application.userId,
      event: "application_accepted",
      communityId,
      bodyOverride: "Ein Platz ist frei geworden — willkommen in der Community!",
      data: { applicationId: result.application.id, source: "waitlist_promotion" },
      autoMessagesEnabled: autoMessages,
    });
  }

  return { error: null };
}

export function buildInviteUrl(code: string): string {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "https://unze.app";
  return `${origin.replace(/\/$/, "")}/invite/${code}`;
}

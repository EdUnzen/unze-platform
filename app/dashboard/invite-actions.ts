"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import {
  createCommunityInviteLink,
  deactivateCommunityInviteLink,
  getCommunityInviteLinks,
} from "@/services/access/invite.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { hasCommunityPermission } from "@/lib/permissions/community.permissions";
import type { CommunityRole } from "@/types/database";
import { revalidatePath } from "next/cache";

async function requireInviteManager(slug: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" as const, ctx: null };

  const { community, canAccess } = await getDashboardCommunityAccess(
    slug,
    user.id,
  );
  if (!canAccess || !community) {
    return { error: "Kein Zugriff" as const, ctx: null };
  }

  return { error: null, ctx: { user, community } };
}

export async function createInviteLinkAction(
  slug: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const check = await requireInviteManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  if (!hasCommunityPermission(check.ctx.community.viewerRole, "manage_invites")) {
    return { error: "Keine Berechtigung" };
  }

  const expiresRaw = String(formData.get("expiresAt") ?? "").trim();
  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const assignedRole = String(
    formData.get("assignedRole") ?? "member",
  ) as CommunityRole;

  const result = await createCommunityInviteLink(
    check.ctx.community.id,
    check.ctx.user.id,
    check.ctx.community.viewerRole,
    {
      label: String(formData.get("label") ?? "").trim() || undefined,
      assignedRole,
      expiresAt: expiresRaw ? new Date(expiresRaw).toISOString() : null,
      maxUses: maxUsesRaw ? parseInt(maxUsesRaw, 10) : null,
      isSingleUse: formData.get("isSingleUse") === "on",
      bypassClosed: formData.get("bypassClosed") === "on",
    },
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/access`);
  return {};
}

export async function deactivateInviteLinkAction(slug: string, inviteId: string) {
  const check = await requireInviteManager(slug);
  if (check.error || !check.ctx) return { error: check.error };

  const result = await deactivateCommunityInviteLink(
    inviteId,
    check.ctx.community.viewerRole,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/access`);
  return { success: true };
}

export async function loadInviteLinksForDashboard(slug: string) {
  const check = await requireInviteManager(slug);
  if (check.error || !check.ctx) return null;

  const canManage = hasCommunityPermission(
    check.ctx.community.viewerRole,
    "manage_invites",
  );

  if (!canManage) return { links: [], canManage: false };

  const { links } = await getCommunityInviteLinks(
    check.ctx.community.id,
    check.ctx.community.viewerRole,
  );

  return { links, canManage: true };
}

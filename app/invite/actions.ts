"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import {
  getInviteLinkPreview,
  redeemCommunityInvite,
} from "@/services/access/invite.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function redeemInviteAction(code: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Bitte zuerst anmelden", requiresLogin: true };
  }

  const result = await redeemCommunityInvite(code, user.id);
  if (result.error) return { error: result.error };

  if (result.slug) {
    revalidatePath(`/community/${result.slug}`);
    revalidatePath(`/invite/${code}`);
    redirect(`/community/${result.slug}?joined=1`);
  }

  return { success: true };
}

export async function loadInvitePageData(code: string) {
  const preview = await getInviteLinkPreview(code);
  const user = await getCurrentUser();
  return { preview, isLoggedIn: Boolean(user) };
}

"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/services/auth/auth.service";
import { updateUserAwardVisibility } from "@/services/badges/badge.service";

export type AwardVisibility = "public" | "private";

export async function setAwardVisibilityAction(
  userCredentialId: string,
  visibility: AwardVisibility,
  communitySlug?: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await updateUserAwardVisibility(
    user.id,
    userCredentialId,
    visibility,
  );

  if (error) return { error };

  revalidatePath("/profile/auszeichnungen");
  revalidatePath("/profile");
  revalidatePath(`/creator/id/${user.id}`);
  if (communitySlug) {
    revalidatePath(`/community/${communitySlug}`);
  }

  return { error: null };
}

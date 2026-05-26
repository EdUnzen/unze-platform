"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/services/auth/auth.service";
import { uploadUserAvatar } from "@/services/user/avatar.service";
import { updateProfile } from "@/services/user/profile.service";

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  const { error } = await updateProfile(user.id, {
    display_name: displayName || undefined,
    bio: bio || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  revalidatePath("/discover");
  return { error: null };
}

export async function uploadAvatarAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Keine Datei ausgewählt" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadUserAvatar({
    userId: user.id,
    buffer,
    fileName: file.name,
    mimeType: file.type || "image/jpeg",
  });

  if (result.error) return { error: result.error };

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  revalidatePath("/discover");
  return { error: null, avatarUrl: result.avatarUrl };
}

export async function removeAvatarAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await updateProfile(user.id, { avatar_url: null });
  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  revalidatePath("/discover");
  return { error: null };
}

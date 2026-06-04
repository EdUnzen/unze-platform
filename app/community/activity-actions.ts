"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { setCommunityActivityPref } from "@/services/notifications/community-activity.service";
import { revalidatePath } from "next/cache";

export async function setCommunityActivityPrefAction(
  communityId: string,
  enabled: boolean,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const result = await setCommunityActivityPref(user.id, communityId, enabled);
  if (result.error) return { error: result.error };

  revalidatePath("/notifications");
  return {};
}

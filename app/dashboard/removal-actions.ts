"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import {
  confirmMemberRemovalTask,
  getPendingRemovalTasks,
} from "@/services/lifecycle/removal-task.service";
import { revalidatePath } from "next/cache";

export async function confirmMemberRemovalAction(slug: string, taskId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { community, canAccess } = await getDashboardCommunityAccess(slug, user.id);
  if (!canAccess || !community) return { error: "Kein Zugriff" };

  const result = await confirmMemberRemovalTask({
    taskId,
    communityId: community.id,
    actorId: user.id,
    actorRole: community.viewerRole,
  });

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/members`);
  revalidatePath(`/dashboard/community/${slug}`);
  revalidatePath(`/community/${slug}`);
  return { success: true };
}

export async function loadPendingRemovalsData(slug: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { community, canAccess } = await getDashboardCommunityAccess(slug, user.id);
  if (!canAccess || !community) return null;

  const { tasks } = await getPendingRemovalTasks(
    community.id,
    community.viewerRole,
  );

  return { tasks };
}

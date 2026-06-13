import { isPlatformOwner } from "@/lib/auth/platform-owner";
import { getCurrentUser } from "@/services/auth/auth.service";
import { fetchProfilePlatformRole } from "@/services/verification/verification.repository";
import { redirect } from "next/navigation";

export async function getPlatformOwnerRole(userId: string) {
  return fetchProfilePlatformRole(userId);
}

export async function isCurrentUserPlatformOwner(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const role = await getPlatformOwnerRole(user.id);
  return isPlatformOwner(role);
}

/** Layout-Guard — normale Nutzer werden umgeleitet */
export async function requirePlatformOwner() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/owner");
  }
  const role = await getPlatformOwnerRole(user.id);
  if (!isPlatformOwner(role)) {
    redirect("/");
  }
  return { user, role };
}

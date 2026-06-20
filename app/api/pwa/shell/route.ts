import { isPlatformOwner } from "@/lib/auth/platform-owner";
import { getCurrentUser } from "@/services/auth/auth.service";
import { hasManagedCommunities } from "@/services/dashboard/dashboard.service";
import { getUnreadNotificationCount } from "@/services/notifications/notification-center.service";
import { fetchProfilePlatformRole } from "@/services/verification/verification.repository";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Leichtgewichtig � f�r Client-Shell-Hydration (Badges, Creator-Icon). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [unreadCount, showDashboard, platformRole] = await Promise.all([
    getUnreadNotificationCount(user.id),
    hasManagedCommunities(user.id),
    fetchProfilePlatformRole(user.id),
  ]);

  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    unreadCount,
    showDashboard,
    showOwnerCenter: isPlatformOwner(platformRole),
  });
}

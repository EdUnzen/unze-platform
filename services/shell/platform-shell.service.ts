import { cache } from "react";
import { isPlatformOwner } from "@/lib/auth/platform-owner";
import { getCurrentUser } from "@/services/auth/auth.service";
import { hasManagedCommunities } from "@/services/dashboard/dashboard.service";
import { getUnreadNotificationCount } from "@/services/notifications/notification-center.service";
import { fetchProfilePlatformRole } from "@/services/verification/verification.repository";
import type { User } from "@supabase/supabase-js";

export type PlatformShellContext = {
  user: User | null;
  unreadCount: number;
  /** Creator Dashboard / Einnahmen — nur bei Bedarf in UI anzeigen */
  showDashboard: boolean;
  /** Owner Center — nur platform_role owner / platform_admin */
  showOwnerCenter: boolean;
};

/** Pro Request dedupliziert (TopBar + BottomNav + Seiten). */
export const getUnreadNotificationCountCached = cache(getUnreadNotificationCount);

export const hasManagedCommunitiesCached = cache(hasManagedCommunities);

export const getPlatformOwnerRoleCached = cache(fetchProfilePlatformRole);

/**
 * Einmal pro Request: Session + Badge + Creator-Flag + Owner-Flag.
 * Normale Nutzer: keine Creator-/Owner-Daten, nur leichte Abfragen.
 */
export const getPlatformShellContext = cache(
  async (): Promise<PlatformShellContext> => {
    const user = await getCurrentUser();
    if (!user) {
      return { user: null, unreadCount: 0, showDashboard: false, showOwnerCenter: false };
    }

    const [unreadCount, showDashboard, platformRole] = await Promise.all([
      getUnreadNotificationCountCached(user.id),
      hasManagedCommunitiesCached(user.id),
      getPlatformOwnerRoleCached(user.id),
    ]);

    return {
      user,
      unreadCount,
      showDashboard,
      showOwnerCenter: isPlatformOwner(platformRole),
    };
  },
);

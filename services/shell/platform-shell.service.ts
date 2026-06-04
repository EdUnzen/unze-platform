import { cache } from "react";
import { getCurrentUser } from "@/services/auth/auth.service";
import { hasManagedCommunities } from "@/services/dashboard/dashboard.service";
import { getUnreadNotificationCount } from "@/services/notifications/notification-center.service";
import type { User } from "@supabase/supabase-js";

export type PlatformShellContext = {
  user: User | null;
  unreadCount: number;
  /** Creator Dashboard / Einnahmen — nur bei Bedarf in UI anzeigen */
  showDashboard: boolean;
};

/** Pro Request dedupliziert (TopBar + BottomNav + Seiten). */
export const getUnreadNotificationCountCached = cache(getUnreadNotificationCount);

export const hasManagedCommunitiesCached = cache(hasManagedCommunities);

/**
 * Einmal pro Request: Session + Badge + Creator-Flag.
 * Normale Nutzer: keine Creator-Daten, nur leichte Abfragen.
 */
export const getPlatformShellContext = cache(
  async (): Promise<PlatformShellContext> => {
    const user = await getCurrentUser();
    if (!user) {
      return { user: null, unreadCount: 0, showDashboard: false };
    }

    const [unreadCount, showDashboard] = await Promise.all([
      getUnreadNotificationCountCached(user.id),
      hasManagedCommunitiesCached(user.id),
    ]);

    return { user, unreadCount, showDashboard };
  },
);

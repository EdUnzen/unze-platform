import { UnzeLogo } from "@/components/brand/UnzeLogo";
import { PlatformTopBarActions } from "@/components/layout/PlatformTopBarActions";
import { hasManagedCommunities } from "@/services/dashboard/dashboard.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getUnreadNotificationCount } from "@/services/notifications/notification-center.service";
export async function PlatformTopBar() {
  const user = await getCurrentUser();

  const [unreadCount, showDashboard] = user
    ? await Promise.all([
        getUnreadNotificationCount(user.id),
        hasManagedCommunities(user.id),
      ])
    : [0, false];

  return (
    <header
      className="sticky top-0 z-30 border-b border-unze-border/60 bg-unze-surface-muted/95 px-4 py-3 backdrop-blur-md"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <UnzeLogo href="/" size="sm" className="-ml-0.5" />

        <PlatformTopBarActions
          userId={user?.id ?? null}
          unreadCount={unreadCount}
          showDashboard={showDashboard}
        />
      </div>
    </header>
  );
}

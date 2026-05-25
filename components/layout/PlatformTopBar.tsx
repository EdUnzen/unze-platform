import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getManagedCommunities } from "@/services/dashboard/dashboard.service";
import { getUnreadNotificationCount } from "@/services/notifications/notification-center.service";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

export async function PlatformTopBar() {
  const user = await getCurrentUser();
  const unreadCount = user ? await getUnreadNotificationCount(user.id) : 0;
  const managed = user ? await getManagedCommunities(user.id) : [];
  const showDashboard = managed.length > 0;

  return (
    <header
      className="sticky top-0 z-30 border-b border-unze-border/60 bg-unze-surface-muted/95 px-4 py-2.5 backdrop-blur-md"
      style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-unze-ink"
          data-testid="platform-home-link"
        >
          UNZE
        </Link>

        <div className="flex items-center gap-2">
          {showDashboard && (
            <Link
              href="/dashboard"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm"
              aria-label="Creator Dashboard"
              data-testid="platform-dashboard-link"
            >
              <LayoutDashboard className="h-4 w-4 text-unze-green" aria-hidden />
            </Link>
          )}
          {user ? (
            <NotificationCenter
              compact
              notifications={[]}
              unreadCount={unreadCount}
            />
          ) : (
            <Link
              href="/auth/login"
              className="rounded-xl bg-unze-green px-3 py-1.5 text-xs font-semibold text-white"
            >
              Anmelden
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

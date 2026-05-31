import { BottomNav } from "@/components/navigation/BottomNav";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getUnreadNotificationCount } from "@/services/notifications/notification-center.service";

interface MobileShellProps {
  children: React.ReactNode;
}

export async function MobileShell({ children }: MobileShellProps) {
  const user = await getCurrentUser();
  const unreadNotifications = user
    ? await getUnreadNotificationCount(user.id)
    : 0;

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-lg bg-unze-surface-muted">
      <main className="min-h-dvh">{children}</main>
      <BottomNav unreadNotifications={unreadNotifications} />
      <InstallPrompt />
    </div>
  );
}

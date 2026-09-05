import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { NotificationPreferencesPanel } from "@/components/profile/NotificationPreferencesPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { loadNotificationPrefsForm } from "@/app/profile/notification-actions";
import { getCurrentUser } from "@/services/auth/auth.service";
import {
  getNotifications,
  markAllNotificationsRead,
} from "@/services/notifications/notification-center.service";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/notifications");

  try {
    await markAllNotificationsRead(user.id);
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("[notifications] markAllRead:", error);
  }

  let notifications: Awaited<ReturnType<typeof getNotifications>> = [];
  try {
    notifications = await getNotifications(user.id, { limit: 50 });
  } catch (error) {
    console.error("[notifications] load:", error);
  }
  const unreadCount = 0;

  const prefsForm = await loadNotificationPrefsForm(user.id);

  return (
    <div className="page-padding">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/profile" className="text-sm font-medium text-unze-green">
          ← Profil
        </Link>
      </div>

      <PageHeader
        title="Benachrichtigungen & Aktivität"
        subtitle="Persönliche Meilensteine, Community-Updates und Einladungen"
      />

      {prefsForm && (
        <div className="mb-6">
          <NotificationPreferencesPanel userId={user.id} initial={prefsForm} />
        </div>
      )}

      <p className="mb-4 text-center text-xs text-unze-ink-muted">
        Vollständige Historie:{" "}
        <Link href="/profile/aktivitaet" className="font-semibold text-unze-green">
          Meine Aktivität →
        </Link>
      </p>

      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
      />
    </div>
  );
}

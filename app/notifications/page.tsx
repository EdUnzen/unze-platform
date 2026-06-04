import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { PageHeader } from "@/components/layout/PageHeader";
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

  await markAllNotificationsRead(user.id);
  revalidatePath("/", "layout");

  const notifications = await getNotifications(user.id, { limit: 50 });
  const unreadCount = 0;

  return (
    <div className="page-padding">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/profile" className="text-sm font-medium text-unze-green">
          ← Profil
        </Link>
      </div>

      <PageHeader
        title="Benachrichtigungen & Aktivität"
        subtitle="Community-Updates, Einladungen, Rollen und wichtige Ereignisse"
      />

      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
      />
    </div>
  );
}

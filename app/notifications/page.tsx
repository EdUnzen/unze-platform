import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { PageHeader } from "@/components/layout/PageHeader";
import { loadNotifications } from "@/app/notifications/actions";
import { getCurrentUser } from "@/services/auth/auth.service";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/notifications");

  const { notifications, unreadCount } = await loadNotifications();

  return (
    <div className="page-padding">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/profile" className="text-sm font-medium text-unze-green">
          ← Profil
        </Link>
      </div>

      <PageHeader
        title="Benachrichtigungen"
        subtitle="Bewerbungen, Moderation, Einladungen & Community-Events"
      />

      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
      />
    </div>
  );
}

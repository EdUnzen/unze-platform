import { UserActivityTimeline } from "@/components/activity/UserActivityTimeline";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getPersonalActivity } from "@/services/platform/activity.service";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfileActivityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/profile/aktivitaet");

  let activity: Awaited<ReturnType<typeof getPersonalActivity>> = [];
  try {
    activity = await getPersonalActivity(user.id, 80);
  } catch (error) {
    console.error("[profile.activity]", error);
  }

  return (
    <div className="page-padding">
      <Link href="/profile" className="mb-4 inline-block text-sm font-medium text-unze-green">
        ← Profil
      </Link>

      <PageHeader
        title="Meine Aktivität"
        subtitle="Deine Historie — Auszeichnungen, Rollen, Beitritte und wichtige Ereignisse"
      />

      <p className="mb-6 rounded-2xl bg-unze-green-muted/30 px-4 py-3 text-xs text-unze-green-dark">
        Nur für dich sichtbar. Community-Verwaltung und geschützte Admin-Bereiche findest du
        im Dashboard unter Audit-Log — nicht hier.
      </p>

      <section className="rounded-3xl bg-white p-4 shadow-card">
        <UserActivityTimeline items={activity} viewerUserId={user.id} />
      </section>

      <p className="mt-4 text-center text-xs text-unze-ink-muted">
        <Link href="/notifications" className="font-medium text-unze-green">
          Benachrichtigungen & Einstellungen →
        </Link>
      </p>
    </div>
  );
}

import { CommunityLifecyclePanel } from "@/components/dashboard/CommunityLifecyclePanel";
import { EditCommunityClient } from "@/components/community/EditCommunityClient";
import { hasCommunityPermission } from "@/lib/permissions/community.permissions";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCommunityBySlug } from "@/services/community/community.service";
import { redirect } from "next/navigation";

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardSettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { community: access } = await getDashboardCommunityAccess(slug, user.id);
  if (!access) redirect("/dashboard");

  const community = await getCommunityBySlug(slug);
  if (!community) redirect("/dashboard");

  const canManageLifecycle = hasCommunityPermission(
    access.viewerRole,
    "archive_community",
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-unze-ink">
          Community-Einstellungen
        </h2>
        <p className="mt-1 text-sm text-unze-ink-secondary">
          Profil, Lifecycle und öffentliche Darstellung
        </p>
      </div>

      <CommunityLifecyclePanel
        slug={slug}
        access={community.access}
        canManageLifecycle={canManageLifecycle}
      />

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-6">
        <EditCommunityClient community={community} />
      </div>
    </section>
  );
}

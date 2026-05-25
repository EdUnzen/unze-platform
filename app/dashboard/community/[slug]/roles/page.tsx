import { RolesOverview } from "@/components/dashboard/RolesOverview";
import { PermissionOverridesPanel } from "@/components/dashboard/PermissionOverridesPanel";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCommunityMembers } from "@/services/community/member.service";
import { loadPermissionOverridesData } from "@/app/dashboard/governance-actions";
import { redirect } from "next/navigation";

interface RolesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardRolesPage({ params }: RolesPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { community } = await getDashboardCommunityAccess(slug, user.id);
  if (!community) redirect("/dashboard");

  const members = await getCommunityMembers(community.id);
  const permData = await loadPermissionOverridesData(slug);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-4 text-base font-semibold text-unze-ink">
          Rollen & Moderatoren
        </h2>
        <RolesOverview members={members} />
      </div>

      {permData && (
        <PermissionOverridesPanel slug={slug} overrides={permData.overrides} />
      )}
    </section>
  );
}

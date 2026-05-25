import { CommunityGroupManager } from "@/components/community/CommunityGroupManager";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCommunityGroups } from "@/services/community/group.service";
import { redirect } from "next/navigation";

interface GroupsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardGroupsPage({ params }: GroupsPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { community } = await getDashboardCommunityAccess(slug, user.id);
  if (!community) redirect("/dashboard");

  const groups = await getCommunityGroups(community.id);

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-unze-ink">Gruppen</h2>
      <CommunityGroupManager
        communityId={community.id}
        slug={slug}
        groups={groups}
      />
    </section>
  );
}

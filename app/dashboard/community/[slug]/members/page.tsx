import { PendingRemovalPanel } from "@/components/dashboard/PendingRemovalPanel";
import { MemberListClient } from "@/components/dashboard/MemberListClient";
import { RemovedMembersPanel } from "@/components/dashboard/RemovedMembersPanel";
import { RestrictionsPanel } from "@/components/dashboard/RestrictionsPanel";
import { loadRestrictionsData } from "@/app/dashboard/lifecycle-actions";
import { loadRemovedMembersData } from "@/app/dashboard/governance-actions";
import { loadPendingRemovalsData } from "@/app/dashboard/removal-actions";
import { getCurrentUser } from "@/services/auth/auth.service";
import {
  canManageRoles,
  getCommunityMembers,
} from "@/services/community/member.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCommunityBadges } from "@/services/badges/badge.service";
import { fetchUserBadgesForCommunity } from "@/services/badges/badge.repository";
import { canBanMembers, hasCommunityPermission } from "@/lib/permissions/community.permissions";
import { loadCommunityPermissionChecks } from "@/services/governance/community-permission-context.service";
import { redirect } from "next/navigation";

interface MembersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardMembersPage({ params }: MembersPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { community } = await getDashboardCommunityAccess(slug, user.id);
  if (!community) redirect("/dashboard");

  const members = await getCommunityMembers(community.id);
  const [communityBadges, memberAwards] = await Promise.all([
    getCommunityBadges(community.id),
    fetchUserBadgesForCommunity(
      community.id,
      members.map((m) => m.userId),
      { publicOnly: false },
    ),
  ]);
  const role = community.viewerRole;
  const perm = await loadCommunityPermissionChecks(community.id, role);
  const restrictionsData = await loadRestrictionsData(slug);
  const removedData = await loadRemovedMembersData(slug);
  const pendingRemovals = await loadPendingRemovalsData(slug);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-1 text-base font-semibold text-unze-ink">Mitglieder</h2>
        <p className="mb-4 text-sm text-unze-ink-secondary">
          {members.length} Mitglieder in dieser Community
        </p>
      </div>
      {pendingRemovals && pendingRemovals.tasks.length > 0 && (
        <PendingRemovalPanel slug={slug} tasks={pendingRemovals.tasks} />
      )}
      <MemberListClient
        slug={slug}
        members={members}
        viewerRole={role}
        canManageRoles={canManageRoles(role)}
        canRemove={hasCommunityPermission(role, "manage_members")}
        canBan={canBanMembers(role)}
        communityBadges={communityBadges}
        memberAwards={memberAwards}
        canGrantAwards={perm.has("grant_awards")}
      />
      {restrictionsData && (
        <RestrictionsPanel
          slug={slug}
          restrictions={restrictionsData.restrictions}
          canBan={restrictionsData.canBan}
        />
      )}
      {removedData && (
        <RemovedMembersPanel slug={slug} members={removedData.members} />
      )}
    </section>
  );
}

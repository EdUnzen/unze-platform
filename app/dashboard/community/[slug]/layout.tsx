import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ACCESS_STATUS_OPTIONS } from "@/lib/constants/access";
import { getDashboardAttentionTotal } from "@/lib/dashboard/filter-drawer-items";
import { countPendingApplicationsFromDb } from "@/services/access/access.repository";
import { getCurrentUser } from "@/services/auth/auth.service";
import {
  getDashboardCommunityAccess,
  getManagedCommunities,
} from "@/services/dashboard/dashboard.service";
import { countPendingReportsFromDb } from "@/services/governance/report.repository";
import { countPendingRemovalTasks } from "@/services/lifecycle/removal-task.service";
import { countCommunityPaymentIssues } from "@/services/monetization/subscription.repository";
import { redirect } from "next/navigation";

interface DashboardCommunityLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function DashboardCommunityLayout({
  children,
  params,
}: DashboardCommunityLayoutProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/dashboard");

  const [{ community, canAccess }, managedCommunities] = await Promise.all([
    getDashboardCommunityAccess(slug, user.id),
    getManagedCommunities(user.id),
  ]);

  if (!canAccess || !community) {
    redirect("/dashboard");
  }

  let pendingApplicationCount = 0;
  let pendingReportCount = 0;
  let pendingRemovalCount = 0;
  let pendingPaymentIssues = 0;

  try {
    [pendingApplicationCount, pendingReportCount, pendingRemovalCount] =
      await Promise.all([
        countPendingApplicationsFromDb(community.id),
        countPendingReportsFromDb(community.id),
        countPendingRemovalTasks(community.id),
      ]);
    if (community.monetizationEnabled && community.viewerRole === "creator") {
      pendingPaymentIssues = await countCommunityPaymentIssues(community.id);
    }
  } catch (e) {
    console.error("[dashboard.layout] pending counts:", e);
  }

  const accessLabel =
    ACCESS_STATUS_OPTIONS.find(
      (o) => o.value === community.access?.accessStatus,
    )?.label ?? "Offen";

  const attentionCounts = {
    applications: pendingApplicationCount,
    reports: pendingReportCount,
    removals: pendingRemovalCount,
    payments: pendingPaymentIssues,
  };

  const openTaskCount = getDashboardAttentionTotal(
    attentionCounts,
    community.viewerRole,
    community.monetizationEnabled ?? false,
  );

  return (
    <div className="page-padding">
      <DashboardChrome
        slug={slug}
        communityTitle={community.title}
        viewerRole={community.viewerRole}
        accessLabel={accessLabel}
        managedCommunities={managedCommunities}
        attentionCounts={attentionCounts}
        monetizationEnabled={community.monetizationEnabled ?? false}
        header={
          <DashboardHeader
            title={community.title}
            subtitle={`Verwaltung · ${accessLabel}`}
            openTaskCount={openTaskCount}
          />
        }
      >
        {children}
      </DashboardChrome>
    </div>
  );
}

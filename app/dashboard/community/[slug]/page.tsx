import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardAttentionPanel } from "@/components/dashboard/DashboardAttentionPanel";
import { DashboardStatusStrip } from "@/components/dashboard/DashboardStatusStrip";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { ACCESS_STATUS_OPTIONS } from "@/lib/constants/access";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { countPendingApplicationsFromDb } from "@/services/access/access.repository";
import { countPendingRemovalTasks } from "@/services/lifecycle/removal-task.service";
import { countPendingReportsFromDb } from "@/services/governance/report.repository";
import { countCommunityPaymentIssues } from "@/services/monetization/subscription.repository";
import { getCommunityActivity } from "@/services/platform/activity.service";
import { ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface DashboardOverviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardOverviewPage({
  params,
}: DashboardOverviewPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { community } = await getDashboardCommunityAccess(slug, user.id);
  if (!community) redirect("/dashboard");

  let activity: Awaited<ReturnType<typeof getCommunityActivity>> = [];
  try {
    activity = await getCommunityActivity(community.id, 15);
  } catch (e) {
    console.error("[dashboard.overview] activity:", e);
  }

  const [
    pendingApplicationCount,
    pendingReportCount,
    pendingRemovalCount,
    pendingPaymentIssues,
  ] = await Promise.all([
    countPendingApplicationsFromDb(community.id),
    countPendingReportsFromDb(community.id),
    countPendingRemovalTasks(community.id),
    community.monetizationEnabled && community.viewerRole === "creator"
      ? countCommunityPaymentIssues(community.id)
      : Promise.resolve(0),
  ]);

  const accessLabel =
    ACCESS_STATUS_OPTIONS.find(
      (o) => o.value === community.access?.accessStatus,
    )?.label ?? "Offen";

  const openTasks =
    pendingApplicationCount + pendingReportCount + pendingRemovalCount + pendingPaymentIssues;

  return (
    <div className="space-y-5">
      <DashboardStatusStrip
        memberCount={community.stats.memberCount}
        accessStatusLabel={accessLabel}
        openTaskCount={openTasks}
      />

      <DashboardAttentionPanel
        slug={slug}
        pendingApplications={pendingApplicationCount}
        pendingReports={pendingReportCount}
        pendingRemovals={pendingRemovalCount}
        pendingPaymentIssues={pendingPaymentIssues}
        monetizationEnabled={community.monetizationEnabled ?? false}
        accessStatusLabel={accessLabel}
        viewerRole={community.viewerRole}
      />

      <DashboardQuickActions slug={slug} viewerRole={community.viewerRole} />

      <DashboardStatGrid stats={community.stats} slug={slug} />

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/community/${slug}/edit`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-unze-green py-3.5 text-sm font-semibold text-white active:scale-[0.98]"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Bearbeiten
        </Link>
        <Link
          href={`/community/${slug}`}
          className="flex items-center justify-center gap-2 rounded-2xl border border-unze-border bg-white py-3.5 text-sm font-semibold text-unze-ink active:scale-[0.98]"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Ansehen
        </Link>
      </div>

      <section className="rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-2 text-sm font-semibold text-unze-ink">Kurzinfo</h2>
        <p className="line-clamp-4 text-sm leading-relaxed text-unze-ink-secondary">
          {community.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {community.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-unze-surface-muted px-2 py-0.5 text-[11px] font-medium text-unze-ink-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-unze-ink">Letzte Aktivität</h2>
        <ActivityFeed items={activity} />
      </section>
    </div>
  );
}

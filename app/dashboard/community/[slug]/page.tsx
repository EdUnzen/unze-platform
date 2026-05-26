import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { DashboardGrowthPanel } from "@/components/dashboard/DashboardGrowthPanel";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardAttentionPanel } from "@/components/dashboard/DashboardAttentionPanel";
import { ACCESS_STATUS_OPTIONS } from "@/lib/constants/access";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { DashboardQuickNav } from "@/components/dashboard/DashboardQuickNav";
import { countPendingApplicationsFromDb } from "@/services/access/access.repository";
import { countPendingReportsFromDb } from "@/services/governance/report.repository";
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

  const activity = await getCommunityActivity(community.id, 15);
  const pendingApplicationCount = await countPendingApplicationsFromDb(
    community.id,
  );
  const pendingReportCount = await countPendingReportsFromDb(community.id);
  const accessLabel =
    ACCESS_STATUS_OPTIONS.find(
      (o) => o.value === community.access?.accessStatus,
    )?.label ?? "Offen";

  return (
    <div className="space-y-6">
      <DashboardAttentionPanel
        slug={slug}
        pendingApplications={pendingApplicationCount}
        pendingReports={pendingReportCount}
        accessStatusLabel={accessLabel}
        viewerRole={community.viewerRole}
      />

      <DashboardQuickNav
        slug={slug}
        viewerRole={community.viewerRole}
        pendingApplications={pendingApplicationCount}
        pendingReports={pendingReportCount}
      />

      <DashboardGrowthPanel
        slug={slug}
        stats={community.stats}
        communityTitle={community.title}
      />

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
        <h2 className="mb-3 text-sm font-semibold text-unze-ink">
          Letzte Aktivität
        </h2>
        <ActivityFeed items={activity} />
      </section>
    </div>
  );
}

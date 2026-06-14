import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { ACCESS_STATUS_OPTIONS } from "@/lib/constants/access";
import { countPendingApplicationsFromDb } from "@/services/access/access.repository";
import { countPendingReportsFromDb } from "@/services/governance/report.repository";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import Link from "next/link";
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

  const { community, canAccess } = await getDashboardCommunityAccess(
    slug,
    user.id,
  );

  if (!canAccess || !community) {
    redirect("/dashboard");
  }

  let pendingApplicationCount = 0;
  let pendingReportCount = 0;
  try {
    pendingApplicationCount = await countPendingApplicationsFromDb(community.id);
    pendingReportCount = await countPendingReportsFromDb(community.id);
  } catch (e) {
    console.error("[dashboard.layout] pending counts:", e);
  }
  const accessLabel =
    ACCESS_STATUS_OPTIONS.find(
      (o) => o.value === community.access?.accessStatus,
    )?.label ?? "Offen";

  return (
    <div className="page-padding">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link href="/dashboard" className="text-sm font-medium text-unze-green">
          ← Dashboard
        </Link>
        <Link
          href={`/community/${slug}`}
          className="text-xs font-medium text-unze-ink-muted underline-offset-2 hover:underline"
        >
          Öffentliche Ansicht
        </Link>
      </div>

      <header className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-unze-ink">
          {community.title}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-sm text-unze-ink-secondary">Verwaltung</span>
          <RoleBadge role={community.viewerRole} />
          <span className="rounded-full bg-unze-surface-muted px-2.5 py-0.5 text-xs font-medium text-unze-ink-secondary">
            {accessLabel}
          </span>
        </div>
      </header>

      <DashboardTabs
        slug={slug}
        viewerRole={community.viewerRole}
        pendingApplicationCount={pendingApplicationCount}
        pendingReportCount={pendingReportCount}
      />

      {children}
    </div>
  );
}

import { OwnerCenter } from "@/components/owner/OwnerCenter";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  fetchOwnerVerificationQueue,
  fetchPlatformOverviewStats,
  fetchPlatformReports,
} from "@/services/platform/owner-center.service";
import { requirePlatformOwner } from "@/services/platform/owner-access.service";

interface OwnerPageProps {
  searchParams: Promise<{ tab?: string }>;
}

const VALID_TABS = new Set(["overview", "reports", "verifications", "measures"]);

export default async function OwnerPage({ searchParams }: OwnerPageProps) {
  await requirePlatformOwner();
  const params = await searchParams;
  const tab = VALID_TABS.has(params.tab ?? "") ? (params.tab as string) : "overview";

  const statsPromise =
    tab === "overview" ? fetchPlatformOverviewStats() : Promise.resolve(null);

  const reportsPromise =
    tab === "reports"
      ? Promise.all([
          fetchPlatformReports("pending"),
          fetchPlatformReports("resolved"),
          fetchPlatformReports("dismissed"),
        ])
      : Promise.resolve([[], [], []] as const);

  const verificationsPromise =
    tab === "verifications" ? fetchOwnerVerificationQueue() : Promise.resolve([]);

  const [stats, reportGroups, verifications] = await Promise.all([
    statsPromise,
    reportsPromise,
    verificationsPromise,
  ]);

  const [pendingReports, resolvedReports, dismissedReports] = reportGroups;

  return (
    <div className="page-padding pb-28">
      <PageHeader
        title="Owner Center"
        subtitle="Plattformverwaltung — nur für UNZE-Owner"
      />
      <OwnerCenter
        initialTab={tab}
        stats={
          stats ?? {
            users: 0,
            communities: 0,
            groups: 0,
            events: 0,
            services: 0,
          }
        }
        pendingReports={[...pendingReports]}
        resolvedReports={[...resolvedReports]}
        dismissedReports={[...dismissedReports]}
        verifications={verifications}
      />
    </div>
  );
}

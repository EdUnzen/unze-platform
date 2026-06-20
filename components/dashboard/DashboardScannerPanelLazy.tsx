"use client";

import dynamic from "next/dynamic";

const DashboardScannerPanel = dynamic(
  () =>
    import("@/components/dashboard/DashboardScannerPanel").then(
      (m) => m.DashboardScannerPanel,
    ),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-64 rounded-3xl bg-unze-border/40" />
        <div className="h-12 rounded-xl bg-unze-border/30" />
      </div>
    ),
    ssr: false,
  },
);

interface DashboardScannerPanelLazyProps {
  slug: string;
  communityId: string;
  communityTitle: string;
}

export function DashboardScannerPanelLazy(props: DashboardScannerPanelLazyProps) {
  return <DashboardScannerPanel {...props} />;
}

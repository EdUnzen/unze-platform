"use client";

import dynamic from "next/dynamic";
import type {
  CreatorStripeStatus,
  ReferralSummary,
  RevenueLedgerEntry,
} from "@/types/referral";

const panelSkeleton = (
  <div className="h-32 animate-pulse rounded-3xl bg-unze-border/40" />
);

const StripeConnectPanel = dynamic(
  () =>
    import("@/components/referral/StripeConnectPanel").then(
      (m) => m.StripeConnectPanel,
    ),
  { loading: () => panelSkeleton },
);

const MyReferralsDashboard = dynamic(
  () =>
    import("@/components/referral/MyReferralsDashboard").then(
      (m) => m.MyReferralsDashboard,
    ),
  { loading: () => panelSkeleton },
);

const CreatorReferralPanel = dynamic(
  () =>
    import("@/components/referral/CreatorReferralPanel").then(
      (m) => m.CreatorReferralPanel,
    ),
  { loading: () => panelSkeleton },
);

const RevenueOverviewPanel = dynamic(
  () =>
    import("@/components/referral/RevenueOverviewPanel").then(
      (m) => m.RevenueOverviewPanel,
    ),
  { loading: () => panelSkeleton },
);

interface ReferralsPanelsLazyProps {
  stripeStatus: CreatorStripeStatus;
  sandboxCommunity: { id: string; title: string } | null;
  summary: ReferralSummary;
  ledger: RevenueLedgerEntry[];
  userId: string;
}

/** Creator-only: Panels erst im Client-Chunk — nicht im Home/Discover-Bundle. */
export function ReferralsPanelsLazy({
  stripeStatus,
  sandboxCommunity,
  summary,
  ledger,
  userId,
}: ReferralsPanelsLazyProps) {
  return (
    <div className="flex flex-col gap-4">
      <StripeConnectPanel
        stripeStatus={stripeStatus}
        sandboxCommunity={sandboxCommunity}
      />
      <MyReferralsDashboard summary={summary} />
      <CreatorReferralPanel summary={summary} />
      <RevenueOverviewPanel ledger={ledger} userId={userId} />
    </div>
  );
}

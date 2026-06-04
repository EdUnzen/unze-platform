"use client";

import dynamic from "next/dynamic";
import type { CommunityVisibility } from "@/types/community";
import type {
  CreatorFinanceStats,
  CreatorSubscriptionRow,
} from "@/types/billing";

const skeleton = (
  <div className="h-28 animate-pulse rounded-3xl bg-unze-border/40" />
);

const CommunityVisibilityCard = dynamic(
  () =>
    import("@/components/dashboard/CommunityVisibilityCard").then(
      (m) => m.CommunityVisibilityCard,
    ),
  { loading: () => skeleton },
);

const CreatorFinanceDashboard = dynamic(
  () =>
    import("@/components/dashboard/CreatorFinanceDashboard").then(
      (m) => m.CreatorFinanceDashboard,
    ),
  { loading: () => skeleton },
);

const MonetizationPrepPanel = dynamic(
  () =>
    import("@/components/dashboard/MonetizationPrepPanel").then(
      (m) => m.MonetizationPrepPanel,
    ),
  { loading: () => skeleton },
);

interface MonetizationPanelsLazyProps {
  slug: string;
  visibility: CommunityVisibility;
  discoverEnabled: boolean;
  monetizationEnabled: boolean;
  isCreator: boolean;
  finance: {
    stats: CreatorFinanceStats;
    subscriptions: CreatorSubscriptionRow[];
  };
  pricing: { monthly: string; semiannual: string; yearly: string };
  premiumScheduledAt: string | null;
  premiumNotifyMembers: boolean;
}

export function MonetizationPanelsLazy(props: MonetizationPanelsLazyProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-base font-semibold text-unze-ink">
        Finanzen & Monetarisierung
      </h2>
      <CommunityVisibilityCard
        slug={props.slug}
        visibility={props.visibility}
        discoverEnabled={props.discoverEnabled}
        monetizationEnabled={props.monetizationEnabled}
      />
      <CreatorFinanceDashboard
        stats={props.finance.stats}
        subscriptions={props.finance.subscriptions}
      />
      <MonetizationPrepPanel
        slug={props.slug}
        monetizationEnabled={props.monetizationEnabled}
        isCreator={props.isCreator}
        pricing={props.pricing}
        premiumScheduledAt={props.premiumScheduledAt}
        premiumNotifyMembers={props.premiumNotifyMembers}
      />
    </section>
  );
}

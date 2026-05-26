import { CommercialInfoDialog } from "@/components/referral/CommercialInfoDialog";
import { CreatorReferralPanel } from "@/components/referral/CreatorReferralPanel";
import { RevenueOverviewPanel } from "@/components/referral/RevenueOverviewPanel";
import { StripeConnectPanel } from "@/components/referral/StripeConnectPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getManagedCommunities } from "@/services/dashboard/dashboard.service";
import { getCreatorStripeStatus } from "@/services/monetization/stripe-connect.service";
import {
  getReferralSummary,
  getRevenueLedger,
} from "@/services/referral/referral.service";
import Link from "next/link";
import { redirect } from "next/navigation";

interface ReferralsPageProps {
  searchParams: Promise<{
    stripe?: string;
    checkout?: string;
  }>;
}

export default async function DashboardReferralsPage({
  searchParams,
}: ReferralsPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/dashboard/referrals");

  const params = await searchParams;
  const [summary, ledger, stripeStatus, communities] = await Promise.all([
    getReferralSummary(user.id),
    getRevenueLedger(user.id),
    getCreatorStripeStatus(user.id),
    getManagedCommunities(user.id),
  ]);

  const sandboxCommunity = communities[0]
    ? { id: communities[0].id, title: communities[0].title }
    : null;

  const banner =
    params.checkout === "success"
      ? "Sandbox-Zahlung erfolgreich — Ledger-Eintrag folgt per Webhook."
      : params.stripe === "complete"
        ? "Stripe-Onboarding abgeschlossen — Status wird aktualisiert."
        : null;

  return (
    <div className="page-padding pb-8">
      <PageHeader
        title="Einnahmen & Referrals"
        subtitle="Stripe Sandbox, optionaler Creator-Referral & Revenue Share"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-unze-green"
        >
          ← Dashboard
        </Link>
        <CommercialInfoDialog />
      </div>

      {banner && (
        <p className="mb-4 rounded-2xl bg-unze-green-muted/50 px-4 py-3 text-sm text-unze-green-dark">
          {banner}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <StripeConnectPanel
          stripeStatus={stripeStatus}
          sandboxCommunity={sandboxCommunity}
        />
        <CreatorReferralPanel summary={summary} />
        <RevenueOverviewPanel ledger={ledger} userId={user.id} />
      </div>
    </div>
  );
}

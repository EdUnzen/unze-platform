import { CommercialInfoDialog } from "@/components/referral/CommercialInfoDialog";
import { CrowdPartnerExplainer } from "@/components/referral/CrowdPartnerExplainer";
import { ReferralsPanelsLazy } from "@/components/referral/ReferralsPanelsLazy";
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

interface CrowdPartnerPageProps {
  searchParams: Promise<{
    stripe?: string;
    checkout?: string;
  }>;
}

export default async function DashboardCrowdPartnerPage({
  searchParams,
}: CrowdPartnerPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/dashboard/crowd-partner");

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
      ? "Sandbox-Zahlung erfolgreich \u2014 Ledger-Eintrag folgt per Webhook."
      : params.stripe === "complete"
        ? "Stripe-Onboarding abgeschlossen \u2014 Status wird aktualisiert."
        : null;

  return (
    <div className="page-padding pb-8">
      <PageHeader
        title="Crowd Partner"
        subtitle="Du unterst\u00fctzt UNZE beim Wachstum \u2014 mit transparentem Anteil an der Plattformgeb\u00fchr."
      />

      <CrowdPartnerExplainer />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href="/dashboard" className="text-sm font-medium text-unze-green">
          {"\u2190"} Dashboard
        </Link>
        <CommercialInfoDialog />
      </div>

      {banner && (
        <p className="mb-4 rounded-2xl bg-unze-green-muted/50 px-4 py-3 text-sm text-unze-green-dark">
          {banner}
        </p>
      )}

      <ReferralsPanelsLazy
        stripeStatus={stripeStatus}
        sandboxCommunity={sandboxCommunity}
        summary={summary}
        ledger={ledger}
        userId={user.id}
      />
    </div>
  );
}

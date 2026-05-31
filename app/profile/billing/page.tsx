import { PageHeader } from "@/components/layout/PageHeader";
import { UserBillingOverview } from "@/components/billing/UserBillingOverview";
import { getUserBillingOverview } from "@/services/monetization/billing.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { redirect } from "next/navigation";

interface ProfileBillingPageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function ProfileBillingPage({ searchParams }: ProfileBillingPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/profile/billing");

  const params = await searchParams;
  const overview = await getUserBillingOverview(user.id);

  return (
    <div className="page-padding">
      <PageHeader
        title="Abos & Zahlungen"
        subtitle="Mitgliedschaften, Buchungen und Stripe-Rechnungen"
        backHref="/profile"
        backLabel="Profil"
      />

      {params.success === "1" && (
        <div className="mb-4 rounded-2xl border border-unze-green/30 bg-unze-green-muted/30 px-4 py-3 text-sm text-unze-green-dark">
          Zahlung erfolgreich — Status wird synchronisiert.
        </div>
      )}

      <UserBillingOverview
        subscriptions={overview.subscriptions}
        payments={overview.payments}
      />
    </div>
  );
}

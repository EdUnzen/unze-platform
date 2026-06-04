import { MonetizationPrepPanel } from "@/components/dashboard/MonetizationPrepPanel";
import { CreatorFinanceDashboard } from "@/components/dashboard/CreatorFinanceDashboard";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCreatorFinanceOverview } from "@/services/monetization/billing.service";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface MonetizationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardMonetizationPage({
  params,
}: MonetizationPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { community } = await getDashboardCommunityAccess(slug, user.id);
  if (!community) redirect("/dashboard");

  const finance = await getCreatorFinanceOverview(community.id);

  const supabase = await createClient();
  let pricing = { monthly: "", semiannual: "", yearly: "" };
  let premiumScheduledAt: string | null = null;
  let premiumNotifyMembers = true;
  if (supabase) {
    const { data } = await supabase
      .from("communities")
      .select(
        "price_monthly_cents, price_semiannual_cents, price_yearly_cents, premium_transition_scheduled_at, premium_transition_notify_members",
      )
      .eq("id", community.id)
      .maybeSingle();
    if (data) {
      pricing = {
        monthly: data.price_monthly_cents ? String(data.price_monthly_cents / 100) : "",
        semiannual: data.price_semiannual_cents ? String(data.price_semiannual_cents / 100) : "",
        yearly: data.price_yearly_cents ? String(data.price_yearly_cents / 100) : "",
      };
      premiumScheduledAt =
        (data as { premium_transition_scheduled_at?: string | null })
          .premium_transition_scheduled_at ?? null;
      premiumNotifyMembers =
        (data as { premium_transition_notify_members?: boolean })
          .premium_transition_notify_members ?? true;
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-base font-semibold text-unze-ink">Finanzen & Monetarisierung</h2>
      <CreatorFinanceDashboard
        stats={finance.stats}
        subscriptions={finance.subscriptions}
      />
      <MonetizationPrepPanel
        slug={slug}
        monetizationEnabled={community.monetizationEnabled ?? false}
        isCreator={community.viewerRole === "creator"}
        pricing={pricing}
        premiumScheduledAt={premiumScheduledAt}
        premiumNotifyMembers={premiumNotifyMembers}
      />
    </section>
  );
}

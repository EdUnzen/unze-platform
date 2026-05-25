import { MonetizationPrepPanel } from "@/components/dashboard/MonetizationPrepPanel";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
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

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-unze-ink">Monetarisierung</h2>
      <MonetizationPrepPanel
        slug={slug}
        monetizationEnabled={community.monetizationEnabled ?? false}
        isCreator={community.viewerRole === "creator"}
      />
    </section>
  );
}

import { AuszeichnungenPanel } from "@/components/dashboard/AuszeichnungenPanel";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCommunityBadges } from "@/services/badges/badge.service";
import { redirect } from "next/navigation";

interface AuszeichnungenPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardAuszeichnungenPage({
  params,
}: AuszeichnungenPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { community } = await getDashboardCommunityAccess(slug, user.id);
  if (!community) redirect("/dashboard");

  const badges = await getCommunityBadges(community.id);

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-unze-ink">Auszeichnungen</h2>
      <AuszeichnungenPanel slug={slug} badges={badges} />
    </section>
  );
}

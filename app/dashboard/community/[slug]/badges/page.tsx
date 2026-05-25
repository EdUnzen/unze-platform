import { BadgeManager } from "@/components/dashboard/BadgeManager";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCommunityBadges } from "@/services/badges/badge.service";
import { redirect } from "next/navigation";

interface BadgesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardBadgesPage({ params }: BadgesPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { community } = await getDashboardCommunityAccess(slug, user.id);
  if (!community) redirect("/dashboard");

  const badges = await getCommunityBadges(community.id);

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-unze-ink">
        Badges & Verifizierung
      </h2>
      <BadgeManager slug={slug} badges={badges} />
    </section>
  );
}

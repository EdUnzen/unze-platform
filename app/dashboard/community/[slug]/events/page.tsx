import { EventManager } from "@/components/events/EventManager";
import { EventDashboardCheckIns } from "@/components/events/EventDashboardCheckIns";
import { CommunityEventsSection } from "@/components/events/CommunityEventsSection";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCommunityEventsAdmin } from "@/services/events/event.service";
import { redirect } from "next/navigation";

interface DashboardEventsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardEventsPage({ params }: DashboardEventsPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { community } = await getDashboardCommunityAccess(slug, user.id);
  if (!community) redirect("/dashboard");

  const events = await getCommunityEventsAdmin(community.id);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-4 text-base font-semibold text-unze-ink">Events</h2>
        <EventManager
          communityId={community.id}
          slug={slug}
          communityBannerUrl={community.bannerUrl}
        />
      </section>

      <EventDashboardCheckIns slug={slug} events={events} />

      <CommunityEventsSection
        communitySlug={slug}
        events={events}
        communityBannerUrl={community.bannerUrl}
        communityCategory={community.category}
        communityBannerGradient={community.bannerGradient}
      />
    </div>
  );
}

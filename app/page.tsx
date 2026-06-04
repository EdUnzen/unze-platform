import { HomeHub } from "@/components/home/HomeHub";
import { PageHeader } from "@/components/layout/PageHeader";
import { getFollowedCommunities } from "@/services/community/community.service";
import { getUpcomingEventsForCommunities } from "@/services/events/event.service";
import { getFollowedGroups } from "@/services/follow/follow.service";
import {
  getMyMemberCommunities,
  getMyPendingApplications,
} from "@/services/home/home.service";
import { getPlatformShellContext } from "@/services/shell/platform-shell.service";

export default async function HomePage() {
  const shell = await getPlatformShellContext();
  const user = shell.user;

  const [
    myCommunities,
    followedCommunities,
    followedGroups,
    pendingApplications,
  ] = await Promise.all([
    user ? getMyMemberCommunities(user.id) : Promise.resolve([]),
    user ? getFollowedCommunities() : Promise.resolve([]),
    user ? getFollowedGroups() : Promise.resolve([]),
    user ? getMyPendingApplications(user.id) : Promise.resolve([]),
  ]);

  const communityIds = [
    ...new Set([
      ...myCommunities.map((c) => c.id),
      ...followedCommunities.map((c) => c.id),
    ]),
  ];

  const upcomingEvents = user
    ? await getUpcomingEventsForCommunities(communityIds, 8)
    : [];

  return (
    <div className="page-padding">
      <PageHeader
        title={user ? "Mein UNZE" : "Willkommen bei UNZE"}
        subtitle={
          user
            ? "Communities, Gruppen, Events und Anträge — dein Verwaltungs-Hub."
            : "Communities organisieren, verifizieren und monetarisieren — dein Netzwerk an einem Ort."
        }
      />

      <HomeHub
        user={user}
        myCommunities={myCommunities}
        followedCommunities={followedCommunities}
        followedGroups={followedGroups}
        upcomingEvents={upcomingEvents}
        pendingApplications={pendingApplications}
        unreadNotifications={shell.unreadCount}
        managedCount={shell.showDashboard ? 1 : 0}
      />
    </div>
  );
}

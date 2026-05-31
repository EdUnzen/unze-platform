import { HomeHub } from "@/components/home/HomeHub";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getFollowedCommunities } from "@/services/community/community.service";
import { getManagedCommunities } from "@/services/dashboard/dashboard.service";
import { getUpcomingEventsForCommunities } from "@/services/events/event.service";
import { getFollowedGroups } from "@/services/follow/follow.service";
import {
  getMyMemberCommunities,
  getMyPendingApplications,
} from "@/services/home/home.service";
import { getUnreadNotificationCount } from "@/services/notifications/notification-center.service";

export default async function HomePage() {
  const user = await getCurrentUser();

  const [
    myCommunities,
    followedCommunities,
    followedGroups,
    pendingApplications,
    managed,
    unreadCount,
  ] = await Promise.all([
    user ? getMyMemberCommunities(user.id) : Promise.resolve([]),
    user ? getFollowedCommunities() : Promise.resolve([]),
    user ? getFollowedGroups() : Promise.resolve([]),
    user ? getMyPendingApplications(user.id) : Promise.resolve([]),
    user ? getManagedCommunities(user.id) : Promise.resolve([]),
    user ? getUnreadNotificationCount(user.id) : Promise.resolve(0),
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
            : "Communities organisieren, verifizieren und monetarisieren — ohne Social-Media-Feed."
        }
      />

      <HomeHub
        user={user}
        myCommunities={myCommunities}
        followedCommunities={followedCommunities}
        followedGroups={followedGroups}
        upcomingEvents={upcomingEvents}
        pendingApplications={pendingApplications}
        unreadNotifications={unreadCount}
        managedCount={managed.length}
      />
    </div>
  );
}

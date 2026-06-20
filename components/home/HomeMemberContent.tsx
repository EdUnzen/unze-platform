import { HomeHub } from "@/components/home/HomeHub";
import { HomeCacheRecorder } from "@/components/pwa/HomeCacheRecorder";
import {
  getMyMemberCommunities,
  getMyPendingApplications,
} from "@/services/home/home.service";
import { getFollowedCommunities } from "@/services/community/community.service";
import { getUpcomingEventsForCommunities } from "@/services/events/event.service";
import { getFollowedGroups } from "@/services/follow/follow.service";
import { hasManagedCommunities } from "@/services/dashboard/dashboard.service";
import { getUnreadNotificationCount } from "@/services/notifications/notification-center.service";
import { getCurrentProfile } from "@/services/auth/auth.service";

interface HomeMemberContentProps {
  userId: string;
}

export async function HomeMemberContent({ userId }: HomeMemberContentProps) {
  const [
    profile,
    unreadNotifications,
    showDashboard,
    myCommunities,
    followedCommunities,
    followedGroups,
    pendingApplications,
  ] = await Promise.all([
    getCurrentProfile(),
    getUnreadNotificationCount(userId),
    hasManagedCommunities(userId),
    getMyMemberCommunities(userId),
    getFollowedCommunities(),
    getFollowedGroups(),
    getMyPendingApplications(userId),
  ]);

  const communityIds = [
    ...new Set([
      ...myCommunities.map((c) => c.id),
      ...followedCommunities.map((c) => c.id),
    ]),
  ];

  const upcomingEvents =
    communityIds.length > 0
      ? await getUpcomingEventsForCommunities(communityIds, 8)
      : [];

  return (
    <>
      <HomeHub
        user={{ id: userId, displayName: profile?.display_name }}
        myCommunities={myCommunities}
        followedCommunities={followedCommunities}
        followedGroups={followedGroups}
        discoverCommunities={[]}
        discoverServices={[]}
        upcomingEvents={upcomingEvents}
        pendingApplications={pendingApplications}
        unreadNotifications={unreadNotifications}
        managedCount={showDashboard ? 1 : 0}
      />
      <HomeCacheRecorder
        displayName={profile?.display_name ?? null}
        communities={myCommunities.map((c) => ({ slug: c.slug, title: c.title }))}
        pendingApplicationCount={pendingApplications.length}
        upcomingEventCount={upcomingEvents.length}
      />
    </>
  );
}

import { getHomeMemberBundle } from "@/services/home/home.service";
import { HomeHub } from "@/components/home/HomeHub";
import { HomeCacheRecorder } from "@/components/pwa/HomeCacheRecorder";

interface HomeMemberContentProps {
  userId: string;
}

export async function HomeMemberContent({ userId }: HomeMemberContentProps) {
  const bundle = await getHomeMemberBundle(userId);

  return (
    <>
      <HomeHub
        user={{ id: userId, displayName: bundle.profile?.display_name }}
        myCommunities={bundle.myCommunities}
        followedCommunities={bundle.followedCommunities}
        followedGroups={bundle.followedGroups}
        discoverCommunities={[]}
        discoverServices={[]}
        upcomingEvents={bundle.upcomingEvents}
        pendingApplications={bundle.pendingApplications}
        unreadNotifications={bundle.unreadNotifications}
        managedCount={bundle.showDashboard ? 1 : 0}
      />
      <HomeCacheRecorder
        displayName={bundle.profile?.display_name ?? null}
        communities={bundle.myCommunities.map((c) => ({ slug: c.slug, title: c.title }))}
        pendingApplicationCount={bundle.pendingApplications.length}
        upcomingEventCount={bundle.upcomingEvents.length}
      />
    </>
  );
}

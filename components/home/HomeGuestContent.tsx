import { HomeHub } from "@/components/home/HomeHub";
import { getDiscoverGroups } from "@/services/community/group.service";
import { getDiscoverCommunitiesPreview } from "@/services/community/community.service";

export async function HomeGuestContent() {
  const [discoverCommunities, discoverServices] = await Promise.all([
    getDiscoverCommunitiesPreview(6),
    getDiscoverGroups(6, { groupType: "service" }),
  ]);

  return (
    <HomeHub
      user={null}
      myCommunities={[]}
      followedCommunities={[]}
      followedGroups={[]}
      discoverCommunities={discoverCommunities}
      discoverServices={discoverServices}
      upcomingEvents={[]}
      pendingApplications={[]}
      unreadNotifications={0}
      managedCount={0}
    />
  );
}

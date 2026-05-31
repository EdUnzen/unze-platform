import { getFollowedCommunities } from "@/services/community/community.service";
import {
  getEventsByIds,
  getUpcomingEventsForCommunities,
} from "@/services/events/event.service";
import {
  getFollowedEventIds,
  getFollowedGroups,
} from "@/services/follow/follow.service";
import type { Community } from "@/types/community";
import type { CommunityEvent } from "@/types/event";
import type { DiscoverGroup } from "@/types/community";

export type FavoritesBundle = {
  communities: Community[];
  groups: DiscoverGroup[];
  services: DiscoverGroup[];
  events: CommunityEvent[];
};

/** Favoriten = gefolgte Communities, Gruppen, Events */
export async function getFavoritesBundle(): Promise<FavoritesBundle> {
  const [communities, followedGroups, followedEventIds] = await Promise.all([
    getFollowedCommunities(),
    getFollowedGroups(),
    getFollowedEventIds(),
  ]);

  const groups = followedGroups.filter((g) => g.groupType !== "service");
  const services = followedGroups.filter((g) => g.groupType === "service");

  const [directEvents, communityDerivedEvents] = await Promise.all([
    followedEventIds.length > 0 ? getEventsByIds(followedEventIds) : Promise.resolve([]),
    (async () => {
      const communityIds = [
        ...new Set([
          ...communities.map((c) => c.id),
          ...followedGroups.map((g) => g.communityId),
        ]),
      ];
      return communityIds.length > 0
        ? getUpcomingEventsForCommunities(communityIds, 12)
        : [];
    })(),
  ]);

  const eventMap = new Map<string, CommunityEvent>();
  for (const event of [...directEvents, ...communityDerivedEvents]) {
    eventMap.set(event.id, event);
  }

  return {
    communities,
    groups,
    services,
    events: [...eventMap.values()].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    ),
  };
}

export function hasAnyFavorites(bundle: FavoritesBundle): boolean {
  return (
    bundle.communities.length > 0 ||
    bundle.groups.length > 0 ||
    bundle.services.length > 0 ||
    bundle.events.length > 0
  );
}

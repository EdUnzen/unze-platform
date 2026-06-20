import { DiscoverEventList } from "@/components/events/CommunityEventsSection";
import { filterDiscoverEvents } from "@/lib/discover/search";
import { getDiscoverEvents } from "@/services/events/event.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getFollowedEventIdsAmong } from "@/services/follow/follow.service";

interface DiscoverEventsTabProps {
  query: string;
}

/** Discover Events: cache first, follow status in parallel when possible. */
export async function DiscoverEventsTab({ query }: DiscoverEventsTabProps) {
  const events = await getDiscoverEvents(24);
  const filtered = filterDiscoverEvents(events, query);

  const userPromise = getCurrentUser();
  const followPromise =
    filtered.length > 0
      ? userPromise.then((user) =>
          user ? getFollowedEventIdsAmong(filtered.map((e) => e.id)) : [],
        )
      : Promise.resolve([] as string[]);

  const [user, followedEventIds] = await Promise.all([userPromise, followPromise]);

  return (
    <DiscoverEventList
      events={filtered}
      title="Events entdecken"
      subtitle={
        query
          ? `${filtered.length} Ergebnis${filtered.length === 1 ? "" : "se"}`
          : "Kommende Termine aus Communities und Gruppen"
      }
      followedEventIds={followedEventIds}
      showFollowButtons={Boolean(user)}
    />
  );
}

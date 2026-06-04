import { getEventDefinition } from "@/lib/events/catalog";
import { PLATFORM_EVENT_CATALOG } from "@/lib/events/catalog";
import type { ActivityFeedItem, PlatformEventType } from "@/types/events";
import { fetchPlatformEventsFromDb } from "./event.repository";

export async function getCommunityActivity(
  communityId: string,
  limit = 25,
): Promise<ActivityFeedItem[]> {
  const events = await fetchPlatformEventsFromDb({ communityId, limit });
  return events.map(toActivityItem);
}

export async function getUserActivity(
  userId: string,
  limit = 25,
): Promise<ActivityFeedItem[]> {
  const [asTarget, asActor] = await Promise.all([
    fetchPlatformEventsFromDb({ targetUserId: userId, limit }),
    fetchPlatformEventsFromDb({ actorId: userId, limit }),
  ]);

  const merged = [...asTarget, ...asActor]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);

  const seen = new Set<string>();
  const unique = merged.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  return unique.map(toActivityItem);
}

export async function getRecentPlatformActivity(limit = 30) {
  const discoverTypes = Object.values(PLATFORM_EVENT_CATALOG)
    .filter((d) => d.discoverRelevant)
    .map((d) => d.eventType);

  const events = await fetchPlatformEventsFromDb({
    eventTypes: discoverTypes as PlatformEventType[],
    limit,
  });

  return events.map(toActivityItem);
}

function toActivityItem(
  event: Awaited<ReturnType<typeof fetchPlatformEventsFromDb>>[number],
): ActivityFeedItem {
  const definition = getEventDefinition(event.eventType);
  const label = definition?.label ?? event.eventType.replace(/[._]/g, " ");
  return {
    id: event.id,
    eventType: event.eventType,
    domain: event.domain,
    label,
    actorId: event.actorId,
    communityId: event.communityId,
    payload: event.payload,
    createdAt: event.createdAt,
  };
}

import { isDemoCommunitySlug } from "@/lib/constants/demo";
import { getDemoEvent, getDemoEvents } from "@/services/community/demo-data";
import {
  fetchCommunityEventsFromDb,
  fetchEventByIdOrSlugFromDb,
} from "./event.repository";
import type { CommunityEvent } from "@/types/event";

export async function getCommunityEventByIdOrSlug(
  communitySlug: string,
  eventIdOrSlug: string,
): Promise<CommunityEvent | null> {
  const fromDb = await fetchEventByIdOrSlugFromDb(communitySlug, eventIdOrSlug);
  if (fromDb) return fromDb;

  if (isDemoCommunitySlug(communitySlug)) {
    return getDemoEvent(communitySlug, eventIdOrSlug);
  }

  return null;
}

export async function getCommunityEventsListed(
  communityId: string,
  communitySlug?: string,
  limit = 12,
): Promise<CommunityEvent[]> {
  const fromDb = await fetchCommunityEventsFromDb(communityId, limit);
  if (fromDb.length > 0) return fromDb;
  if (communitySlug && isDemoCommunitySlug(communitySlug)) {
    return getDemoEvents(communitySlug).slice(0, limit);
  }
  return fromDb;
}

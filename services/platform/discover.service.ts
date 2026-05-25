/**
 * Discover Service — liest plattformweite Signale aus dem Event-Store.
 * Ranking/Feed-Integration folgt in einer späteren Phase.
 */

import { fetchDiscoverRelevantEventsFromDb } from "./event.repository";

export async function getDiscoverSignals(limit = 50) {
  return fetchDiscoverRelevantEventsFromDb(limit);
}

export async function getCommunityDiscoverBoost(communityId: string) {
  const events = await fetchDiscoverRelevantEventsFromDb(100);
  const relevant = events.filter((e) => e.communityId === communityId);

  return {
    communityId,
    signalCount: relevant.length,
    recentEvents: relevant.slice(0, 10),
    /** Platzhalter für Trust-basiertes Ranking */
    discoverScore: relevant.length * 2,
  };
}

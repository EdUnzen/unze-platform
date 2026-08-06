import type { Community, DiscoverGroup } from "@/types/community";
import type { CommunityEvent } from "@/types/event";

function matchesQuery(text: string | null | undefined, q: string): boolean {
  return Boolean(text?.toLowerCase().includes(q));
}

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function filterDiscoverGroups(
  groups: DiscoverGroup[],
  query: string,
): DiscoverGroup[] {
  const q = normalizeSearchQuery(query);
  if (!q) return groups;

  return groups.filter(
    (g) =>
      matchesQuery(g.title, q) ||
      matchesQuery(g.description, q) ||
      matchesQuery(g.communityTitle, q) ||
      matchesQuery(g.communitySlug, q) ||
      matchesQuery(g.category, q),
  );
}

export function filterDiscoverEvents(
  events: CommunityEvent[],
  query: string,
): CommunityEvent[] {
  const q = normalizeSearchQuery(query);
  if (!q) return events;

  return events.filter(
    (e) =>
      matchesQuery(e.title, q) ||
      matchesQuery(e.description, q) ||
      matchesQuery(e.communityTitle, q) ||
      matchesQuery(e.communitySlug, q) ||
      matchesQuery(e.groupTitle, q),
  );
}

export function getDiscoverSearchPlaceholder(tab: string): string {
  switch (tab) {
    case "groups":
      return "Gruppe suchen…";
    case "services":
      return "Service suchen…";
    case "events":
      return "Event suchen…";
    default:
      return "Communities, Gruppen, Events suchen…";
  }
}

export function countDiscoverSearchResults(input: {
  communities: Community[];
  groups: DiscoverGroup[];
  services: DiscoverGroup[];
  events: CommunityEvent[];
  query: string;
}): number {
  const q = normalizeSearchQuery(input.query);
  if (!q) return 0;

  return (
    filterDiscoverCommunities(input.communities, q).length +
    filterDiscoverGroups(input.groups, q).length +
    filterDiscoverGroups(input.services, q).length +
    filterDiscoverEvents(input.events, q).length
  );
}

function filterDiscoverCommunities(communities: Community[], q: string): Community[] {
  return communities.filter(
    (c) =>
      matchesQuery(c.title, q) ||
      matchesQuery(c.description, q) ||
      c.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      matchesQuery(c.category, q),
  );
}

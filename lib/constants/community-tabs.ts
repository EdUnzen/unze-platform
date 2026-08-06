export const COMMUNITY_TAB_IDS = [
  "overview",
  "groups",
  "events",
  "services",
  "members",
  "feed",
] as const;

export type CommunityTabId = (typeof COMMUNITY_TAB_IDS)[number];

export const COMMUNITY_TAB_LABELS: Record<CommunityTabId, string> = {
  overview: "Übersicht",
  groups: "Gruppen",
  events: "Events",
  services: "Services",
  members: "Mitglieder",
  feed: "Aktuelles",
};

export function isCommunityTabId(tab: string | undefined): tab is CommunityTabId {
  return Boolean(tab && (COMMUNITY_TAB_IDS as readonly string[]).includes(tab));
}

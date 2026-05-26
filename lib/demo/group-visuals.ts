/** Demo-Gruppen: Aktivitäts-Hinweise & abstrakte Visual-Seeds (keine Stockfotos) */

export type GroupVisual = {
  /** Deterministischer Seed für GroupCoverVisual */
  visualSeed: string;
  activityLabel: string;
  memberHint?: string;
};

const GROUP_VISUALS: Record<string, GroupVisual> = {
  "rocket-league-ssl/coaching": {
    visualSeed: "rl-coaching",
    activityLabel: "Heute aktiv · 8 Beiträge",
    memberHint: "42 aktive Spieler",
  },
  "rocket-league-ssl/clips": {
    visualSeed: "rl-clips",
    activityLabel: "24 neue Clips diese Woche",
  },
  "rocket-league-ssl/turniere": {
    visualSeed: "rl-events",
    activityLabel: "Event · Scrims Sa.",
  },
  "business-circle-dach/networking": {
    visualSeed: "biz-network",
    activityLabel: "12 neue Intros · heute",
    memberHint: "DACH-Netzwerk",
  },
  "business-circle-dach/marketing": {
    visualSeed: "biz-marketing",
    activityLabel: "Mastermind Donnerstag",
  },
  "business-circle-dach/services": {
    visualSeed: "biz-services",
    activityLabel: "5 neue Angebote",
  },
  "creator-lounge/feed": {
    visualSeed: "creator-feed",
    activityLabel: "Trending · 56 Likes heute",
  },
  "creator-lounge/collabs": {
    visualSeed: "creator-collab",
    activityLabel: "3 offene Collabs",
  },
};

export function getGroupVisual(
  communitySlug: string,
  groupSlug: string,
): GroupVisual | null {
  return GROUP_VISUALS[`${communitySlug}/${groupSlug}`] ?? null;
}

/** Fallback-Seed für Gruppen ohne Demo-Eintrag */
export function getGroupVisualSeed(communitySlug: string, groupSlug: string): string {
  return getGroupVisual(communitySlug, groupSlug)?.visualSeed ?? `${communitySlug}/${groupSlug}`;
}

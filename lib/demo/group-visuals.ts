/** Demo-Gruppen: Cover & Aktivitäts-Hinweise (UI-only, keine DB-Migration) */

export type GroupVisual = {
  imageUrl: string;
  activityLabel: string;
  memberHint?: string;
};

const GROUP_VISUALS: Record<string, GroupVisual> = {
  "rocket-league-ssl/coaching": {
    imageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    activityLabel: "Heute aktiv · 8 Beiträge",
    memberHint: "42 aktive Spieler",
  },
  "rocket-league-ssl/clips": {
    imageUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    activityLabel: "24 neue Clips diese Woche",
  },
  "rocket-league-ssl/turniere": {
    imageUrl:
      "https://images.unsplash.com/photo-1552820728-8b831bb59793?w=800&q=80",
    activityLabel: "Event · Scrims Sa.",
  },
  "business-circle-dach/networking": {
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    activityLabel: "12 neue Intros · heute",
    memberHint: "DACH-Netzwerk",
  },
  "business-circle-dach/marketing": {
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    activityLabel: "Mastermind Donnerstag",
  },
  "business-circle-dach/services": {
    imageUrl:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    activityLabel: "5 neue Angebote",
  },
  "creator-lounge/feed": {
    imageUrl:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7f778?w=800&q=80",
    activityLabel: "Trending · 56 Likes heute",
  },
  "creator-lounge/collabs": {
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    activityLabel: "3 offene Collabs",
  },
};

const COMMUNITY_COVERS: Record<string, string> = {
  "rocket-league-ssl":
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
  "business-circle-dach":
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
  "creator-lounge":
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7f778?w=1200&q=80",
};

export function getGroupVisual(
  communitySlug: string,
  groupSlug: string,
): GroupVisual | null {
  return GROUP_VISUALS[`${communitySlug}/${groupSlug}`] ?? null;
}

export function getDemoCommunityCover(communitySlug: string): string | null {
  return COMMUNITY_COVERS[communitySlug] ?? null;
}

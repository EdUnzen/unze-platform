import type { CommunityLevel } from "@/lib/constants/community-level";
import type { CommunityAccessConfig, JoinQuestion } from "@/types/access";
import type { Community, CommunityGroup } from "@/types/community";
import type { CommunityMemberView } from "@/types/dashboard";
import type { CommunityEvent } from "@/types/event";

export interface DemoCreator {
  id: string;
  name: string;
  username: string;
  avatarGradient: string;
  bio: string;
  isVerified: boolean;
  communityCount: number;
  totalMembers: number;
  category: string;
}

export const DEMO_CREATORS: DemoCreator[] = [
  {
    id: "mock-creator-1",
    name: "UNZE Team",
    username: "unze_official",
    avatarGradient: "from-emerald-500 to-teal-600",
    bio: "Plattform für Communities im DACH-Raum.",
    isVerified: true,
    communityCount: 2,
    totalMembers: 12400,
    category: "Kreativität",
  },
  {
    id: "mock-creator-2",
    name: "Sarah M.",
    username: "sarah_fitness",
    avatarGradient: "from-green-500 to-emerald-600",
    bio: "Fitness-Coach & Community-Builderin.",
    isVerified: true,
    communityCount: 1,
    totalMembers: 15200,
    category: "Fitness",
  },
  {
    id: "mock-creator-3",
    name: "Alex K.",
    username: "alex_dev",
    avatarGradient: "from-slate-600 to-zinc-800",
    bio: "Full-Stack Dev, Open-Source Enthusiast.",
    isVerified: false,
    communityCount: 1,
    totalMembers: 8900,
    category: "Technologie",
  },
  {
    id: "mock-creator-4",
    name: "Thomas R.",
    username: "thomas_invest",
    avatarGradient: "from-amber-500 to-orange-600",
    bio: "Immobilien-Investor & Deal-Analyst.",
    isVerified: true,
    communityCount: 1,
    totalMembers: 312,
    category: "Finanzen",
  },
];

const BASE_ACCESS: CommunityAccessConfig = {
  accessMode: "open",
  accessStatus: "open",
  admissionsPaused: false,
  memberLimit: null,
  joinApprovalMode: "auto_accept",
  communityRules: null,
  requireRulesConsent: false,
  requireAgeVerification: false,
  minAge: null,
  requiredPlatformIds: [],
  waitlistEnabled: false,
  autoRejectAtLimit: true,
  autoMessagesEnabled: true,
  rejoinCooldownDays: null,
  allowRejoinAfterBan: false,
  paidJoinRequired: false,
  archivedAt: null,
  lifecycleNotes: null,
};

export const DEMO_ACCESS_BY_SLUG: Record<string, Partial<CommunityAccessConfig>> = {
  "creator-hub": {
    accessMode: "open",
    accessStatus: "open",
    joinApprovalMode: "manual_review",
    memberLimit: 5000,
    waitlistEnabled: true,
    communityRules:
      "Respektvoller Umgang, kein Spam, keine unaufgeforderten Werbe-DMs. Creator-Inhalte nur in den dafür vorgesehenen Kanälen.",
    requireRulesConsent: true,
  },
  "fitness-mindset": {
    accessMode: "private",
    accessStatus: "open",
    joinApprovalMode: "manual_review",
    memberLimit: 20000,
    waitlistEnabled: true,
    requireAgeVerification: true,
    minAge: 16,
    communityRules:
      "Keine medizinischen Diagnosen. Motivation & Accountability — keine Body-Shaming-Inhalte.",
    requireRulesConsent: true,
    requiredPlatformIds: ["whatsapp"],
  },
  "dev-builders": {
    accessMode: "open",
    accessStatus: "paused",
    admissionsPaused: true,
    joinApprovalMode: "waitlist",
    memberLimit: 9000,
    waitlistEnabled: true,
    communityRules: "Code of Conduct: hilfsbereit, konstruktives Feedback, keine Plagiate.",
    requireRulesConsent: true,
  },
  "immobilien-invest": {
    accessMode: "premium",
    accessStatus: "open",
    joinApprovalMode: "manual_review",
    memberLimit: 500,
    waitlistEnabled: true,
    paidJoinRequired: true,
    communityRules:
      "Vertraulichkeit bei Deals. Keine Finanzberatung — Austausch auf eigene Verantwortung.",
    requireRulesConsent: true,
    requiredPlatformIds: ["telegram"],
  },
  "gaming-legends": {
    accessMode: "open",
    accessStatus: "open",
    joinApprovalMode: "auto_accept",
    memberLimit: null,
    waitlistEnabled: false,
  },
  "elite-network": {
    accessMode: "invite_only",
    accessStatus: "invite_only",
    joinApprovalMode: "invite_required",
    memberLimit: 100,
    waitlistEnabled: false,
    communityRules: "Nur auf Einladung. Diskretion und Vertrauen sind Pflicht.",
    requireRulesConsent: true,
  },
};

export const DEMO_QUESTIONS_BY_SLUG: Record<string, JoinQuestion[]> = {
  "creator-hub": [
    {
      id: "demo-q-1",
      communityId: "mock-1",
      questionType: "text",
      label: "Warum möchtest du der Community beitreten?",
      placeholder: "Kurz dein Ziel beschreiben…",
      options: [],
      isRequired: true,
      sortOrder: 0,
      config: {},
      isActive: true,
    },
    {
      id: "demo-q-2",
      communityId: "mock-1",
      questionType: "rules_consent",
      label: "Ich akzeptiere die Community-Regeln",
      placeholder: null,
      options: [],
      isRequired: true,
      sortOrder: 1,
      config: {},
      isActive: true,
    },
  ],
  "fitness-mindset": [
    {
      id: "demo-q-3",
      communityId: "mock-2",
      questionType: "age_verification",
      label: "Geburtsdatum (Mindestalter 16)",
      placeholder: null,
      options: [],
      isRequired: true,
      sortOrder: 0,
      config: {},
      isActive: true,
    },
    {
      id: "demo-q-4",
      communityId: "mock-2",
      questionType: "text",
      label: "Dein Fitness-Ziel",
      placeholder: "z.B. Muskelaufbau, Abnehmen…",
      options: [],
      isRequired: true,
      sortOrder: 1,
      config: {},
      isActive: true,
    },
    {
      id: "demo-q-5",
      communityId: "mock-2",
      questionType: "image_upload",
      label: "Optional: Fortschrittsfoto (Demo-Upload)",
      placeholder: null,
      options: [],
      isRequired: false,
      sortOrder: 2,
      config: { maxSizeMb: 5 },
      isActive: true,
    },
  ],
  "immobilien-invest": [
    {
      id: "demo-q-6",
      communityId: "mock-4",
      questionType: "text",
      label: "Investitionserfahrung",
      placeholder: "Anzahl Deals, Fokus-Region…",
      options: [],
      isRequired: true,
      sortOrder: 0,
      config: {},
      isActive: true,
    },
    {
      id: "demo-q-7",
      communityId: "mock-4",
      questionType: "file_upload",
      label: "Nachweis: LinkedIn oder Firmenregister (Demo)",
      placeholder: null,
      options: [],
      isRequired: true,
      sortOrder: 1,
      config: { maxSizeMb: 10 },
      isActive: true,
    },
    {
      id: "demo-q-8",
      communityId: "mock-4",
      questionType: "rules_consent",
      label: "Vertraulichkeitsregeln akzeptieren",
      placeholder: null,
      options: [],
      isRequired: true,
      sortOrder: 2,
      config: {},
      isActive: true,
    },
  ],
};

/** Level & Fokus für Demo-/Mock-Communities (nicht manuell durch Creator) */
export const DEMO_FOCUS_BY_SLUG: Record<string, string[]> = {
  "rocket-league-ssl": ["Coaching", "Analyse", "Turniere", "Community"],
  "business-circle-dach": ["Netzwerk", "Marketing", "Investments", "Events"],
  "creator-lounge": ["Community", "Collabs", "Events", "Netzwerk"],
  "creator-hub": ["Networking", "Community", "Events", "Support"],
  "fitness-mindset": ["Coaching", "Community", "Events", "Ernährung"],
  "dev-builders": ["Mentoring", "Netzwerk", "Projekte", "Support"],
  "immobilien-invest": ["Investments", "Netzwerk", "Finanzierung", "Marktanalyse"],
  "gaming-legends": ["Coaching", "Turniere", "Analyse", "Community"],
  "elite-network": ["Netzwerk", "Investments", "Events", "Support"],
};

export const DEMO_LEVEL_BY_SLUG: Record<
  string,
  { level: CommunityLevel; score: number }
> = {
  "rocket-league-ssl": { level: "diamond", score: 72 },
  "business-circle-dach": { level: "platinum", score: 58 },
  "creator-lounge": { level: "gold", score: 46 },
  "creator-hub": { level: "gold", score: 48 },
  "fitness-mindset": { level: "platinum", score: 62 },
  "dev-builders": { level: "silver", score: 32 },
  "immobilien-invest": { level: "diamond", score: 74 },
  "gaming-legends": { level: "gold", score: 45 },
  "elite-network": { level: "elite", score: 88 },
};

export const DEMO_GROUPS_BY_SLUG: Record<string, CommunityGroup[]> = {
  "rocket-league-ssl": [
    {
      id: "demo-rl-g1",
      communityId: "seed-gaming",
      slug: "coaching",
      title: "SSL Coaching",
      description: "1:1 und Gruppen-Coaching",
      sortOrder: 0,
      isPublic: true,
      groupType: "group",
      rating: 4.9,
      reviewCount: 84,
      memberCount: 42,
    },
    {
      id: "demo-rl-g2",
      communityId: "seed-gaming",
      slug: "clips",
      title: "Clips & Highlights",
      description: "Deine besten Plays",
      sortOrder: 1,
      isPublic: true,
      groupType: "group",
      rating: 4.7,
      reviewCount: 120,
    },
    {
      id: "demo-rl-g3",
      communityId: "seed-gaming",
      slug: "turniere",
      title: "Turniere",
      description: "Events & Scrims",
      sortOrder: 2,
      isPublic: true,
      groupType: "group",
    },
    {
      id: "demo-rl-s1",
      communityId: "seed-gaming",
      slug: "einzelcoaching",
      title: "Einzelcoaching 1v1",
      description: "60 Min Replay-Review & Mechanik-Training",
      sortOrder: 3,
      isPublic: true,
      groupType: "service",
      priceCents: 5000,
      currency: "eur",
      rating: 5,
      reviewCount: 28,
    },
  ],
  "business-circle-dach": [
    {
      id: "demo-biz-g1",
      communityId: "seed-business",
      slug: "networking",
      title: "Networking",
      description: "Kontakte & Intros im DACH-Raum",
      sortOrder: 0,
      isPublic: true,
      groupType: "group",
    },
    {
      id: "demo-biz-g2",
      communityId: "seed-business",
      slug: "marketing",
      title: "Marketing",
      description: "Ads, Funnel, Brand",
      sortOrder: 1,
      isPublic: true,
      groupType: "group",
    },
    {
      id: "demo-biz-s1",
      communityId: "seed-business",
      slug: "services",
      title: "Meta Ads Audit",
      description: "30-Min-Audit für E-Commerce",
      sortOrder: 2,
      isPublic: true,
      groupType: "service",
      priceCents: 9900,
      currency: "eur",
      rating: 4.8,
      reviewCount: 15,
    },
  ],
  "creator-lounge": [
    {
      id: "demo-cl-g1",
      communityId: "seed-ent",
      slug: "feed",
      title: "Creator Feed",
      description: "Updates & Ankündigungen",
      sortOrder: 0,
      isPublic: true,
      groupType: "group",
    },
    {
      id: "demo-cl-g2",
      communityId: "seed-ent",
      slug: "collabs",
      title: "Collabs",
      description: "Gemeinsame Projekte",
      sortOrder: 1,
      isPublic: true,
      groupType: "group",
    },
  ],
  "creator-hub": [
    {
      id: "demo-g-1",
      communityId: "mock-1",
      slug: "ankuendigungen",
      title: "Ankündigungen",
      description: "Offizielle Updates vom Team",
      sortOrder: 0,
      isPublic: true,
    },
    {
      id: "demo-g-2",
      communityId: "mock-1",
      slug: "networking",
      title: "Networking",
      description: "Creator untereinander",
      sortOrder: 1,
      isPublic: false,
    },
  ],
  "dev-builders": [
    {
      id: "demo-g-3",
      communityId: "mock-3",
      slug: "showcase",
      title: "Showcase",
      description: "Zeig deine Projekte",
      sortOrder: 0,
      isPublic: true,
    },
  ],
  "gaming-legends": [
    {
      id: "demo-gl-g1",
      communityId: "mock-5",
      slug: "squads",
      title: "Squad Finder",
      description: "Mate suchen & Teams bilden",
      sortOrder: 0,
      isPublic: true,
      groupType: "group",
    },
    {
      id: "demo-gl-s1",
      communityId: "mock-5",
      slug: "coaching-open",
      title: "Open Coaching",
      description: "Kostenlose Einsteiger-Session",
      sortOrder: 1,
      isPublic: true,
      groupType: "service",
      priceCents: 0,
      currency: "eur",
    },
  ],
};

/** Demo-Events (Offline / ohne Supabase) */
export const DEMO_EVENTS_BY_SLUG: Record<string, CommunityEvent[]> = {
  "rocket-league-ssl": [
    {
      id: "demo-ev-rl-1",
      communityId: "seed-gaming",
      communitySlug: "rocket-league-ssl",
      communityTitle: "Rocket League SSL",
      groupId: "demo-rl-g3",
      groupTitle: "Turniere",
      slug: "ssl-community-cup",
      title: "SSL Community Cup",
      description:
        "Monatliches Turnier für verifizierte SSL-Spieler. Replay-Review im Anschluss.",
      startsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      endsAt: null,
      location: "Online · Discord",
      externalUrl: "https://discord.com",
      coverUrl: null,
      isPublic: true,
      isFeatured: true,
      platformType: "discord",
    },
    {
      id: "demo-ev-rl-2",
      communityId: "seed-gaming",
      communitySlug: "rocket-league-ssl",
      communityTitle: "Rocket League SSL",
      groupId: "demo-rl-g1",
      groupTitle: "SSL Coaching",
      slug: "mechanik-bootcamp",
      title: "Mechanik-Bootcamp Live",
      description: "Gruppen-Session: Air Dribble & Flip Resets Grundlagen.",
      startsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      endsAt: null,
      location: "UNZE · Live",
      externalUrl: null,
      coverUrl: null,
      isPublic: true,
      isFeatured: false,
      platformType: "discord",
    },
  ],
  "business-circle-dach": [
    {
      id: "demo-ev-biz-1",
      communityId: "seed-business",
      communitySlug: "business-circle-dach",
      communityTitle: "Business Circle DACH",
      groupId: null,
      groupTitle: null,
      slug: "dach-founder-meetup",
      title: "DACH Founder Meetup",
      description: "Networking-Abend für Gründer:innen im DACH-Raum.",
      startsAt: new Date(Date.now() + 10 * 86400000).toISOString(),
      endsAt: null,
      location: "München · Hybrid",
      externalUrl: null,
      coverUrl: null,
      isPublic: true,
      isFeatured: true,
      platformType: "website",
    },
  ],
  "creator-lounge": [
    {
      id: "demo-ev-cl-1",
      communityId: "seed-ent",
      communitySlug: "creator-lounge",
      communityTitle: "Creator Lounge",
      groupId: "demo-cl-g2",
      groupTitle: "Collabs",
      slug: "collab-pitch-night",
      title: "Collab Pitch Night",
      description: "Kurzpitches für Creator-Kollaborationen — 3 Min pro Slot.",
      startsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      endsAt: null,
      location: "Online",
      externalUrl: null,
      coverUrl: null,
      isPublic: true,
      isFeatured: false,
      platformType: "instagram",
    },
  ],
};

/** Öffentlicher Mitgliederbereich (Demo / Offline) */
export const DEMO_SHOWCASE_BY_SLUG: Record<string, CommunityMemberView[]> = {
  "rocket-league-ssl": [
    {
      id: "demo-m-creator",
      userId: "demo-creator",
      role: "creator",
      roleTitle: null,
      joinedAt: "2024-01-01T00:00:00Z",
      displayName: "Edu UNZE Demo",
      username: "edudemo",
      avatarUrl: null,
      isVerified: true,
    },
    {
      id: "demo-m-mod",
      userId: "demo-mod-1",
      role: "moderator",
      roleTitle: "SSL Coach",
      joinedAt: "2024-02-01T00:00:00Z",
      displayName: "Max SSL",
      username: "maxssl",
      avatarUrl: null,
      isVerified: true,
    },
    {
      id: "demo-m-expert",
      userId: "demo-expert-1",
      role: "expert",
      roleTitle: "Turnierleiter",
      joinedAt: "2024-03-01T00:00:00Z",
      displayName: "Sarah Business",
      username: "sarahbiz",
      avatarUrl: null,
      isVerified: true,
    },
    {
      id: "demo-m-vip",
      userId: "demo-vip-1",
      role: "verified_member",
      roleTitle: "VIP",
      joinedAt: "2024-04-01T00:00:00Z",
      displayName: "Leo Creator",
      username: "leocreator",
      avatarUrl: null,
      isVerified: true,
    },
  ],
  "business-circle-dach": [
    {
      id: "demo-m-biz-creator",
      userId: "demo-biz-creator",
      role: "creator",
      roleTitle: null,
      joinedAt: "2024-01-15T00:00:00Z",
      displayName: "Thomas R.",
      username: "thomas_invest",
      avatarUrl: null,
      isVerified: true,
    },
    {
      id: "demo-m-biz-mod",
      userId: "demo-biz-mod",
      role: "moderator",
      roleTitle: "Deal Scout",
      joinedAt: "2024-02-15T00:00:00Z",
      displayName: "Anna M.",
      username: "anna_m",
      avatarUrl: null,
      isVerified: true,
    },
    {
      id: "demo-m-biz-expert",
      userId: "demo-biz-expert",
      role: "expert",
      roleTitle: "Marketing Lead",
      joinedAt: "2024-03-15T00:00:00Z",
      displayName: "Chris Ads",
      username: "chrisads",
      avatarUrl: null,
      isVerified: true,
    },
    {
      id: "demo-m-biz-vip",
      userId: "demo-biz-vip",
      role: "verified_member",
      roleTitle: "VIP",
      joinedAt: "2024-04-15T00:00:00Z",
      displayName: "Partner Gold",
      username: "partnergold",
      avatarUrl: null,
      isVerified: true,
    },
  ],
  "creator-lounge": [
    {
      id: "demo-m-cl-creator",
      userId: "demo-cl-creator",
      role: "creator",
      roleTitle: null,
      joinedAt: "2024-01-20T00:00:00Z",
      displayName: "UNZE Team",
      username: "unze_official",
      avatarUrl: null,
      isVerified: true,
    },
    {
      id: "demo-m-cl-mod",
      userId: "demo-cl-mod",
      role: "moderator",
      roleTitle: "Community Host",
      joinedAt: "2024-02-20T00:00:00Z",
      displayName: "Mia Host",
      username: "miahost",
      avatarUrl: null,
      isVerified: false,
    },
    {
      id: "demo-m-cl-vip",
      userId: "demo-cl-vip",
      role: "verified_member",
      roleTitle: "VIP Creator",
      joinedAt: "2024-05-01T00:00:00Z",
      displayName: "Leo Creator",
      username: "leocreator",
      avatarUrl: null,
      isVerified: true,
    },
  ],
};

export function getDemoEvents(slug: string): CommunityEvent[] {
  return DEMO_EVENTS_BY_SLUG[slug] ?? [];
}

export function getDemoEvent(
  communitySlug: string,
  eventIdOrSlug: string,
): CommunityEvent | null {
  const events = getDemoEvents(communitySlug);
  return (
    events.find((e) => e.id === eventIdOrSlug || e.slug === eventIdOrSlug) ?? null
  );
}

export function getDemoAccess(slug: string): CommunityAccessConfig {
  const override = DEMO_ACCESS_BY_SLUG[slug] ?? {};
  return { ...BASE_ACCESS, ...override };
}

export function getDemoQuestions(slug: string): JoinQuestion[] {
  return DEMO_QUESTIONS_BY_SLUG[slug] ?? [];
}

export function getDemoGroups(slug: string): CommunityGroup[] {
  return DEMO_GROUPS_BY_SLUG[slug] ?? [];
}

export function getDemoCreator(creatorId: string): DemoCreator | undefined {
  return DEMO_CREATORS.find((c) => c.id === creatorId);
}

export function getDemoShowcaseMembers(slug: string): CommunityMemberView[] {
  return DEMO_SHOWCASE_BY_SLUG[slug] ?? [];
}

export function enrichMockCommunity(community: Community): Community {
  const access = getDemoAccess(community.slug);
  const creator = DEMO_CREATORS.find((c) => c.id === community.creatorId);
  const levelMeta = DEMO_LEVEL_BY_SLUG[community.slug];
  const focusTags =
    community.focusTags?.length > 0
      ? community.focusTags
      : (DEMO_FOCUS_BY_SLUG[community.slug] ?? []);

  return {
    ...community,
    focusTags,
    communityLevel: levelMeta?.level ?? community.communityLevel ?? "bronze",
    levelScore: levelMeta?.score ?? community.levelScore ?? 0,
    showMemberArea: community.showMemberArea ?? true,
    access,
    monetizationEnabled:
      community.visibility === "premium" || access.paidJoinRequired,
    groupCount: getDemoGroups(community.slug).length,
    creatorAvatarUrl: null,
    creatorUsername: creator?.username,
    creatorIsVerified: creator?.isVerified,
    createdAt: community.createdAt ?? "2024-05-17T10:00:00Z",
    region: community.region ?? "DACH",
    language: community.language ?? "Deutsch",
    viewCount: community.viewCount ?? Math.round(community.memberCount * 12.4),
    priceLabel: community.priceLabel ?? null,
    joinAccess: {
      canJoinDirectly: access.joinApprovalMode === "auto_accept",
      requiresApplication:
        access.joinApprovalMode === "manual_review" ||
        access.joinApprovalMode === "waitlist",
      requiresInvite: access.joinApprovalMode === "invite_required",
      blockReason:
        access.accessStatus === "archived"
          ? "Community archiviert"
          : access.admissionsPaused
            ? "Weitere Bewerbungen aktuell pausiert"
            : access.accessStatus === "closed"
              ? "Community aktuell geschlossen"
              : null,
      existingApplication: null,
      waitlistAtCapacity:
        access.memberLimit !== null &&
        community.memberCount >= access.memberLimit &&
        access.waitlistEnabled,
      userRestriction: null,
    },
  };
}

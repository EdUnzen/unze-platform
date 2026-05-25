import type { CommunityAccessConfig, JoinQuestion } from "@/types/access";
import type { Community, CommunityGroup } from "@/types/community";

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

export const DEMO_GROUPS_BY_SLUG: Record<string, CommunityGroup[]> = {
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
};

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

export function enrichMockCommunity(community: Community): Community {
  const access = getDemoAccess(community.slug);
  const creator = DEMO_CREATORS.find((c) => c.id === community.creatorId);

  return {
    ...community,
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

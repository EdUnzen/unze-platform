import type { NotificationItem } from "@/types/governance";

/** Seed-Benachrichtigungen für Demo/Beta ohne Supabase */
export const SEED_DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "demo-seed-1",
    userId: "demo-user",
    type: "membership.application_received",
    category: "application",
    title: "Neue Bewerbung",
    body: "Jemand möchte Creator Hub beitreten — Antworten prüfen.",
    data: { communitySlug: "creator-hub", communityId: "mock-1", category: "application" },
    readAt: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-seed-2",
    userId: "demo-user",
    type: "membership.application_accepted",
    category: "application",
    title: "Antrag angenommen",
    body: "Willkommen bei Gaming Legends DACH!",
    data: { communitySlug: "gaming-legends", communityId: "mock-5", category: "application" },
    readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-seed-3",
    userId: "demo-user",
    type: "membership.application_waitlisted",
    category: "application",
    title: "Warteliste",
    body: "Dev Builders: Du stehst auf der Warteliste — wir melden uns.",
    data: { communitySlug: "dev-builders", communityId: "mock-3", category: "application" },
    readAt: null,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-seed-4",
    userId: "demo-user",
    type: "invite.created",
    category: "invite",
    title: "Einladung erhalten",
    body: "Du wurdest zu Elite Business Network eingeladen.",
    data: { communitySlug: "elite-network", code: "DEMO-ELITE", category: "invite" },
    readAt: null,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-seed-5",
    userId: "demo-user",
    type: "verification.approved",
    category: "system",
    title: "Verifikation bestätigt",
    body: "Dein Creator-Profil wurde verifiziert.",
    data: { category: "system" },
    readAt: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-seed-6",
    userId: "demo-user",
    type: "community.lifecycle_changed",
    category: "community_event",
    title: "Community geschlossen",
    body: "Dev Builders: Aufnahme ist vorübergehend pausiert.",
    data: { communitySlug: "dev-builders", communityId: "mock-3", category: "community_event" },
    readAt: null,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export function getDemoNotificationsForUser(_userId: string): NotificationItem[] {
  return SEED_DEMO_NOTIFICATIONS;
}

export function countUnreadDemoNotifications(): number {
  return SEED_DEMO_NOTIFICATIONS.filter((n) => !n.readAt).length;
}

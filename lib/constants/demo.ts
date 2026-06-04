/**
 * Demo-/Testdaten — via `npm run seed:demo` in Supabase (echte DB, gekennzeichnet)
 *
 * WICHTIG: Demo-Communities, -Gruppen, -Services, -Events und -Posts nicht löschen
 * ohne ausdrückliche Freigabe. Seed aktualisiert/migriert bestehende Demo-Daten.
 * Vollständiger Reset nur mit UNZE_DEMO_FORCE_RESET=true.
 */

/** Supabase-Seed (npm run seed:demo) */
export const DEMO_COMMUNITY_SLUGS = [
  "rocket-league-ssl",
  "business-circle-dach",
  "creator-lounge",
] as const;

/** Zusätzliche Mock-Communities (Offline / Anreicherung) */
export const MOCK_COMMUNITY_SLUGS = [
  "creator-hub",
  "fitness-mindset",
  "dev-builders",
  "immobilien-invest",
  "gaming-legends",
  "elite-network",
] as const;

export const ALL_DEMO_COMMUNITY_SLUGS = [
  ...DEMO_COMMUNITY_SLUGS,
  ...MOCK_COMMUNITY_SLUGS,
] as const;

export const DEMO_CREATOR_EMAIL = "edubek89@icloud.com";

export const DEMO_MEMBER_EMAILS = [
  "demo.member1@unze.local",
  "demo.member2@unze.local",
  "demo.member3@unze.local",
  "demo.applicant@unze.local",
] as const;

export function isDemoCommunitySlug(slug: string): boolean {
  return (ALL_DEMO_COMMUNITY_SLUGS as readonly string[]).includes(slug);
}

export function isSeededDemoCommunitySlug(slug: string): boolean {
  return (DEMO_COMMUNITY_SLUGS as readonly string[]).includes(slug);
}

export function isDemoEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  if (lower === DEMO_CREATOR_EMAIL.toLowerCase()) return true;
  return DEMO_MEMBER_EMAILS.some((e) => e.toLowerCase() === lower);
}

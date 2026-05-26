/** Demo-/Testdaten — via `npm run seed:demo` in Supabase (echte DB, gekennzeichnet) */

export const DEMO_COMMUNITY_SLUGS = [
  "rocket-league-ssl",
  "business-circle-dach",
  "creator-lounge",
] as const;

export const DEMO_CREATOR_EMAIL = "edubek89@icloud.com";

export const DEMO_MEMBER_EMAILS = [
  "demo.member1@unze.local",
  "demo.member2@unze.local",
  "demo.member3@unze.local",
  "demo.applicant@unze.local",
] as const;

export function isDemoCommunitySlug(slug: string): boolean {
  return (DEMO_COMMUNITY_SLUGS as readonly string[]).includes(slug);
}

export function isDemoEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  if (lower === DEMO_CREATOR_EMAIL.toLowerCase()) return true;
  return DEMO_MEMBER_EMAILS.some((e) => e.toLowerCase() === lower);
}

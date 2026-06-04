/** Nutzerfreundliche Meldungen — technische Details nur in Server-Logs. */

export const COMMUNITY_CREATE_GENERIC =
  "Die Community konnte aktuell nicht erstellt werden. Bitte erneut versuchen.";

export function toUserCommunityCreateError(technical?: string | null): string {
  if (!technical) return COMMUNITY_CREATE_GENERIC;

  const lower = technical.toLowerCase();

  if (lower.includes("nicht angemeldet") || lower.includes("anmelden")) {
    return "Bitte melde dich an, um eine Community zu erstellen.";
  }
  if (lower.includes("bereits vergeben") || lower.includes("slug")) {
    return "Dieser Community-Name ist bereits vergeben. Bitte wähle einen anderen Titel.";
  }
  if (lower.includes("titel ist erforderlich")) {
    return "Bitte gib einen Titel für deine Community ein.";
  }
  if (
    lower.includes("creator_id") ||
    lower.includes("foreign key") ||
    lower.includes("profiles")
  ) {
    return "Dein Profil ist noch nicht vollständig angelegt. Bitte abmelden, erneut anmelden und die Community erneut erstellen.";
  }
  if (lower.includes("creator-mitgliedschaft") || lower.includes("community_members")) {
    return "Die Community wurde teilweise angelegt. Bitte im Dashboard prüfen oder erneut versuchen.";
  }

  return COMMUNITY_CREATE_GENERIC;
}

export function logCommunityCreateError(technical: string, context?: Record<string, unknown>) {
  console.error("[community.create]", technical, context ?? "");
}

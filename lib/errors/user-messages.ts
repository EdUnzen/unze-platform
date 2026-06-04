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

  return COMMUNITY_CREATE_GENERIC;
}

export function logCommunityCreateError(technical: string, context?: Record<string, unknown>) {
  console.error("[community.create]", technical, context ?? "");
}

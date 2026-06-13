import { ACTION_MESSAGES } from "@/lib/constants/action-messages";

/** Postgres-/Supabase-Fehler in verständliche Nutzertexte übersetzen */
export function mapDbError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("community_members_community_id_user_id_key") ||
    lower.includes("duplicate key") && lower.includes("community_members")
  ) {
    return ACTION_MESSAGES.community.alreadyMember;
  }

  if (lower.includes("mitgliederlimit")) {
    return "Mitgliederlimit erreicht.";
  }

  if (lower.includes("keine berechtigung")) {
    return "Keine Berechtigung für diese Aktion.";
  }

  if (lower.includes("ticket bereits verwendet")) {
    return "Dieses Ticket wurde bereits eingecheckt.";
  }

  if (lower.includes("ticket nicht gefunden")) {
    return "Ticket nicht gefunden.";
  }

  if (lower.includes("network") || lower.includes("fetch failed")) {
    return "Verbindungsfehler — bitte erneut versuchen.";
  }

  return "Die Aktion konnte nicht abgeschlossen werden. Bitte erneut versuchen.";
}

export function isDuplicateMemberError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("community_members_community_id_user_id_key") ||
    (lower.includes("duplicate key") && lower.includes("community_members"))
  );
}

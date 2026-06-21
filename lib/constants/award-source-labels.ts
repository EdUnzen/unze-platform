/** Labels for user_credentials.source_type in profile history. */
export const AWARD_SOURCE_LABELS: Record<string, string> = {
  manual_grant: "Manuelle Vergabe",
  event_check_in: "Event Check-in",
  legacy_badge: "Legacy-Badge",
  collection_completion: "Sammlung abgeschlossen",
};

export function getAwardSourceLabel(sourceType: string | null | undefined): string | null {
  if (!sourceType) return null;
  return AWARD_SOURCE_LABELS[sourceType] ?? null;
}

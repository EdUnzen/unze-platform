import { createClient } from "@/lib/supabase/server";

/** Auto-Hinweise aus Event-Check-in Konfiguration */
export async function fetchCredentialEarnHintsFromEvents(
  communityId: string,
  credentialIds: string[],
): Promise<Record<string, string>> {
  if (credentialIds.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("community_events")
    .select("title, check_in_credential_id")
    .eq("community_id", communityId)
    .in("check_in_credential_id", credentialIds)
    .not("check_in_credential_id", "is", null);

  if (error || !data?.length) return {};

  const hints: Record<string, string> = {};
  for (const row of data) {
    const credId = row.check_in_credential_id as string;
    const title = row.title as string;
    if (!credId || hints[credId]) continue;
    hints[credId] = `Teilnahme am Event „${title}" (Check-in)`;
  }

  return hints;
}

export function resolveEarnHint(
  credentialId: string,
  manualHint: string | null | undefined,
  autoHints: Record<string, string>,
): string | null {
  const manual = manualHint?.trim();
  if (manual) return manual;
  return autoHints[credentialId] ?? null;
}

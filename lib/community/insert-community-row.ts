import type { SupabaseClient } from "@supabase/supabase-js";

const COMMUNITY_SELECT = `
  *,
  creator:profiles!communities_creator_id_fkey (
    id,
    display_name,
    username,
    avatar_url,
    is_verified
  )
`;

export type CommunityInsertPayload = Record<string, unknown>;

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = error.message ?? "";
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    msg.includes("focus_tags") ||
    msg.includes("banner_url") ||
    msg.includes("does not exist")
  );
}

export function isAuthOrRlsError(error: { message?: string } | null): boolean {
  if (!error?.message) return false;
  const m = error.message.toLowerCase();
  return (
    m.includes("row-level security") ||
    m.includes("permission denied") ||
    m.includes("jwt") ||
    m.includes("not authenticated") ||
    m.includes("violates")
  );
}

/** Varianten ohne fehlende Spalten (focus_tags, banner_url). */
export function buildCommunityInsertVariants(
  base: CommunityInsertPayload,
  withFocus: CommunityInsertPayload,
): CommunityInsertPayload[] {
  const seen = new Set<string>();
  const variants: CommunityInsertPayload[] = [];
  for (const p of [withFocus, base, { ...base, banner_url: undefined }, { ...withFocus, focus_tags: undefined }]) {
    const key = JSON.stringify(p);
    if (seen.has(key)) continue;
    seen.add(key);
    variants.push(p);
  }
  return variants;
}

export async function insertCommunityRow(
  client: SupabaseClient,
  variants: CommunityInsertPayload[],
): Promise<{
  data: Record<string, unknown> | null;
  error: { message: string; code?: string } | null;
}> {
  let lastError: { message: string; code?: string } | null = null;

  for (const payload of variants) {
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined),
    );

    const { data, error } = await client
      .from("communities")
      .insert(cleaned)
      .select(COMMUNITY_SELECT)
      .single();

    if (!error && data) {
      return { data: data as Record<string, unknown>, error: null };
    }

    lastError = error ? { message: error.message, code: error.code } : { message: "Unbekannter Fehler" };

    if (!isMissingColumnError(error)) {
      return { data: null, error: lastError };
    }
  }

  return { data: null, error: lastError };
}

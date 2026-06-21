import { createClient } from "@/lib/supabase/server";
import type { BadgeType } from "@/types/database";

export function mapValidityToBadgeType(validityMode: string | null): BadgeType {
  if (validityMode === "expires_at" || validityMode === "renewal") return "temporary";
  return "permanent";
}

export async function grantCredentialInDb(input: {
  credentialId: string;
  userId: string;
  grantedBy: string;
  sourceType?: string;
  sourceId?: string;
}): Promise<{ error: string | null; grantId?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase.rpc("grant_credential", {
    p_credential_id: input.credentialId,
    p_user_id: input.userId,
    p_granted_by: input.grantedBy,
    p_source_type: input.sourceType ?? null,
    p_source_id: input.sourceId ?? null,
    p_visibility: "public",
  });

  if (error) return { error: error.message };
  return { error: null, grantId: data as string | undefined };
}

export async function updateEventCheckInRewardsInDb(input: {
  eventId: string;
  checkInCredentialId: string | null;
  checkInGroupId: string | null;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("community_events")
    .update({
      check_in_credential_id: input.checkInCredentialId,
      check_in_group_id: input.checkInGroupId,
    })
    .eq("id", input.eventId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function userHasGroupUnlockInDb(
  userId: string,
  groupId: string,
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { data, error } = await supabase.rpc("user_has_group_unlock", {
    p_user_id: userId,
    p_group_id: groupId,
  });

  if (error) {
    console.error("[credential.repository] group unlock:", error.message);
    return false;
  }

  return Boolean(data);
}

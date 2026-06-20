import { createClient } from "@/lib/supabase/server";
import type {
  RequirementResourceType,
  UnzeVerifyResult,
  UnzeVerifyResultCode,
} from "@/types/requirement-engine";

export async function fetchUnzePublicIdForUser(
  userId: string,
): Promise<{ token: string | null; error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { token: null, error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("profiles")
    .select("unze_public_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) return { token: null, error: error.message };
  return { token: (data?.unze_public_id as string) ?? null, error: null };
}

export async function verifyUnzeIdInDb(
  token: string,
  resourceType: RequirementResourceType,
  resourceId: string,
  actorId: string,
): Promise<{ data: UnzeVerifyResult | null; error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase.rpc("verify_unze_id", {
    p_token: token.trim(),
    p_resource_type: resourceType,
    p_resource_id: resourceId,
    p_actor_id: actorId,
  });

  if (error) return { data: null, error: error.message };
  if (!data || typeof data !== "object") {
    return { data: null, error: "Ungültige Verify-Antwort" };
  }

  const row = data as Record<string, unknown>;
  return {
    data: {
      allowed: Boolean(row.allowed),
      resultCode: String(row.result_code ?? "denied") as UnzeVerifyResultCode,
      severity: row.severity as UnzeVerifyResult["severity"],
    },
    error: null,
  };
}

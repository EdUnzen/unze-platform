import { createClient } from "@/lib/supabase/server";
import type {
  RequirementEvaluation,
  RequirementResourceType,
} from "@/types/requirement-engine";

function mapEvaluation(raw: Record<string, unknown>): RequirementEvaluation {
  const missingRaw = raw.missing;
  const missing = Array.isArray(missingRaw)
    ? missingRaw.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          predicate: String(row.predicate ?? "unknown"),
          label: String(row.label ?? "Voraussetzung"),
        };
      })
    : [];

  const satisfiedRaw = raw.satisfied;
  const satisfied = Array.isArray(satisfiedRaw)
    ? satisfiedRaw.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          predicate: String(row.predicate ?? "unknown"),
          label: String(row.label ?? "Voraussetzung"),
        };
      })
    : [];

  return {
    fulfilled: Boolean(raw.fulfilled),
    severity: (raw.severity as RequirementEvaluation["severity"]) ?? "none",
    missing,
    satisfied,
    phase: typeof raw.phase === "number" ? raw.phase : undefined,
    note: typeof raw.note === "string" ? raw.note : undefined,
  };
}

export async function evaluateRequirementsInDb(
  userId: string,
  resourceType: RequirementResourceType,
  resourceId: string,
): Promise<{ data: RequirementEvaluation | null; error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase.rpc("evaluate_requirements", {
    p_user_id: userId,
    p_resource_type: resourceType,
    p_resource_id: resourceId,
  });

  if (error) return { data: null, error: error.message };
  if (!data || typeof data !== "object") {
    return { data: null, error: "Ungültige Engine-Antwort" };
  }

  return { data: mapEvaluation(data as Record<string, unknown>), error: null };
}

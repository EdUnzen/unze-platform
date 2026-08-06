import { evaluateRequirementsInDb } from "@/services/requirements/requirement-engine.repository";
import type {
  RequirementEvaluation,
  RequirementResourceType,
} from "@/types/requirement-engine";

/**
 * Central Requirement-Engine entry (UNZE-005).
 * Phase 1: membership, premium, verification, role, ticket, credential predicates.
 */
export async function evaluateRequirements(
  userId: string,
  resourceType: RequirementResourceType,
  resourceId: string,
): Promise<{ data: RequirementEvaluation | null; error: string | null }> {
  if (!userId?.trim()) {
    return {
      data: {
        fulfilled: false,
        severity: "required",
        missing: [{ predicate: "identity", label: "Nutzer unbekannt" }],
      },
      error: null,
    };
  }

  return evaluateRequirementsInDb(userId, resourceType, resourceId);
}

/** UI helper — pre-application check. */
export async function checkRequirements(
  userId: string,
  resourceType: RequirementResourceType,
  resourceId: string,
) {
  return evaluateRequirements(userId, resourceType, resourceId);
}

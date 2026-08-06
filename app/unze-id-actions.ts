"use server";

import { verifyUnzeId } from "@/services/unze-id/unze-id.service";
import type { RequirementResourceType } from "@/types/requirement-engine";

export async function verifyUnzeIdAction(
  token: string,
  resourceType: RequirementResourceType,
  resourceId: string,
) {
  if (!token?.trim()) return { error: "UNZE-ID fehlt" };
  if (!resourceId?.trim()) return { error: "Ressource fehlt" };

  const result = await verifyUnzeId(token, resourceType, resourceId);
  if (result.error) return { error: result.error };
  if (!result.data) return { error: "Prüfung fehlgeschlagen" };

  return { success: true, ...result.data };
}

import { getCurrentUser } from "@/services/auth/auth.service";
import {
  fetchUnzePublicIdForUser,
  verifyUnzeIdInDb,
} from "@/services/unze-id/unze-id.repository";
import type { RequirementResourceType } from "@/types/requirement-engine";

import { UNZE_ID_PAYLOAD_PREFIX } from "@/lib/constants/unze-id";

export function formatUnzeIdPayload(token: string): string {
  return `${UNZE_ID_PAYLOAD_PREFIX}${token}`;
}

export async function getUnzeIdForCurrentUser() {
  const user = await getCurrentUser();
  if (!user) return { token: null, payload: null, error: "Nicht angemeldet" };

  const result = await fetchUnzePublicIdForUser(user.id);
  if (result.error || !result.token) {
    return { token: null, payload: null, error: result.error ?? "UNZE-ID nicht gefunden" };
  }

  return {
    token: result.token,
    payload: formatUnzeIdPayload(result.token),
    error: null,
  };
}

/**
 * Scanner-side verify (UNZE-004 + UNZE-005).
 * Phase 0: identity resolution + audit + stub evaluation.
 */
export async function verifyUnzeId(
  token: string,
  resourceType: RequirementResourceType,
  resourceId: string,
) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Nicht angemeldet" };

  return verifyUnzeIdInDb(token, resourceType, resourceId, user.id);
}

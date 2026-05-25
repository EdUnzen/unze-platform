"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getProofsForModerator } from "@/services/storage/proof.service";

export async function loadApplicationProofsAction(
  slug: string,
  applicationId: string,
  applicantUserId: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet", proofs: [] };

  const { community, canAccess } = await getDashboardCommunityAccess(
    slug,
    user.id,
  );
  if (!canAccess || !community) {
    return { error: "Kein Zugriff", proofs: [] };
  }

  const result = await getProofsForModerator(
    applicationId,
    applicantUserId,
    user.id,
    community.viewerRole,
  );

  return { error: result.error, proofs: result.proofs };
}

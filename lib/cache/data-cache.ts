import { unstable_cache } from "next/cache";
import {
  fetchCommunitiesFromDb,
  fetchCommunityBySlugFromDb,
} from "@/services/community/community.repository";
import { countPendingApplicationsFromDb } from "@/services/access/access.repository";
import { countPendingReportsFromDb } from "@/services/governance/report.repository";

const DISCOVER_LIST_KEY = "discover-list-v1";

/** Öffentliche Discover-Liste (ohne Viewer-Kontext). */
export const getCachedDiscoverList = unstable_cache(
  async () => fetchCommunitiesFromDb({ discover: true, limit: 50 }),
  [DISCOVER_LIST_KEY],
  { revalidate: 60, tags: ["discover"] },
);

export function getCachedCommunityBySlug(
  slug: string,
  userId: string | null,
  inviteCode?: string | null,
) {
  const inviteKey = inviteCode?.trim() || "_";
  return unstable_cache(
    async () => fetchCommunityBySlugFromDb(slug, userId, inviteCode),
    ["community-by-slug", slug, userId ?? "anon", inviteKey],
    { revalidate: 30, tags: [`community:${slug}`] },
  )();
}

export function getCachedDashboardPendingCounts(communityId: string) {
  return unstable_cache(
    async () => {
      const [applications, reports] = await Promise.all([
        countPendingApplicationsFromDb(communityId),
        countPendingReportsFromDb(communityId),
      ]);
      return { applications, reports };
    },
    ["dashboard-pending", communityId],
    { revalidate: 30, tags: [`dashboard-pending:${communityId}`] },
  )();
}

import { publicJsonResponse } from "@/lib/marketing/public-api";
import {
  getPublicDirectoryCommunities,
  getPublicDirectoryStats,
} from "@/lib/marketing/public-directory.service";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 48), 100);
  const includeStats = searchParams.get("stats") === "1";
  const search = searchParams.get("search")?.trim() ?? "";

  if (search) {
    const { searchPublicDirectoryCommunities } = await import(
      "@/lib/marketing/public-directory.service"
    );
    const communities = await searchPublicDirectoryCommunities(search, limit);
    return publicJsonResponse({ communities, query: search });
  }

  const communities = await getPublicDirectoryCommunities(limit);
  if (!includeStats) {
    return publicJsonResponse({ communities });
  }

  const stats = await getPublicDirectoryStats();
  return publicJsonResponse({ communities, stats });
}

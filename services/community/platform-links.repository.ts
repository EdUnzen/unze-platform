import { createClient } from "@/lib/supabase/server";
import type { PlatformType } from "@/types/community";

export type CommunityPlatformLink = {
  id: string;
  platformType: PlatformType;
  url: string;
  label: string | null;
  sortOrder: number;
};

export async function fetchCommunityPlatformLinksFromDb(
  communityId: string,
): Promise<CommunityPlatformLink[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_platform_links")
    .select("id, platform_type, url, label, sort_order")
    .eq("community_id", communityId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[platform-links] fetch:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    platformType: row.platform_type as PlatformType,
    url: row.url as string,
    label: (row.label as string) ?? null,
    sortOrder: row.sort_order as number,
  }));
}

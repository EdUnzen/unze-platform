import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export type PlatformMigrationDetails = {
  featureFlagsTable: boolean;
  feedPostsFlag: boolean;
  communityEventsTable: boolean;
  groupTypeColumn: boolean;
  communityReviewsTable: boolean;
  groupReviewsTable: boolean;
};

export type PlatformMigrationStatus = {
  coreSchema: boolean;
  /** Migration 021 — platform_feature_flags + Feed-RLS */
  migration021: boolean;
  /** Migration 022 — events, group_type, reviews, group follow */
  migration022: boolean;
  details: PlatformMigrationDetails;
};

function all021(details: PlatformMigrationDetails): boolean {
  return details.featureFlagsTable && details.feedPostsFlag;
}

function all022(details: PlatformMigrationDetails): boolean {
  return (
    details.communityEventsTable &&
    details.groupTypeColumn &&
    details.communityReviewsTable &&
    details.groupReviewsTable
  );
}

async function probePlatformMigrationStatus(): Promise<PlatformMigrationStatus> {
  const supabase = await createClient();
  const emptyDetails: PlatformMigrationDetails = {
    featureFlagsTable: false,
    feedPostsFlag: false,
    communityEventsTable: false,
    groupTypeColumn: false,
    communityReviewsTable: false,
    groupReviewsTable: false,
  };
  const empty: PlatformMigrationStatus = {
    coreSchema: false,
    migration021: false,
    migration022: false,
    details: emptyDetails,
  };
  if (!supabase) return empty;

  const { error: coreError } = await supabase
    .from("communities")
    .select("id")
    .limit(1);

  if (coreError) return empty;

  const [flagsTable, feedFlag, eventsTable, groupsType, communityReviews, groupReviews] =
    await Promise.all([
      supabase.from("platform_feature_flags").select("key").limit(1),
      supabase
        .from("platform_feature_flags")
        .select("key")
        .eq("key", "feed_posts")
        .maybeSingle(),
      supabase.from("community_events").select("id").limit(1),
      supabase.from("community_groups").select("group_type").limit(1),
      supabase.from("community_reviews").select("id").limit(1),
      supabase.from("group_reviews").select("id").limit(1),
    ]);

  const details: PlatformMigrationDetails = {
    featureFlagsTable: !flagsTable.error,
    feedPostsFlag: !feedFlag.error && Boolean(feedFlag.data),
    communityEventsTable: !eventsTable.error,
    groupTypeColumn: !groupsType.error,
    communityReviewsTable: !communityReviews.error,
    groupReviewsTable: !groupReviews.error,
  };

  return {
    coreSchema: true,
    migration021: all021(details),
    migration022: all022(details),
    details,
  };
}

const getCachedPlatformMigrationStatus = unstable_cache(
  probePlatformMigrationStatus,
  ["unze-platform-migration-status"],
  { revalidate: 60 },
);

/** Prüft ob Kern- und Phase-1-Migrationen (021/022) aktiv sind — 60s Cache */
export async function getPlatformMigrationStatus(): Promise<PlatformMigrationStatus> {
  return getCachedPlatformMigrationStatus();
}

export function isPhase1MigrationsComplete(
  status: PlatformMigrationStatus,
): boolean {
  return status.migration021 && status.migration022;
}

/** @deprecated Nutze getPlatformMigrationStatus */
export async function isPlatformSchemaReady(): Promise<boolean> {
  const status = await getPlatformMigrationStatus();
  return status.coreSchema;
}

import { createClient } from "@/lib/supabase/server";

export type PlatformMigrationStatus = {
  coreSchema: boolean;
  featureFlags: boolean;
  communityEvents: boolean;
  groupExtensions: boolean;
};

/** Prüft ob Kern- und Phase-1-Migrationen (021/022) aktiv sind */
export async function getPlatformMigrationStatus(): Promise<PlatformMigrationStatus> {
  const supabase = await createClient();
  const empty: PlatformMigrationStatus = {
    coreSchema: false,
    featureFlags: false,
    communityEvents: false,
    groupExtensions: false,
  };
  if (!supabase) return empty;

  const { error: coreError } = await supabase
    .from("communities")
    .select("id")
    .limit(1);

  if (coreError) return empty;

  const [flags, events, groups] = await Promise.all([
    supabase.from("platform_feature_flags").select("key").limit(1),
    supabase.from("community_events").select("id").limit(1),
    supabase.from("community_groups").select("group_type").limit(1),
  ]);

  return {
    coreSchema: true,
    featureFlags: !flags.error,
    communityEvents: !events.error,
    groupExtensions: !groups.error,
  };
}

/** @deprecated Nutze getPlatformMigrationStatus */
export async function isPlatformSchemaReady(): Promise<boolean> {
  const status = await getPlatformMigrationStatus();
  return status.coreSchema;
}

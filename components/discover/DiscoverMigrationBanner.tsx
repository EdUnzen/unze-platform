import {
  getPlatformMigrationStatus,
  isPhase1MigrationsComplete,
  type PlatformMigrationStatus,
} from "@/services/platform/schema.service";

interface DiscoverMigrationBannerProps {
  status?: PlatformMigrationStatus;
}

/** Schema-Hinweise — optional mit vorgeladenem Status (ein Probe-Call pro Request). */
export async function DiscoverMigrationBanner({ status }: DiscoverMigrationBannerProps = {}) {
  const migrationStatus = status ?? (await getPlatformMigrationStatus());
  const schemaReady = migrationStatus.coreSchema;
  const migrationsComplete = isPhase1MigrationsComplete(migrationStatus);

  if (!schemaReady) {
    return (
      <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">Datenbank-Schema fehlt in Supabase</p>
        <p className="mt-1">
          {process.env.VERCEL ? (
            <>
              Prüfe in Vercel → Settings → Environment Variables:{" "}
              <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> und{" "}
              <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              . Danach Redeploy. Schema:{" "}
              <code className="rounded bg-amber-100 px-1">database/BUNDLE_all_migrations.sql</code>
            </>
          ) : (
            <>
              Führe{" "}
              <code className="rounded bg-amber-100 px-1">database/BUNDLE_all_migrations.sql</code> im
              Supabase SQL Editor aus, dann{" "}
              <code className="rounded bg-amber-100 px-1">npm run seed:demo</code>.
            </>
          )}
        </p>
      </div>
    );
  }

  if (migrationsComplete) return null;

  const missing021 = !migrationStatus.migration021;
  const missing022 = !migrationStatus.migration022;

  return (
    <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">Phase-1-Migrationen fehlen teilweise</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        {missing021 && (
          <li>
            <code className="rounded bg-amber-100 px-1">021_platform_feature_flags.sql</code> — Feature-Flags
            {!migrationStatus.details.featureFlagsTable && " (Tabelle fehlt)"}
            {migrationStatus.details.featureFlagsTable &&
              !migrationStatus.details.feedPostsFlag &&
              " (feed_posts-Flag fehlt)"}
          </li>
        )}
        {missing022 && (
          <li>
            <code className="rounded bg-amber-100 px-1">022_platform_core_entities.sql</code> — Events,
            Gruppen-Typen, Bewertungen
            {!migrationStatus.details.communityEventsTable && " · community_events fehlt"}
            {!migrationStatus.details.groupTypeColumn && " · group_type fehlt"}
            {!migrationStatus.details.communityReviewsTable && " · community_reviews fehlt"}
            {!migrationStatus.details.groupReviewsTable && " · group_reviews fehlt"}
          </li>
        )}
      </ul>
      <p className="mt-2 text-xs">
        Prüfung: <code className="rounded bg-amber-100 px-1">npm run check:migrations</code>
      </p>
    </div>
  );
}

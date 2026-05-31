import { DiscoverTabs } from "@/components/discover/DiscoverTabs";
import { DiscoverContent } from "@/components/discover/DiscoverContent";
import {
  DiscoverCategoryFilter,
  DiscoverSearchBar,
} from "@/components/discover/DiscoverFilters";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getPlatformMigrationStatus,
  isPhase1MigrationsComplete,
} from "@/services/platform/schema.service";
import { Suspense } from "react";

interface DiscoverPageProps {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    category?: string;
  }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = await searchParams;
  const tab = params.tab ?? "communities";
  const query = params.q ?? "";
  const category = params.category ?? "Alle";
  const migrationStatus = await getPlatformMigrationStatus();
  const schemaReady = migrationStatus.coreSchema;
  const migrationsComplete = isPhase1MigrationsComplete(migrationStatus);

  const missing021 = schemaReady && !migrationStatus.migration021;
  const missing022 = schemaReady && !migrationStatus.migration022;

  return (
    <div className="page-padding">
      <PageHeader
        title="Discover"
        subtitle="Communities, Gruppen, Events und Dienstleistungen entdecken"
      />

      {!schemaReady ? (
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
      ) : !migrationsComplete ? (
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
      ) : null}

      <Suspense fallback={<div className="mb-4 h-12 animate-pulse rounded-2xl bg-unze-border/50" />}>
        <DiscoverSearchBar />
      </Suspense>

      {tab !== "events" && tab !== "services" && (
        <Suspense fallback={null}>
          <DiscoverCategoryFilter />
        </Suspense>
      )}

      <Suspense fallback={<div className="mb-6 h-11 animate-pulse rounded-2xl bg-unze-border/50" />}>
        <DiscoverTabs />
      </Suspense>

      <DiscoverContent
        tab={tab}
        query={query}
        category={category}
        migrationDetails={migrationStatus.details}
      />
    </div>
  );
}

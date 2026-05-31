import { DiscoverTabs } from "@/components/discover/DiscoverTabs";
import { DiscoverContent } from "@/components/discover/DiscoverContent";
import {
  DiscoverCategoryFilter,
  DiscoverSearchBar,
} from "@/components/discover/DiscoverFilters";
import { PageHeader } from "@/components/layout/PageHeader";
import { isPlatformSchemaReady } from "@/services/platform/schema.service";
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
  const schemaReady = await isPlatformSchemaReady();

  return (
    <div className="page-padding">
      <PageHeader
        title="Discover"
        subtitle="Communities, Creator, Feed und Trends entdecken"
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
      ) : (
        <div className="mb-4 rounded-2xl border border-unze-green/25 bg-unze-green-muted/20 px-4 py-3 text-sm text-unze-green-dark">
          <p className="font-semibold">Live-Plattform · Supabase verbunden</p>
          <p className="mt-1 text-unze-ink-secondary">
            Communities mit <span className="font-semibold text-amber-800">Demo</span>-Badge sind
            Testdaten aus der Demo-Seed-Umgebung — echte Registrierung und Creator-Communities
            funktionieren parallel.
          </p>
        </div>
      )}

      <Suspense fallback={<div className="mb-4 h-12 animate-pulse rounded-2xl bg-unze-border/50" />}>
        <DiscoverSearchBar />
      </Suspense>

      {tab !== "creators" && tab !== "feed" && tab !== "groups" && (
        <Suspense fallback={null}>
          <DiscoverCategoryFilter />
        </Suspense>
      )}

      <Suspense fallback={<div className="mb-6 h-11 animate-pulse rounded-2xl bg-unze-border/50" />}>
        <DiscoverTabs />
      </Suspense>

      <DiscoverContent tab={tab} query={query} category={category} />
    </div>
  );
}

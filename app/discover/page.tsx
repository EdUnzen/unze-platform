import { DiscoverContent } from "@/components/discover/DiscoverContent";
import {
  DiscoverCategoryFilter,
  DiscoverSearchBar,
} from "@/components/discover/DiscoverFilters";
import { DiscoverMigrationBanner } from "@/components/discover/DiscoverMigrationBanner";
import { DiscoverTabs } from "@/components/discover/DiscoverTabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { DISCOVER_SUBTITLE } from "@/lib/constants/platform-copy";
import { Suspense } from "react";

export const revalidate = 120;

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

  return (
    <div className="page-padding">
      <PageHeader
        title="Entdecken"
        subtitle={DISCOVER_SUBTITLE}
      />

      <Suspense fallback={null}>
        <DiscoverMigrationBanner />
      </Suspense>

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

      <Suspense
        fallback={
          <div className="space-y-3 pt-2 animate-pulse">
            <div className="h-40 rounded-3xl bg-unze-border/40" />
            <div className="h-40 rounded-3xl bg-unze-border/40" />
          </div>
        }
      >
        <DiscoverContent tab={tab} query={query} category={category} />
      </Suspense>
    </div>
  );
}

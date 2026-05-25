import { CommunityCardList } from "@/components/community/CommunityCardList";
import { CreatorCardList } from "@/components/discover/CreatorCard";
import { DiscoverTabs } from "@/components/discover/DiscoverTabs";
import {
  DiscoverCategoryFilter,
  DiscoverSearchBar,
} from "@/components/discover/DiscoverFilters";
import { filterDiscoverCommunities } from "@/lib/discover/filter-communities";
import { FeedPostList } from "@/components/feed/FeedPostList";
import { PageHeader } from "@/components/layout/PageHeader";
import { getDiscoverCommunities } from "@/services/community/community.service";
import { getDiscoverCreators } from "@/services/creator/creator.service";
import {
  getDiscoverFeedPosts,
  getFeedCommunityMeta,
} from "@/services/feed/feed.service";
import { isPlatformSchemaReady } from "@/services/platform/schema.service";
import { Suspense } from "react";
import Link from "next/link";

interface DiscoverPageProps {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    category?: string;
  }>;
}

async function DiscoverContent({
  tab,
  query,
  category,
}: {
  tab: string;
  query: string;
  category: string;
}) {
  const communities = await getDiscoverCommunities();
  const filtered = filterDiscoverCommunities(communities, query, category);

  if (tab === "feed") {
    const posts = await getDiscoverFeedPosts();
    const communityIds = posts
      .map((p) => p.communityId)
      .filter((id): id is string => Boolean(id));
    const communityNames = await getFeedCommunityMeta(communityIds);

    return (
      <section>
        <header className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-unze-ink">
            Feed Discover
          </h2>
          <p className="mt-0.5 text-sm text-unze-ink-secondary">
            Öffentliche Beiträge aus dem Netzwerk
          </p>
        </header>
        <FeedPostList posts={posts} communityNames={communityNames} />
      </section>
    );
  }

  if (tab === "trends") {
    const trending = filterDiscoverCommunities(
      communities.filter((c) => c.isTrending),
      query,
      category,
    );
    return (
      <CommunityCardList
        communities={trending}
        title="Trending"
        subtitle="Wachsende und aktive Communities"
      />
    );
  }

  if (tab === "creators") {
    const creators = await getDiscoverCreators();
    if (creators.length === 0) {
      return (
        <section className="rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="text-sm text-unze-ink-secondary">
            Noch keine Creator im Netzwerk. Erstelle eine Community und werde
            der erste Creator auf UNZE.
          </p>
        </section>
      );
    }
    return (
      <CreatorCardList
        creators={creators}
        title="Creator"
        subtitle="Verifizierte Community-Builder im Netzwerk"
      />
    );
  }

  if (tab === "new") {
    const sorted = [...filtered].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    return (
      <CommunityCardList
        communities={sorted}
        title="Neue Communities"
        subtitle="Zuletzt gestartete Communities"
      />
    );
  }

  const trending = filtered.filter((c) => c.isTrending).slice(0, 3);
  const rest = filtered.filter((c) => !trending.includes(c));

  return (
    <div className="space-y-8">
      {trending.length > 0 && (
        <CommunityCardList
          communities={trending}
          title="Trending"
          subtitle="Beliebt und aktiv"
        />
      )}
      <CommunityCardList
        communities={rest.length > 0 ? rest : filtered}
        title="Alle Communities"
        subtitle={
          query || category !== "Alle"
            ? `${filtered.length} Ergebnis${filtered.length === 1 ? "" : "se"}`
            : "Finde deine nächste Community"
        }
      />
      {filtered.length === 0 && communities.length === 0 && (
        <section className="rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="text-sm font-medium text-unze-ink">
            {communities.length === 0
              ? "Noch keine Communities im Netzwerk"
              : "Keine Treffer für deine Suche"}
          </p>
          <p className="mt-1 text-sm text-unze-ink-secondary">
            {communities.length === 0
              ? "Sei der erste Creator und starte deine Community auf UNZE."
              : "Passe Suche oder Kategorie an."}
          </p>
          {communities.length === 0 && (
            <Link
              href="/create/community"
              className="mt-4 inline-block rounded-xl bg-unze-green px-4 py-2.5 text-sm font-semibold text-white"
            >
              Community erstellen
            </Link>
          )}
        </section>
      )}
    </div>
  );
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

      {!schemaReady && (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">Datenbank-Schema fehlt in Supabase</p>
          <p className="mt-1">
            Führe <code className="rounded bg-amber-100 px-1">database/BUNDLE_all_migrations.sql</code> im
            Supabase SQL Editor aus, dann{" "}
            <code className="rounded bg-amber-100 px-1">npm run seed:demo</code>.
          </p>
        </div>
      )}

      <Suspense fallback={<div className="mb-4 h-12 animate-pulse rounded-2xl bg-unze-border/50" />}>
        <DiscoverSearchBar />
      </Suspense>

      {tab !== "creators" && tab !== "feed" && (
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

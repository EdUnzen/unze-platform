import { CommunityCardList } from "@/components/community/CommunityCardList";
import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";
import { CreatorCardList } from "@/components/discover/CreatorCard";
import { filterDiscoverCommunities } from "@/lib/discover/filter-communities";
import { FeedPostList } from "@/components/feed/FeedPostList";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDiscoverCommunities } from "@/services/community/community.service";
import { getDiscoverGroups } from "@/services/community/group.service";
import { getDiscoverCreators } from "@/services/creator/creator.service";
import { getDiscoverFeedPosts, getPersonalFeedPosts } from "@/services/feed/feed.service";
import Link from "next/link";

interface DiscoverContentProps {
  tab: string;
  query: string;
  category: string;
}

export async function DiscoverContent({ tab, query, category }: DiscoverContentProps) {
  if (tab === "feed") {
    const user = await getCurrentUser();
    const posts = user
      ? await getPersonalFeedPosts(24)
      : await getDiscoverFeedPosts(24);

    return (
      <section>
        <header className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-unze-ink">
            {user ? "Dein Feed" : "Feed Discover"}
          </h2>
          <p className="mt-0.5 text-sm text-unze-ink-secondary">
            {user
              ? "Follows + Entdecken — Liste oder Swipe-Ansicht"
              : "Öffentliche Beiträge — Liste oder Swipe-Ansicht"}
          </p>
        </header>
        <FeedPostList posts={posts} isLoggedIn={Boolean(user)} interactive />
      </section>
    );
  }

  if (tab === "groups") {
    const groups = await getDiscoverGroups();
    return (
      <CommunityGroupCardList
        groups={groups}
        title="Gruppen entdecken"
        subtitle="Aktive Bereiche in Communities — Coaching, Networking und mehr"
      />
    );
  }

  if (tab === "creators") {
    const creators = await getDiscoverCreators();
    if (creators.length === 0) {
      return (
        <section className="rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="text-sm text-unze-ink-secondary">
            Noch keine Creator im Netzwerk. Erstelle eine Community und werde der
            erste Creator auf UNZE.
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

  const communities = await getDiscoverCommunities();
  const filtered = filterDiscoverCommunities(communities, query, category);

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
  const featuredGroups = await getDiscoverGroups(8);

  return (
    <div className="space-y-8">
      {featuredGroups.length > 0 && (
        <CommunityGroupCardList
          groups={featuredGroups}
          title="Aktive Gruppen"
          subtitle="Beliebte Bereiche in Communities"
          layout="horizontal"
        />
      )}
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
            Noch keine Communities im Netzwerk
          </p>
          <p className="mt-1 text-sm text-unze-ink-secondary">
            Sei der erste Creator und starte deine Community auf UNZE.
          </p>
          <Link
            href="/create/community"
            className="mt-4 inline-block rounded-xl bg-unze-green px-4 py-2.5 text-sm font-semibold text-white"
          >
            Community erstellen
          </Link>
        </section>
      )}
    </div>
  );
}

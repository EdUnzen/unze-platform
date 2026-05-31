import { CommunityCardList } from "@/components/community/CommunityCardList";
import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";
import { DiscoverEventList } from "@/components/events/CommunityEventsSection";
import { filterDiscoverCommunities } from "@/lib/discover/filter-communities";
import { getDiscoverCommunities } from "@/services/community/community.service";
import { getDiscoverGroups } from "@/services/community/group.service";
import { getDiscoverEvents } from "@/services/events/event.service";
import Link from "next/link";

interface DiscoverContentProps {
  tab: string;
  query: string;
  category: string;
}

const LEGACY_TABS = new Set(["feed", "trends", "new", "creators"]);

export async function DiscoverContent({ tab, query, category }: DiscoverContentProps) {
  const effectiveTab = LEGACY_TABS.has(tab) ? "communities" : tab;

  if (effectiveTab === "events") {
    const events = await getDiscoverEvents(24);
    const filtered = query
      ? events.filter(
          (e) =>
            e.title.toLowerCase().includes(query.toLowerCase()) ||
            e.communityTitle?.toLowerCase().includes(query.toLowerCase()) ||
            e.communitySlug?.toLowerCase().includes(query.toLowerCase()),
        )
      : events;

    return (
      <DiscoverEventList
        events={filtered}
        title="Events entdecken"
        subtitle="Kommende Termine aus Communities und Gruppen"
      />
    );
  }

  if (effectiveTab === "groups") {
    const groups = await getDiscoverGroups(24, { groupType: "group" });
    return (
      <CommunityGroupCardList
        groups={groups}
        title="Gruppen entdecken"
        subtitle="Bereiche innerhalb von Communities — Coaching, Teams, Networking"
      />
    );
  }

  if (effectiveTab === "services") {
    const services = await getDiscoverGroups(24, { groupType: "service" });
    if (services.length === 0) {
      return (
        <section className="rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="text-sm font-medium text-unze-ink">Noch keine Dienstleistungen</p>
          <p className="mt-1 text-sm text-unze-ink-secondary">
            Dienstleistungen werden als Gruppentyp „Service“ in Communities angelegt.
          </p>
        </section>
      );
    }
    return (
      <CommunityGroupCardList
        groups={services}
        title="Dienstleistungen"
        subtitle="Angebote und Services aus dem Netzwerk"
      />
    );
  }

  const communities = await getDiscoverCommunities();
  const filtered = filterDiscoverCommunities(communities, query, category);
  const featuredGroups = await getDiscoverGroups(6, { groupType: "group" });
  const featuredEvents = await getDiscoverEvents(4);

  return (
    <div className="space-y-8">
      {featuredEvents.length > 0 && (
        <DiscoverEventList
          events={featuredEvents}
          title="Kommende Events"
          subtitle="Termine aus dem Netzwerk"
        />
      )}

      {featuredGroups.length > 0 && (
        <CommunityGroupCardList
          groups={featuredGroups}
          title="Aktive Gruppen"
          subtitle="Beliebte Bereiche in Communities"
          layout="horizontal"
        />
      )}

      <CommunityCardList
        communities={filtered}
        title="Communities"
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

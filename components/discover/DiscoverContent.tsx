import { CommunityCardList } from "@/components/community/CommunityCardList";
import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";
import { DiscoverEventList } from "@/components/events/CommunityEventsSection";
import { filterDiscoverCommunities } from "@/lib/discover/filter-communities";
import {
  filterDiscoverEvents,
  filterDiscoverGroups,
} from "@/lib/discover/search";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getDiscoverCommunities } from "@/services/community/community.service";
import { getDiscoverGroups } from "@/services/community/group.service";
import { getDiscoverEvents } from "@/services/events/event.service";
import { getFollowedEventIdsAmong } from "@/services/follow/follow.service";
import Link from "next/link";

interface DiscoverContentProps {
  tab: string;
  query: string;
  category: string;
  migrationDetails?: {
    communityEventsTable?: boolean;
    groupTypeColumn?: boolean;
  };
}

const LEGACY_TABS = new Set(["feed", "trends", "new", "creators"]);

export async function DiscoverContent({
  tab,
  query,
  category,
  migrationDetails,
}: DiscoverContentProps) {
  const effectiveTab = LEGACY_TABS.has(tab) ? "communities" : tab;
  const eventsAvailable = migrationDetails?.communityEventsTable !== false;
  const groupTypesAvailable = migrationDetails?.groupTypeColumn !== false;

  if (effectiveTab === "events") {
    if (!eventsAvailable) {
      return (
        <section className="rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="text-sm font-medium text-unze-ink">Events noch nicht verfügbar</p>
          <p className="mt-1 text-sm text-unze-ink-secondary">
            Events werden nach Plattform-Update freigeschaltet.
          </p>
        </section>
      );
    }
    const user = await getCurrentUser();
    const events = await getDiscoverEvents(24);
    const filtered = filterDiscoverEvents(events, query);
    const followedEventIds =
      user && filtered.length > 0
        ? await getFollowedEventIdsAmong(filtered.map((e) => e.id))
        : [];

    return (
      <DiscoverEventList
        events={filtered}
        title="Events entdecken"
        subtitle={
          query
            ? `${filtered.length} Ergebnis${filtered.length === 1 ? "" : "se"}`
            : "Kommende Termine aus Communities und Gruppen"
        }
        followedEventIds={followedEventIds}
        showFollowButtons={Boolean(user)}
      />
    );
  }

  if (effectiveTab === "groups") {
    const groups = await getDiscoverGroups(48, { groupType: "group" });
    const filtered = filterDiscoverGroups(groups, query);
    return (
      <CommunityGroupCardList
        groups={filtered}
        title="Gruppen entdecken"
        subtitle={
          query
            ? `${filtered.length} Ergebnis${filtered.length === 1 ? "" : "se"}`
            : "Bereiche innerhalb von Communities — Coaching, Teams, Networking"
        }
      />
    );
  }

  if (effectiveTab === "services") {
    if (!groupTypesAvailable) {
      return (
        <section className="rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="text-sm font-medium text-unze-ink">Dienstleistungen noch nicht verfügbar</p>
          <p className="mt-1 text-sm text-unze-ink-secondary">
            Dienstleistungen werden nach Plattform-Update freigeschaltet.
          </p>
        </section>
      );
    }
    const services = await getDiscoverGroups(48, { groupType: "service" });
    const filtered = filterDiscoverGroups(services, query);
    if (filtered.length === 0 && services.length === 0) {
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
        groups={filtered}
        title="Dienstleistungen"
        subtitle={
          query
            ? `${filtered.length} Ergebnis${filtered.length === 1 ? "" : "se"}`
            : "Angebote und Services aus dem Netzwerk"
        }
      />
    );
  }

  const communities = await getDiscoverCommunities();
  const filtered = filterDiscoverCommunities(communities, query, category);
  const featuredGroups = groupTypesAvailable
    ? await getDiscoverGroups(6, { groupType: "group" })
    : await getDiscoverGroups(6);
  const featuredEvents = eventsAvailable ? await getDiscoverEvents(4) : [];

  return (
    <div className="space-y-8">
      {featuredEvents.length > 0 && !query && (
        <DiscoverEventList
          events={featuredEvents}
          title="Kommende Events"
          subtitle="Termine aus dem Netzwerk"
        />
      )}

      {featuredGroups.length > 0 && !query && (
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

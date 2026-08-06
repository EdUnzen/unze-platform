import { CommunityCardList } from "@/components/community/CommunityCardList";
import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";
import { DiscoverEventList } from "@/components/events/CommunityEventsSection";
import type { FavoritesBundle } from "@/services/favorites/favorites.service";

interface FavoritesSectionsProps {
  bundle: FavoritesBundle;
}

export function FavoritesSections({ bundle }: FavoritesSectionsProps) {
  const { communities, groups, services, events } = bundle;

  return (
    <div className="space-y-8">
      {communities.length > 0 && (
        <CommunityCardList
          communities={communities}
          title="Communities"
          subtitle="Communities, denen du folgst"
        />
      )}

      {groups.length > 0 && (
        <CommunityGroupCardList
          groups={groups}
          title="Gruppen"
          subtitle="Gruppen, denen du folgst"
        />
      )}

      {services.length > 0 && (
        <CommunityGroupCardList
          groups={services}
          title="Services"
          subtitle="Services, denen du folgst"
        />
      )}

      {events.length > 0 && (
        <DiscoverEventList
          events={events}
          title="Events"
          subtitle="Kommende Termine aus deinen Favoriten"
        />
      )}
    </div>
  );
}

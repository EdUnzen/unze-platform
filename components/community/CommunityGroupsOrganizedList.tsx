import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";
import type { DiscoverGroup } from "@/types/community";
import { TrendingUp } from "lucide-react";

interface CommunityGroupsOrganizedListProps {
  groups: DiscoverGroup[];
  cardVariant?: "group" | "service";
}

function groupByCategory(items: DiscoverGroup[]): Map<string, DiscoverGroup[]> {
  const map = new Map<string, DiscoverGroup[]>();
  for (const g of items) {
    const key = g.category?.trim() || "Allgemein";
    const list = map.get(key) ?? [];
    list.push(g);
    map.set(key, list);
  }
  return map;
}

/** Gruppen/Services: Featured-Zeile + Kategorien */
export function CommunityGroupsOrganizedList({
  groups,
  cardVariant = "group",
}: CommunityGroupsOrganizedListProps) {
  if (groups.length === 0) return null;

  const sorted = [...groups].sort((a, b) => {
    if (a.isTrending !== b.isTrending) return a.isTrending ? -1 : 1;
    return b.memberCount - a.memberCount;
  });

  const featured = sorted.filter((g) => g.isTrending).slice(0, 6);
  const featuredIds = new Set(featured.map((g) => g.id));
  const remainder = sorted.filter((g) => !featuredIds.has(g.id));

  const categories = groupByCategory(remainder);
  const showCategories = categories.size > 1;

  return (
    <div className="space-y-6">
      {featured.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-unze-green" aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-unze-ink-muted">
              Beliebt in dieser Community
            </h3>
          </div>
          <CommunityGroupCardList
            groups={featured}
            layout="horizontal"
            cardVariant={cardVariant}
          />
        </div>
      )}

      {showCategories ? (
        Array.from(categories.entries()).map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-unze-ink-muted">
              {category}
            </h3>
            <CommunityGroupCardList
              groups={items}
              layout="vertical"
              cardVariant={cardVariant}
            />
          </div>
        ))
      ) : (
        <CommunityGroupCardList
          groups={remainder.length > 0 ? remainder : sorted}
          layout="vertical"
          cardVariant={cardVariant}
        />
      )}
    </div>
  );
}

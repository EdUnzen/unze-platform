import type { CommunityGroup } from "@/types/community";
import { GroupCoverVisual } from "@/components/visual/GroupCoverVisual";
import { getGroupVisualSeed } from "@/lib/demo/group-visuals";
import { resolveGroupCoverDisplay } from "@/lib/visual/resolve-banner";
import Link from "next/link";

interface CommunityGroupListProps {
  groups: CommunityGroup[];
  communitySlug: string;
  bannerGradient?: string;
  title?: string;
  category?: string;
}

export function CommunityGroupList({
  groups,
  communitySlug,
  bannerGradient = "from-unze-green/80 via-emerald-600/70 to-teal-800/80",
  title = "Gruppen",
  category = "general",
}: CommunityGroupListProps) {
  if (groups.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-base font-semibold text-unze-ink">{title}</h2>
      <ul className="flex flex-col gap-2">
        {groups.map((group) => {
          const cover = resolveGroupCoverDisplay({
            coverUrl: group.coverUrl,
            bannerGradient,
            category,
          });
          return (
          <li key={group.id}>
            <Link
              href={`/community/${communitySlug}?group=${group.slug}`}
              className="flex gap-3 rounded-2xl bg-white p-3 shadow-card transition active:scale-[0.99]"
            >
              <GroupCoverVisual
                seed={getGroupVisualSeed(communitySlug, group.slug)}
                bannerGradient={cover.gradient}
                cover={cover.cover}
                groupType={group.groupType === "service" ? "service" : "group"}
                className="h-14 w-14 shrink-0 rounded-xl"
                compact
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-unze-ink">{group.title}</h3>
                {group.description && (
                  <p className="mt-0.5 line-clamp-2 text-sm text-unze-ink-secondary">
                    {group.description}
                  </p>
                )}
                {!group.isPublic && (
                  <span className="mt-1 inline-block text-[10px] font-medium text-unze-ink-muted">
                    Privat
                  </span>
                )}
              </div>
            </Link>
          </li>
          );
        })}
      </ul>
    </section>
  );
}

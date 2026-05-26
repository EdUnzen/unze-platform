import { PlatformBadge } from "@/components/community/PlatformBadge";
import { AttentionBadge } from "@/components/dashboard/StatusBadge";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { ACCESS_STATUS_OPTIONS } from "@/lib/constants/access";
import { ROLE_LABELS } from "@/lib/constants/dashboard";
import { formatMemberCount } from "@/services/community/community.service";
import { formatCompactCount } from "@/lib/utils/format-metrics";
import type { ManagedCommunity } from "@/types/dashboard";
import { ChevronRight, Eye, Share2, Users } from "lucide-react";
import Link from "next/link";

interface DashboardCommunityCardProps {
  community: ManagedCommunity;
  priority?: boolean;
}

export function DashboardCommunityCard({
  community,
  priority,
}: DashboardCommunityCardProps) {
  const accessLabel =
    ACCESS_STATUS_OPTIONS.find(
      (o) => o.value === community.access?.accessStatus,
    )?.label ?? "Offen";
  const pending = community.pendingApplicationCount ?? 0;

  return (
    <Link
      href={`/dashboard/community/${community.slug}`}
      data-testid={`dashboard-community-card-${community.slug}`}
      className="group block touch-target outline-none active:scale-[0.98]"
      prefetch={priority}
    >
      <article className="overflow-hidden rounded-3xl bg-white shadow-card transition-shadow group-hover:shadow-card-hover">
        <div className="relative h-24 overflow-hidden">
          <CommunityCoverVisual
            seed={community.slug}
            bannerGradient={community.bannerGradient}
            className="h-full"
            overlay="card"
          />
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-2">
            <PlatformBadge platform={community.platformType} variant="overlay" />
            <div className="flex items-center gap-1.5">
              {pending > 0 && <AttentionBadge count={pending} />}
              <span className="rounded-lg bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                {ROLE_LABELS[community.viewerRole]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-unze-ink">
              {community.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-unze-ink-secondary">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {formatMemberCount(community.memberCount)} · {community.category}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-unze-ink-muted">
              {(community.stats.weeklyViews ?? 0) > 0 && (
                <span className="inline-flex items-center gap-0.5">
                  <Eye className="h-3 w-3" aria-hidden />
                  {formatCompactCount(community.stats.weeklyViews!)}
                </span>
              )}
              {(community.stats.shareCount ?? 0) > 0 && (
                <span className="inline-flex items-center gap-0.5 font-medium text-unze-ink-secondary">
                  <Share2 className="h-3 w-3" aria-hidden />
                  {formatCompactCount(community.stats.shareCount!)}×
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-unze-surface-muted px-2 py-0.5 text-[10px] font-medium text-unze-ink-secondary">
                {accessLabel}
              </span>
              {pending > 0 && (
                <span className="text-[10px] font-medium text-amber-700">
                  {pending} Antrag{pending === 1 ? "" : "äge"} offen
                </span>
              )}
            </div>
          </div>
          <ChevronRight
            className="h-5 w-5 shrink-0 text-unze-ink-muted transition group-hover:text-unze-green"
            aria-hidden
          />
        </div>
      </article>
    </Link>
  );
}

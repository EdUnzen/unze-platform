import { isDemoCommunitySlug } from "@/lib/constants/demo";
import { getGroupVisual, getGroupVisualSeed } from "@/lib/demo/group-visuals";
import { getAppUrl } from "@/lib/env";
import { CardEngagementStrip } from "@/components/share/CardEngagementStrip";
import { ShareMenu } from "@/components/share/ShareMenu";
import { GroupPriceBadge } from "@/components/ui/PriceBadge";
import { GroupCoverVisual } from "@/components/visual/GroupCoverVisual";
import { resolveGroupCoverDisplay } from "@/lib/visual/resolve-banner";
import { formatMemberCount } from "@/services/community/community.service";
import type { DiscoverGroup } from "@/types/community";
import { RatingSummary } from "@/components/ui/RatingSummary";
import { hasReviews } from "@/lib/utils/ratings";
import { cn } from "@/lib/utils/cn";
import { BadgeCheck, Lock, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { PlatformBadge } from "./PlatformBadge";

interface CommunityGroupCardProps {
  group: DiscoverGroup;
  className?: string;
  compact?: boolean;
}

function CommunityGroupCardInner({
  group,
  className,
  compact = false,
}: CommunityGroupCardProps) {
  const href = `/community/${group.communitySlug}/group/${group.slug}`;
  const shareUrl = `${getAppUrl()}${href}`;
  const visual = getGroupVisual(group.communitySlug, group.slug);
  const visualSeed = getGroupVisualSeed(group.communitySlug, group.slug);
  const cover = resolveGroupCoverDisplay({
    coverUrl: group.coverUrl,
    bannerGradient: group.bannerGradient,
    category: group.category,
  });

  return (
    <article
      className={cn(
        "glass-card overflow-hidden rounded-3xl shadow-card transition-all duration-300",
        "hover:shadow-card-hover",
        compact ? "w-[280px] shrink-0 snap-start" : "w-full",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={href}
          className="group block touch-target outline-none transition-transform active:scale-[0.99]"
        >
          <div className="relative">
            <GroupCoverVisual
              seed={visualSeed}
              bannerGradient={cover.gradient}
              imageUrl={cover.imageUrl}
              className={compact ? "h-24" : "h-28"}
              compact={compact}
            />
            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 pr-10">
              <PlatformBadge platform={group.platformType} variant="overlay" />
              {group.isTrending && (
                <span className="inline-flex items-center gap-0.5 rounded-lg bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  Trending
                </span>
              )}
              {group.isPremium && (
                <span className="inline-flex items-center gap-0.5 rounded-lg bg-black/35 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                  <Lock className="h-3 w-3" aria-hidden />
                  Premium
                </span>
              )}
              {isDemoCommunitySlug(group.communitySlug) && (
                <span className="rounded-lg bg-amber-400/90 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-950 backdrop-blur-md">
                  Demo
                </span>
              )}
            </div>
            {group.isVerified && (
              <div
                className="absolute bottom-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm"
                title="Verifiziert"
              >
                <BadgeCheck
                  className="h-4 w-4 text-unze-green"
                  aria-label="Verifizierte Community"
                />
              </div>
            )}
          </div>

          <div className={cn("p-4", compact && "p-3.5")}>
            <p className="mb-0.5 line-clamp-1 text-[11px] font-medium uppercase tracking-wide text-unze-ink-muted">
              {group.communityTitle}
            </p>
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-unze-ink">
                {group.title}
              </h3>
              {hasReviews(group.reviewCount) && (
                <RatingSummary
                  rating={group.rating}
                  reviewCount={group.reviewCount}
                  showCount={false}
                  starClassName="h-3.5 w-3.5"
                  className="shrink-0 text-unze-ink-secondary"
                />
              )}
            </div>

            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-unze-ink-secondary">
              {group.description}
            </p>

            {visual?.activityLabel && (
              <p className="mb-2 text-[11px] font-medium text-unze-green-dark">
                {visual.activityLabel}
              </p>
            )}

            <CardEngagementStrip metrics={group.engagement} className="mb-2" max={2} />

            {(group.priceCents != null && group.priceCents > 0) ||
            group.groupType === "service" ? (
              <div className="mb-3">
                <GroupPriceBadge
                  priceCents={group.priceCents}
                  currency={group.currency}
                  isService={group.groupType === "service"}
                />
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-unze-border/80 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <PlatformBadge platform={group.platformType} variant="footer" />
                <span className="flex items-center gap-1 text-xs text-unze-ink-secondary">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {formatMemberCount(group.memberCount)}
                </span>
              </div>
              <span className="text-[11px] text-unze-ink-muted">{group.category}</span>
            </div>
          </div>
        </Link>

        <ShareMenu
          className="absolute right-3 top-3 z-10"
          target={{
            type: "group",
            title: `${group.title} · ${group.communityTitle}`,
            url: shareUrl,
            communityId: group.communityId,
            groupId: group.id,
          }}
        />
      </div>
    </article>
  );
}

export const CommunityGroupCard = memo(CommunityGroupCardInner);

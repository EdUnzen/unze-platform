import { RatingSummary } from "@/components/ui/RatingSummary";
import { PlatformBadge } from "@/components/community/PlatformBadge";
import { CommunityFocusChips } from "@/components/community/CommunityFocusChips";
import { CommunityStatusBadges } from "@/components/community/CommunityStatusBadges";
import { ShareMenu } from "@/components/share/ShareMenu";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { getDefaultBannerPresetForCategory } from "@/lib/constants/category-banners";
import { resolveCommunityBannerDisplay } from "@/lib/visual/resolve-banner";
import { formatMemberCount } from "@/services/community/community.service";
import type { Community } from "@/types/community";
import { getAppUrl } from "@/lib/env";
import { Users } from "lucide-react";

interface CommunityHeaderProps {
  community: Community;
  /** Berechneter Community Score (0–100) */
  displayScore?: number;
}

export function CommunityHeader({ community, displayScore }: CommunityHeaderProps) {
  const score = displayScore ?? community.levelScore ?? 0;
  const banner = resolveCommunityBannerDisplay(community);
  const categoryFallback = getDefaultBannerPresetForCategory(community.category);
  return (
    <header className="overflow-hidden rounded-3xl bg-white shadow-card">
      <div className="relative h-44 sm:h-52">
        <CommunityCoverVisual
          seed={community.slug}
          bannerGradient={banner.gradient}
          imageUrl={community.bannerUrl ?? banner.imageUrl}
          fallbackImageUrl={categoryFallback.imageUrl}
          className="h-full"
          overlay="hero"
        />
        <ShareMenu
          className="absolute right-4 top-4 z-10"
          target={{
            type: "community",
            title: community.title,
            url: `${getAppUrl()}/community/${community.slug}`,
            communityId: community.id,
          }}
        />
        <div className="absolute bottom-4 left-4 right-16 z-10 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <CommunityStatusBadges community={community} />
            <span className="inline-flex items-center rounded-lg bg-black/30 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              Score {score}
            </span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="mb-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                {community.category}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {community.title}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <RatingSummary
                  rating={community.rating}
                  reviewCount={community.reviewCount}
                  alwaysShow
                  onDark
                  starClassName="h-3.5 w-3.5"
                />
                <span className="flex items-center gap-1 text-white/90">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  <strong className="font-semibold">
                    {formatMemberCount(community.memberCount)}
                  </strong>
                  Mitglieder
                </span>
              </div>
            </div>
            <PlatformBadge platform={community.platformType} variant="overlay" />
          </div>
        </div>
      </div>

      {community.focusTags.length > 0 && (
        <div className="border-b border-unze-border px-4 py-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-unze-ink-muted">
            Community-Fokus
          </p>
          <CommunityFocusChips focusTags={community.focusTags} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 border-b border-unze-border px-4 py-3 text-sm text-unze-ink-secondary">
        {community.priceLabel && (
          <PriceBadge label={community.priceLabel} variant="inline" className="text-unze-green-dark" />
        )}
      </div>
    </header>
  );
}

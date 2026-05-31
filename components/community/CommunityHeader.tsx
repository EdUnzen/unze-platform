import { RatingSummary } from "@/components/ui/RatingSummary";
import { PlatformBadge } from "@/components/community/PlatformBadge";
import { CommunityStatusBadges } from "@/components/community/CommunityStatusBadges";
import { ShareMenu } from "@/components/share/ShareMenu";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { formatMemberCount } from "@/services/community/community.service";
import type { Community } from "@/types/community";
import { getAppUrl } from "@/lib/env";
import { Users } from "lucide-react";

interface CommunityHeaderProps {
  community: Community;
}

export function CommunityHeader({ community }: CommunityHeaderProps) {
  return (
    <header className="overflow-hidden rounded-3xl bg-white shadow-card">
      <div className="relative h-44 sm:h-52">
        <CommunityCoverVisual
          seed={community.slug}
          bannerGradient={community.bannerGradient}
          imageUrl={community.bannerUrl}
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
          <CommunityStatusBadges community={community} />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="mb-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                {community.category}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {community.title}
              </h1>
            </div>
            <PlatformBadge platform={community.platformType} variant="overlay" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b border-unze-border px-4 py-3 text-sm text-unze-ink-secondary">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-unze-green" aria-hidden />
          <strong className="font-semibold text-unze-ink">
            {formatMemberCount(community.memberCount)}
          </strong>
          Mitglieder
        </span>
        <RatingSummary
          rating={community.rating}
          reviewCount={community.reviewCount}
          className="text-sm text-unze-ink-secondary"
        />
        {community.priceLabel && (
          <PriceBadge label={community.priceLabel} variant="inline" className="text-unze-green-dark" />
        )}
      </div>
    </header>
  );
}

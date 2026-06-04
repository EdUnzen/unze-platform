import { RatingSummary } from "@/components/ui/RatingSummary";
import { formatMemberCount } from "@/services/community/community.service";
import type { Community } from "@/types/community";
import { cn } from "@/lib/utils/cn";
import { ACCESS_STATUS_OPTIONS } from "@/lib/constants/access";
import { VISIBILITY_OPTIONS } from "@/lib/constants/community";
import { isDemoCommunitySlug } from "@/lib/constants/demo";
import { getAppUrl } from "@/lib/env";
import { CardEngagementStrip } from "@/components/share/CardEngagementStrip";
import { ShareMenu } from "@/components/share/ShareMenu";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { getDefaultBannerPresetForCategory } from "@/lib/constants/category-banners";
import { getFocusTagStyle } from "@/lib/constants/focus-tag-styles";
import { resolveCommunityBannerDisplay } from "@/lib/visual/resolve-banner";
import { BadgeCheck, FolderOpen, Heart, Lock, TrendingUp, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { PlatformBadge } from "@/components/community/PlatformBadge";

interface CommunityCardProps {
  community: Community;
  className?: string;
  priority?: boolean;
}

function CommunityCardInner({
  community,
  className,
  priority = false,
}: CommunityCardProps) {
  const visibilityLabel =
    VISIBILITY_OPTIONS.find((o) => o.value === community.visibility)?.label ??
    community.visibility;
  const accessLabel = community.access
    ? ACCESS_STATUS_OPTIONS.find((o) => o.value === community.access?.accessStatus)
        ?.label
    : null;
  const applicationStatus = community.joinAccess?.existingApplication?.status;
  const shareUrl = `${getAppUrl()}/community/${community.slug}`;
  const banner = resolveCommunityBannerDisplay(community);
  const categoryFallback = getDefaultBannerPresetForCategory(community.category);

  return (
    <article
      className={cn(
        "glass-card overflow-hidden rounded-3xl shadow-card transition-all duration-300",
        "hover:shadow-card-hover",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={`/community/${community.slug}`}
          className="group block touch-target outline-none transition-transform active:scale-[0.99]"
          prefetch={priority}
        >
          <div className="relative">
            <CommunityCoverVisual
              seed={community.slug}
              bannerGradient={banner.gradient}
              imageUrl={community.bannerUrl ?? banner.imageUrl}
              fallbackImageUrl={categoryFallback.imageUrl}
              className="h-[10.5rem] sm:h-44"
              overlay="card"
            />
            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 pr-12">
              <PlatformBadge platform={community.platformType} variant="overlay" />
              {community.visibility !== "public" && (
                <span className="inline-flex items-center gap-0.5 rounded-lg bg-black/35 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                  <Lock className="h-3 w-3" aria-hidden />
                  {visibilityLabel}
                </span>
              )}
              {accessLabel && accessLabel !== "Offen" && (
                <span className="rounded-lg bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                  {accessLabel}
                </span>
              )}
              {community.isTrending && (
                <span className="inline-flex items-center gap-0.5 rounded-lg bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  Trending
                </span>
              )}
              {isDemoCommunitySlug(community.slug) && (
                <span className="rounded-lg bg-amber-400/90 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-950 backdrop-blur-md">
                  Demo
                </span>
              )}
            </div>

            {community.isVerified && (
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

          <div className="p-4 pb-3">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-unze-ink">
                {community.title}
              </h3>
              <RatingSummary
                rating={community.rating}
                reviewCount={community.reviewCount}
                alwaysShow
                starClassName="h-3.5 w-3.5"
                className="shrink-0 text-xs"
              />
            </div>

            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-unze-ink-secondary">
              {community.description}
            </p>

            <CardEngagementStrip metrics={community.engagement} className="mb-2" />

            {community.priceLabel && (
              <div className="mb-3">
                <PriceBadge label={community.priceLabel} variant="prominent" />
              </div>
            )}

            <div className="mb-3 flex flex-wrap gap-1.5">
              {community.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                    getFocusTagStyle(tag),
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-unze-border/80 pt-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-unze-ink-secondary">
                <PlatformBadge platform={community.platformType} variant="footer" />
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {formatMemberCount(community.memberCount)}
                </span>
                {(community.groupCount ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <FolderOpen className="h-3.5 w-3.5" aria-hidden />
                    {community.groupCount} Gruppen
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {applicationStatus && !community.membership?.isMember && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      applicationStatus === "pending" && "bg-amber-100 text-amber-800",
                      applicationStatus === "waitlisted" && "bg-blue-100 text-blue-800",
                      applicationStatus === "accepted" && "bg-unze-green-muted text-unze-green-dark",
                      applicationStatus === "rejected" && "bg-red-100 text-red-700",
                      applicationStatus === "withdrawn" && "bg-unze-surface-muted text-unze-ink-muted",
                    )}
                  >
                    {applicationStatus === "pending" && "Antrag offen"}
                    {applicationStatus === "waitlisted" && "Warteliste"}
                    {applicationStatus === "accepted" && "Angenommen"}
                    {applicationStatus === "rejected" && "Abgelehnt"}
                    {applicationStatus === "withdrawn" && "Zurückgezogen"}
                  </span>
                )}
                {community.membership?.isMember && (
                  <span className="flex items-center gap-0.5 rounded-full bg-unze-green-muted px-2 py-0.5 text-[10px] font-semibold text-unze-green-dark">
                    <UserCheck className="h-3 w-3" aria-hidden />
                    Mitglied
                  </span>
                )}
                {community.isFollowing && !community.membership?.isMember && (
                  <Heart className="h-3.5 w-3.5 fill-unze-green text-unze-green" aria-label="Gefolgt" />
                )}
                <span className="text-[11px] text-unze-ink-muted">{community.category}</span>
              </div>
            </div>
          </div>
        </Link>

        <ShareMenu
          className="absolute right-3 top-3 z-10"
          target={{
            type: "community",
            title: community.title,
            url: shareUrl,
            communityId: community.id,
          }}
        />
      </div>
    </article>
  );
}

export const CommunityCard = memo(CommunityCardInner);

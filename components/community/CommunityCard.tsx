import { RatingSummary } from "@/components/ui/RatingSummary";
import { formatMemberCount } from "@/services/community/community.service";
import type { Community } from "@/types/community";
import { cn } from "@/lib/utils/cn";
import { ACCESS_STATUS_OPTIONS } from "@/lib/constants/access";
import { getVisibilityDisplayLabel } from "@/lib/constants/visibility-display";
import { isDemoCommunitySlug } from "@/lib/constants/demo";
import { getAppUrl } from "@/lib/env";
import { CardEngagementStrip } from "@/components/share/CardEngagementStrip";
import { ShareMenu } from "@/components/share/ShareMenu";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { getFocusTagStyle } from "@/lib/constants/focus-tag-styles";
import { resolveCommunityCover } from "@/lib/visual/auto-cover";
import {
  BadgeCheck,
  FolderOpen,
  Heart,
  Lock,
  Tag,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
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
  const visibilityLabel = getVisibilityDisplayLabel(community.visibility);
  const accessLabel = community.access
    ? ACCESS_STATUS_OPTIONS.find((o) => o.value === community.access?.accessStatus)
        ?.label
    : null;
  const applicationStatus = community.joinAccess?.existingApplication?.status;
  const shareUrl = `${getAppUrl()}/community/${community.slug}`;
  const cover = resolveCommunityCover(community);

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
              bannerGradient={cover.gradient}
              cover={cover}
              className="h-52 sm:h-56"
              overlay="card"
            />
            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2 pr-12">
              <PlatformBadge platform={community.platformType} variant="overlay" />
              {community.isTrending && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-white/25 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                  Beliebt
                </span>
              )}
              {isDemoCommunitySlug(community.slug) && (
                <span className="rounded-xl bg-amber-400/95 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-950">
                  Demo
                </span>
              )}
            </div>

            {community.isVerified && (
              <div
                className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
                title="Verifiziert"
              >
                <BadgeCheck
                  className="h-4 w-4 text-unze-green"
                  aria-label="Verifizierte Community"
                />
              </div>
            )}
          </div>

          <div className="p-4">
            {/* Meta-Zeile: Plattform, Kategorie, Status */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <PlatformBadge platform={community.platformType} variant="card" />
              <span className="inline-flex items-center gap-1 rounded-xl bg-unze-surface-muted px-2.5 py-1.5 text-xs font-semibold text-unze-ink-secondary">
                <Tag className="h-3.5 w-3.5 text-unze-green" aria-hidden />
                {community.category}
              </span>
              {community.visibility !== "public" && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  {visibilityLabel}
                </span>
              )}
              {accessLabel && accessLabel !== "Offen" && (
                <span className="rounded-xl bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-800 ring-1 ring-blue-200">
                  {accessLabel}
                </span>
              )}
              {community.membership?.isMember && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-unze-green-muted px-2.5 py-1.5 text-xs font-semibold text-unze-green-dark">
                  <UserCheck className="h-3.5 w-3.5" aria-hidden />
                  Mitglied
                </span>
              )}
            </div>

            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-unze-ink">
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

            {community.priceLabel && (
              <div className="mb-3">
                <PriceBadge label={community.priceLabel} variant="prominent" />
              </div>
            )}

            <CardEngagementStrip metrics={community.engagement} className="mb-3" />

            <div className="mb-3 flex flex-wrap gap-1.5">
              {community.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-semibold",
                    getFocusTagStyle(tag),
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Mitglieder & Gruppen — immer sichtbar */}
            <div className="flex flex-wrap items-center gap-3 border-t border-unze-border/80 pt-3 text-sm font-medium text-unze-ink-secondary">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-unze-green" aria-hidden />
                {formatMemberCount(community.memberCount)}
              </span>
              {(community.groupCount ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <FolderOpen className="h-4 w-4 text-unze-green" aria-hidden />
                  {community.groupCount} Gruppen
                </span>
              )}
              {applicationStatus && !community.membership?.isMember && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    applicationStatus === "pending" && "bg-amber-100 text-amber-800",
                    applicationStatus === "waitlisted" && "bg-blue-100 text-blue-800",
                  )}
                >
                  {applicationStatus === "pending" && "Antrag offen"}
                  {applicationStatus === "waitlisted" && "Warteliste"}
                </span>
              )}
              {community.isFollowing && !community.membership?.isMember && (
                <Heart className="h-4 w-4 fill-unze-green text-unze-green" aria-label="Gefolgt" />
              )}
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

import { isDemoCommunitySlug } from "@/lib/constants/demo";
import { getGroupVisual } from "@/lib/demo/group-visuals";
import { formatMemberCount } from "@/services/community/community.service";
import { formatWeeklyActivityLabel } from "@/services/platform/activity-stats.service";
import type { DiscoverGroup } from "@/types/community";
import { cn } from "@/lib/utils/cn";
import { Activity, BadgeCheck, Lock, Star, Users } from "lucide-react";
import Image from "next/image";
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
  const visual = getGroupVisual(group.communitySlug, group.slug);
  const href = `/community/${group.communitySlug}?group=${group.slug}`;
  const activityLabel =
    visual?.activityLabel ??
    formatWeeklyActivityLabel(group.weeklyPostCount ?? 0);

  return (
    <Link
      href={href}
      className={cn(
        "group block touch-target outline-none transition-transform active:scale-[0.98]",
        compact ? "w-[280px] shrink-0 snap-start" : "w-full",
        className,
      )}
    >
      <article
        className={cn(
          "glass-card overflow-hidden rounded-3xl shadow-card transition-all duration-300",
          "group-hover:shadow-card-hover group-focus-visible:ring-2 group-focus-visible:ring-unze-green/40",
        )}
      >
        <div className={cn("relative overflow-hidden", compact ? "h-24" : "h-28")}>
          {visual?.imageUrl ? (
            <Image
              src={visual.imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={compact ? "280px" : "100vw"}
            />
          ) : (
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                group.bannerGradient,
              )}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <PlatformBadge platform={group.platformType} />
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
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm"
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
            <div className="flex shrink-0 items-center gap-0.5 text-unze-ink-secondary">
              <Star
                className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                aria-hidden
              />
              <span className="text-xs font-medium">{group.rating}</span>
            </div>
          </div>

          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-unze-ink-secondary">
            {group.description}
          </p>

          {activityLabel && (
            <p className="mb-3 inline-flex items-center gap-1 rounded-full bg-unze-green-muted/60 px-2.5 py-1 text-[11px] font-semibold text-unze-green-dark">
              <Activity className="h-3 w-3" aria-hidden />
              {activityLabel}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-unze-border/80 pt-3">
            <span className="flex items-center gap-1 text-xs text-unze-ink-secondary">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {formatMemberCount(group.memberCount)}
            </span>
            <span className="text-[11px] text-unze-ink-muted">
              {group.reviewCount > 0
                ? `${group.reviewCount} Reviews`
                : group.category}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export const CommunityGroupCard = memo(CommunityGroupCardInner);

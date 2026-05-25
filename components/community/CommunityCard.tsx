import { formatMemberCount } from "@/services/community/community.service";
import type { Community } from "@/types/community";
import { cn } from "@/lib/utils/cn";
import { ACCESS_STATUS_OPTIONS } from "@/lib/constants/access";
import { VISIBILITY_OPTIONS } from "@/lib/constants/community";
import { BadgeCheck, FolderOpen, Heart, Lock, Star, TrendingUp, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { PlatformBadge } from "./PlatformBadge";

interface CommunityCardProps {
  community: Community;
  className?: string;
  priority?: boolean;
}

export function CommunityCard({
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

  return (
    <Link
      href={`/community/${community.slug}`}
      className={cn(
        "group block touch-target outline-none transition-transform active:scale-[0.98]",
        className,
      )}
      prefetch={priority}
    >
      <article
        className={cn(
          "glass-card overflow-hidden rounded-3xl shadow-card transition-all duration-300",
          "group-hover:shadow-card-hover group-focus-visible:ring-2 group-focus-visible:ring-unze-green/40",
        )}
      >
        {/* Banner */}
        <div className="relative h-28 overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              community.bannerGradient,
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <PlatformBadge platform={community.platformType} />
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
          </div>

          {community.isVerified && (
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

        {/* Content */}
        <div className="p-4">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-unze-ink">
              {community.title}
            </h3>
            <div className="flex shrink-0 items-center gap-0.5 text-unze-ink-secondary">
              <Star
                className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                aria-hidden
              />
              <span className="text-xs font-medium">{community.rating}</span>
            </div>
          </div>

          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-unze-ink-secondary">
            {community.description}
          </p>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {community.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-unze-surface-muted px-2 py-0.5 text-[11px] font-medium text-unze-ink-secondary"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-unze-border/80 pt-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-unze-ink-secondary">
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
      </article>
    </Link>
  );
}

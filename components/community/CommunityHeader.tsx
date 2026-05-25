import { PlatformBadge } from "@/components/community/PlatformBadge";
import { CommunityStatusBadges } from "@/components/community/CommunityStatusBadges";
import { formatMemberCount } from "@/services/community/community.service";
import type { Community } from "@/types/community";
import { cn } from "@/lib/utils/cn";
import { Eye, Star, Users } from "lucide-react";

interface CommunityHeaderProps {
  community: Community;
}

export function CommunityHeader({ community }: CommunityHeaderProps) {
  return (
    <header className="overflow-hidden rounded-3xl bg-white shadow-card">
      <div
        className={cn(
          "relative h-44 bg-gradient-to-br sm:h-52",
          community.bannerGradient,
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <CommunityStatusBadges community={community} />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="mb-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                {community.category}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {community.title}
              </h1>
            </div>
            <PlatformBadge platform={community.platformType} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-b border-unze-border px-4 py-3 text-sm text-unze-ink-secondary">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-unze-green" aria-hidden />
          <strong className="font-semibold text-unze-ink">
            {formatMemberCount(community.memberCount)}
          </strong>
          Mitglieder
        </span>
        <span className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          {community.rating} ({community.reviewCount})
        </span>
        {community.viewCount !== undefined && (
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" aria-hidden />
            {community.viewCount.toLocaleString("de-DE")} Aufrufe
          </span>
        )}
      </div>
    </header>
  );
}

import { getCreatorById } from "@/services/creator/creator.service";
import type { Community } from "@/types/community";
import { cn } from "@/lib/utils/cn";
import { BadgeCheck, Users } from "lucide-react";
import Link from "next/link";

interface CreatorProfileCardProps {
  community: Community;
}

export async function CreatorProfileCard({ community }: CreatorProfileCardProps) {
  const creator = await getCreatorById(community.creatorId);

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card" data-testid="creator-profile">
      <h2 className="mb-3 text-sm font-semibold text-unze-ink">Creator</h2>
      <div className="flex items-start gap-3">
        {community.creatorAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={community.creatorAvatarUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-unze-green to-emerald-600 text-lg font-bold text-white",
            )}
            aria-hidden
          >
            {community.creatorName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-unze-ink">{community.creatorName}</p>
            {(community.creatorIsVerified ?? creator?.isVerified) && (
              <BadgeCheck
                className="h-4 w-4 text-unze-green"
                aria-label="Verifizierter Creator"
              />
            )}
          </div>
          {(community.creatorUsername ?? creator?.username) && (
            <p className="text-xs text-unze-ink-muted">
              @{community.creatorUsername ?? creator?.username}
            </p>
          )}
          {creator?.bio && (
            <p className="mt-1 text-sm text-unze-ink-secondary">{creator.bio}</p>
          )}
          {creator && (
            <p className="mt-2 flex items-center gap-1 text-xs text-unze-ink-muted">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {creator.communityCount} Communities ·{" "}
              {creator.totalMembers.toLocaleString("de-DE")} Mitglieder gesamt
            </p>
          )}
        </div>
      </div>
      <Link
        href="/discover?tab=creators"
        className="mt-3 inline-block text-xs font-semibold text-unze-green"
      >
        Mehr Creator entdecken →
      </Link>
    </section>
  );
}

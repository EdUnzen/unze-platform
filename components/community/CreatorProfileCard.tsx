import { getCreatorById, getCreatorProfilePath } from "@/services/creator/creator.service";
import type { Community } from "@/types/community";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BadgeCheck, ChevronRight, Users } from "lucide-react";
import Link from "next/link";

interface CreatorProfileCardProps {
  community: Community;
}

export async function CreatorProfileCard({ community }: CreatorProfileCardProps) {
  const creator = await getCreatorById(community.creatorId);
  const profilePath = getCreatorProfilePath({
    username: community.creatorUsername ?? creator?.username ?? null,
    id: community.creatorId,
  });

  const cardContent = (
    <>
      <div className="flex items-start gap-3">
        <UserAvatar
          name={community.creatorName}
          seed={community.creatorId}
          avatarUrl={community.creatorAvatarUrl}
          size="lg"
        />
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
            <p className="mt-1 line-clamp-2 text-sm text-unze-ink-secondary">
              {creator.bio}
            </p>
          )}
          {creator && (
            <p className="mt-2 flex items-center gap-1 text-xs text-unze-ink-muted">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {creator.communityCount} Communities ·{" "}
              {creator.totalMembers.toLocaleString("de-DE")} Mitglieder gesamt
            </p>
          )}
        </div>
        {profilePath && (
          <ChevronRight className="h-5 w-5 shrink-0 text-unze-ink-muted" aria-hidden />
        )}
      </div>
    </>
  );

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card" data-testid="creator-profile">
      <h2 className="mb-3 text-sm font-semibold text-unze-ink">Creator</h2>
      <Link
        href={profilePath}
        className="block touch-target rounded-2xl transition-colors hover:bg-unze-surface-muted/40 active:scale-[0.99]"
      >
        {cardContent}
      </Link>
      <Link
        href="/discover"
        className="mt-3 inline-block text-xs font-semibold text-unze-green"
      >
        Mehr entdecken →
      </Link>
    </section>
  );
}

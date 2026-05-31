import { formatMemberCount } from "@/services/community/community.service";
import { getCreatorProfilePath } from "@/services/creator/creator.service";
import type { PlatformCreator } from "@/types/creator";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BadgeCheck, Users } from "lucide-react";
import Link from "next/link";

interface CreatorCardProps {
  creator: PlatformCreator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const profilePath = getCreatorProfilePath(creator);

  const card = (
    <article className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-card">
        <UserAvatar
          name={creator.name}
          seed={creator.id}
          avatarUrl={creator.avatarUrl}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-unze-ink">{creator.name}</h3>
            {creator.isVerified && (
              <BadgeCheck
                className="h-4 w-4 shrink-0 text-unze-green"
                aria-label="Verifiziert"
              />
            )}
          </div>
          {creator.username && (
            <p className="text-xs text-unze-ink-muted">@{creator.username}</p>
          )}
          {creator.bio && (
            <p className="mt-0.5 line-clamp-1 text-xs text-unze-ink-secondary">
              {creator.bio}
            </p>
          )}
          <p className="mt-1 flex items-center gap-1 text-[11px] text-unze-ink-muted">
            <Users className="h-3 w-3" aria-hidden />
            {creator.communityCount} Communities ·{" "}
            {formatMemberCount(creator.totalMembers)}
          </p>
        </div>
        {creator.primaryCategory && (
          <span className="shrink-0 rounded-full bg-unze-surface-muted px-2 py-0.5 text-[10px] font-medium text-unze-ink-secondary">
            {creator.primaryCategory}
          </span>
        )}
      </article>
  );

  if (!profilePath) {
    return (
      <div className="block" data-testid={`creator-card-${creator.id}`}>
        {card}
      </div>
    );
  }

  return (
    <Link
      href={profilePath}
      className="block touch-target active:scale-[0.98]"
      data-testid={`creator-card-${creator.id}`}
    >
      {card}
    </Link>
  );
}

interface CreatorCardListProps {
  creators: PlatformCreator[];
  title?: string;
  subtitle?: string;
}

export function CreatorCardList({ creators, title, subtitle }: CreatorCardListProps) {
  return (
    <section>
      {(title || subtitle) && (
        <header className="mb-4">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-unze-ink">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-0.5 text-sm text-unze-ink-secondary">{subtitle}</p>
          )}
        </header>
      )}
      <ul className="flex flex-col gap-3">
        {creators.map((creator) => (
          <li key={creator.id}>
            <CreatorCard creator={creator} />
          </li>
        ))}
      </ul>
    </section>
  );
}

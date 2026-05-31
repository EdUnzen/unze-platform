import { CommunityCardList } from "@/components/community/CommunityCardList";
import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";
import { CreatorReviewsSection } from "@/components/creator/CreatorReviewsSection";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatMemberCount } from "@/services/community/community.service";
import type { CreatorPublicProfile } from "@/services/creator/creator.service";
import { BadgeCheck, Users } from "lucide-react";

interface CreatorPublicProfileViewProps {
  profile: CreatorPublicProfile;
}

export function CreatorPublicProfileView({ profile }: CreatorPublicProfileViewProps) {
  const { creator, communities, groups, reviews } = profile;

  return (
    <div className="page-padding">
      <PageHeader
        title={creator.name}
        subtitle={creator.username ? `@${creator.username}` : "Creator-Profil"}
      />

      <section className="mb-6 rounded-3xl bg-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={creator.name}
            seed={creator.id}
            avatarUrl={creator.avatarUrl}
            size="xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-unze-ink">{creator.name}</h1>
              {creator.isVerified && (
                <BadgeCheck
                  className="h-5 w-5 text-unze-green"
                  aria-label="Verifizierter Creator"
                />
              )}
            </div>
            {creator.username && (
              <p className="text-sm text-unze-ink-muted">@{creator.username}</p>
            )}
            {creator.bio ? (
              <p className="mt-2 text-sm leading-relaxed text-unze-ink-secondary">
                {creator.bio}
              </p>
            ) : (
              <p className="mt-2 text-sm text-unze-ink-muted">Keine Beschreibung hinterlegt.</p>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-sm text-unze-ink-secondary">
              <Users className="h-4 w-4 text-unze-green" aria-hidden />
              {creator.communityCount} Communities ·{" "}
              {formatMemberCount(creator.totalMembers)} Mitglieder gesamt
            </p>
            {creator.primaryCategory && (
              <span className="mt-2 inline-block rounded-full bg-unze-surface-muted px-2.5 py-0.5 text-xs font-medium text-unze-ink-secondary">
                {creator.primaryCategory}
              </span>
            )}
          </div>
        </div>
      </section>

      {communities.length > 0 ? (
        <CommunityCardList
          communities={communities}
          title="Communities"
          subtitle={`${communities.length} öffentliche Communities von ${creator.name}`}
        />
      ) : (
        <section className="mb-6 rounded-3xl bg-white p-6 text-center shadow-card">
          <p className="text-sm text-unze-ink-secondary">
            Noch keine öffentlichen Communities.
          </p>
        </section>
      )}

      {groups.length > 0 && (
        <div className="mt-8">
          <CommunityGroupCardList
            groups={groups}
            title="Gruppen & Dienstleistungen"
            subtitle="Öffentliche Bereiche aus den Communities dieses Creators"
          />
        </div>
      )}

      <CreatorReviewsSection reviews={reviews} />
    </div>
  );
}

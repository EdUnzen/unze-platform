import { FollowGroupButton } from "@/components/community/FollowGroupButton";
import { PlatformBadge } from "@/components/community/PlatformBadge";
import { EntityReviewsSection } from "@/components/reviews/EntityReviewsSection";
import { GroupCoverVisual } from "@/components/visual/GroupCoverVisual";
import { getGroupVisualSeed } from "@/lib/demo/group-visuals";
import { formatMemberCount } from "@/services/community/community.service";
import { getGroupBySlugs } from "@/services/community/group.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getCommunityEvents } from "@/services/events/event.service";
import { isFollowingGroup } from "@/services/follow/follow.service";
import { CommunityEventsSection } from "@/components/events/CommunityEventsSection";
import { BadgeCheck, Star, Users, Wrench } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface GroupPageProps {
  params: Promise<{ slug: string; groupSlug: string }>;
}

function formatPrice(cents: number | null | undefined, currency = "eur"): string | null {
  if (cents == null || cents <= 0) return null;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { slug, groupSlug } = await params;
  const group = await getGroupBySlugs(slug, groupSlug);
  if (!group || !group.isPublic) notFound();

  const user = await getCurrentUser();
  const [following, events] = await Promise.all([
    user ? isFollowingGroup(group.id) : Promise.resolve(false),
    getCommunityEvents(group.communityId, 6),
  ]);

  const groupEvents = events.filter((e) => e.groupId === group.id || !e.groupId);
  const returnPath = `/community/${slug}/group/${groupSlug}`;
  const isService = group.groupType === "service";
  const priceLabel = formatPrice(group.priceCents, group.currency);

  return (
    <div className="page-padding">
      <div className="mb-4">
        <Link
          href={`/community/${slug}`}
          className="text-sm font-medium text-unze-green"
        >
          ← {group.communityTitle}
        </Link>
      </div>

      <header className="mb-4 overflow-hidden rounded-3xl bg-white shadow-card">
        <GroupCoverVisual
          seed={getGroupVisualSeed(slug, groupSlug)}
          bannerGradient={group.bannerGradient}
          className="h-40"
        />
        <div className="p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <PlatformBadge platform={group.platformType} />
            {isService && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
                <Wrench className="h-3 w-3" aria-hidden />
                Dienstleistung
              </span>
            )}
            {group.isVerified && (
              <BadgeCheck className="h-4 w-4 text-unze-green" aria-label="Verifiziert" />
            )}
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-unze-ink-muted">
            {group.communityTitle}
          </p>
          <h1 className="text-xl font-bold text-unze-ink">{group.title}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-unze-ink-secondary">
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4 text-unze-green" aria-hidden />
              {formatMemberCount(group.memberCount ?? 0)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              {group.rating} ({group.reviewCount})
            </span>
            {priceLabel && (
              <span className="font-semibold text-unze-ink">{priceLabel}</span>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <section className="rounded-3xl bg-white p-4 shadow-card">
            <h2 className="mb-2 text-sm font-semibold text-unze-ink">Beschreibung</h2>
            <p className="text-sm leading-relaxed text-unze-ink-secondary">
              {group.description || "Keine Beschreibung."}
            </p>
          </section>

          <CommunityEventsSection communitySlug={slug} events={groupEvents} />

          <EntityReviewsSection
            isLoggedIn={Boolean(user)}
            context={{
              target: "group",
              targetId: group.id,
              title: group.title,
              rating: group.rating,
              reviewCount: group.reviewCount,
              returnPath,
              canReview: Boolean(user),
            }}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {user ? (
            <section className="rounded-3xl bg-white p-4 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-unze-ink">Gruppe folgen</h2>
              <FollowGroupButton
                groupId={group.id}
                communitySlug={slug}
                groupSlug={groupSlug}
                initialFollowing={following}
              />
            </section>
          ) : (
            <section className="rounded-3xl bg-white p-4 shadow-card text-center">
              <p className="text-sm text-unze-ink-secondary">
                <Link href="/auth/login" className="font-semibold text-unze-green">
                  Anmelden
                </Link>
                , um dieser Gruppe zu folgen.
              </p>
            </section>
          )}

          <section className="rounded-3xl bg-white p-4 shadow-card">
            <h2 className="mb-2 text-sm font-semibold text-unze-ink">Community</h2>
            <Link
              href={`/community/${slug}`}
              className="text-sm font-semibold text-unze-green"
            >
              {group.communityTitle} ansehen →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

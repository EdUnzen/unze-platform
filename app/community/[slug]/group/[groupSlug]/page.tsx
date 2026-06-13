import { ServiceBookingPanel } from "@/components/services/ServiceBookingPanel";
import { ReportDialog } from "@/components/governance/ReportDialog";
import { RatingSummary } from "@/components/ui/RatingSummary";
import { FollowGroupButton } from "@/components/community/FollowGroupButton";
import { PlatformBadge } from "@/components/community/PlatformBadge";
import { EntityReviewsSection } from "@/components/reviews/EntityReviewsSection";
import { GroupCoverVisual } from "@/components/visual/GroupCoverVisual";
import { resolveGroupCoverDisplay } from "@/lib/visual/resolve-banner";
import { getGroupVisualSeed } from "@/lib/demo/group-visuals";
import { formatMemberCount } from "@/services/community/community.service";
import { getGroupBySlugs } from "@/services/community/group.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getCommunityEventsListed } from "@/services/events/event.service";
import { getFollowedEventIdsAmong, isFollowingGroup } from "@/services/follow/follow.service";
import { CommunityEventsSection } from "@/components/events/CommunityEventsSection";
import { BadgeCheck, Users, Wrench } from "lucide-react";
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
    getCommunityEventsListed(group.communityId, slug, 6),
  ]);

  const groupEvents = events.filter((e) => e.groupId === group.id || !e.groupId);
  const followedEventIds =
    user && groupEvents.length > 0
      ? await getFollowedEventIdsAmong(groupEvents.map((e) => e.id))
      : [];
  const returnPath = `/community/${slug}/group/${groupSlug}`;
  const isService = group.groupType === "service";
  const priceLabel = formatPrice(group.priceCents, group.currency);
  const cover = resolveGroupCoverDisplay({
    coverUrl: group.coverUrl,
    bannerGradient: group.bannerGradient,
    category: group.category,
  });

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
          bannerGradient={cover.gradient}
          imageUrl={cover.imageUrl}
          className="h-40"
        />
        <div className="p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <PlatformBadge platform={group.platformType} />
            {isService && (
              <span className="inline-flex items-center gap-1 rounded-full bg-unze-green-muted px-2 py-0.5 text-[10px] font-semibold text-unze-green-dark">
                <Wrench className="h-3 w-3" aria-hidden />
                Service
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
            <RatingSummary
              rating={group.rating}
              reviewCount={group.reviewCount}
              className="text-sm text-unze-ink-secondary"
            />
            {priceLabel && (
              <span className="font-semibold text-unze-ink">{priceLabel}</span>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <div className="space-y-4 order-2">
          <section className="rounded-3xl bg-white p-4 shadow-card">
            <h2 className="mb-2 text-sm font-semibold text-unze-ink">Beschreibung</h2>
            <p className="text-sm leading-relaxed text-unze-ink-secondary">
              {group.description || "Keine Beschreibung."}
            </p>
          </section>

          <CommunityEventsSection
            communitySlug={slug}
            events={groupEvents}
            followedEventIds={followedEventIds}
            showFollowButtons={Boolean(user)}
          />

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

        <aside className="order-1 space-y-4">
          {isService ? (
            <ServiceBookingPanel
              communityId={group.communityId}
              communitySlug={slug}
              groupId={group.id}
              groupSlug={groupSlug}
              groupTitle={group.title}
              priceCents={group.priceCents ?? 0}
              currency={group.currency}
              isLoggedIn={Boolean(user)}
            />
          ) : null}

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

          {user && (
            <div className="flex justify-end">
              <ReportDialog
                targetType="group"
                targetId={group.id}
                communityId={group.communityId}
                label={isService ? "Service melden" : "Gruppe melden"}
                returnPath={returnPath}
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

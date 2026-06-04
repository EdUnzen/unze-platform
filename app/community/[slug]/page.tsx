import { CommunityFocusChips } from "@/components/community/CommunityFocusChips";

import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";

import { CommunityHeader } from "@/components/community/CommunityHeader";

import { CommunityJoinPanel } from "@/components/community/CommunityJoinPanel";

import { CommunityLevelPanel } from "@/components/community/CommunityLevelPanel";

import { CommunityManageButton } from "@/components/community/CommunityManageButton";

import { CommunityMemberShowcase } from "@/components/community/CommunityMemberShowcase";

import { CommunityPageTabs } from "@/components/community/CommunityPageTabs";
import {
  isCommunityTabId,
  type CommunityTabId,
} from "@/lib/constants/community-tabs";

import { CommunityTabSectionHeader } from "@/components/community/CommunityTabSectionHeader";

import { CommunityPlatformLinksSection } from "@/components/community/CommunityPlatformLinksSection";

import { CommunityRulesSection } from "@/components/community/CommunityRulesSection";

import { CommunityStatsRow } from "@/components/community/CommunityStatsRow";

import { CommunityViewRecorder } from "@/components/community/CommunityViewRecorder";

import { CreatorProfileCard } from "@/components/community/CreatorProfileCard";

import { CommunityEventsSection } from "@/components/events/CommunityEventsSection";

import { FeedPostList } from "@/components/feed/FeedPostList";

import { ReportDialog } from "@/components/governance/ReportDialog";

import { EntityReviewsSection } from "@/components/reviews/EntityReviewsSection";

import { EmptyStateVisual } from "@/components/visual/EmptyStateVisual";

import { getEffectiveJoinQuestions } from "@/lib/access/join-questions";

import { mapGroupToDiscoverCard } from "@/lib/community/map-discover-group";

import { getJoinQuestions } from "@/services/access/access.service";

import { getCurrentUser } from "@/services/auth/auth.service";

import { fetchCommunityEntityCounts } from "@/services/community/community-counts";

import {
  levelMetricsFromCounts,
  levelMetricsFromGroups,
  persistCommunityLevel,
  resolveCommunityLevelFromMetrics,
} from "@/services/community/community-level.service";

import { getCommunityBySlug } from "@/services/community/community.service";

import { getCommunityGroups } from "@/services/community/group.service";

import { fetchMembersForShowcase } from "@/services/community/member.repository";

import { canEditCommunity } from "@/services/community/member.service";

import { fetchCommunityPlatformLinksFromDb } from "@/services/community/platform-links.repository";

import { getCommunityEventsListed } from "@/services/events/event.service";

import { getFollowedEventIdsAmong } from "@/services/follow/follow.service";

import { getCommunityPosts } from "@/services/feed/feed.service";

import { getCommunityActivityStats } from "@/services/platform/activity-stats.service";

import {
  Calendar,
  ChevronLeft,
  FolderOpen,
  Megaphone,
  Pencil,
  Wrench,
} from "lucide-react";

import Link from "next/link";

import { notFound } from "next/navigation";

interface CommunityPageProps {
  params: Promise<{ slug: string }>;

  searchParams: Promise<{ invite?: string; joined?: string; tab?: string }>;
}

function parseTab(tab: string | undefined): CommunityTabId {
  if (isCommunityTabId(tab)) return tab;
  return "overview";
}

export default async function CommunityPage({
  params,

  searchParams,
}: CommunityPageProps) {
  const { slug } = await params;

  const { invite, tab: tabParam } = await searchParams;

  const tab = parseTab(tabParam);

  const community = await getCommunityBySlug(slug, invite ?? null);

  if (!community) notFound();

  const user = await getCurrentUser();

  const needsGroupList = tab === "groups" || tab === "services";

  const needsEventsList = tab === "events";

  const needsFeed = tab === "feed" || tab === "overview";

  const needsOverviewExtras = tab === "overview";

  const needsMembers = tab === "members";

  const needsCountsOnly = !needsGroupList;

  const [
    groups,

    events,

    entityCounts,

    platformLinks,

    activityStats,

    showcaseMembers,

    feedPosts,
  ] = await Promise.all([
    needsGroupList
      ? getCommunityGroups(community.id, slug)
      : Promise.resolve([]),

    needsEventsList
      ? getCommunityEventsListed(community.id, slug, 12)
      : Promise.resolve([]),

    needsCountsOnly
      ? fetchCommunityEntityCounts(community.id)
      : Promise.resolve(null),

    needsOverviewExtras
      ? fetchCommunityPlatformLinksFromDb(community.id)
      : Promise.resolve([]),

    getCommunityActivityStats([community.id]),

    needsMembers && community.showMemberArea
      ? fetchMembersForShowcase(community.id, slug)
      : Promise.resolve([]),

    needsFeed ? getCommunityPosts(community.id, 20) : Promise.resolve([]),
  ]);

  const eventCountForLevel = needsEventsList
    ? events.length
    : (entityCounts?.upcomingEventCount ?? 0);

  const stats = activityStats[community.id];

  const levelMetrics =
    groups.length > 0
      ? levelMetricsFromGroups(
          community,

          groups,

          eventCountForLevel,

          stats?.weeklyPostCount ?? 0,
        )
      : entityCounts
        ? levelMetricsFromCounts(
            community,

            entityCounts,

            stats?.weeklyPostCount ?? 0,
          )
        : levelMetricsFromGroups(community, [], 0, stats?.weeklyPostCount ?? 0);

  const levelResult = resolveCommunityLevelFromMetrics(levelMetrics);

  if (
    levelResult.level !== community.communityLevel ||
    levelResult.score !== community.levelScore
  ) {
    void persistCommunityLevel(community.id, levelResult);
  }

  const regularGroupCount =
    groups.length > 0
      ? groups.filter((g) => g.groupType !== "service").length
      : (entityCounts?.regularGroupCount ?? 0);

  const serviceGroupCount =
    groups.length > 0
      ? groups.filter((g) => g.groupType === "service").length
      : (entityCounts?.serviceGroupCount ?? 0);

  const eventCount = needsEventsList
    ? events.length
    : (entityCounts?.upcomingEventCount ?? 0);

  const followedEventIds =
    needsEventsList && user && events.length > 0
      ? await getFollowedEventIdsAmong(events.map((e) => e.id))
      : [];

  const communityWithLevel = {
    ...community,

    communityLevel: levelResult.level,

    levelScore: levelResult.score,
  };

  const regularGroups = groups.filter((g) => g.groupType !== "service");

  const serviceGroups = groups.filter((g) => g.groupType === "service");

  const discoverRegular = regularGroups.map((g) =>
    mapGroupToDiscoverCard(communityWithLevel, g),
  );

  const discoverServices = serviceGroups.map((g) =>
    mapGroupToDiscoverCard(communityWithLevel, g),
  );

  const rawQuestions = needsOverviewExtras
    ? await getJoinQuestions(community.id, true)
    : [];

  const questions = getEffectiveJoinQuestions(rawQuestions, community.access);

  const canEdit = canEditCommunity(community.membership?.role ?? null);

  return (
    <div className="page-padding">
      <CommunityViewRecorder communityId={community.id} />

      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1 text-sm font-medium text-unze-green"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Discover
        </Link>

        {canEdit && (
          <Link
            href={`/community/${slug}/edit`}
            className="flex items-center gap-1 rounded-full bg-unze-surface-muted px-3 py-1.5 text-xs font-medium text-unze-ink"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Bearbeiten
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <CommunityHeader
          community={communityWithLevel}
          displayLevel={levelResult.level}
        />

        <CommunityStatsRow
          memberCount={community.memberCount}
          groupCount={regularGroupCount}
          eventCount={eventCount}
          serviceCount={serviceGroupCount}
          rating={community.rating}
        />

        <CommunityPageTabs slug={slug} activeTab={tab} />

        {tab === "overview" && (
          <div className="space-y-4">
            <section className="rounded-3xl bg-white p-4 shadow-card">
              <h2 className="mb-2 text-sm font-semibold text-unze-ink">
                Über diese Community
              </h2>

              <p className="text-sm leading-relaxed text-unze-ink-secondary">
                {community.description}
              </p>

              {community.focusTags.length > 0 && (
                <div className="mt-3">
                  <CommunityFocusChips focusTags={community.focusTags} />
                </div>
              )}
            </section>

            <CommunityLevelPanel levelResult={levelResult} />

            <CommunityPlatformLinksSection
              community={communityWithLevel}
              links={platformLinks}
            />

            <CreatorProfileCard community={communityWithLevel} />

            {feedPosts.length > 0 && (
              <section className="rounded-3xl bg-white p-4 shadow-card">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-unze-ink">
                    Aktuelles
                  </h2>

                  <Link
                    href={`/community/${slug}?tab=feed`}
                    className="text-xs font-medium text-unze-green"
                  >
                    Alle anzeigen
                  </Link>
                </div>

                <FeedPostList
                  posts={feedPosts.slice(0, 3)}
                  isLoggedIn={Boolean(user)}
                />
              </section>
            )}

            <section className="rounded-3xl bg-white p-4 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-unze-ink">
                Community beitreten
              </h2>

              <CommunityJoinPanel
                community={communityWithLevel}
                slug={slug}
                isLoggedIn={Boolean(user)}
                questions={questions}
                inviteCode={
                  invite ?? community.joinAccess?.validInviteCode ?? undefined
                }
              />

              <div className="mt-3">
                <CommunityManageButton slug={slug} userId={user?.id ?? null} />
              </div>
            </section>
          </div>
        )}

        {tab === "groups" && (
          <section className="rounded-3xl bg-white p-4 shadow-card">
            <CommunityTabSectionHeader
              title="Gruppen"
              subtitle="Bereiche innerhalb dieser Community"
              icon={FolderOpen}
            />
            {discoverRegular.length === 0 ? (
              <EmptyStateVisual
                icon={FolderOpen}
                title="Noch keine Gruppen"
                description="Gruppen gehören immer zu dieser Community."
                className="py-8"
              />
            ) : (
              <CommunityGroupCardList
                groups={discoverRegular}
                layout="vertical"
              />
            )}
          </section>
        )}

        {tab === "services" && (
          <section className="rounded-3xl bg-white p-4 shadow-card">
            <CommunityTabSectionHeader
              title="Services"
              subtitle="Dienstleistungen buchen & bewerten"
              icon={Wrench}
            />
            {discoverServices.length === 0 ? (
              <EmptyStateVisual
                icon={Wrench}
                title="Noch keine Services"
                description="Dienstleistungen werden als Gruppen vom Typ Service angelegt."
              />
            ) : (
              <CommunityGroupCardList
                groups={discoverServices}
                layout="vertical"
              />
            )}
          </section>
        )}

        {tab === "events" && (
          <section className="rounded-3xl bg-white p-4 shadow-card">
            <CommunityTabSectionHeader
              title="Events"
              subtitle="Kommende Termine & Highlights"
              icon={Calendar}
            />
            {events.length === 0 ? (
              <EmptyStateVisual
                icon={Calendar}
                title="Noch keine Events"
                description="Events werden vom Community-Team angelegt."
                className="py-8"
              />
            ) : (
              <CommunityEventsSection
                communitySlug={slug}
                events={events}
                followedEventIds={followedEventIds}
                showFollowButtons={Boolean(user)}
                embedded
              />
            )}
          </section>
        )}

        {tab === "members" && (
          <section className="rounded-3xl bg-white p-4 shadow-card">
            <CommunityMemberShowcase members={showcaseMembers} />
          </section>
        )}

        {tab === "feed" && (
          <section className="rounded-3xl bg-white p-4 shadow-card">
            <header className="mb-3 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-unze-green" aria-hidden />

              <div>
                <h2 className="text-sm font-semibold text-unze-ink">
                  Community-Feed
                </h2>

                <p className="text-xs text-unze-ink-secondary">
                  Ankündigungen, News, Events &amp; Serviceangebote — kein
                  Social-Media-Feed
                </p>
              </div>
            </header>

            <FeedPostList
              posts={feedPosts}
              isLoggedIn={Boolean(user)}
              emptyMessage="Noch keine Ankündigungen in dieser Community."
            />
          </section>
        )}

        {(tab === "overview" || tab === "groups") && (
          <>
            <EntityReviewsSection
              isLoggedIn={Boolean(user)}
              context={{
                target: "community",

                targetId: community.id,

                title: community.title,

                rating: community.rating,

                reviewCount: community.reviewCount,

                returnPath: `/community/${slug}`,

                canReview: Boolean(user && community.membership?.isMember),
              }}
            />

            <CommunityRulesSection community={communityWithLevel} />
          </>
        )}

        {user && (
          <div className="flex flex-wrap gap-2 rounded-3xl bg-white p-4 shadow-card">
            <ReportDialog
              targetType="community"
              targetId={community.id}
              communityId={community.id}
              returnPath={`/community/${slug}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

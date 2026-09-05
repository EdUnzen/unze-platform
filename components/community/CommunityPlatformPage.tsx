import { CommunityFocusChips } from "@/components/community/CommunityFocusChips";

import { CommunityGroupsOrganizedList } from "@/components/community/CommunityGroupsOrganizedList";

import { CommunityAvailableAwards } from "@/components/community/CommunityAvailableAwards";

import { CommunityOverviewHighlights } from "@/components/community/CommunityOverviewHighlights";

import { CommunityHeader } from "@/components/community/CommunityHeader";

import { CommunityJoinPanel } from "@/components/community/CommunityJoinPanel";

import { CommunityRequirementsHint } from "@/components/community/CommunityRequirementsHint";

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

import { CommunityVisitTracker } from "@/components/community/CommunityVisitTracker";
import { CommunityViewRecorder } from "@/components/community/CommunityViewRecorder";

import { CreatorProfileCard } from "@/components/community/CreatorProfileCard";

import { CommunityEventsSection } from "@/components/events/CommunityEventsSection";

import dynamic from "next/dynamic";

const FeedPostList = dynamic(
  () =>
    import("@/components/feed/FeedPostList").then((mod) => mod.FeedPostList),
  {
    loading: () => (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-2xl bg-unze-surface-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-unze-surface-muted" />
      </div>
    ),
  },
);

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

import { settle } from "@/lib/utils/safe-promise";
import { getCommunityBySlug } from "@/services/community/community.service";

import { getCommunityGroups } from "@/services/community/group.service";

import { fetchMembersForShowcase } from "@/services/community/member.repository";

import { canEditCommunity } from "@/services/community/member.service";

import { fetchCommunityPlatformLinksFromDb } from "@/services/community/platform-links.repository";

import { getCommunityEventsListed } from "@/services/events/event.service";
import { getCommunityAvailableAwards } from "@/services/badges/badge.service";
import { fetchUserBadgesForCommunity } from "@/services/badges/badge.repository";

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

import type { CommunityPageProps } from "@/components/community/community-page-types";

function parseTab(tab: string | undefined): CommunityTabId {
  if (isCommunityTabId(tab)) return tab;
  return "overview";
}

export async function CommunityPlatformPage({
  params,

  searchParams,
}: CommunityPageProps) {
  const { slug } = await params;

  const { invite, tab: tabParam, checkout } = await searchParams;

  const tab = parseTab(tabParam);

  let community;
  try {
    community = await getCommunityBySlug(slug, invite ?? null);
  } catch (error) {
    console.error("[community.page] load:", slug, error);
    throw error;
  }

  if (!community) notFound();

  const user = await getCurrentUser();

  let activityFeedEnabled = true;
  if (user) {
    try {
      const { getCommunityActivityPrefs } = await import(
        "@/services/notifications/community-activity.service"
      );
      const prefs = await getCommunityActivityPrefs(user.id);
      activityFeedEnabled = prefs[community.id] !== false;
    } catch (error) {
      console.error("[community.page] activity prefs:", error);
    }
  }

  const needsGroupList = tab === "groups" || tab === "services" || tab === "overview";

  const needsEventsList = tab === "events" || tab === "overview";

  const needsFeed = tab === "feed" || tab === "overview";
  const feedLimit = tab === "overview" ? 5 : 20;

  const needsOverviewExtras = tab === "overview";

  const needsAvailableAwards = tab === "overview";

  const needsMembers = tab === "members";

  const eventsFetchLimit = tab === "events" ? 50 : 12;

  const needsCountsOnly = !needsGroupList;

  const emptyStats = {
    [community.id]: { weeklyPostCount: 0, totalPostCount: 0 },
  };

  const [
    groups,
    events,
    entityCounts,
    platformLinks,
    activityStats,
    showcaseMembers,
    feedPosts,
    availableAwards,
  ] = await Promise.all([
    needsGroupList
      ? settle("groups", getCommunityGroups(community.id, slug), [])
      : Promise.resolve([]),
    needsEventsList
      ? settle(
          "events",
          getCommunityEventsListed(community.id, slug, eventsFetchLimit),
          [],
        )
      : Promise.resolve([]),
    needsCountsOnly
      ? settle(
          "entityCounts",
          fetchCommunityEntityCounts(community.id),
          {
            regularGroupCount: 0,
            serviceGroupCount: 0,
            upcomingEventCount: 0,
          },
        )
      : Promise.resolve(null),
    needsOverviewExtras
      ? settle(
          "platformLinks",
          fetchCommunityPlatformLinksFromDb(community.id),
          [],
        )
      : Promise.resolve([]),
    tab === "members"
      ? Promise.resolve(emptyStats)
      : settle(
          "activityStats",
          getCommunityActivityStats([community.id]),
          emptyStats,
        ),
    needsMembers && community.showMemberArea
      ? settle(
          "showcaseMembers",
          fetchMembersForShowcase(community.id, slug),
          [],
        )
      : Promise.resolve([]),
    needsFeed
      ? settle("feedPosts", getCommunityPosts(community.id, feedLimit), [])
      : Promise.resolve([]),
    needsAvailableAwards
      ? settle("availableAwards", getCommunityAvailableAwards(community.id), [])
      : Promise.resolve([]),
  ]);

  const showcaseMemberAwards =
    needsMembers && showcaseMembers.length > 0
      ? await settle(
          "showcaseMemberAwards",
          fetchUserBadgesForCommunity(
            community.id,
            showcaseMembers.map((m) => m.userId),
            { publicOnly: true },
          ),
          {},
        )
      : {};

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
    tab === "overview" &&
    (levelResult.level !== community.communityLevel ||
      levelResult.score !== community.levelScore)
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
      ? await settle(
          "followedEvents",
          getFollowedEventIdsAmong(events.map((e) => e.id)),
          [],
        )
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
    ? await settle("joinQuestions", getJoinQuestions(community.id, true), [])
    : [];

  const questions = getEffectiveJoinQuestions(rawQuestions, community.access);

  const canEdit = canEditCommunity(community.membership?.role ?? null);

  return (
    <div className="page-padding">
      <CommunityViewRecorder communityId={community.id} />
      <CommunityVisitTracker slug={slug} />

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
          displayScore={levelResult.score}
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

            <CommunityOverviewHighlights
              slug={slug}
              events={events}
              groups={discoverRegular}
              services={discoverServices}
              followedEventIds={followedEventIds}
              showFollowButtons={Boolean(user)}
              communityBannerUrl={communityWithLevel.bannerUrl}
              communityCategory={communityWithLevel.category}
              communityBannerGradient={communityWithLevel.bannerGradient}
            />

            <CommunityAvailableAwards
              slug={slug}
              awards={availableAwards}
              communityTitle={communityWithLevel.title}
            />

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

            <section id="beitritt" className="rounded-3xl bg-white p-4 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-unze-ink">
                Community beitreten
              </h2>

              {user && !community.membership?.isMember && (
                <div className="mb-3">
                  <CommunityRequirementsHint userId={user.id} communityId={community.id} />
                </div>
              )}

              <CommunityJoinPanel
                community={communityWithLevel}
                slug={slug}
                isLoggedIn={Boolean(user)}
                questions={questions}
                activityFeedEnabled={activityFeedEnabled}
                checkoutCancelled={checkout === "cancel"}
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
              <CommunityGroupsOrganizedList
                groups={discoverRegular}
                cardVariant="group"
              />
            )}
          </section>
        )}

        {tab === "services" && (
          <section className="rounded-3xl bg-white p-4 shadow-card">
            <CommunityTabSectionHeader
              title="Services"
              subtitle="Services buchen und bewerten"
              icon={Wrench}
            />
            {discoverServices.length === 0 ? (
              <EmptyStateVisual
                icon={Wrench}
                title="Noch keine Services"
                description="Services werden als Gruppen vom Typ Service angelegt."
              />
            ) : (
              <CommunityGroupsOrganizedList
                groups={discoverServices}
                cardVariant="service"
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
                communityBannerUrl={communityWithLevel.bannerUrl}
                communityCategory={communityWithLevel.category}
                communityBannerGradient={communityWithLevel.bannerGradient}
                embedded
                limit={null}
                layout="timeline"
              />
            )}
          </section>
        )}

        {tab === "members" && (
          <section className="rounded-3xl bg-white p-4 shadow-card">
            <CommunityMemberShowcase
              members={showcaseMembers}
              memberAwards={showcaseMemberAwards}
            />
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

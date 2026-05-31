import { CommunityGroupSection } from "@/components/community/CommunityGroupSection";
import { CommunityJoinPanel } from "@/components/community/CommunityJoinPanel";
import { CommunityManageButton } from "@/components/community/CommunityManageButton";
import { CommunityAtAGlance } from "@/components/community/CommunityAtAGlance";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CommunityMetaGrid } from "@/components/community/CommunityMetaGrid";
import { CommunityPlatformLinksSection } from "@/components/community/CommunityPlatformLinksSection";
import { EntityReviewsSection } from "@/components/reviews/EntityReviewsSection";
import { CommunityRulesSection } from "@/components/community/CommunityRulesSection";
import { CommunitySocialProof } from "@/components/community/CommunitySocialProof";
import { CommunityViewRecorder } from "@/components/community/CommunityViewRecorder";
import { CreatorProfileCard } from "@/components/community/CreatorProfileCard";
import { CommunityEventsSection } from "@/components/events/CommunityEventsSection";
import { ReportDialog } from "@/components/governance/ReportDialog";
import { getEffectiveJoinQuestions } from "@/lib/access/join-questions";
import { getJoinQuestions } from "@/services/access/access.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getCommunityBySlug } from "@/services/community/community.service";
import { getCommunityGroups } from "@/services/community/group.service";
import { fetchCommunityPlatformLinksFromDb } from "@/services/community/platform-links.repository";
import { canEditCommunity } from "@/services/community/member.service";
import { getCommunityEvents } from "@/services/events/event.service";
import {
  getCommunityActivityStats,
} from "@/services/platform/activity-stats.service";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CommunityPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ invite?: string; joined?: string }>;
}

export default async function CommunityPage({
  params,
  searchParams,
}: CommunityPageProps) {
  const { slug } = await params;
  const { invite } = await searchParams;
  const community = await getCommunityBySlug(slug, invite ?? null);

  if (!community) notFound();

  const user = await getCurrentUser();

  const [groups, events, platformLinks, activityStats] = await Promise.all([
    getCommunityGroups(community.id),
    getCommunityEvents(community.id, 8),
    fetchCommunityPlatformLinksFromDb(community.id),
    getCommunityActivityStats([community.id]),
  ]);

  const stats = activityStats[community.id];
  const rawQuestions = await getJoinQuestions(community.id, true);
  const questions = getEffectiveJoinQuestions(rawQuestions, community.access);

  const canEdit = canEditCommunity(community.membership?.role ?? null);

  return (
    <div className="page-padding">
      <CommunityViewRecorder communityId={community.id} />
      <div className="mb-4 flex items-center justify-between">
        <Link href="/discover" className="text-sm font-medium text-unze-green">
          ← Discover
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
        <CommunityHeader community={community} />

        <CommunitySocialProof
          community={community}
          weeklyEventCount={stats?.weeklyEventCount}
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <section className="rounded-3xl bg-white p-4 shadow-card">
              <h2 className="mb-2 text-sm font-semibold text-unze-ink">
                Über diese Community
              </h2>
              <p className="text-sm leading-relaxed text-unze-ink-secondary">
                {community.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {community.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-unze-surface-muted px-2.5 py-1 text-xs font-medium text-unze-ink-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <CommunityPlatformLinksSection
              community={community}
              links={platformLinks}
            />
            <CommunityMetaGrid community={community} />
            <CommunityEventsSection communitySlug={slug} events={events} />
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
            <CommunityRulesSection community={community} />
            <CreatorProfileCard community={community} />
            <CommunityGroupSection community={community} groups={groups} />
          </div>

          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <CommunityAtAGlance community={community} />

            <section className="rounded-3xl bg-white p-4 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-unze-ink">
                Community beitreten
              </h2>
              <CommunityJoinPanel
                community={community}
                slug={slug}
                isLoggedIn={Boolean(user)}
                questions={questions}
                inviteCode={invite ?? community.joinAccess?.validInviteCode ?? undefined}
              />
              <div className="mt-3">
                <CommunityManageButton slug={slug} userId={user?.id ?? null} />
              </div>
            </section>
          </div>
        </div>

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

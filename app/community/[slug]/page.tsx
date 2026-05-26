import { CommunityGroupList } from "@/components/community/CommunityGroupList";
import { CommunityJoinPanel } from "@/components/community/CommunityJoinPanel";
import { CommunityManageButton } from "@/components/community/CommunityManageButton";
import { CommunityAtAGlance } from "@/components/community/CommunityAtAGlance";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CommunityMetaGrid } from "@/components/community/CommunityMetaGrid";
import { CommunityReviewsPrep } from "@/components/community/CommunityReviewsPrep";
import { CommunityRulesSection } from "@/components/community/CommunityRulesSection";
import { CommunitySocialProof } from "@/components/community/CommunitySocialProof";
import { CreatorProfileCard } from "@/components/community/CreatorProfileCard";
import { FeedPostList } from "@/components/feed/FeedPostList";
import { ReportDialog } from "@/components/governance/ReportDialog";
import { getEffectiveJoinQuestions } from "@/lib/access/join-questions";
import { getJoinQuestions } from "@/services/access/access.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getCommunityBySlug } from "@/services/community/community.service";
import { getCommunityGroups } from "@/services/community/group.service";
import { canEditCommunity } from "@/services/community/member.service";
import { getCommunityPosts } from "@/services/feed/feed.service";
import { getCommunityActivityStats } from "@/services/platform/activity-stats.service";
import { ExternalLink, Pencil } from "lucide-react";
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

  const groups = await getCommunityGroups(community.id);
  const posts = await getCommunityPosts(community.id, 8);
  const activityStats = await getCommunityActivityStats([community.id]);
  const stats = activityStats[community.id];
  const rawQuestions = await getJoinQuestions(community.id, true);
  const questions = getEffectiveJoinQuestions(rawQuestions, community.access);

  const canEdit = canEditCommunity(community.membership?.role ?? null);

  return (
    <div className="page-padding">
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
          weeklyPostCount={stats?.weeklyPostCount}
          totalPostCount={stats?.totalPostCount}
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
              {community.externalUrl && (
                <a
                  href={community.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-unze-green"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Externe Plattform öffnen
                </a>
              )}
            </section>

            <CommunityMetaGrid community={community} />
            <CommunityReviewsPrep community={community} />
            <CommunityRulesSection community={community} />
            <CreatorProfileCard community={community} />
            <CommunityGroupList groups={groups} />

            {posts.length > 0 && (
              <section className="rounded-3xl bg-white p-4 shadow-card">
                <header className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-unze-ink">
                      Community-Feed
                    </h2>
                    <p className="text-xs text-unze-ink-secondary">
                      Aktuelle Beiträge und Updates
                    </p>
                  </div>
                  <Link
                    href="/discover?tab=feed"
                    className="text-xs font-semibold text-unze-green"
                  >
                    Mehr →
                  </Link>
                </header>
                <FeedPostList
                  posts={posts}
                  isLoggedIn={Boolean(user)}
                  emptyMessage="Noch keine Beiträge."
                />
              </section>
            )}
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

"use client";

import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";
import { CommunityEventsSection } from "@/components/events/CommunityEventsSection";
import type { DiscoverGroup } from "@/types/community";
import type { CommunityEvent } from "@/types/event";
import { Calendar, ChevronRight, FolderOpen, Wrench } from "lucide-react";
import Link from "next/link";

interface CommunityOverviewHighlightsProps {
  slug: string;
  events: CommunityEvent[];
  groups: DiscoverGroup[];
  services: DiscoverGroup[];
  followedEventIds?: string[];
  showFollowButtons?: boolean;
  communityBannerUrl?: string | null;
  communityCategory?: string;
  communityBannerGradient?: string;
}

export function CommunityOverviewHighlights({
  slug,
  events,
  groups,
  services,
  followedEventIds = [],
  showFollowButtons = false,
  communityBannerUrl,
  communityCategory,
  communityBannerGradient,
}: CommunityOverviewHighlightsProps) {
  const hasEvents = events.length > 0;
  const hasGroups = groups.length > 0;
  const hasServices = services.length > 0;

  if (!hasEvents && !hasGroups && !hasServices) return null;

  const featuredGroups = [...groups]
    .sort((a, b) => {
      if (a.isTrending !== b.isTrending) return a.isTrending ? -1 : 1;
      return b.memberCount - a.memberCount;
    })
    .slice(0, 6);

  const featuredServices = services.slice(0, 4);

  return (
    <div className="space-y-4">
      {hasEvents && (
        <section className="rounded-3xl bg-white p-4 shadow-card">
          <header className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-unze-green" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold text-unze-ink">Demnächst</h2>
                <p className="text-xs text-unze-ink-secondary">Nächste Termine in dieser Community</p>
              </div>
            </div>
            <Link
              href={`/community/${slug}?tab=events`}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-unze-green"
            >
              Alle Events
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </header>
          <CommunityEventsSection
            communitySlug={slug}
            events={events}
            followedEventIds={followedEventIds}
            showFollowButtons={showFollowButtons}
            embedded
            limit={3}
            layout="timeline"
            communityBannerUrl={communityBannerUrl}
            communityCategory={communityCategory}
            communityBannerGradient={communityBannerGradient}
          />
        </section>
      )}

      {hasGroups && (
        <section className="rounded-3xl bg-white p-4 shadow-card">
          <header className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-unze-green" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold text-unze-ink">Gruppen</h2>
                <p className="text-xs text-unze-ink-secondary">Beliebte Bereiche &amp; Channels</p>
              </div>
            </div>
            <Link
              href={`/community/${slug}?tab=groups`}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-unze-green"
            >
              Alle Gruppen
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </header>
          <CommunityGroupCardList groups={featuredGroups} layout="horizontal" cardVariant="group" />
        </section>
      )}

      {hasServices && (
        <section className="rounded-3xl bg-white p-4 shadow-card">
          <header className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-unze-green" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold text-unze-ink">Services &amp; Angebote</h2>
                <p className="text-xs text-unze-ink-secondary">Buchbare Leistungen dieser Community</p>
              </div>
            </div>
            <Link
              href={`/community/${slug}?tab=services`}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-unze-green"
            >
              Alle Services
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </header>
          <CommunityGroupCardList
            groups={featuredServices}
            layout="vertical"
            cardVariant="service"
          />
        </section>
      )}
    </div>
  );
}

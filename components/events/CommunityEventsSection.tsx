import { PlatformBadge } from "@/components/community/PlatformBadge";
import { FollowEventButton } from "@/components/events/FollowEventButton";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { resolveEventCoverDisplay } from "@/lib/visual/resolve-banner";
import type { CommunityEvent } from "@/types/event";
import { Calendar, ExternalLink, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

interface CommunityEventsSectionProps {
  communitySlug: string;
  events: CommunityEvent[];
  followedEventIds?: string[];
  showFollowButtons?: boolean;
  /** Kein äußerer Karten-Header (z. B. Community-Events-Tab) */
  embedded?: boolean;
  /** Max. Anzahl. `null` = alle. Standard: 5 */
  limit?: number | null;
  layout?: "list" | "timeline";
  communityBannerUrl?: string | null;
  communityCategory?: string;
  communityBannerGradient?: string;
}

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimelineDay(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  });
}

function partitionEvents(events: CommunityEvent[]) {
  const soonThreshold = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const soon: CommunityEvent[] = [];
  const later: CommunityEvent[] = [];

  for (const event of events) {
    if (new Date(event.startsAt).getTime() <= soonThreshold) {
      soon.push(event);
    } else {
      later.push(event);
    }
  }

  return { soon, later };
}

function applyLimit(events: CommunityEvent[], limit?: number | null) {
  if (limit === null) return events;
  const max = limit ?? 5;
  return events.slice(0, max);
}

interface EventCardProps {
  event: CommunityEvent;
  communitySlug: string;
  followedSet: Set<string>;
  showFollowButtons: boolean;
  communityBannerUrl?: string | null;
  communityCategory: string;
  communityBannerGradient?: string;
  layout: "list" | "timeline";
  compact?: boolean;
}

function EventCard({
  event,
  communitySlug,
  followedSet,
  showFollowButtons,
  communityBannerUrl,
  communityCategory,
  communityBannerGradient,
  layout,
  compact = false,
}: EventCardProps) {
  const eventCover = resolveEventCoverDisplay({
    coverUrl: event.coverUrl,
    communityCategory,
    communityBannerUrl,
    communityGradient: communityBannerGradient,
  });

  const content = (
    <>
      {!compact && (
        <CommunityCoverVisual
          seed={event.id}
          bannerGradient={eventCover.gradient}
          cover={eventCover.cover}
          className="h-24"
          overlay="card"
          imageVariant="list"
        />
      )}
      <div className={compact ? "p-3" : "p-3"}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {event.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Highlight
                </span>
              )}
              {event.groupTitle && (
                <span className="text-[10px] font-medium text-unze-ink-muted">
                  {event.groupTitle}
                </span>
              )}
            </div>
            <Link
              href={`/community/${communitySlug}/event/${event.id}`}
              className="font-semibold text-unze-ink hover:text-unze-green"
            >
              {event.title}
            </Link>
            {event.description && !compact && (
              <p className="mt-1 line-clamp-2 text-xs text-unze-ink-secondary">
                {event.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-unze-ink-secondary">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-unze-green" aria-hidden />
                {formatEventDate(event.startsAt)}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {event.location}
                </span>
              )}
            </div>
          </div>
          {showFollowButtons && (
            <FollowEventButton
              eventId={event.id}
              communitySlug={communitySlug}
              initialFollowing={followedSet.has(event.id)}
            />
          )}
        </div>
        {event.externalUrl && (
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-unze-green"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Externe Plattform öffnen
          </a>
        )}
      </div>
    </>
  );

  if (layout === "timeline") {
    return (
      <li className="relative pl-8">
        <div
          className="absolute left-0 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-unze-green bg-white text-[9px] font-bold leading-none text-unze-green-dark"
          aria-hidden
        >
          {new Date(event.startsAt).getDate()}
        </div>
        <div className="overflow-hidden rounded-2xl border border-unze-border/80 bg-unze-surface-muted/20">
          {content}
        </div>
        <span className="absolute left-0 top-10 -translate-x-0 text-[9px] font-medium text-unze-ink-muted">
          {formatTimelineDay(event.startsAt)}
        </span>
      </li>
    );
  }

  return (
    <li className="overflow-hidden rounded-2xl border border-unze-border/80 bg-unze-surface-muted/20">
      {content}
    </li>
  );
}

function EventListBlock({
  title,
  events,
  communitySlug,
  followedSet,
  showFollowButtons,
  communityBannerUrl,
  communityCategory,
  communityBannerGradient,
  layout,
}: {
  title?: string;
  events: CommunityEvent[];
  communitySlug: string;
  followedSet: Set<string>;
  showFollowButtons: boolean;
  communityBannerUrl?: string | null;
  communityCategory: string;
  communityBannerGradient?: string;
  layout: "list" | "timeline";
}) {
  if (events.length === 0) return null;

  return (
    <div className={title ? "space-y-3" : ""}>
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-unze-ink-muted">
          {title}
        </h3>
      )}
      <ul
        className={
          layout === "timeline"
            ? "relative space-y-4 border-l-2 border-unze-green/25 pl-4"
            : "space-y-3"
        }
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            communitySlug={communitySlug}
            followedSet={followedSet}
            showFollowButtons={showFollowButtons}
            communityBannerUrl={communityBannerUrl}
            communityCategory={communityCategory}
            communityBannerGradient={communityBannerGradient}
            layout={layout}
            compact={layout === "timeline"}
          />
        ))}
      </ul>
    </div>
  );
}

export function CommunityEventsSection({
  communitySlug,
  events,
  followedEventIds = [],
  showFollowButtons = false,
  embedded = false,
  limit,
  layout = "list",
  communityBannerUrl,
  communityCategory = "Allgemein",
  communityBannerGradient,
}: CommunityEventsSectionProps) {
  const followedSet = new Set(followedEventIds);
  if (events.length === 0) return null;

  const displayEvents = applyLimit(events, limit);
  const showTimelineSections =
    layout === "timeline" && limit === null && displayEvents.length > 1;
  const { soon, later } = partitionEvents(displayEvents);

  return (
    <section className={embedded ? "" : "rounded-3xl bg-white p-4 shadow-card"}>
      {!embedded && (
        <header className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-unze-ink">Events</h2>
            <p className="text-xs text-unze-ink-secondary">
              Termine und Veranstaltungen dieser Community
            </p>
          </div>
          <Link
            href={`/discover?tab=events&q=${encodeURIComponent(communitySlug)}`}
            className="text-xs font-semibold text-unze-green"
          >
            Alle →
          </Link>
        </header>
      )}

      {showTimelineSections ? (
        <div className="space-y-6">
          <EventListBlock
            title={soon.length > 0 && later.length > 0 ? "Demnächst" : undefined}
            events={soon.length > 0 ? soon : displayEvents}
            communitySlug={communitySlug}
            followedSet={followedSet}
            showFollowButtons={showFollowButtons}
            communityBannerUrl={communityBannerUrl}
            communityCategory={communityCategory}
            communityBannerGradient={communityBannerGradient}
            layout={layout}
          />
          {later.length > 0 && soon.length > 0 && (
            <EventListBlock
              title="Später"
              events={later}
              communitySlug={communitySlug}
              followedSet={followedSet}
              showFollowButtons={showFollowButtons}
              communityBannerUrl={communityBannerUrl}
              communityCategory={communityCategory}
              communityBannerGradient={communityBannerGradient}
              layout={layout}
            />
          )}
        </div>
      ) : (
        <EventListBlock
          events={displayEvents}
          communitySlug={communitySlug}
          followedSet={followedSet}
          showFollowButtons={showFollowButtons}
          communityBannerUrl={communityBannerUrl}
          communityCategory={communityCategory}
          communityBannerGradient={communityBannerGradient}
          layout={layout}
        />
      )}
    </section>
  );
}

interface DiscoverEventListProps {
  events: CommunityEvent[];
  title?: string;
  subtitle?: string;
  followedEventIds?: string[];
  showFollowButtons?: boolean;
}

export function DiscoverEventList({
  events,
  title = "Events",
  subtitle = "Kommende Termine aus dem Netzwerk",
  followedEventIds = [],
  showFollowButtons = false,
}: DiscoverEventListProps) {
  const followedSet = new Set(followedEventIds);
  if (events.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-sm font-medium text-unze-ink">Noch keine Events</p>
        <p className="mt-1 text-sm text-unze-ink-secondary">
          Events werden von Community-Betreibern angelegt und erscheinen hier.
        </p>
      </section>
    );
  }

  return (
    <section>
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-unze-ink">{title}</h2>
        <p className="mt-0.5 text-sm text-unze-ink-secondary">{subtitle}</p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {events.map((event) => {
          const eventCover = resolveEventCoverDisplay({
            coverUrl: event.coverUrl,
            communityCategory: "Allgemein",
          });
          return (
          <li
            key={event.id}
            className="overflow-hidden rounded-3xl border border-unze-border/80 bg-white shadow-card"
          >
            <CommunityCoverVisual
              seed={event.id}
              bannerGradient={eventCover.gradient}
              cover={eventCover.cover}
              className="h-28"
              overlay="card"
              imageVariant="list"
            />
            <div className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              {event.isFeatured ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Highlight
                </span>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                {event.communitySlug && (
                  <Link
                    href={`/community/${event.communitySlug}`}
                    className="text-xs font-semibold text-unze-green"
                  >
                    {event.communityTitle}
                  </Link>
                )}
                {showFollowButtons && event.communitySlug && (
                  <FollowEventButton
                    eventId={event.id}
                    communitySlug={event.communitySlug}
                    initialFollowing={followedSet.has(event.id)}
                  />
                )}
              </div>
            </div>
            <Link
              href={
                event.communitySlug
                  ? `/community/${event.communitySlug}/event/${event.id}`
                  : "#"
              }
              className="font-semibold text-unze-ink hover:text-unze-green"
            >
              {event.title}
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-unze-ink-secondary">
              {event.description || "Keine Beschreibung"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-unze-ink-secondary">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-unze-green" aria-hidden />
                {formatEventDate(event.startsAt)}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {event.location}
                </span>
              )}
            </div>
            {event.platformType && (
              <div className="mt-3">
                <PlatformBadge
                  platform={event.platformType as import("@/types/community").PlatformType}
                  variant="footer"
                />
              </div>
            )}
            </div>
          </li>
          );
        })}
      </ul>
    </section>
  );
}

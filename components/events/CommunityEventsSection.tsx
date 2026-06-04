import { PlatformBadge } from "@/components/community/PlatformBadge";
import { FollowEventButton } from "@/components/events/FollowEventButton";
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

export function CommunityEventsSection({
  communitySlug,
  events,
  followedEventIds = [],
  showFollowButtons = false,
  embedded = false,
}: CommunityEventsSectionProps) {
  const followedSet = new Set(followedEventIds);
  if (events.length === 0) return null;

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

      <ul className="space-y-3">
        {events.slice(0, 5).map((event) => (
          <li
            key={event.id}
            className="rounded-2xl border border-unze-border/80 bg-unze-surface-muted/20 p-3"
          >
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
                {event.description && (
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
          </li>
        ))}
      </ul>
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
        {events.map((event) => (
          <li
            key={event.id}
            className="rounded-3xl border border-unze-border/80 bg-white p-4 shadow-card"
          >
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
          </li>
        ))}
      </ul>
    </section>
  );
}

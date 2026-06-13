import { PlatformBadge } from "@/components/community/PlatformBadge";
import { EventBookTicketButton } from "@/components/events/EventBookTicketButton";
import { FollowEventButton } from "@/components/events/FollowEventButton";
import { ReportDialog } from "@/components/governance/ReportDialog";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import { resolveCommunityBannerDisplay } from "@/lib/visual/resolve-banner";
import type { Community } from "@/types/community";
import type { CommunityEvent } from "@/types/event";
import type { EventTicketView } from "@/types/event-ticket";
import type { PlatformType } from "@/types/database";
import {
  Calendar,
  ChevronLeft,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface EventDetailViewProps {
  community: Community;
  event: CommunityEvent;
  isLoggedIn: boolean;
  initialFollowing: boolean;
  userTicket: EventTicketView | null;
}

function formatEventRange(startsAt: string, endsAt: string | null): string {
  const start = new Date(startsAt).toLocaleString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!endsAt) return start;
  const end = new Date(endsAt).toLocaleString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${start} – ${end}`;
}

export function EventDetailView({
  community,
  event,
  isLoggedIn,
  initialFollowing,
  userTicket,
}: EventDetailViewProps) {
  const slug = community.slug;

  return (
    <div className="page-padding">
      <div className="mb-4">
        <Link
          href={`/community/${slug}?tab=events`}
          className="inline-flex items-center gap-1 text-sm font-medium text-unze-green"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Events · {community.title}
        </Link>
      </div>

      <header className="mb-4 overflow-hidden rounded-3xl bg-white shadow-card">
        <CommunityCoverVisual
          seed={`event-${event.id}`}
          bannerGradient={community.bannerGradient}
          imageUrl={event.coverUrl}
          fallbackImageUrl={resolveCommunityBannerDisplay(community).imageUrl}
          className="h-44"
          overlay="hero"
          imageVariant="hero"
        />
        <div className="p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {event.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                <Sparkles className="h-3 w-3" aria-hidden />
                Highlight
              </span>
            )}
            {event.platformType && (
              <PlatformBadge
                platform={event.platformType as PlatformType}
                variant="footer"
              />
            )}
          </div>
          {event.groupTitle && (
            <p className="text-xs font-medium uppercase tracking-wide text-unze-ink-muted">
              {event.groupTitle}
            </p>
          )}
          <h1 className="text-xl font-bold text-unze-ink">{event.title}</h1>
        </div>
      </header>

      <section className="mb-4 rounded-3xl bg-white p-4 shadow-card">
        <div className="space-y-3 text-sm text-unze-ink-secondary">
          <p className="inline-flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-unze-green" aria-hidden />
            {formatEventRange(event.startsAt, event.endsAt)}
          </p>
          {event.location && (
            <p className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-unze-green" aria-hidden />
              {event.location}
            </p>
          )}
        </div>

        {isLoggedIn && (
          <div className="mt-4 space-y-4 border-t border-unze-border/60 pt-4">
            <EventBookTicketButton
              slug={slug}
              eventId={event.id}
              communityId={community.id}
              existingTicket={userTicket}
              isLoggedIn={isLoggedIn}
            />
            <FollowEventButton
              eventId={event.id}
              communitySlug={slug}
              initialFollowing={initialFollowing}
            />
          </div>
        )}
      </section>

      <section className="mb-4 rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-2 text-sm font-semibold text-unze-ink">Über dieses Event</h2>
        <p className="text-sm leading-relaxed text-unze-ink-secondary">
          {event.description || "Keine Beschreibung."}
        </p>
      </section>

      {event.externalUrl && (
        <section className="rounded-3xl bg-white p-4 shadow-card">
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3 text-sm font-semibold text-white"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Auf externer Plattform öffnen
          </a>
        </section>
      )}

      {isLoggedIn && (
        <div className="mt-4 flex justify-end">
          <ReportDialog
            targetType="event"
            targetId={event.id}
            communityId={community.id}
            label="Event melden"
            returnPath={`/community/${slug}/event/${event.slug ?? event.id}`}
          />
        </div>
      )}

      {!isLoggedIn && (
        <p className="mt-4 text-center text-sm text-unze-ink-secondary">
          <Link href="/auth/login" className="font-semibold text-unze-green">
            Anmelden
          </Link>
          , um dieses Event zu favorisieren.
        </p>
      )}
    </div>
  );
}

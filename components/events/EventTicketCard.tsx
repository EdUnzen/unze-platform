import { EventTicketQr } from "@/components/events/EventTicketQr";
import type { EventTicketView } from "@/types/event-ticket";
import { Calendar, MapPin, Ticket } from "lucide-react";
import Link from "next/link";

interface EventTicketCardProps {
  ticket: EventTicketView;
}

export function EventTicketCard({ ticket }: EventTicketCardProps) {
  const startLabel = ticket.eventStartsAt
    ? new Date(ticket.eventStartsAt).toLocaleString("de-DE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="border-b border-unze-border/60 bg-unze-green-muted/30 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-unze-green-dark">
              {ticket.communityTitle}
            </p>
            <h3 className="truncate text-sm font-bold text-unze-ink">{ticket.eventTitle}</h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              ticket.status === "used"
                ? "bg-unze-surface-muted text-unze-ink-muted"
                : "bg-unze-green text-white"
            }`}
          >
            {ticket.status === "used" ? "Genutzt" : "Aktiv"}
          </span>
        </div>
      </div>

      <div className="flex gap-4 p-4">
        <div className="shrink-0">
          <EventTicketQr ticketCode={ticket.ticketCode} />
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-xs text-unze-ink-secondary">
          <p className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-unze-green" aria-hidden />
            {startLabel}
          </p>
          {ticket.eventLocation && (
            <p className="inline-flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-unze-green" aria-hidden />
              {ticket.eventLocation}
            </p>
          )}
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] text-unze-ink">
            <Ticket className="h-3.5 w-3.5 text-unze-green" aria-hidden />
            {ticket.ticketCode}
          </p>
          <Link
            href={`/community/${ticket.communitySlug}/event/${ticket.eventId}`}
            className="inline-block text-xs font-semibold text-unze-green"
          >
            Event ansehen
          </Link>
        </div>
      </div>
    </article>
  );
}

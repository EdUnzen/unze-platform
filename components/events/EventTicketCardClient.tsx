"use client";

import { cancelEventTicketAction } from "@/app/event-ticket-actions";
import { EventTicketQr } from "@/components/events/EventTicketQr";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { ACTION_MESSAGES } from "@/lib/constants/action-messages";
import type { EventTicketView } from "@/types/event-ticket";
import { Calendar, MapPin, Ticket, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface EventTicketCardClientProps {
  ticket: EventTicketView;
}

export function EventTicketCardClient({ ticket: initialTicket }: EventTicketCardClientProps) {
  const ticket = initialTicket;
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (cancelled) {
    return (
      <div className="space-y-2">
        <ActionFeedback variant="success">{ACTION_MESSAGES.event.ticketCancelled}</ActionFeedback>
      </div>
    );
  }

  const startLabel = ticket.eventStartsAt
    ? new Date(ticket.eventStartsAt).toLocaleString("de-DE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const eventStarted =
    ticket.eventStartsAt && new Date(ticket.eventStartsAt) <= new Date();
  const canCancel = ticket.status === "active" && !eventStarted;

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

      {canCancel && (
        <div className="border-t border-unze-border/60 px-4 py-3">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                setSuccess(null);
                const result = await cancelEventTicketAction(ticket.id);
                if (result.error) {
                  setError(result.error);
                  return;
                }
                setCancelled(true);
                setSuccess(result.message ?? ACTION_MESSAGES.event.ticketCancelled);
                router.refresh();
              })
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" aria-hidden />
            {pending ? "Wird storniert…" : "Ticket stornieren"}
          </button>
        </div>
      )}

      {success && (
        <div className="px-4 pb-3">
          <ActionFeedback variant="success">{success}</ActionFeedback>
        </div>
      )}
      {error && (
        <div className="px-4 pb-3">
          <ActionFeedback variant="error">{error}</ActionFeedback>
        </div>
      )}
    </article>
  );
}

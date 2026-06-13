"use client";

import { bookEventTicketAction } from "@/app/event-ticket-actions";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { ACTION_MESSAGES } from "@/lib/constants/action-messages";
import type { EventTicketView } from "@/types/event-ticket";
import { Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface EventBookTicketButtonProps {
  slug: string;
  eventId: string;
  communityId: string;
  existingTicket: EventTicketView | null;
  isLoggedIn: boolean;
}

export function EventBookTicketButton({
  slug,
  eventId,
  communityId,
  existingTicket,
  isLoggedIn,
}: EventBookTicketButtonProps) {
  const [ticket, setTicket] = useState(existingTicket);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-unze-ink-secondary">
        <Link href={`/auth/login?next=/community/${slug}/event/${eventId}`} className="font-semibold text-unze-green">
          Anmelden
        </Link>
        , um ein Ticket zu buchen.
      </p>
    );
  }

  if (ticket) {
    return (
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-unze-green-dark">
          <Ticket className="h-4 w-4" aria-hidden />
          Ticket gebucht
          {ticket.status === "used" && (
            <span className="rounded-full bg-unze-surface-muted px-2 py-0.5 text-[10px] font-bold uppercase text-unze-ink-muted">
              Eingecheckt
            </span>
          )}
        </p>
        <Link
          href="/profile/tickets"
          className="inline-block text-xs font-medium text-unze-green hover:underline"
        >
          Ticket im Profil anzeigen →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            setSuccess(null);
            const result = await bookEventTicketAction(slug, eventId, communityId);
            if (result.error) {
              setError(result.error);
              return;
            }
            if (result.ticket) {
              setTicket(result.ticket);
              setSuccess(ACTION_MESSAGES.event.ticketBooked);
              router.refresh();
            }
          })
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        <Ticket className="h-4 w-4" aria-hidden />
        {pending ? "Wird gebucht…" : "Ticket buchen"}
      </button>
      {success && (
        <ActionFeedback variant="success" className="mt-2">
          {success}
        </ActionFeedback>
      )}
      {error && (
        <ActionFeedback variant="error" className="mt-2">
          {error}
        </ActionFeedback>
      )}
    </div>
  );
}

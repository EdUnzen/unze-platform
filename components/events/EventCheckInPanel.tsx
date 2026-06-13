"use client";

import { checkInEventTicketAction } from "@/app/event-ticket-actions";
import type { EventTicketStats } from "@/types/event-ticket";
import { ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface EventCheckInPanelProps {
  slug: string;
  eventId: string;
  eventTitle: string;
  stats: EventTicketStats;
}

export function EventCheckInPanel({
  slug,
  eventId,
  eventTitle,
  stats,
}: EventCheckInPanelProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <section
      className="rounded-2xl border border-unze-border bg-white p-4 shadow-card"
      data-testid="event-check-in-panel"
    >
      <div className="mb-3 flex items-center gap-2">
        <ScanLine className="h-5 w-5 text-unze-green" aria-hidden />
        <h3 className="text-sm font-semibold text-unze-ink">Check-In · {eventTitle}</h3>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-unze-surface-muted px-2 py-2">
          <p className="text-lg font-bold text-unze-ink">{stats.total}</p>
          <p className="text-[10px] text-unze-ink-muted">Tickets</p>
        </div>
        <div className="rounded-xl bg-unze-green-muted/50 px-2 py-2">
          <p className="text-lg font-bold text-unze-green-dark">{stats.checkedIn}</p>
          <p className="text-[10px] text-unze-ink-muted">Eingecheckt</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-2 py-2">
          <p className="text-lg font-bold text-amber-900">{stats.pending}</p>
          <p className="text-[10px] text-unze-ink-muted">Offen</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            setMessage(null);
            const result = await checkInEventTicketAction(slug, code.trim());
            if (result.error) {
              setMessage({ type: "err", text: result.error });
              return;
            }
            setMessage({ type: "ok", text: "Check-In erfolgreich" });
            setCode("");
            router.refresh();
          });
        }}
        className="space-y-2"
      >
        <input type="hidden" name="eventId" value={eventId} />
        <label htmlFor={`checkin-${eventId}`} className="sr-only">
          Ticket-Code
        </label>
        <input
          id={`checkin-${eventId}`}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ticket-Code scannen oder eingeben"
          autoComplete="off"
          className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-unze-green"
        />
        <button
          type="submit"
          disabled={pending || !code.trim()}
          className="w-full rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Prüfe…" : "Check-In bestätigen"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-2 text-xs ${message.type === "ok" ? "text-unze-green-dark" : "text-red-600"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </section>
  );
}

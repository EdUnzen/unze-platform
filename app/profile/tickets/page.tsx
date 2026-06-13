import { EventTicketCardClient } from "@/components/events/EventTicketCardClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getUserEventTickets } from "@/services/events/event-ticket.service";
import { Ticket } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfileTicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/profile/tickets");

  const { tickets } = await getUserEventTickets(user.id);

  return (
    <div className="page-padding pb-8">
      <PageHeader
        title="Meine Tickets"
        subtitle="Event-Tickets mit QR-Code für den Check-In"
      />

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-card">
          <Ticket className="mb-4 h-10 w-10 text-unze-ink-muted" aria-hidden />
          <p className="text-sm font-semibold text-unze-ink">Noch keine Tickets</p>
          <p className="mt-2 max-w-xs text-sm text-unze-ink-secondary">
            Buche ein Ticket auf der Event-Seite einer Community.
          </p>
          <Link
            href="/discover?tab=events"
            className="mt-6 rounded-xl bg-unze-green px-6 py-3 text-sm font-semibold text-white"
          >
            Events entdecken
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <EventTicketCardClient key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      <p className="mt-6 text-center">
        <Link href="/profile" className="text-sm font-medium text-unze-green">
          ← Zurück zum Profil
        </Link>
      </p>
    </div>
  );
}

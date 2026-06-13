import { EventCheckInPanel } from "@/components/events/EventCheckInPanel";
import type { CommunityEvent } from "@/types/event";
import { getEventTicketStats } from "@/services/events/event-ticket.service";

interface EventDashboardCheckInsProps {
  slug: string;
  events: CommunityEvent[];
}

export async function EventDashboardCheckIns({
  slug,
  events,
}: EventDashboardCheckInsProps) {
  if (events.length === 0) return null;

  const statsList = await Promise.all(
    events.map(async (event) => ({
      event,
      stats: (await getEventTicketStats(event.id)).stats,
    })),
  );

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-unze-ink">Ticket Check-In</h2>
      {statsList.map(({ event, stats }) => (
        <EventCheckInPanel
          key={event.id}
          slug={slug}
          eventId={event.id}
          eventTitle={event.title}
          stats={stats}
        />
      ))}
    </section>
  );
}

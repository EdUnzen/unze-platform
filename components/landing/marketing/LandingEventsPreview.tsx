import { CtaLink } from "@/components/landing/LegalPage";
import { PublicEventCardView } from "@/components/landing/marketing/PublicEventCard";
import { fetchPublicEvents } from "@/lib/marketing/public-client";
import type { PublicEventCard } from "@/lib/marketing/public-directory.service";

export async function LandingEventsPreview() {
  let events: PublicEventCard[] = [];
  try {
    events = await fetchPublicEvents(3);
  } catch {
    events = [];
  }

  if (events.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#00C853]">Events</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              Kommende Termine
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {"Öffentliche Events aus UNZE-Communities – Buchung in der App."}
            </p>
          </div>
          <CtaLink href="/events" variant="secondary">
            Alle Events
          </CtaLink>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {events.map((event) => (
            <PublicEventCardView key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

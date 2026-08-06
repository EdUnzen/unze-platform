import { MarketingCtaBar } from "@/components/landing/marketing/MarketingCtaBar";
import { MarketingPageHero } from "@/components/landing/marketing/MarketingPageHero";
import { PublicEventCardView } from "@/components/landing/marketing/PublicEventCard";
import { PwaInstallHint } from "@/components/landing/marketing/PwaInstallHint";
import { fetchPublicEvents } from "@/lib/marketing/public-client";
import type { PublicEventCard } from "@/lib/marketing/public-directory.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Öffentliche Community-Events auf UNZE – Termine, Highlights und Communities.",
};

export const revalidate = 60;

export default async function EventsPage() {
  let events: PublicEventCard[] = [];
  try {
    events = await fetchPublicEvents(24);
  } catch {
    events = [];
  }

  return (
    <>
      <MarketingPageHero
        eyebrow="Events"
        title="Öffentliche Events"
        description="Kommende Termine aus verifizierten und öffentlichen UNZE-Communities. Buchung und Teilnahme erfolgen in der App."
      >
        <MarketingCtaBar />
      </MarketingPageHero>

      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">Derzeit keine öffentlichen Events.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <PublicEventCardView key={event.id} event={event} />
            ))}
          </div>
        )}
        <div className="mt-12">
          <PwaInstallHint />
        </div>
      </div>
    </>
  );
}

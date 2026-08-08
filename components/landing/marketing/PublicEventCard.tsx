"use client";

import { AppNutzenButton } from "@/components/landing/marketing/MarketingAppEntryGate";
import { CTA_APP_USE } from "@/lib/constants/cta-copy";
import type { PublicEventCard } from "@/lib/marketing/public-directory.service";
import { Calendar, MapPin } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Marketing-Vorschau — kein Deep-Link in die Connect-App. */
export function PublicEventCardView({ event }: { event: PublicEventCard }) {
  const returnTo = event.communitySlug
    ? `/community/${event.communitySlug}/event/${event.slug ?? event.id}`
    : undefined;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          {event.isFeatured ? (
            <span className="mb-2 inline-block rounded-full bg-[#00C853]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00C853]">
              Highlight
            </span>
          ) : null}
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          {event.communityTitle && event.communitySlug ? (
            <a
              href={`/community/${event.communitySlug}`}
              className="mt-1 inline-block text-xs text-[#00C853] hover:underline"
            >
              {event.communityTitle}
            </a>
          ) : event.communityTitle ? (
            <p className="mt-1 text-xs text-[#00C853]">{event.communityTitle}</p>
          ) : null}
        </div>
        <Calendar className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-gray-600">{event.description}</p>
      <div className="mt-4 space-y-1 text-xs text-gray-500">
        <p>{formatDate(event.startsAt)}</p>
        {event.location ? (
          <p className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" aria-hidden />
            {event.location}
          </p>
        ) : null}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        Teilnahme in der App —{" "}
        <AppNutzenButton
          tone="event"
          returnTo={returnTo}
          className="font-medium text-[#00C853] hover:underline"
        >
          {CTA_APP_USE}
        </AppNutzenButton>
      </p>
    </article>
  );
}

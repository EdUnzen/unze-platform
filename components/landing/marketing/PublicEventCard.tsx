import { platformUrl } from "@/lib/constants/site";
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

export function PublicEventCardView({ event }: { event: PublicEventCard }) {
  const href = event.communitySlug
    ? platformUrl(`/community/${event.communitySlug}/event/${event.slug ?? event.id}`)
    : platformUrl("/discover?tab=events");

  return (
    <a
      href={href}
      rel="noopener noreferrer"
      className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#00C853]/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {event.isFeatured ? (
            <span className="mb-2 inline-block rounded-full bg-[#00C853]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00C853]">
              Highlight
            </span>
          ) : null}
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          {event.communityTitle ? (
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
    </a>
  );
}

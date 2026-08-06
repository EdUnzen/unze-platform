import { QUOTE_STATUS_THEMES } from "@/lib/studio/overview-colors";
import Link from "next/link";

const QUOTE_FILTERS = [
  { id: "all", label: "Alle" },
  { id: "draft", label: "Entwurf" },
  { id: "sent", label: "Versendet" },
  { id: "accepted", label: "Angenommen" },
  { id: "paid", label: "Bezahlt" },
  { id: "rejected", label: "Abgelehnt" },
] as const;

type QuoteFilterId = (typeof QUOTE_FILTERS)[number]["id"];

export function QuoteStatusFilter({
  active,
  counts,
}: {
  active?: Exclude<QuoteFilterId, "all">;
  counts?: Partial<Record<Exclude<QuoteFilterId, "all">, number>>;
}) {
  const activeKey: QuoteFilterId = active ?? "all";

  return (
    <div className="flex flex-wrap gap-2">
      {QUOTE_FILTERS.map(({ id, label }) => {
        const isAll = id === "all";
        const href = isAll ? "/studio/app/angebote" : `/studio/app/angebote?status=${id}`;
        const isActive = activeKey === id;
        const theme = isAll
          ? {
              filterActive: "bg-gray-900 text-white ring-2 ring-gray-300",
              filterIdle: "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50",
            }
          : QUOTE_STATUS_THEMES[id];
        const count = isAll ? undefined : counts?.[id];

        return (
          <Link
            key={id}
            href={href}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isActive ? theme.filterActive : theme.filterIdle
            }`}
          >
            {!isAll ? (
              <span className={`h-1.5 w-1.5 rounded-full ${QUOTE_STATUS_THEMES[id].dot}`} aria-hidden />
            ) : null}
            {label}
            {count != null && count > 0 ? (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? "bg-white/20" : "bg-black/5"}`}>
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

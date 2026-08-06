import type { StudioClient } from "@/lib/studio/client-types";
import { formatInquiryDate } from "@/lib/studio/overview-extras";
import { SECTION_THEMES } from "@/lib/studio/overview-colors";
import Link from "next/link";

const STATUS_LABELS: Record<StudioClient["status"], string> = {
  active: "Aktiv",
  paused: "Pausiert",
  archived: "Archiv",
};

const STATUS_STYLES: Record<StudioClient["status"], string> = {
  active: "bg-emerald-50 text-emerald-800",
  paused: "bg-amber-50 text-amber-800",
  archived: "bg-gray-100 text-gray-600",
};

export function OverviewRecentClientsSection({ clients }: { clients: StudioClient[] }) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${SECTION_THEMES.clients}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 bg-indigo-50/50 px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Kunden</h2>
          <p className="text-xs text-gray-500">Zuletzt bearbeitet</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/studio/app/kunden"
            className="text-xs font-semibold text-indigo-700 hover:underline"
          >
            Alle Kunden →
          </Link>
          <Link
            href="/studio/app/kunden/neu"
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            + Neu
          </Link>
        </div>
      </div>
      {clients.length === 0 ? (
        <p className="p-5 text-sm text-gray-500">Noch keine Kunden angelegt.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/studio/app/kunden/${client.id}`}
                className="flex flex-wrap items-start justify-between gap-3 p-4 transition hover:bg-gray-50 sm:p-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{client.companyName}</p>
                  <p className="text-xs text-gray-500">
                    {client.contactName ?? client.contactEmail}
                    {client.city ? ` · ${client.city}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Aktualisiert {formatInquiryDate(client.updatedAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[client.status]}`}
                >
                  {STATUS_LABELS[client.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

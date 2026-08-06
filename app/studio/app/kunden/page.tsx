import { CLIENT_STATUS_LABELS } from "@/lib/studio/client-types";
import { listStudioClients } from "@/lib/studio/clients";
import Link from "next/link";

export default async function StudioKundenPage() {
  const clients = await listStudioClients();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
            Kunden
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {clients.length} aktiv · Domains, Hosting & Verträge pro Kunde
          </p>
        </div>
        <Link
          href="/studio/app/kunden/neu"
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white active:scale-[0.98]"
        >
          + Kunde
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">Noch keine Kunden angelegt.</p>
          <p className="mt-2 text-xs text-gray-400">
            Aus einem Lead anlegen oder manuell hinzufügen.
          </p>
          <Link
            href="/studio/app/kunden/neu"
            className="mt-4 inline-block text-sm font-medium text-emerald-700 underline"
          >
            Ersten Kunden anlegen →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {clients.map((c) => (
            <li key={c.id}>
              <Link
                href={`/studio/app/kunden/${c.id}`}
                className="block p-4 transition active:bg-gray-50 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{c.companyName}</p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {c.contactName ? `${c.contactName} · ` : ""}
                      {c.contactEmail}
                    </p>
                    {c.city ? <p className="text-xs text-gray-400">{c.city}</p> : null}
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {CLIENT_STATUS_LABELS[c.status]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

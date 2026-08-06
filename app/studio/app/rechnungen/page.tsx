import { formatEuroCents } from "@/lib/business/pricing-utils";
import { listPaidQuotes } from "@/lib/studio/quotes";
import { listPaidShopOrders } from "@/lib/studio/shop-orders";
import Link from "next/link";

export default async function StudioRechnungenPage() {
  const [paidQuotes, paidShopOrders] = await Promise.all([
    listPaidQuotes(50),
    listPaidShopOrders(50),
  ]);

  const empty = paidQuotes.length === 0 && paidShopOrders.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
        Rechnungen
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Bezahlte Angebote und Shop-Aufträge — Rechnung mit Logo als PDF drucken.
      </p>

      {empty ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">Noch keine bezahlten Rechnungen.</p>
        </div>
      ) : null}

      {paidShopOrders.length > 0 ? (
        <>
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Shop-Aufträge
          </h2>
          <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {paidShopOrders.map((order) => (
              <li key={order.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-emerald-700">
                      {order.referenceId.replace(/^SH-/, "RE-")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{order.productName}</p>
                    <p className="text-sm text-gray-500">
                      {order.company ?? order.customerName ?? order.customerEmail}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatEuroCents(order.totalCents)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/studio/app/auftraege/${order.id}/rechnung`}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Rechnung PDF
                  </Link>
                  <Link
                    href={`/studio/app/auftraege/${order.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Auftrag
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {paidQuotes.length > 0 ? (
        <>
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Angebote
          </h2>
          <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {paidQuotes.map((quote) => (
              <li key={quote.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-emerald-700">
                      {quote.referenceId.replace(/^AN-/, "RE-")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {quote.company ?? quote.customerName ?? quote.customerEmail}
                    </p>
                    {quote.paidAt ? (
                      <p className="text-xs text-gray-500">
                        Bezahlt: {new Date(quote.paidAt).toLocaleDateString("de-DE")}
                      </p>
                    ) : null}
                  </div>
                  <p className="font-semibold text-gray-900">{formatEuroCents(quote.totalCents)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/studio/app/rechnungen/${quote.id}/pdf`}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Rechnung PDF
                  </Link>
                  <Link
                    href={`/studio/app/angebote/${quote.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Angebot öffnen
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

import { formatEuroCents } from "@/lib/business/pricing-utils";
import { listShopOrders } from "@/lib/studio/shop-orders";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Zahlung ausstehend",
  paid: "Bezahlt",
  in_progress: "In Bearbeitung",
  completed: "Erledigt",
  cancelled: "Storniert",
};

export default async function StudioShopOrdersPage() {
  const orders = await listShopOrders(100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
        Shop-Aufträge
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Buchungen aus dem Business-Shop — getrennt von Connect und Community.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">Noch keine Shop-Aufträge.</p>
          <Link href="/business/kontakt" className="mt-2 inline-block text-sm text-emerald-700 underline">
            Shop öffentlich öffnen
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/studio/app/auftraege/${order.id}`}
                className="flex flex-wrap items-start justify-between gap-3 p-4 transition hover:bg-gray-50 sm:p-5"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-emerald-700">{order.referenceId}</p>
                  <p className="mt-1 font-medium text-gray-900">{order.productName}</p>
                  <p className="text-sm text-gray-500">
                    {order.customerName ?? order.customerEmail}
                    {order.company ? ` · ${order.company}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatEuroCents(order.totalCents)}</p>
                  <p className="text-xs text-gray-500">{STATUS_LABELS[order.status] ?? order.status}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

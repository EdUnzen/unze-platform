import { ShopOrderMessageForm } from "@/components/studio/ShopOrderMessageForm";
import { ShopOrderStatusForm } from "@/components/studio/ShopOrderStatusForm";
import { formatEuroCents } from "@/lib/business/pricing-utils";
import { getShopOrderById, listOrderMessages } from "@/lib/studio/shop-orders";
import Link from "next/link";
import { notFound } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Zahlung ausstehend",
  paid: "Bezahlt",
  in_progress: "In Bearbeitung",
  completed: "Erledigt",
  cancelled: "Storniert",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudioShopOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getShopOrderById(id);
  if (!order) notFound();

  const messages = await listOrderMessages(order.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/studio/app/auftraege" className="text-sm text-gray-500 hover:text-gray-800">
        ← Alle Aufträge
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold text-emerald-700">{order.referenceId}</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
            {order.productName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {STATUS_LABELS[order.status] ?? order.status} · {formatEuroCents(order.totalCents)}
          </p>
        </div>
        {order.paymentStatus === "paid" ? (
          <Link
            href={`/studio/app/auftraege/${order.id}/rechnung`}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Rechnung PDF
          </Link>
        ) : null}
      </div>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 text-sm">
        <h2 className="font-semibold text-gray-900">Kunde</h2>
        <dl className="mt-3 space-y-1 text-gray-700">
          <div>
            <dt className="text-xs text-gray-400">Name</dt>
            <dd>{order.customerName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">E-Mail</dt>
            <dd>{order.customerEmail}</dd>
          </div>
          {order.company ? (
            <div>
              <dt className="text-xs text-gray-400">Unternehmen</dt>
              <dd>{order.company}</dd>
            </div>
          ) : null}
          {order.processingTime ? (
            <div>
              <dt className="text-xs text-gray-400">Bearbeitungszeit</dt>
              <dd>{order.processingTime}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="mt-6">
        <ShopOrderStatusForm orderId={order.id} currentStatus={order.status} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900">Nachrichtenverlauf</h2>
        {messages.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Noch keine Nachrichten.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`rounded-lg border px-4 py-3 text-sm ${
                  msg.direction === "outbound"
                    ? "border-emerald-100 bg-emerald-50/50"
                    : msg.direction === "inbound"
                      ? "border-blue-100 bg-blue-50/40"
                      : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500">
                  <span>
                    {msg.direction === "outbound"
                      ? "Ausgehend"
                      : msg.direction === "inbound"
                        ? "Eingehend"
                        : "System"}
                  </span>
                  <time>{new Date(msg.createdAt).toLocaleString("de-DE")}</time>
                </div>
                {msg.subject ? <p className="mt-1 font-medium text-gray-800">{msg.subject}</p> : null}
                <p className="mt-2 whitespace-pre-wrap text-gray-700">{msg.body}</p>
              </li>
            ))}
          </ul>
        )}

        <ShopOrderMessageForm orderId={order.id} />
      </section>
    </div>
  );
}

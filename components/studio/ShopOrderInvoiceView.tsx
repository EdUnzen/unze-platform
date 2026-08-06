import { formatEuroCents } from "@/lib/business/pricing-utils";
import { DocumentFooter, DocumentLetterhead } from "@/components/studio/DocumentLetterhead";
import { STUDIO_COMPANY_PROFILE } from "@/lib/studio/company-profile";
import type { StudioShopOrder } from "@/lib/studio/shop-order-types";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("de-DE");
}

export function ShopOrderInvoiceView({ order }: { order: StudioShopOrder }) {
  const referenceId = order.referenceId.replace(/^SH-/, "RE-");

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-gray-900 print:p-12">
      <DocumentLetterhead
        documentLabel="Rechnung"
        referenceId={referenceId}
        dateLabel="Rechnungsdatum"
        dateValue={formatDate(order.paidAt ?? order.createdAt)}
      />

      <section className="mt-8 grid gap-8 sm:grid-cols-2 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">An</p>
          <p className="mt-2 font-semibold">{order.company ?? order.customerName ?? "—"}</p>
          {order.customerName && order.company ? <p>{order.customerName}</p> : null}
          <p>{order.customerEmail}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Leistung</p>
          <p className="mt-2 font-semibold">{order.productName}</p>
          <p className="mt-1 font-mono text-xs text-gray-500">Shop-Auftrag {order.referenceId}</p>
          {order.paidAt ? (
            <p className="mt-2 text-xs font-medium text-emerald-700">
              Bezahlt am {formatDate(order.paidAt)}
            </p>
          ) : null}
        </div>
      </section>

      <table className="mt-10 w-full text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="pb-2">Position</th>
            <th className="pb-2 text-right">Menge</th>
            <th className="pb-2 text-right">Einzelpreis</th>
            <th className="pb-2 text-right">Summe</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-3 pr-4">{order.productName}</td>
            <td className="py-3 text-right">1</td>
            <td className="py-3 text-right">{formatEuroCents(order.subtotalCents)}</td>
            <td className="py-3 text-right font-medium">{formatEuroCents(order.subtotalCents)}</td>
          </tr>
        </tbody>
      </table>

      <dl className="mt-8 ml-auto w-full max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Netto</dt>
          <dd>{formatEuroCents(order.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">MwSt. ({order.taxRate}%)</dt>
          <dd>{formatEuroCents(order.taxCents)}</dd>
        </div>
        <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-bold">
          <dt>Gesamt</dt>
          <dd>{formatEuroCents(order.totalCents)}</dd>
        </div>
        <div className="flex justify-between text-emerald-700">
          <dt>Bezahlt</dt>
          <dd>{formatEuroCents(order.totalCents)}</dd>
        </div>
      </dl>

      <DocumentFooter closingNote={STUDIO_COMPANY_PROFILE.vatNote} />
    </div>
  );
}

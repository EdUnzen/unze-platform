import { formatEuroCents } from "@/lib/business/pricing-utils";
import { describePaymentPlan } from "@/lib/studio/payment-plans";
import type { StudioQuote } from "@/lib/studio/quote-types";
import { DocumentFooter, DocumentLetterhead } from "@/components/studio/DocumentLetterhead";

export type StudioDocumentKind = "quote" | "invoice";

interface StudioDocumentViewProps {
  quote: StudioQuote;
  kind: StudioDocumentKind;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("de-DE");
}

export function StudioDocumentView({ quote, kind }: StudioDocumentViewProps) {
  const isInvoice = kind === "invoice";
  const documentLabel = isInvoice ? "Rechnung" : "Angebot";
  const referenceId = isInvoice ? quote.referenceId.replace(/^AN-/, "RE-") : quote.referenceId;

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-gray-900 print:p-12">
      <DocumentLetterhead
        documentLabel={documentLabel}
        referenceId={referenceId}
        dateLabel={isInvoice ? "Rechnungsdatum" : "Datum"}
        dateValue={formatDate(isInvoice && quote.paidAt ? quote.paidAt : quote.createdAt)}
        secondaryDateLabel={isInvoice ? undefined : "Gültig bis"}
        secondaryDateValue={isInvoice ? undefined : formatDate(quote.validUntil)}
      />

      <section className="mt-8 grid gap-8 sm:grid-cols-2 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">An</p>
          <p className="mt-2 font-semibold">{quote.company ?? quote.customerName ?? "—"}</p>
          {quote.customerName && quote.company ? <p>{quote.customerName}</p> : null}
          <p>{quote.customerEmail}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {isInvoice ? "Leistung" : "Angebot"}
          </p>
          <p className="mt-2 font-semibold">{quote.title ?? "Projektangebot"}</p>
          <p className="mt-1 text-xs text-gray-500">
            {describePaymentPlan(quote.paymentPlan, quote.totalCents)}
          </p>
          {isInvoice && quote.paidAt ? (
            <p className="mt-2 text-xs font-medium text-emerald-700">
              Bezahlt am {formatDate(quote.paidAt)}
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
          {quote.lineItems.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-3 pr-4">{item.label}</td>
              <td className="py-3 text-right">{item.quantity}</td>
              <td className="py-3 text-right">{formatEuroCents(item.unitCents)}</td>
              <td className="py-3 text-right font-medium">
                {formatEuroCents(item.quantity * item.unitCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-8 ml-auto w-full max-w-xs space-y-1 text-sm">
        {quote.taxRate > 0 ? (
          <>
            <div className="flex justify-between">
              <dt className="text-gray-500">Netto</dt>
              <dd>{formatEuroCents(quote.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">MwSt. ({quote.taxRate}%)</dt>
              <dd>{formatEuroCents(quote.taxCents)}</dd>
            </div>
          </>
        ) : null}
        <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-bold">
          <dt>Gesamtbetrag{quote.chargeTotalCents !== quote.totalCents ? " (inkl. Plan)" : ""}</dt>
          <dd>{formatEuroCents(quote.chargeTotalCents)}</dd>
        </div>
        {isInvoice ? (
          <div className="flex justify-between text-emerald-700">
            <dt>Bezahlt</dt>
            <dd>{formatEuroCents(quote.amountPaidCents)}</dd>
          </div>
        ) : null}
      </dl>

      {quote.notes ? (
        <section className="mt-10 text-xs text-gray-600">
          <p className="font-semibold uppercase tracking-wide text-gray-400">Hinweise</p>
          <p className="mt-2 whitespace-pre-wrap">{quote.notes}</p>
        </section>
      ) : null}

      <DocumentFooter
        closingNote={
          isInvoice
            ? "Vielen Dank für Ihr Vertrauen. Bei Rückfragen nennen Sie bitte die Rechnungsnummer."
            : "Dieses Angebot ist unverbindlich bis zur schriftlichen Bestätigung."
        }
      />
    </div>
  );
}

import { formatEuroCents } from "@/lib/business/pricing-utils";
import { QuoteStatusFilter } from "@/components/studio/QuoteStatusFilter";
import { QUOTE_STATUS_THEMES } from "@/lib/studio/overview-colors";
import { listStudioQuotes } from "@/lib/studio/quotes";
import type { QuoteStatus } from "@/lib/studio/quote-types";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  draft: "Entwurf",
  sent: "Versendet",
  accepted: "Angenommen",
  rejected: "Abgelehnt",
  paid: "Bezahlt",
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Offen",
  pending: "Zahlung ausstehend",
  paid: "Bezahlt",
  refunded: "Erstattet",
};

const QUOTE_LEFT_BORDER: Record<QuoteStatus, string> = {
  draft: "border-l-slate-400",
  sent: "border-l-sky-500",
  accepted: "border-l-indigo-500",
  paid: "border-l-emerald-500",
  rejected: "border-l-rose-400",
};

const VALID_STATUSES = new Set<string>(Object.keys(QUOTE_LEFT_BORDER));

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function StudioAngebotePage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams;
  const statusFilter =
    statusParam && VALID_STATUSES.has(statusParam) ? (statusParam as QuoteStatus) : undefined;

  const allQuotes = await listStudioQuotes(100);
  const statusCounts = allQuotes.reduce(
    (acc, quote) => {
      acc[quote.status] = (acc[quote.status] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<QuoteStatus, number>>,
  );

  const quotes = statusFilter
    ? allQuotes.filter((q) => q.status === statusFilter)
    : allQuotes;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
        Angebote
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        {quotes.length} von {allQuotes.length} Angebot{allQuotes.length === 1 ? "" : "en"}
        {statusFilter ? ` · ${STATUS_LABELS[statusFilter]}` : ""}
      </p>

      <div className="mt-6 space-y-3">
        <QuoteStatusFilter active={statusFilter} counts={statusCounts} />
        {statusFilter ? (
          <Link
            href="/studio/app/angebote"
            className="inline-flex text-xs font-semibold text-emerald-700 hover:underline"
          >
            Filter zurücksetzen
          </Link>
        ) : null}
      </div>

      {quotes.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            {statusFilter ? "Keine Angebote für diesen Status." : "Noch keine Angebote erstellt."}
          </p>
          {!statusFilter ? (
            <p className="mt-2 text-xs text-gray-400">
              Aus einem Lead heraus „Angebot erstellen“ wählen.
            </p>
          ) : (
            <Link
              href="/studio/app/angebote"
              className="mt-4 inline-block text-sm font-medium text-emerald-700 underline"
            >
              Alle Angebote anzeigen
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {quotes.map((quote) => {
            const theme = QUOTE_STATUS_THEMES[quote.status] ?? QUOTE_STATUS_THEMES.draft;
            return (
              <li key={quote.id} className={`border-l-4 ${QUOTE_LEFT_BORDER[quote.status]}`}>
                <Link
                  href={`/studio/app/angebote/${quote.id}`}
                  className="block p-4 transition hover:bg-gray-50 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold text-emerald-700">
                        {quote.referenceId}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {quote.company ?? quote.customerName ?? quote.customerEmail}
                      </p>
                      <p className="text-xs text-gray-500">{quote.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatEuroCents(quote.totalCents)}</p>
                      <p className="text-xs text-gray-500">
                        <span className={`font-medium ${theme.label}`}>
                          {STATUS_LABELS[quote.status] ?? quote.status}
                        </span>
                        {" · "}
                        {PAYMENT_LABELS[quote.paymentStatus] ?? quote.paymentStatus}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

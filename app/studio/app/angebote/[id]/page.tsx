import { QuoteEditor } from "@/components/studio/QuoteEditor";
import { QuotePaymentPanel } from "@/components/studio/QuotePaymentPanel";
import { formatEuroCents } from "@/lib/business/pricing-utils";
import { getStudioQuoteById } from "@/lib/studio/quotes";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; paymentUrl?: string; error?: string }>;
}

export default async function StudioQuoteDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { saved, paymentUrl, error } = await searchParams;
  const quote = await getStudioQuoteById(id);

  if (!quote) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/studio/app/angebote" className="text-sm text-gray-500 hover:text-gray-800">
        ← Alle Angebote
      </Link>

      <div className="mt-4">
        <p className="font-mono text-sm font-semibold text-emerald-700">{quote.referenceId}</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
          {quote.title ?? "Angebot"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {quote.customerName ?? "—"} · {quote.customerEmail}
          {quote.company ? ` · ${quote.company}` : ""}
        </p>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {formatEuroCents(quote.chargeTotalCents)}
          {quote.chargeTotalCents !== quote.totalCents ? (
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Listenpreis {formatEuroCents(quote.totalCents)})
            </span>
          ) : null}
        </p>
      </div>

      {saved === "1" ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Angebot gespeichert.
        </p>
      ) : null}
      {saved === "plan" ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Zahlungsplan gespeichert.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-800">{decodeURIComponent(error)}</p>
      ) : null}

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Bearbeiten</h2>
        <div className="mt-4">
          <QuoteEditor quote={quote} />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Versand & Zahlung
        </h2>
        <div className="mt-4">
          <QuotePaymentPanel quote={quote} paymentUrl={paymentUrl} />
        </div>
      </section>

      {quote.inquiryId ? (
        <p className="mt-6 text-sm text-gray-500">
          <Link href={`/studio/app/inquiries/${quote.inquiryId}`} className="underline">
            Zugehörigen Lead ansehen
          </Link>
        </p>
      ) : null}
    </div>
  );
}

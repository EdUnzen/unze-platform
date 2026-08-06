import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zahlung abgebrochen — UNZE Business",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function QuotePaymentCancelledPage({ searchParams }: Props) {
  const { ref } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
        Zahlung abgebrochen
      </h1>
      {ref ? (
        <p className="mt-3 text-sm text-gray-600">
          Angebot: <span className="font-mono">{ref}</span>
        </p>
      ) : null}
      <p className="mt-4 text-gray-600">
        Die Zahlung wurde nicht abgeschlossen. Sie können den Link aus der E-Mail jederzeit erneut
        öffnen oder uns direkt kontaktieren.
      </p>
      <Link
        href="/business/kontakt"
        className="mt-8 inline-block rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Kontakt aufnehmen
      </Link>
    </div>
  );
}

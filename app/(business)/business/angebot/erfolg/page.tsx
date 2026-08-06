import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zahlung erfolgreich — UNZE Business",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ ref?: string; paid?: string }>;
};

export default async function QuotePaymentSuccessPage({ searchParams }: Props) {
  const { ref } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#00C853]/10 text-2xl text-[#00C853]">
        &#10003;
      </div>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
        Vielen Dank für Ihre Zahlung
      </h1>
      {ref ? (
        <p className="mt-3 text-sm font-medium text-gray-700">
          Angebot: <span className="font-mono">{ref}</span>
        </p>
      ) : null}
      <p className="mt-4 text-gray-600">
        Wir haben Ihre Zahlung erhalten und senden Ihnen in Kürze eine Bestätigung per E-Mail.
        Anschließend melden wir uns mit den nächsten Projektschritten.
      </p>
      <Link
        href="/business"
        className="mt-8 inline-block rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Zurück zur Übersicht
      </Link>
    </div>
  );
}

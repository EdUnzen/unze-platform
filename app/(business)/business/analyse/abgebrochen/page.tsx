import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zahlung abgebrochen — UNZE Business",
  description: "Die Zahlung für die Analyse wurde abgebrochen.",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function AnalysisCancelledPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  const c = BUSINESS_COPY.analyse.cancelled;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">{c.title}</h1>
      {ref ? (
        <p className="mt-3 text-sm font-medium text-gray-700">
          Referenz: <span className="font-mono">{ref}</span>
        </p>
      ) : null}
      <p className="mt-4 text-gray-600">{c.body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/business/analyse"
          className="inline-block rounded-full bg-[#00C853] px-6 py-3 text-sm font-semibold text-white hover:bg-[#00b34a]"
        >
          {c.retryCta}
        </Link>
        <Link
          href="/business/kontakt"
          className="inline-block rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          Kontakt
        </Link>
      </div>
    </div>
  );
}

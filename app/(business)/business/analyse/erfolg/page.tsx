import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Analyse eingegangen — UNZE Business",
  description: "Ihre Analyse-Anfrage wurde erfolgreich übermittelt.",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ ref?: string; paid?: string; note?: string }>;
};

export default async function AnalysisSuccessPage({ searchParams }: Props) {
  const { ref, paid, note } = await searchParams;
  const c = BUSINESS_COPY.analyse.success;
  const isPaid = paid === "1";

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#00C853]/10 text-2xl text-[#00C853]">
        &#10003;
      </div>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
        {isPaid ? c.titlePaid : c.title}
      </h1>
      {ref ? (
        <p className="mt-3 text-sm font-medium text-gray-700">
          Referenz: <span className="font-mono">{ref}</span>
        </p>
      ) : null}
      <p className="mt-4 text-gray-600">{isPaid ? c.bodyPaid : c.body}</p>
      {note ? <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{note}</p> : null}
      <Link
        href="/business"
        className="mt-8 inline-block rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Zurück zur Übersicht
      </Link>
    </div>
  );
}

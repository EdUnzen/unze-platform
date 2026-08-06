import { ClientForm } from "@/components/studio/ClientForm";
import { createClientAction } from "@/lib/studio/client-actions";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function StudioKundeNeuPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <Link href="/studio/app/kunden" className="text-sm text-gray-500 hover:text-gray-800">
        ← Kunden
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
        Neuer Kunde
      </h1>
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          Speichern fehlgeschlagen. Bitte erneut versuchen.
        </p>
      ) : null}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <ClientForm action={createClientAction} submitLabel="Kunde speichern" />
      </div>
    </div>
  );
}

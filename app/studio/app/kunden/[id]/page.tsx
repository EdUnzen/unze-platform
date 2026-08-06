import { ClientForm } from "@/components/studio/ClientForm";
import {
  ClientContractsSection,
  ClientDomainsSection,
  ClientHostingSection,
} from "@/components/studio/ClientAssetSections";
import { CLIENT_STATUS_LABELS } from "@/lib/studio/client-types";
import { updateClientAction } from "@/lib/studio/client-actions";
import { getStudioClientDetail } from "@/lib/studio/clients";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; fromLead?: string; error?: string }>;
}

export default async function StudioKundeDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { saved, fromLead, error } = await searchParams;
  const client = await getStudioClientDetail(id);

  if (!client) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/studio/app/kunden" className="text-sm text-gray-500 hover:text-gray-800">
        ← Kunden
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
            {client.companyName}
          </h1>
          <p className="mt-1 text-sm text-gray-600">{client.contactEmail}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          {CLIENT_STATUS_LABELS[client.status]}
        </span>
      </div>

      {saved === "1" ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">Gespeichert.</p>
      ) : null}
      {fromLead === "1" ? (
        <p className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800">
          Kunde aus Lead angelegt — Domains, Hosting und Verträge kannst du jetzt ergänzen.
        </p>
      ) : null}
      {error === "1" ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">Fehler beim Speichern.</p>
      ) : null}

      {client.sourceInquiryId ? (
        <p className="mt-4 text-xs text-gray-500">
          Ursprung:{" "}
          <Link href={`/studio/app/inquiries/${client.sourceInquiryId}`} className="text-emerald-700 underline">
            Lead ansehen
          </Link>
        </p>
      ) : null}

      <div className="mt-8 space-y-6">
        <ClientDomainsSection clientId={client.id} domains={client.domains} />
        <ClientHostingSection clientId={client.id} hosting={client.hosting} />
        <ClientContractsSection clientId={client.id} contracts={client.contracts} />

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Stammdaten</h2>
          <div className="mt-4">
            <ClientForm action={updateClientAction} client={client} submitLabel="Stammdaten speichern" />
          </div>
        </section>
      </div>
    </div>
  );
}

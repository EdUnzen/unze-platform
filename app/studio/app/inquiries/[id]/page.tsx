import { InquiryOutreachPanel } from "@/components/studio/InquiryOutreachPanel";
import { ProjectEstimateCard } from "@/components/studio/ProjectEstimateCard";
import { InquiryStatusBadge } from "@/components/studio/InquiryStatusBadge";
import { InquiryStatusForm } from "@/components/studio/InquiryStatusForm";
import type { ProjectEstimate } from "@/lib/business/project-estimate.service";
import type { BriefingReadiness } from "@/lib/constants/business-pricing-mastermind";
import { getStudioInquiryById } from "@/lib/studio/inquiries";
import { createQuoteFromInquiryAction } from "@/lib/studio/quote-actions";
import { getQuotesByInquiryId } from "@/lib/studio/quotes";
import { createClientFromInquiryAction } from "@/lib/studio/client-actions";
import { getClientByInquiryId } from "@/lib/studio/clients";
import type { StudioInquiryStatus } from "@/lib/studio/types";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatAnswerKey(key: string): string {
  const labels: Record<string, string> = {
    industry: "Branche",
    projectType: "Gewünschte Lösung",
    phone: "Telefon",
    serviceModel: "Vorgehen / Modell",
    analysisTier: "Analyse-Stufe",
    servicePackage: "Servicepaket",
    websiteScope: "Website-Umfang",
    projectTier: "Paket-Stufe",
    hosting: "Hosting-Situation",
    infrastructure: "Einrichtungs-Leistungen",
    budget: "Budget",
    timeline: "Zeitrahmen",
    preferredDate: "Wunschtermin",
    modules: "Module",
  };
  return labels[key] ?? key;
}

function formatAnswerValue(key: string, value: unknown): string {
  if (key === "projectTier" && typeof value === "string") {
    const labels: Record<string, string> = {
      starter: "Starter — Werkstatt-Setup",
      business: "Business",
      premium: "Premium — individuelles Design",
    };
    return labels[value] ?? value;
  }
  if (Array.isArray(value)) {
    if (key === "modules") {
      return value.join(", ");
    }
    if (key === "infrastructure") {
      return value.join(", ");
    }
    return value.join(", ");
  }
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function parseBriefing(raw: unknown): BriefingReadiness | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as BriefingReadiness;
}

function parseEstimate(raw: unknown): ProjectEstimate | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as ProjectEstimate;
  if (typeof e.suggestedCents !== "number") return null;
  return e;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function StudioInquiryDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const inquiry = await getStudioInquiryById(id);

  if (!inquiry) {
    notFound();
  }

  const estimate = parseEstimate(inquiry.answers.estimate);
  const briefing = parseBriefing(inquiry.answers.briefing) ?? undefined;
  const existingQuotes = await getQuotesByInquiryId(id);
  const linkedClient = await getClientByInquiryId(id);

  const answerEntries = Object.entries(inquiry.answers).filter(
    ([key, value]) =>
      key !== "estimate" &&
      key !== "briefing" &&
      value !== null &&
      value !== undefined &&
      value !== "",
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/studio/app" className="text-sm text-gray-500 transition hover:text-gray-800">
        ← Alle Leads
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold text-emerald-700">{inquiry.referenceId}</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
            {inquiry.contactName ?? "Anfrage"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{formatDate(inquiry.createdAt)}</p>
        </div>
        <InquiryStatusBadge status={inquiry.status as StudioInquiryStatus} />
      </div>

      {saved === "1" ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Status gespeichert.
        </p>
      ) : null}
      {error === "no-estimate" ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Keine Schätzung vorhanden — Angebot manuell unter Angebote anlegen.
        </p>
      ) : null}

      {error === "client" ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          Kunde konnte nicht angelegt werden.
        </p>
      ) : null}

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Kunde</h2>
        {linkedClient ? (
          <div className="mt-3">
            <p className="text-sm text-gray-800">{linkedClient.companyName}</p>
            <Link
              href={`/studio/app/kunden/${linkedClient.id}`}
              className="mt-2 inline-block text-sm font-medium text-emerald-700 underline"
            >
              Kundenakte öffnen →
            </Link>
          </div>
        ) : (
          <form action={createClientFromInquiryAction} className="mt-3">
            <input type="hidden" name="inquiryId" value={inquiry.id} />
            <button
              type="submit"
              className="rounded-lg border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-700 active:bg-emerald-50"
            >
              Als Kunde speichern
            </button>
          </form>
        )}
      </section>

      {estimate ? (
        <div className="mt-8">
          <ProjectEstimateCard estimate={estimate} />
          <form action={createQuoteFromInquiryAction} className="mt-4">
            <input type="hidden" name="inquiryId" value={inquiry.id} />
            <button
              type="submit"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "#1DB872" }}
            >
              Angebot aus Schätzung erstellen
            </button>
          </form>
        </div>
      ) : null}

      {existingQuotes.length > 0 ? (
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Angebote</h2>
          <ul className="mt-3 space-y-2">
            {existingQuotes.map((q) => (
              <li key={q.id}>
                <Link href={`/studio/app/angebote/${q.id}`} className="text-sm text-emerald-700 underline">
                  {q.referenceId} — {q.status}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Kontakt</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-gray-500">E-Mail</dt>
            <dd>
              <a href={`mailto:${inquiry.contactEmail}`} className="font-medium text-emerald-700 hover:underline">
                {inquiry.contactEmail}
              </a>
            </dd>
          </div>
          {inquiry.company ? (
            <div>
              <dt className="text-gray-500">Unternehmen</dt>
              <dd className="font-medium text-gray-900">{inquiry.company}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-gray-500">Typ</dt>
            <dd className="font-medium text-gray-900">{inquiry.inquiryType}</dd>
          </div>
        </dl>
      </section>

      {inquiry.message ? (
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Nachricht</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{inquiry.message}</p>
        </section>
      ) : null}

      {briefing ? (
        <section className="mt-6 rounded-xl border border-sky-200 bg-sky-50/40 p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-800">Briefing / Material</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Logo</dt>
              <dd className="text-sm font-medium text-gray-900">{briefing.hasLogo ? "Ja" : "Nein / folgt"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Texte</dt>
              <dd className="text-sm font-medium text-gray-900">{briefing.hasTexts ? "Ja" : "Nein / folgt"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Bilder</dt>
              <dd className="text-sm font-medium text-gray-900">{briefing.hasImages ? "Ja" : "Nein / folgt"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Rechtstexte</dt>
              <dd className="text-sm font-medium text-gray-900">
                {briefing.hasLegalTexts ? "Ja" : "Nein / folgt"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Referenz-Template</dt>
              <dd className="text-sm font-medium text-gray-900">
                {briefing.hasReference ? "Ja" : "Nein / folgt"}
              </dd>
            </div>
            {briefing.uploadedFileNames?.length ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-500">Hochgeladene Dateien</dt>
                <dd className="text-sm font-medium text-gray-900">{briefing.uploadedFileNames.join(", ")}</dd>
              </div>
            ) : null}
            {briefing.materialNotes ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-500">Hinweise</dt>
                <dd className="whitespace-pre-wrap text-sm text-gray-800">{briefing.materialNotes}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      <div className="mt-6">
        <InquiryOutreachPanel
          context={{
            referenceId: inquiry.referenceId,
            contactName: inquiry.contactName,
            contactEmail: inquiry.contactEmail,
            company: inquiry.company,
            inquiryType: inquiry.inquiryType,
            briefing,
            estimate,
          }}
        />
      </div>

      {answerEntries.length > 0 ? (
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Projektdetails</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {answerEntries.map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs text-gray-500">{formatAnswerKey(key)}</dt>
                <dd className="text-sm font-medium text-gray-900">{formatAnswerValue(key, value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Bearbeitung</h2>
        <div className="mt-4">
          <InquiryStatusForm inquiryId={inquiry.id} currentStatus={inquiry.status} />
        </div>
      </section>
    </div>
  );
}

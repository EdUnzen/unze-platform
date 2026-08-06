import { ProjectEstimateCard } from "@/components/studio/ProjectEstimateCard";
import {
  getSampleEstimatePreviews,
  seedSampleInquiryAction,
} from "@/lib/studio/sample-inquiry-actions";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ seeded?: string; ref?: string; id?: string; error?: string }>;
}

export default async function SchaetzungTestPage({ searchParams }: PageProps) {
  const { seeded, ref, id, error } = await searchParams;
  const previews = await getSampleEstimatePreviews();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
          Schätzung testen
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Drei anonymisierte Beispiel-Anfragen. Vorschau der Grobschätzung oder mit einem Klick als
          echter Test-Lead im Studio anlegen.
        </p>
      </div>

      {seeded === "1" && ref ? (
        <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Test-Lead angelegt: <span className="font-mono font-semibold">{ref}</span>
          {id ? (
            <>
              {" "}
              (
              <Link href="/studio/app" className="underline">
                zu Leads
              </Link>
              )
            </>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error === "unknown"
            ? "Unbekanntes Test-Szenario."
            : decodeURIComponent(error)}
        </div>
      ) : null}

      <div className="mt-8 space-y-10">
        {previews.map(({ scenario, estimate }) => (
          <article
            key={scenario.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <header>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Test {scenario.id}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900">{scenario.title}</h2>
              <p className="text-sm text-gray-600">{scenario.subtitle}</p>
            </header>

            <ul className="mt-3 list-inside list-disc text-xs text-gray-500">
              {scenario.expectedFactors.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Firma</dt>
                <dd className="font-medium">{scenario.input.company}</dd>
              </div>
              <div>
                <dt className="text-gray-500">E-Mail (Test)</dt>
                <dd className="font-mono text-xs">{scenario.input.contactEmail}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <ProjectEstimateCard estimate={estimate} />
            </div>

            <form action={seedSampleInquiryAction} className="mt-4">
              <input type="hidden" name="scenarioId" value={scenario.id} />
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: "#1DB872" }}
              >
                Als Test-Lead anlegen
              </button>
            </form>
          </article>
        ))}
      </div>

      <p className="mt-10 text-xs text-gray-400">
        Hinweis: Mit konfiguriertem Resend erhältst du pro angelegtem Lead eine Admin-E-Mail.
        @example.com-Adressen werden nicht zugestellt.
      </p>
    </div>
  );
}

import {

  BUSINESS_PRICING,

  EBAY_TEMPLATE_PRICING,

  PRICING_DISCLAIMER,

  PRICING_WORLDS,

  type PriceTier,

  type StudioTierScope,

} from "@/lib/constants/business-pricing";

import {

  INFRASTRUCTURE_ADDON_CENTS,

  INFRASTRUCTURE_LABELS,

  TIER_BUNDLED_INFRASTRUCTURE,

} from "@/lib/constants/business-pricing-estimate-config";

import { formatEuroCents } from "@/lib/business/pricing-utils";
import {
  ASPIRATION_HOURLY_CENTS,
  INTERNAL_HOURLY_RATE_CENTS,
  TARGET_EFFECTIVE_HOURLY_CENTS,
  TIER_HOUR_ESTIMATES,
} from "@/lib/constants/business-pricing-mastermind";



function ScopeBlock({ scope }: { scope: StudioTierScope }) {

  return (

    <div className="mt-4 space-y-4 border-t border-gray-100 pt-4 text-sm">

      <p className="font-medium text-gray-900">{scope.summary}</p>

      <div className="grid gap-4 md:grid-cols-2">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Enthalten (Ergebnis)</p>

          <ul className="mt-2 list-disc space-y-1 pl-4 text-gray-700">

            {scope.included.map((item) => (

              <li key={item}>{item}</li>

            ))}

          </ul>

        </div>

        <div>

          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Deine Aufgaben (Checkliste)</p>

          <ol className="mt-2 list-decimal space-y-1 pl-4 text-gray-700">

            {scope.tasks.map((item) => (

              <li key={item}>{item}</li>

            ))}

          </ol>

        </div>

      </div>

      <div>

        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Nicht enthalten</p>

        <ul className="mt-2 list-disc space-y-1 pl-4 text-gray-600">

          {scope.notIncluded.map((item) => (

            <li key={item}>{item}</li>

          ))}

        </ul>

      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-600">

        <span>

          <strong className="text-gray-800">Zeitrahmen:</strong> {scope.timeframe}

        </span>

        <span>

          <strong className="text-gray-800">Korrekturen:</strong> {scope.revisions}

        </span>

      </div>

    </div>

  );

}



function TierScopeCard({ tier }: { tier: PriceTier }) {

  if (!tier.studioScope) {

    return (

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

        <h3 className="text-lg font-semibold text-gray-900">

          {tier.name} — {tier.price}

          {tier.period ?? ""}

        </h3>

        <p className="mt-1 text-sm text-gray-600">{tier.note}</p>

        <p className="mt-3 text-xs text-amber-700">Leistungsbeschreibung folgt in SSOT.</p>

      </div>

    );

  }



  return (

    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-5">

      <div className="flex flex-wrap items-baseline justify-between gap-2">

        <h3 className="text-lg font-semibold text-gray-900">

          {tier.name} — {tier.price}

          {tier.period ?? ""}

        </h3>

        {tier.studioOnly ? (

          <span className="text-xs text-gray-600">Vergleich Template only: {tier.studioOnly}</span>

        ) : null}

      </div>

      <p className="mt-1 text-sm text-gray-600">{tier.note}</p>

      <ScopeBlock scope={tier.studioScope} />

    </div>

  );

}



export default function StudioPreisePage() {

  return (

    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">

        Preise & Leistungsumfang

      </h1>

      <p className="mt-2 text-sm text-gray-600">

        SSOT für Angebote und Auftragsabwicklung — gleiche Projektpreise wie{" "}

        <span className="font-medium">unze.app/business/preise</span>. Bei jedem Auftrag: Stufe wählen, Scope

        durchgehen, Checkliste abarbeiten.

      </p>

      <p className="mt-1 text-xs text-gray-400">{PRICING_DISCLAIMER}</p>



      <div className="mt-6 grid gap-3 sm:grid-cols-3">

        {PRICING_WORLDS.map((world) => (

          <div key={world.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{world.title}</p>

            <p className="mt-1 text-xl font-bold text-emerald-700">{world.from}</p>

            <p className="mt-1 text-xs text-gray-600">{world.detail}</p>

          </div>

        ))}

      </div>



      <nav className="mt-8 flex flex-wrap gap-2">

        {BUSINESS_PRICING.map((cat) => (

          <a

            key={cat.id}

            href={`#${cat.id}`}

            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-800"

          >

            {cat.title}

          </a>

        ))}

        <a

          href="#kalkulation"

          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 hover:border-sky-300"

        >

          Auto-Kalkulation

        </a>

        <a

          href="#ebay"

          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 hover:border-amber-300"

        >

          eBay Templates

        </a>

      </nav>



      <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">

          <h2 className="text-lg font-semibold text-gray-900">Preisübersicht (aktuell)</h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full text-sm">

            <thead>

              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">

                <th className="px-5 py-3 font-semibold">Kategorie</th>

                <th className="px-5 py-3 font-semibold">Stufe</th>

                <th className="px-5 py-3 font-semibold">Preis</th>

                <th className="px-5 py-3 font-semibold">Template only</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {BUSINESS_PRICING.flatMap((category) =>

                category.tiers.map((tier) => (

                  <tr key={`${category.id}-${tier.name}`}>

                    <td className="px-5 py-3 text-gray-700">{category.title}</td>

                    <td className="px-5 py-3 font-medium text-gray-900">{tier.name}</td>

                    <td className="px-5 py-3 font-semibold text-emerald-700">

                      {tier.price}

                      {tier.period ?? ""}

                    </td>

                    <td className="px-5 py-3 text-gray-600">{tier.studioOnly ?? "—"}</td>

                  </tr>

                )),

              )}

            </tbody>

          </table>

        </div>

      </section>



      {BUSINESS_PRICING.map((category) => (

        <section key={category.id} id={category.id} className="mt-12 scroll-mt-6">

          <div className="border-b border-gray-200 pb-3">

            <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>

            <p className="mt-1 text-sm text-gray-600">{category.description}</p>

          </div>

          <div className="mt-6 space-y-6">

            {category.tiers.map((tier) => (

              <TierScopeCard key={`${category.id}-${tier.name}`} tier={tier} />

            ))}

          </div>

        </section>

      ))}



      <section id="kalkulation" className="mt-12 scroll-mt-6 overflow-hidden rounded-xl border border-sky-200 bg-sky-50/40 shadow-sm">

        <div className="border-b border-sky-200/80 bg-sky-100/50 px-5 py-3">

          <h2 className="text-lg font-semibold text-gray-900">Automatische Kalkulation (Anfrageformular)</h2>

          <p className="mt-0.5 text-sm text-gray-700">

            Zusatzleistungen und Gutschriften — sync mit Grobschätzung im Lead.

          </p>

        </div>

        <div className="grid gap-6 p-5 md:grid-cols-2">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Zusatz (wenn angehakt)</p>

            <ul className="mt-2 space-y-1 text-sm text-gray-700">

              {Object.entries(INFRASTRUCTURE_ADDON_CENTS).map(([key, cents]) => (

                <li key={key} className="flex justify-between gap-3">

                  <span>{INFRASTRUCTURE_LABELS[key] ?? key}</span>

                  <span className="font-medium">+{formatEuroCents(cents)}</span>

                </li>

              ))}

            </ul>

          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">

              In Stufe inkl. — Gutschrift wenn nicht gewünscht

            </p>

            <ul className="mt-2 space-y-2 text-sm text-gray-700">

              {Object.entries(TIER_BUNDLED_INFRASTRUCTURE).map(([catId, tiers]) => (

                <li key={catId}>

                  <span className="font-medium capitalize">{catId.replace("-", " ")}:</span>{" "}

                  {Object.entries(tiers)

                    .map(([idx, keys]) => `Stufe ${Number(idx) + 1}: ${keys?.join(", ")}`)

                    .join(" · ")}

                </li>

              ))}

            </ul>

          </div>

        </div>

      </section>



      <section id="mastermind" className="mt-8 scroll-mt-6 overflow-hidden rounded-xl border border-violet-200 bg-violet-50/40 shadow-sm">

        <div className="border-b border-violet-200/80 bg-violet-100/50 px-5 py-3">

          <h2 className="text-lg font-semibold text-gray-900">Mastermind — interne Stundenlogik</h2>

          <p className="mt-0.5 text-sm text-gray-700">

            Nur Studio — nie öffentlich. Paketpreise bleiben fix; hier prüfen wir Effektiv-€/h und Briefing-Qualität.

          </p>

        </div>

        <div className="grid gap-6 p-5 md:grid-cols-3">

          <div className="rounded-lg border border-white/80 bg-white/70 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Listen-Stundensatz</p>

            <p className="mt-1 text-xl font-bold text-gray-900">{formatEuroCents(INTERNAL_HOURLY_RATE_CENTS)}/h</p>

            <p className="mt-1 text-xs text-gray-600">Interne Kalkulation</p>

          </div>

          <div className="rounded-lg border border-white/80 bg-white/70 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Praxis-Ziel</p>

            <p className="mt-1 text-xl font-bold text-emerald-800">

              ≥ {formatEuroCents(TARGET_EFFECTIVE_HOURLY_CENTS)}/h effektiv

            </p>

            <p className="mt-1 text-xs text-gray-600">Bei Paketpreisen (Nebengewerbe)</p>

          </div>

          <div className="rounded-lg border border-white/80 bg-white/70 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Langfrist-Richtwert</p>

            <p className="mt-1 text-xl font-bold text-gray-700">{formatEuroCents(ASPIRATION_HOURLY_CENTS)}/h</p>

            <p className="mt-1 text-xs text-gray-600">Nicht öffentlich · nicht erzwingen</p>

          </div>

        </div>

        <div className="border-t border-violet-200/60 px-5 py-4">

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Beispiel Landing Starter (390 €)</p>

          <p className="mt-2 text-sm text-gray-700">

            {TIER_HOUR_ESTIMATES.landingpages[0].suggested} h netto × {formatEuroCents(INTERNAL_HOURLY_RATE_CENTS)}/h ≈{" "}

            {formatEuroCents(

              Math.round(TIER_HOUR_ESTIMATES.landingpages[0].suggested * INTERNAL_HOURLY_RATE_CENTS),

            )}{" "}

            Listenwert · effektiv bei 390 € ≈{" "}

            {formatEuroCents(Math.round(39000 / TIER_HOUR_ESTIMATES.landingpages[0].suggested))}/h

          </p>

        </div>

      </section>



      <section id="ebay" className="mt-8 scroll-mt-6 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/60 shadow-sm">

        <div className="border-b border-amber-200/80 bg-amber-100/50 px-5 py-3">

          <h2 className="text-lg font-semibold text-gray-900">eBay Templates (nur Datei — kein Setup)</h2>

          <p className="mt-0.5 text-sm text-gray-700">Nicht mit Projektpreis verwechseln. Keine Abnahme durch UNZE.</p>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full text-sm">

            <thead>

              <tr className="border-b border-amber-200/60 text-left text-xs uppercase tracking-wide text-gray-600">

                <th className="px-5 py-3 font-semibold">ID</th>

                <th className="px-5 py-3 font-semibold">Produkt</th>

                <th className="px-5 py-3 font-semibold">Preis</th>

                <th className="px-5 py-3 font-semibold">Hinweis</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-amber-200/40">

              {EBAY_TEMPLATE_PRICING.map((row) => (

                <tr key={row.id}>

                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{row.id}</td>

                  <td className="px-5 py-3 font-medium text-gray-900">{row.name}</td>

                  <td className="px-5 py-3 font-semibold text-emerald-800">{row.price}</td>

                  <td className="px-5 py-3 text-gray-700">{row.note}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

    </div>

  );

}



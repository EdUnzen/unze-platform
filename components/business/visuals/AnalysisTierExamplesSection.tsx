"use client";

import { BusinessEyebrow } from "@/components/business/BusinessUi";
import { BusinessLink } from "@/components/business/BusinessLink";
import {
  DEMO_ANALYSIS_TIER_EXAMPLES,
  DEMO_ANALYSIS_TIER_ORDER,
} from "@/lib/constants/business-analysis-tier-examples";
import type { AnalysisReportCategoryId } from "@/lib/constants/business-analysis-tiers";
import type { AnalysisTierId } from "@/lib/constants/business-analysis-tiers";
import { shopSlugToInquiryHref, buildInquiryHref } from "@/lib/business/inquiry-links";
import { ArrowRight, Check, FileText } from "lucide-react";
import { useState } from "react";

const CATEGORY_BADGE: Record<AnalysisReportCategoryId, string> = {
  observation: "bg-blue-100 text-blue-800",
  assumption: "bg-amber-100 text-amber-900",
  recommendation: "bg-emerald-100 text-emerald-800",
};

const CATEGORY_LABEL: Record<AnalysisReportCategoryId, string> = {
  observation: "Fakt",
  assumption: "Ableitung",
  recommendation: "Maßnahme",
};

type Props = {
  initialTier?: AnalysisTierId;
};

export function AnalysisTierExamplesSection({ initialTier = "business" }: Props) {
  const [activeTier, setActiveTier] = useState<AnalysisTierId>(initialTier);
  const example = DEMO_ANALYSIS_TIER_EXAMPLES[activeTier];

  return (
    <section id="analyse-beispiele" className="scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <BusinessEyebrow>Beispiel-Analysen</BusinessEyebrow>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
          So sieht das Ergebnis aus — Stufe für Stufe
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Echte Demo-Beispiele zeigen Umfang, Struktur und Mehrwert — von der Quick-Website-Analyse
          bis zur Premium-Strategie mit Roadmap.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {DEMO_ANALYSIS_TIER_ORDER.map((tierId) => {
          const tier = DEMO_ANALYSIS_TIER_EXAMPLES[tierId];
          const active = tierId === activeTier;
          return (
            <button
              key={tierId}
              type="button"
              onClick={() => setActiveTier(tierId)}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-[#00C853] text-white shadow-lg shadow-[#00C853]/20"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-[#00C853]/30 hover:bg-[#00C853]/5"
              }`}
            >
              {tier.tierLabel}
              <span className={`ml-2 text-xs ${active ? "text-white/80" : "text-gray-500"}`}>
                {tier.priceDisplay}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl ring-1 ring-gray-100">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-emerald-50/40 px-6 py-5 md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#00C853]">
                Demo-Bericht · {example.tierLabel}
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                {example.company}
              </h3>
              <p className="text-sm text-gray-500">{example.industry}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-xs text-gray-600">
              <p>
                <strong className="text-gray-900">Eingabe:</strong> {example.inputSummary}
              </p>
              <p className="mt-1">
                <strong className="text-gray-900">Lieferung:</strong> {example.deliveryTime}
              </p>
              <p className="mt-1">
                <strong className="text-gray-900">Umfang:</strong> {example.reportVolume}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-5">
          <div className="border-b border-gray-100 p-6 lg:col-span-2 lg:border-b-0 lg:border-r lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Executive Summary
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{example.executiveSummary}</p>

            <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Kennzahlen (Demo)
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {example.scores.map((score) => (
                <div key={score.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-[10px] font-medium text-gray-500">{score.label}</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-gray-900">
                    {score.value}
                    {score.unit}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Berichts-Inhalte
            </p>
            <ul className="mt-3 space-y-1.5">
              {example.reportSections.map((section) => (
                <li key={section} className="flex gap-2 text-sm text-gray-700">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00C853]" aria-hidden />
                  {section}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 lg:col-span-3 lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Auszug aus dem Bericht
            </p>
            <ul className="mt-4 space-y-3">
              {example.findings.map((finding, index) => (
                <li
                  key={index}
                  className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
                >
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CATEGORY_BADGE[finding.categoryId]}`}
                  >
                    {CATEGORY_LABEL[finding.categoryId]}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-gray-800">{finding.text}</p>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Top-Empfehlungen
            </p>
            <ul className="mt-3 space-y-2">
              {example.recommendations.map((rec) => (
                <li key={rec} className="flex gap-2 text-sm text-gray-800">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                  {rec}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
              <BusinessLink
                href={shopSlugToInquiryHref(example.shopSlug)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#00C853] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#00C853]/20 transition hover:bg-[#00b34a]"
              >
                <FileText className="h-4 w-4" aria-hidden />
                {example.tierLabel} anfragen
                <ArrowRight className="h-4 w-4" aria-hidden />
              </BusinessLink>
              <BusinessLink
                href={buildInquiryHref({ projectType: "analysis" })}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 transition hover:border-gray-300"
              >
                Zum Anfrageformular
              </BusinessLink>
            </div>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-gray-500">
        Alle gezeigten Unternehmen und Daten sind Demo-Beispiele zur Darstellung des
        Analyse-Leistungsumfangs.
      </p>
    </section>
  );
}

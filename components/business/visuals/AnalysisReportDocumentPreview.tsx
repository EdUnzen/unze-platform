"use client";

import { BusinessEyebrow } from "@/components/business/BusinessUi";
import { BusinessLink } from "@/components/business/BusinessLink";
import {
  DEMO_ANALYSIS_PRIORITY_ITEMS,
  DEMO_ANALYSIS_REPORT_SECTIONS,
  DEMO_ANALYSIS_ROADMAP_PHASES,
} from "@/lib/constants/business-analysis-demo";
import {
  DEMO_ANALYSIS_TIER_EXAMPLES,
  DEMO_ANALYSIS_TIER_ORDER,
  type TierAnalysisExample,
} from "@/lib/constants/business-analysis-tier-examples";
import type { AnalysisReportCategoryId, AnalysisTierId } from "@/lib/constants/business-analysis-tiers";
import { ANALYSIS_REPORT_CATEGORIES } from "@/lib/constants/business-analysis-tiers";
import { shopSlugToInquiryHref } from "@/lib/business/inquiry-links";
import { ArrowRight, FileText } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

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
  title: string;
  intro: string;
  disclaimer: string;
  initialTier?: AnalysisTierId;
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium text-gray-700">{label}</span>
        <span className="font-mono text-[11px] font-semibold text-gray-900">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#00C853] to-emerald-400"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function ReportPage({
  pageNumber,
  totalPages,
  tierLabel,
  children,
  className = "",
}: {
  pageNumber: number;
  totalPages: number;
  tierLabel: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`relative flex min-h-[520px] flex-col rounded-2xl border border-gray-200 bg-white shadow-lg ring-1 ring-gray-100 ${className}`}
      data-export={`analysis-report-page-${pageNumber}`}
    >
      <header className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-[#00C853] text-[10px] font-bold text-white">
            U
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            UNZE Business · {tierLabel}
          </span>
        </div>
        <span className="font-mono text-[10px] text-gray-400">
          Seite {pageNumber} / {totalPages}
        </span>
      </header>
      <div className="flex-1 px-6 py-5">{children}</div>
      <footer className="border-t border-gray-100 px-6 py-2.5">
        <p className="text-[9px] text-gray-400">
          Demo-Bericht · Vertraulich · Nur zur Darstellung des Analyse-Leistungsumfangs
        </p>
      </footer>
    </article>
  );
}

function buildPages(example: TierAnalysisExample) {
  const totalPages = example.tierId === "quick" ? 6 : example.tierId === "business" ? 8 : 10;
  return { example, totalPages };
}

export function AnalysisReportDocumentPreview({
  title,
  intro,
  disclaimer,
  initialTier = "business",
}: Props) {
  const [activeTier, setActiveTier] = useState<AnalysisTierId>(initialTier);
  const example = DEMO_ANALYSIS_TIER_EXAMPLES[activeTier];
  const { totalPages } = useMemo(() => buildPages(example), [example]);

  const categoryLegend = ANALYSIS_REPORT_CATEGORIES.map((cat) => ({
    ...cat,
    badge: CATEGORY_BADGE[cat.id],
  }));

  return (
    <div data-export="analysis-report-document-preview">
      <div className="mx-auto max-w-3xl text-center">
        <BusinessEyebrow>Vollständiger Bericht</BusinessEyebrow>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-lg text-gray-600">{intro}</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {DEMO_ANALYSIS_TIER_ORDER.map((tierId) => {
          const tier = DEMO_ANALYSIS_TIER_EXAMPLES[tierId];
          const active = tierId === activeTier;
          return (
            <button
              key={tierId}
              type="button"
              onClick={() => setActiveTier(tierId)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-gray-900 text-white shadow-lg"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {tier.tierLabel}
              <span className={`ml-2 text-xs ${active ? "text-white/70" : "text-gray-500"}`}>
                {tier.reportVolume}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[240px_1fr]">
        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Berichtsstruktur
            </p>
            <ol className="space-y-2 text-sm text-gray-700">
              {example.reportSections.map((section, index) => (
                <li key={section} className="flex gap-2">
                  <span className="shrink-0 font-mono text-xs text-[#00C853]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section}
                </li>
              ))}
            </ol>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-900">{example.company}</p>
              <p className="mt-1 text-xs text-gray-500">{example.reportVolume}</p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <ReportPage pageNumber={1} totalPages={totalPages} tierLabel={example.tierLabel}>
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00C853]">
                  Unternehmensanalyse
                </p>
                <h3 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-gray-900">
                  {example.company}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{example.industry}</p>
              </div>
              <div className="mt-8 space-y-3 border-t border-gray-100 pt-6 text-sm text-gray-600">
                <p>
                  <strong className="text-gray-900">Stufe:</strong> {example.tierLabel}
                </p>
                <p>
                  <strong className="text-gray-900">Umfang:</strong> {example.reportVolume}
                </p>
                <p>
                  <strong className="text-gray-900">Datenbasis:</strong> {example.inputSummary}
                </p>
                <p>
                  <strong className="text-gray-900">Lieferung:</strong> {example.deliveryTime}
                </p>
              </div>
            </div>
          </ReportPage>

          <ReportPage pageNumber={2} totalPages={totalPages} tierLabel={example.tierLabel}>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              Executive Summary
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-gray-700">{example.executiveSummary}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {example.scores.slice(0, 4).map((score) => (
                <div key={score.label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-[10px] font-medium text-gray-500">{score.label}</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                    {score.value}
                    {score.unit}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-gray-500">
              Die Kennzahlen sind Schätzungen auf Basis der Analyse — im Bericht mit Quellen,
              Begründung und Priorisierung dokumentiert.
            </p>
          </ReportPage>

          <ReportPage pageNumber={3} totalPages={totalPages} tierLabel={example.tierLabel}>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              Bewertungsübersicht
            </h4>
            <div className="mt-5 space-y-4">
              {example.scores.map((score) => (
                <ScoreBar key={score.label} label={score.label} value={score.value} />
              ))}
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Analysierte Bereiche
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {DEMO_ANALYSIS_REPORT_SECTIONS.map((section) => (
                <li
                  key={section}
                  className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-700"
                >
                  {section}
                </li>
              ))}
            </ul>
          </ReportPage>

          <ReportPage pageNumber={4} totalPages={totalPages} tierLabel={example.tierLabel}>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              Analyse-Auszug · Website & Prozesse
            </h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {categoryLegend.map((cat) => (
                <span
                  key={cat.id}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${cat.badge}`}
                >
                  {cat.shortLabel}
                </span>
              ))}
            </div>
            <ul className="mt-5 space-y-3">
              {example.findings.map((finding, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3"
                >
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${CATEGORY_BADGE[finding.categoryId]}`}
                  >
                    {CATEGORY_LABEL[finding.categoryId]}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-gray-800">{finding.text}</p>
                </li>
              ))}
            </ul>
          </ReportPage>

          {activeTier !== "quick" && (
            <ReportPage pageNumber={5} totalPages={totalPages} tierLabel={example.tierLabel}>
              <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                Prioritäten & Maßnahmenplan
              </h4>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="pb-2 pr-3 font-semibold">Prio</th>
                      <th className="pb-2 pr-3 font-semibold">Maßnahme</th>
                      <th className="pb-2 pr-3 font-semibold">Aufwand</th>
                      <th className="pb-2 pr-3 font-semibold">Wirkung</th>
                      <th className="pb-2 font-semibold">Zeitrahmen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {DEMO_ANALYSIS_PRIORITY_ITEMS.map((item) => (
                      <tr key={item.title} className="text-gray-700">
                        <td className="py-2.5 pr-3 font-mono font-bold text-[#00C853]">
                          {item.priority}
                        </td>
                        <td className="py-2.5 pr-3">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="mt-0.5 text-[11px] text-gray-500">{item.detail}</p>
                        </td>
                        <td className="py-2.5 pr-3">{item.effort}</td>
                        <td className="py-2.5 pr-3">{item.impact}</td>
                        <td className="py-2.5">{item.timeline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="mt-6 space-y-2">
                {example.recommendations.map((rec) => (
                  <li key={rec} className="flex gap-2 text-sm text-gray-800">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C853]" />
                    {rec}
                  </li>
                ))}
              </ul>
            </ReportPage>
          )}

          {activeTier === "premium" && (
            <ReportPage pageNumber={6} totalPages={totalPages} tierLabel={example.tierLabel}>
              <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                Strategie-Roadmap
              </h4>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {DEMO_ANALYSIS_ROADMAP_PHASES.map((phase) => (
                  <div
                    key={phase.phase}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <p className="text-xs font-bold text-[#00C853]">{phase.phase}</p>
                    <p className="mt-1 text-[11px] font-medium text-gray-500">{phase.window}</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{phase.focus}</p>
                    <ul className="mt-3 space-y-1">
                      {phase.items.map((item) => (
                        <li key={item} className="text-xs text-gray-600">
                          · {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
                Premium-Analysen enthalten ein individuelles Umsetzungsangebot mit Budgetrahmen,
                Modul-Empfehlungen und 100&nbsp;% Gutschrift des Analysebetrags bei Beauftragung.
              </p>
            </ReportPage>
          )}

          <ReportPage
            pageNumber={activeTier === "quick" ? 5 : activeTier === "business" ? 6 : 7}
            totalPages={totalPages}
            tierLabel={example.tierLabel}
          >
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              Inhaltsverzeichnis · {example.reportVolume}
            </h4>
            <ol className="mt-5 space-y-2">
              {example.reportSections.map((section, index) => (
                <li
                  key={section}
                  className="flex items-baseline justify-between gap-4 border-b border-dotted border-gray-200 pb-2 text-sm"
                >
                  <span className="flex gap-3 text-gray-800">
                    <span className="font-mono text-xs text-gray-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {section}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-gray-400">
                    {index + 2}
                  </span>
                </li>
              ))}
            </ol>
          </ReportPage>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 text-center">
        <BusinessLink
          href={shopSlugToInquiryHref(example.shopSlug)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00C853] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#00C853]/20 transition hover:bg-[#00b34a]"
        >
          <FileText className="h-4 w-4" aria-hidden />
          {example.tierLabel} anfragen
          <ArrowRight className="h-4 w-4" aria-hidden />
        </BusinessLink>
        <p className="max-w-2xl text-xs text-gray-500">{disclaimer}</p>
      </div>
    </div>
  );
}

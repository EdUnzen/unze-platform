import { BusinessEyebrow } from "@/components/business/BusinessUi";
import {
  ANALYSIS_REPORT_CATEGORIES,
  type AnalysisReportCategoryId,
} from "@/lib/constants/business-analysis-tiers";
import { DEMO_ANALYSIS_TRANSPARENCY_EXAMPLES } from "@/lib/constants/business-analysis-demo";
import { Eye, Lightbulb, Target } from "lucide-react";

const CATEGORY_STYLES: Record<
  AnalysisReportCategoryId,
  { border: string; bg: string; text: string; badge: string; Icon: typeof Eye }
> = {
  observation: {
    border: "border-l-blue-500",
    bg: "bg-blue-50/80",
    text: "text-blue-900",
    badge: "bg-blue-100 text-blue-800",
    Icon: Eye,
  },
  assumption: {
    border: "border-l-amber-500",
    bg: "bg-amber-50/80",
    text: "text-amber-950",
    badge: "bg-amber-100 text-amber-900",
    Icon: Lightbulb,
  },
  recommendation: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50/80",
    text: "text-emerald-950",
    badge: "bg-emerald-100 text-emerald-800",
    Icon: Target,
  },
};

type Props = {
  title: string;
  text: string;
};

export function AnalysisTransparencySection({ title, text }: Props) {
  const categoryMap = Object.fromEntries(
    ANALYSIS_REPORT_CATEGORIES.map((cat) => [cat.id, cat]),
  ) as Record<AnalysisReportCategoryId, (typeof ANALYSIS_REPORT_CATEGORIES)[number]>;

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <BusinessEyebrow>Transparenz</BusinessEyebrow>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
          {title}
        </h2>
        <p className="mt-4 text-gray-600">{text}</p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {ANALYSIS_REPORT_CATEGORIES.map((cat) => {
          const style = CATEGORY_STYLES[cat.id];
          const Icon = style.Icon;
          return (
            <div
              key={cat.id}
              className="flex max-w-xs items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bg}`}
              >
                <Icon className={`h-4 w-4 ${style.text}`} aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{cat.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{cat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <p className="text-center text-sm font-medium text-gray-500">
          Auszug aus einem Demo-Bericht — so lesen Sie unsere Analyse
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg ring-1 ring-gray-100">
          <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Berichtsauszug · Muster Logistics GmbH
            </p>
          </div>
          <ul className="divide-y divide-gray-100">
            {DEMO_ANALYSIS_TRANSPARENCY_EXAMPLES.map((entry, index) => {
              const cat = categoryMap[entry.categoryId];
              const style = CATEGORY_STYLES[entry.categoryId];
              return (
                <li
                  key={index}
                  className={`border-l-4 ${style.border} px-5 py-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.badge}`}
                  >
                    {cat.shortLabel}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-gray-800">{entry.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">
          Im vollständigen Bericht finden Sie dieselbe Struktur für alle Bereiche — Website, Prozesse,
          Digitalisierung und Roadmap.
        </p>
      </div>
    </div>
  );
}

import { BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { BusinessLink } from "@/components/business/BusinessLink";
import {
  ANALYSIS_TIERS,
  type AnalysisTierId,
} from "@/lib/constants/business-analysis-tiers";
import { analysisTierToInquiryHref } from "@/lib/business/inquiry-links";
import { ArrowRight, Calendar, FileText, MessageSquare } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    title: "Anfrageformular ausfüllen",
    text: "Stufe, Projekttyp, Hosting und Wünsche — damit wir im Studio sofort die Übersicht haben.",
  },
  {
    icon: MessageSquare,
    title: "Persönliche Rückmeldung",
    text: "Wir prüfen Ihre Anfrage und melden uns innerhalb von 2 Werktagen.",
  },
  {
    icon: Calendar,
    title: "Erstgespräch & Angebot",
    text: "Nach dem Gespräch erhalten Sie ein individuelles Angebot — Analyse, Projekt oder Servicepaket.",
  },
] as const;

type Props = {
  highlightTier?: AnalysisTierId;
};

export function AnalysisShopBookingSection({ highlightTier = "quick" }: Props) {
  return (
    <BusinessSection className="bg-gray-50" id="analyse-buchen">
      <div className="mx-auto max-w-3xl text-center">
        <BusinessEyebrow>Anfrage</BusinessEyebrow>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
          Analyse anfragen — in drei Schritten
        </h2>
        <p className="mt-4 text-gray-600">
          Kein anonymer Shop: Sie beschreiben Ihr Vorhaben strukturiert im Formular. Wir bearbeiten
          alles persönlich im UNZE Studio und schlagen das passende Modell vor.
        </p>
      </div>

      <ol className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#00C853]/10 text-sm font-bold text-[#00C853]">
                {i + 1}
              </span>
              <Icon className="mx-auto mt-4 h-6 w-6 text-[#00C853]" aria-hidden />
              <h3 className="mt-3 font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.text}</p>
            </li>
          );
        })}
      </ol>

      <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-[#00C853]/25 bg-white p-6 shadow-sm md:p-8">
        <p className="text-center text-sm font-semibold text-gray-900">
          Gewählte Stufe: {ANALYSIS_TIERS.find((t) => t.id === highlightTier)?.name}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <BusinessLink
            href={analysisTierToInquiryHref(highlightTier)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00C853] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#00C853]/20 transition hover:bg-[#00b34a]"
          >
            Analyse anfragen
            <ArrowRight className="h-4 w-4" aria-hidden />
          </BusinessLink>
          <BusinessLink
            href={analysisTierToInquiryHref("quick")}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 transition hover:border-gray-300"
          >
            Alle Optionen im Formular
          </BusinessLink>
        </div>
        <p className="mt-5 text-center text-xs text-gray-500">
          Kurze Rückfragen per E-Mail sind möglich — für ein verbindliches Angebot bitte das Formular
          vollständig ausfüllen.
        </p>
      </div>
    </BusinessSection>
  );
}

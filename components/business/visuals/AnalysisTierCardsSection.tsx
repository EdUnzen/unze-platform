import { BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { BusinessLink } from "@/components/business/BusinessLink";
import {
  ANALYSIS_TIERS,
  type AnalysisTierId,
} from "@/lib/constants/business-analysis-tiers";
import { analysisTierToInquiryHref } from "@/lib/business/inquiry-links";
import { Check, Sparkles } from "lucide-react";

type Props = {
  selectedTier: AnalysisTierId;
  tiersTitle: string;
  tiersIntro: string;
  includesPreviousQuick: string;
  includesPreviousBusiness: string;
};

/** Server-seitige Stufen-Karten — Tier per URL (?tier=), kein Client-JavaScript nötig. */
export function AnalysisTierCardsSection({
  selectedTier,
  tiersTitle,
  tiersIntro,
  includesPreviousQuick,
  includesPreviousBusiness,
}: Props) {
  return (
    <BusinessSection id="analyse-stufen">
      <div className="mx-auto max-w-2xl text-center">
        <BusinessEyebrow>Analyse-Stufen</BusinessEyebrow>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
          {tiersTitle}
        </h2>
        <p className="mt-4 text-gray-600">{tiersIntro}</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {ANALYSIS_TIERS.map((tier) => {
          const isSelected = tier.id === selectedTier;
          const inquiryHref = analysisTierToInquiryHref(tier.id);

          return (
            <article
              key={tier.id}
              className={`flex h-full flex-col rounded-2xl border p-8 transition duration-300 hover:shadow-xl ${
                tier.highlighted
                  ? "relative border-[#00C853] bg-white shadow-xl ring-2 ring-[#00C853]/15"
                  : "border-gray-100 bg-white shadow-sm"
              } ${isSelected ? "ring-2 ring-[#00C853]/40" : ""}`}
            >
              {tier.highlighted ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00C853] px-3 py-0.5 text-xs font-semibold text-white">
                  Empfohlen
                </span>
              ) : null}
              {isSelected ? (
                <span className="mb-2 text-center text-xs font-semibold text-[#00C853]">Ausgewählt</span>
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-wide text-[#00C853]">
                Stufe {tier.stage}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
                {tier.name}
              </h3>
              <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                {tier.priceDisplay}
                {tier.pricePeriod ? (
                  <span className="text-sm font-normal text-gray-500">{tier.pricePeriod}</span>
                ) : null}
              </p>
              {tier.entryPriceNote ? (
                <p className="mt-1 text-sm italic text-gray-500">{tier.entryPriceNote}</p>
              ) : null}
              {tier.creditNote ? (
                <div
                  className="mt-4 rounded-xl border-2 border-[#00C853]/35 bg-gradient-to-br from-[#00C853]/12 to-[#00C853]/5 px-4 py-3 shadow-sm"
                  role="note"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#00C853]">
                        {tier.creditBadge ?? "100 % Gutschrift"}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-snug text-gray-900">
                        {tier.creditNote}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              <p className="mt-3 text-sm text-gray-600">{tier.subtitle}</p>
              {tier.duration ? (
                <p className="mt-2 text-xs font-medium text-gray-500">Dauer: {tier.duration}</p>
              ) : null}
              {tier.includesPreviousTier ? (
                <p className="mt-4 text-xs font-semibold text-[#00C853]">
                  {tier.id === "business" ? includesPreviousQuick : includesPreviousBusiness}
                </p>
              ) : null}
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {tier.deliverablesLabel}
              </p>
              <ul className="mt-3 flex-1 space-y-2">
                {tier.deliverables.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              {tier.note ? <p className="mt-4 text-xs text-gray-500">{tier.note}</p> : null}
              <div className="mt-8">
                <BusinessLink
                  href={inquiryHref}
                  className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-300 ${
                    tier.highlighted
                      ? "bg-[#00C853] text-white shadow-lg shadow-[#00C853]/20 hover:bg-[#00b34a]"
                      : "border border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  Analyse anfragen
                </BusinessLink>
              </div>
            </article>
          );
        })}
      </div>
    </BusinessSection>
  );
}

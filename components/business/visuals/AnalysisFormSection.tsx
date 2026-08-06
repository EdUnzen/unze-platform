import { BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { AnalysisInquiryFormServer } from "@/components/business/AnalysisInquiryFormServer";
import { BUSINESS_PRICING_POLICY } from "@/lib/constants/business-pricing-policy";
import type { AnalysisTierId } from "@/lib/constants/business-analysis-tiers";

type Props = {
  initialTier: AnalysisTierId;
  formTitle: string;
  formIntro: string;
  error?: string | null;
  shopOrderReference?: string | null;
};

export function AnalysisFormSection({
  initialTier,
  formTitle,
  formIntro,
  error,
  shopOrderReference,
}: Props) {
  return (
    <BusinessSection className="bg-gray-50" id="analyse-formular">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <BusinessEyebrow>Anfrage</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
            {formTitle}
          </h2>
          <p className="mt-4 text-gray-600">{formIntro}</p>
          {shopOrderReference ? (
            <p className="mt-2 font-mono text-sm text-emerald-700">Auftrag {shopOrderReference}</p>
          ) : null}
        </div>
        <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-10">
          <AnalysisInquiryFormServer
            tier={initialTier}
            error={error}
            shopOrderReference={shopOrderReference}
          />
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">{BUSINESS_PRICING_POLICY.analysisNote}</p>
      </div>
    </BusinessSection>
  );
}

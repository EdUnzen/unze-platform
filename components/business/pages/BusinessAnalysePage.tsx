import {
  BusinessCtaBand,
  BusinessEyebrow,
  BusinessSection,
  BusinessSectionIntro,
} from "@/components/business/BusinessUi";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { AnalysisPageShopBar } from "@/components/business/visuals/AnalysisPageShopBar";
import { AnalysisTierExamplesSection } from "@/components/business/visuals/AnalysisTierExamplesSection";
import { AnalysisStaticBenefitCard } from "@/components/business/visuals/AnalysisStaticBenefitCard";
import { AnalysisShopBookingSection } from "@/components/business/visuals/AnalysisShopBookingSection";
import { AnalysisFormSection } from "@/components/business/visuals/AnalysisFormSection";
import { AnalysisPageHero } from "@/components/business/visuals/AnalysisPageHero";
import { AnalysisReportDocumentPreview } from "@/components/business/visuals/AnalysisReportDocumentPreview";
import { AnalysisTierCardsSection } from "@/components/business/visuals/AnalysisTierCardsSection";
import { AnalysisWorkflowGrid } from "@/components/business/visuals/AnalysisWorkflowGrid";
import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { PremiumCta } from "@/components/business/visuals/PremiumCta";
import { AnalysisTransparencySection } from "@/components/business/visuals/AnalysisTransparencySection";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import {
  ANALYSIS_WORKFLOW_STEPS,
  type AnalysisTierId,
} from "@/lib/constants/business-analysis-tiers";
import { DEMO_ANALYSIS_PROJECT_PATH } from "@/lib/constants/business-analysis-demo";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";

const ANALYSIS_AREA_IMAGES = [
  BUSINESS_IMAGERY.analysis.areas.website,
  BUSINESS_IMAGERY.analysis.areas.processes,
  BUSINESS_IMAGERY.analysis.areas.digital,
  BUSINESS_IMAGERY.analysis.areas.strategy,
] as const;

const ANALYSIS_BENEFIT_IMAGES = [
  BUSINESS_IMAGERY.analysis.benefits.clarity,
  BUSINESS_IMAGERY.analysis.benefits.advisory,
  BUSINESS_IMAGERY.analysis.benefits.project,
] as const;

import type { StudioShopOrder } from "@/lib/studio/shop-order-types";

type Props = {
  initialTier?: AnalysisTierId;
  formError?: string | null;
  paidShopOrder?: StudioShopOrder | null;
};

export function BusinessAnalysePage({
  initialTier = "quick",
  formError = null,
  paidShopOrder = null,
}: Props) {
  const c = BUSINESS_COPY.analyse;

  return (
    <>
      <AnalysisPageHero {...c.hero} />
      <AnalysisPageShopBar />

      <BusinessSection>
        <AnalysisTierExamplesSection initialTier={initialTier === "quick" ? "business" : initialTier} />
      </BusinessSection>

      <BusinessSection className="bg-gray-50">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <BusinessEyebrow>{c.aiAdvantage.eyebrow}</BusinessEyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
              {c.aiAdvantage.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">{c.aiAdvantage.text}</p>
            <div className="mt-8">
              <a
                href="#analyse-buchen"
                className="inline-flex items-center justify-center rounded-full bg-[#00C853] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00C853]/20 transition hover:bg-[#00b34a]"
              >
                {c.hero.ctaPrimary}
              </a>
            </div>
          </div>
          <div className={`relative overflow-hidden ${BUSINESS_VISUAL.photoAspect} rounded-3xl shadow-xl ring-1 ring-gray-200/80`}>
            <BusinessPhoto
              src={BUSINESS_IMAGERY.analysis.ai.src}
              alt={BUSINESS_IMAGERY.analysis.ai.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 text-sm font-medium text-white/90">
              KI-Vorarbeit — persönlich geprüft und freigegeben
            </p>
          </div>
        </div>
      </BusinessSection>

      <BusinessSection>
        <BusinessSectionIntro
          eyebrow={<BusinessEyebrow>{c.whatWeAnalyze.eyebrow}</BusinessEyebrow>}
          title={c.whatWeAnalyze.title}
          intro={c.whatWeAnalyze.intro}
          className={`max-w-2xl ${BUSINESS_VISUAL.sectionIntroMb}`}
        />
        <div className={`${BUSINESS_VISUAL.cardGrid} sm:grid-cols-2 lg:grid-cols-4`}>
          {c.whatWeAnalyze.areas.map((area, i) => (
            <AnalysisStaticBenefitCard
              key={area.title}
              title={area.title}
              text={area.text}
              imageSrc={ANALYSIS_AREA_IMAGES[i]?.src ?? ANALYSIS_AREA_IMAGES[0].src}
              imageAlt={ANALYSIS_AREA_IMAGES[i]?.alt ?? ""}
            />
          ))}
        </div>
      </BusinessSection>

      <BusinessSection className="bg-gray-50">
        <BusinessSectionIntro
          eyebrow={<BusinessEyebrow>{c.benefits.eyebrow}</BusinessEyebrow>}
          title={c.benefits.title}
          className={`max-w-2xl ${BUSINESS_VISUAL.sectionIntroMb}`}
        />
        <div className={`${BUSINESS_VISUAL.cardGrid} md:grid-cols-3`}>
          {c.benefits.items.map((item, i) => (
            <AnalysisStaticBenefitCard
              key={item.title}
              title={item.title}
              text={item.text}
              imageSrc={ANALYSIS_BENEFIT_IMAGES[i]?.src ?? ANALYSIS_BENEFIT_IMAGES[0].src}
              imageAlt={ANALYSIS_BENEFIT_IMAGES[i]?.alt ?? ""}
            />
          ))}
        </div>
      </BusinessSection>

      <BusinessCtaBand
        title={c.midCta.title}
        text={c.midCta.text}
        cta={c.midCta.cta}
        href="#analyse-buchen"
      />

      <AnalysisTierCardsSection
        selectedTier={initialTier}
        tiersTitle={c.tiersTitle}
        tiersIntro={c.tiersIntro}
        includesPreviousQuick={c.includesPreviousQuick}
        includesPreviousBusiness={c.includesPreviousBusiness}
      />

      {paidShopOrder ? (
        <AnalysisFormSection
          initialTier={initialTier}
          formTitle="Analyse-Formular"
          formIntro="Ihre Zahlung ist eingegangen. Bitte vervollständigen Sie die Angaben für Ihre Analyse."
          error={formError}
          shopOrderReference={paidShopOrder.referenceId}
        />
      ) : (
        <AnalysisShopBookingSection highlightTier={initialTier} />
      )}
      <BusinessSection className="bg-gray-50">
        <div className="grid items-start gap-12 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-2">
            <div>
              <BusinessEyebrow>Ablauf</BusinessEyebrow>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
                {c.workflowTitle}
              </h2>
              <div className={`relative mt-8 overflow-hidden ${BUSINESS_VISUAL.photoAspect} rounded-2xl shadow-lg ring-1 ring-gray-200/80`}>
                <BusinessPhoto
                  src={BUSINESS_IMAGERY.analysis.workflow.src}
                  alt={BUSINESS_IMAGERY.analysis.workflow.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <AnalysisWorkflowGrid steps={ANALYSIS_WORKFLOW_STEPS} />
          </div>
        </div>
      </BusinessSection>

      <BusinessSection>
        <AnalysisTransparencySection title={c.transparencyTitle} text={c.transparencyText} />
      </BusinessSection>

      <BusinessSection className="bg-gray-50">
        <AnalysisReportDocumentPreview
          title={c.sampleReport.title}
          intro={c.sampleReport.intro}
          disclaimer={c.sampleReport.disclaimer}
          initialTier={initialTier === "quick" ? "business" : initialTier}
        />
      </BusinessSection>

      <BusinessSection>
        <div className="mx-auto max-w-2xl text-center">
          <BusinessEyebrow>{c.projectPath.eyebrow}</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
            {c.projectPath.title}
          </h2>
          <p className="mt-4 text-gray-600">{c.projectPath.intro}</p>
        </div>
        <div className="mt-12">
          <AnalysisWorkflowGrid steps={DEMO_ANALYSIS_PROJECT_PATH} />
        </div>
      </BusinessSection>

      <PremiumCta
        title="Lieber persönliches Erstgespräch?"
        text="Wenn Sie unsicher sind, welche Stufe passt — wir beraten Sie gerne unverbindlich."
        cta="Kontakt aufnehmen"
        href="/business/kontakt"
        mockVariant="calendar"
      />
    </>
  );
}

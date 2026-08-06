import { BusinessEyebrow, BusinessSectionIntro, BusinessShowcaseCard } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessMockDisclaimer } from "@/components/business/visuals/BusinessMockDisclaimer";
import { ReferenceBrowserShowcase } from "@/components/business/visuals/ReferenceShowcase";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { BUSINESS_CORE_MODULE_REFERENCES } from "@/lib/constants/business-reference-showcase";

export function BusinessCoreEcosystemShowcase() {
  return (
    <div data-export="business-core-ecosystem">
      <BusinessScrollReveal>
        <BusinessSectionIntro
          eyebrow={<BusinessEyebrow>Das Ökosystem</BusinessEyebrow>}
          title="Ein komplettes Unternehmenssystem — nicht nur einzelne Screens"
          intro="Business Core verbindet Dashboard, CRM, Finanzen, Planung und mehr — als zusammenhängendes System auf bewährter Grundlage."
          className={BUSINESS_VISUAL.sectionIntroMb}
        />
      </BusinessScrollReveal>

      <div className={`${BUSINESS_VISUAL.sectionContentMt} ${BUSINESS_VISUAL.showcaseStack}`}>
        {BUSINESS_CORE_MODULE_REFERENCES.map((mod, i) => (
          <BusinessScrollReveal key={mod.label} delay={i * 60}>
            <BusinessShowcaseCard>
              <article
                className={`${BUSINESS_VISUAL.featureGrid} ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="space-y-5 lg:max-w-md lg:py-2">
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-gray-900 md:text-2xl">
                    {mod.label}
                  </h3>
                  <p className="leading-relaxed text-gray-600">{mod.description}</p>
                </div>
                <div className="max-lg:mt-8 lg:pt-2">
                  <ReferenceBrowserShowcase mock={mod.mock} label={mod.label} size="hero" />
                </div>
              </article>
            </BusinessShowcaseCard>
          </BusinessScrollReveal>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-2">
        {[
          "Dokumente",
          "Mitarbeiter",
          "Marketing",
          "Analytics",
          "KI-Assistent",
          "Community",
          "Verwaltung",
          "Profile",
          "Web-App",
          "Angebote",
        ].map((label) => (
          <span
            key={label}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600"
          >
            {label}
          </span>
        ))}
      </div>

      <BusinessMockDisclaimer variant="note" className="mt-10" />
    </div>
  );
}

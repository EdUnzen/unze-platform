import { BusinessEyebrow, BusinessSectionIntro, BusinessShowcaseCard } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { AppPhoneShowcaseTile } from "@/components/business/visuals/AppPhoneCollageShowcase";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { CONNECT_PLATFORM_SHOWCASE } from "@/lib/constants/business-connect-showcase";

/** Web-Apps Seite */
export function AppReferenceShowcase() {
  return (
    <div className={BUSINESS_VISUAL.featureStack} data-export="app-reference-showcase">
      <BusinessSectionIntro
        eyebrow={<BusinessEyebrow>Eigene Entwicklung</BusinessEyebrow>}
        title="Web-Apps aus eigener Entwicklung"
        intro="UNZE Connect ist unsere Referenz — produktive Software auf Smartphone und Desktop."
        className={BUSINESS_VISUAL.sectionIntroMb}
      />

      <div className={`${BUSINESS_VISUAL.sectionContentMt} ${BUSINESS_VISUAL.cardGrid} md:grid-cols-3`}>
        {CONNECT_PLATFORM_SHOWCASE.map((item, index) => (
          <BusinessScrollReveal key={item.id} delay={index * 60}>
            <BusinessShowcaseCard className="flex h-full flex-col !p-8 md:!p-9">
              <div className="mx-auto w-[220px] sm:w-[248px]">
                <AppPhoneShowcaseTile item={item} priority={index < 2} showLabels={false} stage="standard" />
              </div>
              <h3 className="mt-8 font-[family-name:var(--font-display)] text-lg font-semibold text-balance text-gray-900">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{item.subtitle}</p>
            </BusinessShowcaseCard>
          </BusinessScrollReveal>
        ))}
      </div>
    </div>
  );
}

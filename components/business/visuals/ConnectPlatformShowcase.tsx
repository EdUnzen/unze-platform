import { BusinessEyebrow, BusinessSectionIntro } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import {
  AppPhoneShowcaseTile,
  AppPhoneStageShowcase,
} from "@/components/business/visuals/AppPhoneCollageShowcase";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { CONNECT_PLATFORM_SHOWCASE } from "@/lib/constants/business-connect-showcase";

/** Web-App-Referenzen — UNZE Connect in Smartphone-Rahmen. */
export function ConnectPlatformShowcase() {
  return (
    <div className="space-y-12 md:space-y-14" data-export="connect-platform-showcase">
      <BusinessScrollReveal>
        <BusinessSectionIntro
          eyebrow={<BusinessEyebrow>UNZE Plattform</BusinessEyebrow>}
          title="Web-Apps aus eigener Entwicklung — echte Referenzen"
          intro="Discover, Dashboard und Communities aus UNZE Connect — so sieht professionelle App-Oberfläche bei uns aus. Ihre Web-App wird individuell geplant."
          className={BUSINESS_VISUAL.sectionIntroMb}
        />
      </BusinessScrollReveal>

      <BusinessScrollReveal>
        <AppPhoneStageShowcase items={CONNECT_PLATFORM_SHOWCASE} showLabels />
      </BusinessScrollReveal>

      <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
        {CONNECT_PLATFORM_SHOWCASE.map((item, i) => (
          <BusinessScrollReveal key={item.id} delay={i * 80}>
            <li className="space-y-4">
              <div className="mx-auto w-full max-w-[220px]">
                <AppPhoneShowcaseTile item={item} priority={i === 0} showLabels={false} />
              </div>
              <p className="text-center text-sm font-medium text-balance text-gray-900">{item.title}</p>
              <p className="text-center text-xs leading-relaxed text-pretty text-gray-500">{item.subtitle}</p>
            </li>
          </BusinessScrollReveal>
        ))}
      </ul>
    </div>
  );
}

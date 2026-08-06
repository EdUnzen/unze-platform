import {
  BusinessPageHero,
  BusinessSection,
} from "@/components/business/BusinessUi";
import { PremiumCta } from "@/components/business/visuals/PremiumCta";
import { IndustryModuleShowcase } from "@/components/business/visuals/IndustryModuleShowcase";
import { IndustryTemplateShowcase } from "@/components/business/visuals/IndustryTemplateShowcase";
import { BusinessDevelopmentPortfolio } from "@/components/business/visuals/BusinessDevelopmentPortfolio";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";

export function BusinessBranchenPage() {
  const c = BUSINESS_COPY.branchen;

  return (
    <>
      <BusinessPageHero {...c.hero} />
      <BusinessSection className="bg-gradient-to-b from-gray-50 to-white">
        <IndustryTemplateShowcase />
      </BusinessSection>
      <BusinessSection>
        <IndustryModuleShowcase />
      </BusinessSection>
      <BusinessDevelopmentPortfolio className="bg-gray-50" />
      <PremiumCta
        title="Branchenlösung für Ihr Unternehmen?"
        text="Wir analysieren zuerst — und zeigen Ihnen live, wie Ihr System aussehen kann."
        cta="Beratung anfragen"
        mockVariant="customers"
      />
    </>
  );
}

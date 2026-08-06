import Link from "next/link";
import {
  BusinessCtaButton,
  BusinessPageHero,
  BusinessSection,
} from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessPhilosophySection } from "@/components/business/visuals/BusinessPhilosophySection";
import { BusinessPricingCatalogSection } from "@/components/business/visuals/BusinessPricingCatalogSection";
import { BusinessPricingOverviewSection } from "@/components/business/visuals/BusinessPricingOverviewSection";
import { BusinessWorkflowSection } from "@/components/business/visuals/BusinessWorkflowSection";
import { PremiumCta } from "@/components/business/visuals/PremiumCta";
import { PriceGlowCard } from "@/components/business/visuals/WowMoments";
import { BUSINESS_PRICING } from "@/lib/constants/business-pricing";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { BUSINESS_PRICING_POLICY } from "@/lib/constants/business-pricing-policy";

export function BusinessPreisePage() {
  const c = BUSINESS_COPY.preise;
  const corePricing = BUSINESS_PRICING.find((cat) => cat.id === "business-core");

  return (
    <>
      <BusinessPageHero {...c.hero} />
      <BusinessPricingOverviewSection />
      <BusinessPricingCatalogSection excludeIds={["business-core"]} />
      {corePricing ? (
        <BusinessSection className="bg-gradient-to-b from-white to-gray-50">
          <BusinessScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
                {corePricing.title}
              </h2>
              <p className="mt-4 text-gray-600">{corePricing.description}</p>
            </div>
          </BusinessScrollReveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {corePricing.tiers.map((tier) => (
              <PriceGlowCard key={tier.name} highlighted={tier.highlighted}>
                {tier.highlighted ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00C853]">
                    Beliebt
                  </span>
                ) : null}
                <p className="mt-1 font-semibold text-gray-900">{tier.name}</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
                  {tier.price}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{tier.note}</p>
              </PriceGlowCard>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/business/business-core"
              className="text-sm font-semibold text-[#00C853] hover:underline"
            >
              Business Core im Detail →
            </Link>
          </div>
        </BusinessSection>
      ) : null}
      <BusinessSection className="border-t border-gray-100 bg-white py-12">
        <p className="mx-auto max-w-3xl text-center text-base text-gray-600">
          {BUSINESS_PRICING_POLICY.philosophy}
        </p>
        <div className="mt-8 text-center">
          <BusinessCtaButton href="/business/kontakt" variant="primary">
            {c.cta}
          </BusinessCtaButton>
        </div>
      </BusinessSection>
      <BusinessWorkflowSection className="bg-gray-50" showProcessingTime showWarranty={false} />
      <BusinessPhilosophySection className="bg-white py-14 md:py-16" />
      <PremiumCta
        title="Individuelles Angebot?"
        text="Orientierungspreise sind der Start — Ihr finales Angebot folgt nach dem persönlichen Erstgespräch."
        cta={c.cta}
        mockVariant="invoices"
      />
    </>
  );
}

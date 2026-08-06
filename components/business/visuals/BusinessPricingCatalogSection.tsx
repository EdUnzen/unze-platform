import Link from "next/link";

import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";

import { PricingTierScopePublic } from "@/components/business/visuals/PricingTierScopePublic";

import { PriceIncludedList } from "@/components/business/visuals/PriceIncludedList";

import { PriceGlowCard } from "@/components/business/visuals/WowMoments";

import { BUSINESS_PRICING, PRICING_DISCLAIMER } from "@/lib/constants/business-pricing";

import { BUSINESS_PRICING_POLICY } from "@/lib/constants/business-pricing-policy";



type BusinessPricingCatalogSectionProps = {

  excludeIds?: string[];

  className?: string;

};



export function BusinessPricingCatalogSection({

  excludeIds = [],

  className = "bg-gray-50",

}: BusinessPricingCatalogSectionProps) {

  const categories = BUSINESS_PRICING.filter((cat) => !excludeIds.includes(cat.id));



  return (

    <section className={className}>

      <div className="container mx-auto max-w-6xl px-4 py-14 md:py-16">

        <BusinessScrollReveal>

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00C853]">Preistabelle</p>

            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">

              Orientierungspreise

            </h2>

            <p className="mt-3 text-sm text-gray-600">{PRICING_DISCLAIMER}</p>

            <p className="mt-2 text-xs text-gray-500">

              Werkstatt-Setup = Referenz aus unserem Designsystem · Premium = individuelles Design / Sonderstruktur

            </p>

          </div>

        </BusinessScrollReveal>



        <div className="mt-10 space-y-10">

          {categories.map((cat, ci) => (

            <BusinessScrollReveal key={cat.id} delay={ci * 40}>

              <div

                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"

                data-export={`pricing-${cat.id}`}

              >

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>

                    <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 md:text-2xl">

                      {cat.title}

                    </h3>

                    <p className="mt-2 text-sm text-gray-600">{cat.description}</p>

                  </div>

                  {cat.href ? (

                    <Link href={cat.href} className="text-sm font-semibold text-[#00C853] hover:underline">

                      Details →

                    </Link>

                  ) : null}

                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">

                  {cat.tiers.map((tier) => (

                    <PriceGlowCard key={tier.name} highlighted={tier.highlighted}>

                      {tier.highlighted ? (

                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00C853]">

                          Beliebt

                        </span>

                      ) : null}

                      <p className="mt-1 font-semibold text-gray-900">{tier.name}</p>

                      <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">

                        {tier.price}

                        {tier.period ? (

                          <span className="text-sm font-normal text-gray-500">{tier.period}</span>

                        ) : null}

                      </p>

                      {tier.studioOnly ? (

                        <p className="mt-1 text-[10px] text-gray-500">Template only: {tier.studioOnly}</p>

                      ) : null}

                      <p className="mt-3 text-xs leading-relaxed text-gray-600">{tier.note}</p>

                      {tier.studioScope ? (

                        <PricingTierScopePublic scope={tier.studioScope} compact />

                      ) : null}

                    </PriceGlowCard>

                  ))}

                </div>

                {cat.showIncluded ? <PriceIncludedList /> : null}

                {cat.id === "service" ? (

                  <p className="mt-4 text-sm text-gray-600">{BUSINESS_PRICING_POLICY.serviceNote}</p>

                ) : null}

              </div>

            </BusinessScrollReveal>

          ))}

        </div>

      </div>

    </section>

  );

}



"use client";

import { Check } from "lucide-react";
import {
  BusinessCtaButton,
  BusinessEyebrow,
  BusinessSection,
} from "@/components/business/BusinessUi";
import { PremiumCta } from "@/components/business/visuals/PremiumCta";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { IndustryModuleShowcase } from "@/components/business/visuals/IndustryModuleShowcase";
import { BusinessCoreEcosystemShowcase } from "@/components/business/visuals/BusinessCoreEcosystemShowcase";
import { BusinessCoreHero } from "@/components/business/visuals/BusinessCoreHero";
import { BusinessMockDisclaimer } from "@/components/business/visuals/BusinessMockDisclaimer";
import { BusinessWorkflowSection } from "@/components/business/visuals/BusinessWorkflowSection";
import { ProcessTimeline } from "@/components/business/visuals/ProcessTimeline";
import { IndustryPhotoStage } from "@/components/business/visuals/IndustryPhotoStage";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import { INDUSTRY_META } from "@/lib/constants/business-industry-scenarios";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { BUSINESS_PRICING } from "@/lib/constants/business-pricing";

const CORE_TEMPLATE_SHOWCASE: {
  industry: IndustryId;
  variant: "dashboard" | "customers";
  moduleLabel: string;
}[] = [
  { industry: "umzug", variant: "dashboard", moduleLabel: "Dashboard — Umzug" },
  { industry: "reinigung", variant: "customers", moduleLabel: "Kunden — Reinigung & Hausmeister" },
  { industry: "arztpraxis", variant: "dashboard", moduleLabel: "Dashboard — Arztpraxis" },
];

export function BusinessCorePage() {
  const c = BUSINESS_COPY.businessCore;
  const corePricing = BUSINESS_PRICING.find((p) => p.id === "business-core");

  return (
    <>
      <BusinessCoreHero
        eyebrow={c.hero.eyebrow}
        headline={c.hero.headline}
        subline={c.hero.subline}
        intro={c.intro}
        emotionalHook={c.emotionalHook}
        benefits={c.benefits.items}
      />

      <BusinessSection className="bg-gradient-to-b from-gray-50 to-white">
        <IndustryModuleShowcase />
      </BusinessSection>

      <BusinessSection>
        <BusinessCoreEcosystemShowcase />
      </BusinessSection>

      <BusinessSection>
        <BusinessScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <BusinessEyebrow>Branchen-Templates</BusinessEyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
              Drei Referenz-Branchen — individuell anpassbar
            </h2>
            <p className="mt-4 text-gray-600">
              Umzugsunternehmen, Reinigung & Hausmeister sowie Arztpraxis — professionelle Branchen-Referenzen,
              die wir individuell an Ihr Unternehmen anpassen.
            </p>
          </div>
        </BusinessScrollReveal>
        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-3">
          {CORE_TEMPLATE_SHOWCASE.map((item, i) => (
            <BusinessScrollReveal key={item.industry} delay={i * 80} className="flex h-full flex-col">
              <IndustryPhotoStage industry={item.industry} className="h-full" />
              <p className="mt-3 text-center text-sm font-medium text-gray-600">
                {INDUSTRY_META[item.industry].label}
              </p>
            </BusinessScrollReveal>
          ))}
        </div>
        <BusinessMockDisclaimer variant="note" className="mt-10" />
      </BusinessSection>

      <BusinessSection className="bg-gray-50">
        <BusinessScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <BusinessEyebrow>{c.modules.eyebrow}</BusinessEyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
              {c.modules.title}
            </h2>
            <p className="mt-4 text-gray-600">{c.modules.subtitle}</p>
          </div>
        </BusinessScrollReveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {c.modules.items.map((item, i) => (
            <BusinessScrollReveal key={item.title} delay={i * 60}>
              <article className={`flex h-full flex-col ${BUSINESS_VISUAL.cardRadius} border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#00C853]/25 hover:shadow-xl md:p-8`}>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
                {"problem" in item && item.problem ? (
                  <p className="mt-3 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">Löst:</span> {item.problem}
                  </p>
                ) : null}
                {"benefit" in item && item.benefit ? (
                  <p className="mt-2 text-xs font-medium text-emerald-700">{item.benefit}</p>
                ) : null}
                {"extensions" in item && item.extensions?.length ? (
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-gray-50 pt-4">
                    {item.extensions.map((ext) => (
                      <span
                        key={ext}
                        className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] text-gray-500"
                      >
                        + {ext}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            </BusinessScrollReveal>
          ))}
        </div>
      </BusinessSection>

      <BusinessSection>
        <BusinessScrollReveal>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <BusinessEyebrow>Ablauf</BusinessEyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
              Vom ersten Gespräch bis zum Live-System
            </h2>
            <p className="mt-4 text-gray-600">
              Analyse zuerst — dann die passenden Module. Kein Baukasten von der Stange.
            </p>
          </div>
        </BusinessScrollReveal>
        <ProcessTimeline steps={c.processSteps} />
      </BusinessSection>

      <BusinessWorkflowSection className="bg-white" showProcessingTime showWarranty={false} />

      <BusinessSection className="bg-gray-50">
        <div className="mx-auto max-w-2xl text-center">
          <BusinessEyebrow>{c.packages.eyebrow}</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
            {c.packages.title}
          </h2>
          <p className="mt-4 text-gray-600">{c.packages.subtitle}</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {c.packages.tiers.map((tier, i) => {
            const price = corePricing?.tiers[i];
            return (
              <BusinessScrollReveal key={tier.name} delay={i * 100}>
                <article
                  className={`flex h-full flex-col ${BUSINESS_VISUAL.cardRadius} border p-8 transition hover:shadow-lg ${
                    "highlighted" in tier && tier.highlighted
                      ? "relative border-[#00C853] bg-white shadow-lg ring-2 ring-[#00C853]/15"
                      : "border-gray-100 bg-white shadow-sm"
                  }`}
                >
                  {"highlighted" in tier && tier.highlighted ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00C853] px-3 py-0.5 text-xs font-semibold text-white">
                      Empfohlen
                    </span>
                  ) : null}
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">{tier.name}</h3>
                  {price ? (
                    <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                      {price.price}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-gray-600">{tier.description}</p>
                  <ul className="mt-6 flex-1 space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-gray-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                </article>
              </BusinessScrollReveal>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <BusinessCtaButton href="/business/kontakt" variant="primary">
            {c.packages.cta}
          </BusinessCtaButton>
        </div>
      </BusinessSection>

      <PremiumCta
        title="Business Core für Ihr Unternehmen?"
        text="Wir analysieren zuerst Ihre Prozesse — und zeigen Ihnen live, wie Ihr System aussehen kann."
        cta="Kostenlose Erstberatung"
        mockVariant="dashboard"
      />
    </>
  );
}

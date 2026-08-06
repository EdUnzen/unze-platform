import type { ReactNode } from "react";
import {
  BusinessEyebrow,
  BusinessPageHero,
  BusinessSection,
} from "@/components/business/BusinessUi";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { AppReferenceShowcase } from "@/components/business/visuals/AppReferenceShowcase";
import { BusinessKiHeroShowcase, BusinessKiShowcaseSection } from "@/components/business/visuals/BusinessKiShowcase";
import { PremiumCta } from "@/components/business/visuals/PremiumCta";
import { IndustryMockStage } from "@/components/business/visuals/IndustryMockStage";
import { WebsiteReferenceShowcase } from "@/components/business/visuals/WebsiteReferenceShowcase";
import { type MockVariant } from "@/components/business/visuals/MockScreen";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { tbcReference } from "@/lib/constants/business-reference-showcase";
import { ReferenceBrowserShowcase } from "@/components/business/visuals/ReferenceShowcase";
import { WebsitePreview } from "@/components/business/visuals/previews/WebsitePreview";

function BusinessFeaturePage({
  hero,
  features,
  extra,
  ctaLabel = "Projekt anfragen",
  mockVariant,
  mockDevice,
  salesLine,
  salesVisual,
  wow,
}: {
  hero: { eyebrow: string; headline: string; subline: string };
  features: readonly { title: string; text: string }[];
  extra?: { title: string; items: readonly string[] };
  ctaLabel?: string;
  mockVariant: MockVariant;
  mockDevice?: "laptop" | "phone";
  salesLine: string;
  salesVisual?: ReactNode;
  wow?: ReactNode;
}) {
  return (
    <>
      <BusinessPageHero {...hero} />
      <BusinessSection>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <p className="text-lg leading-relaxed text-pretty text-gray-600 lg:max-w-lg lg:py-4">{salesLine}</p>
          <div className="lg:pt-2">
            {salesVisual ?? (
              <IndustryMockStage
                industry="arztpraxis"
                variant={mockVariant}
                label="Referenz — Arztpraxis"
                uniform
              />
            )}
          </div>
        </div>
      </BusinessSection>
      <BusinessSection className="bg-gray-50">
        <div className={`${BUSINESS_VISUAL.cardGrid} md:grid-cols-2`}>
          {features.map((f) => (
            <article
              key={f.title}
              className={`h-full ${BUSINESS_VISUAL.cardRadius} border border-gray-100 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-[#00C853]/15`}
            >
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-balance text-gray-900">
                {f.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{f.text}</p>
            </article>
          ))}
        </div>
      </BusinessSection>
      {extra ? (
        <BusinessSection>
          <BusinessEyebrow>{extra.title}</BusinessEyebrow>
          <ul className={`${BUSINESS_VISUAL.sectionContentMt} grid gap-3 sm:grid-cols-2 md:grid-cols-3`}>
            {extra.items.map((item) => (
              <li
                key={item}
                className={`${BUSINESS_VISUAL.cardRadius} border border-gray-100 bg-white px-5 py-4 text-sm font-medium text-gray-800 shadow-sm transition hover:border-[#00C853]/25 hover:shadow-md`}
              >
                {item}
              </li>
            ))}
          </ul>
        </BusinessSection>
      ) : null}
      {wow}
      <PremiumCta
        title="Bereit für den nächsten Schritt?"
        text="Wir beraten Sie persönlich und erstellen ein individuelles Konzept für Ihr Vorhaben."
        cta={ctaLabel}
        mockVariant={mockVariant}
        mockDevice={mockDevice}
      />
    </>
  );
}

function WebsiteScrollWow() {
  return (
    <section className="border-b border-gray-100 bg-white py-20 md:py-32">
      <div className="container mx-auto max-w-6xl px-4">
        <WebsiteReferenceShowcase />
      </div>
    </section>
  );
}

function WebAppScrollWow() {
  return (
    <section className="border-b border-gray-100 bg-gray-50 py-20 md:py-32">
      <div className="container mx-auto max-w-6xl px-4">
        <AppReferenceShowcase />
      </div>
    </section>
  );
}

export function BusinessWebseitenPage() {
  const c = BUSINESS_COPY.webseiten;
  return (
    <BusinessFeaturePage
      hero={c.hero}
      features={c.features}
      extra={c.types}
      ctaLabel="Webseite anfragen"
      mockVariant="website"
      salesLine="Ihr Webauftritt ist oft der erste Kontakt mit Ihren Kunden. Wir gestalten Seiten, die Vertrauen schaffen — auf Basis bewährter Branchenvorlagen aus dem TBC Studio."
      salesVisual={
        <ReferenceBrowserShowcase
          asset={tbcReference("umzug", "home")}
          label="TransWerk Umzug — Startseite"
          caption="Template Business Core — echte Referenz"
          size="hero"
          priority
          fallback={<WebsitePreview industry="umzug" page="home" size="gallery" />}
        />
      }
      wow={<WebsiteScrollWow />}
    />
  );
}

export function BusinessWebAppsPage() {
  const c = BUSINESS_COPY.webApps;
  return (
    <BusinessFeaturePage
      hero={c.hero}
      features={c.features}
      extra={c.useCases}
      ctaLabel="Web-App anfragen"
      mockVariant="webapp"
      mockDevice="phone"
      salesLine="Individuelle Apps ersetzen Excel, E-Mail-Chaos und Insellösungen — Referenzqualität wie UNZE Connect und unsere Plattform."
      wow={<WebAppScrollWow />}
    />
  );
}

export function BusinessKiPage() {
  const c = BUSINESS_COPY.ki;
  return (
    <BusinessFeaturePage
      hero={c.hero}
      features={c.features}
      extra={c.areas}
      ctaLabel="KI-Projekt anfragen"
      mockVariant="ai"
      mockDevice="phone"
      salesLine="KI und Automatisierung entlasten Ihr Team dort, wo es wirklich zählt — bei Dokumenten, Kommunikation und wiederkehrenden Entscheidungen."
      salesVisual={<BusinessKiHeroShowcase />}
      wow={<BusinessKiShowcaseSection />}
    />
  );
}

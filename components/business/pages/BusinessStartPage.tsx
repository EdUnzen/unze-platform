import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import {
  BusinessCtaButton,
  BusinessEyebrow,
  BusinessSection,
  BusinessSectionIntro,
  BusinessTextLink,
} from "@/components/business/BusinessUi";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { PremiumCta } from "@/components/business/visuals/PremiumCta";
import { BusinessEntryPathsSection } from "@/components/business/visuals/BusinessEntryPathsSection";
import { BusinessAnalysisPromoSection } from "@/components/business/visuals/BusinessAnalysisPromoSection";
import { BusinessPhilosophySection } from "@/components/business/visuals/BusinessPhilosophySection";
import { BusinessDevelopmentPortfolio } from "@/components/business/visuals/BusinessDevelopmentPortfolio";
import { BusinessWorkflowSection } from "@/components/business/visuals/BusinessWorkflowSection";
import { BusinessStatsStrip, BusinessVisualShowcase } from "@/components/business/visuals/ShowcaseBlocks";
import { BusinessBenefitCard } from "@/components/business/visuals/BusinessBenefitCard";
import { BusinessServiceCard } from "@/components/business/visuals/BusinessServiceCard";
import { BusinessIndustryExamplesSection } from "@/components/business/visuals/BusinessIndustryExamplesSection";
import { BusinessProductShowcaseCard } from "@/components/business/visuals/BusinessProductShowcaseCard";
import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { UNZE_OWN_PRODUCTS } from "@/lib/constants/business-own-products";
import { DEMO_COMPANY_BY_INDUSTRY } from "@/lib/constants/demo-companies";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";

const PROBLEM_IMAGES = [
  BUSINESS_IMAGERY.problems.digitalize,
  BUSINESS_IMAGERY.problems.professional,
  BUSINESS_IMAGERY.problems.scale,
] as const;

export function BusinessStartPage() {
  const c = BUSINESS_COPY.start;

  return (
    <>
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <BusinessPhoto
          src={BUSINESS_IMAGERY.hero.poster}
          alt=""
          fill
          className="absolute inset-0 opacity-20"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-950/88 to-gray-950/75" />
        <div className="relative container mx-auto max-w-7xl px-4 py-20 md:py-28 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <BusinessEyebrow>{c.hero.eyebrow}</BusinessEyebrow>
              <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.06] tracking-tight md:text-5xl lg:text-[3.5rem]">
                {c.hero.headline}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl">
                {c.hero.subline}
              </p>
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <BusinessCtaButton
                    href={c.hero.ctaAnalyseHref}
                    variant="primary"
                    className="w-full sm:w-auto sm:min-w-[200px]"
                  >
                    {c.hero.ctaAnalyse}
                  </BusinessCtaButton>
                  <BusinessCtaButton
                    href={c.hero.ctaContactHref}
                    variant="secondary"
                    className="w-full sm:w-auto sm:min-w-[200px]"
                  >
                    {c.hero.ctaContact}
                  </BusinessCtaButton>
                </div>
                <Link
                  href={c.hero.ctaTertiaryHref}
                  className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-white/70 transition hover:text-white hover:underline hover:underline-offset-4"
                >
                  {c.hero.ctaTertiary}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <ul className="mt-10 grid gap-3 sm:grid-cols-3">
                {c.hero.trust.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/75">
                    <Check className="h-4 w-4 text-[#00C853]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <BusinessScrollReveal delay={150}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/10">
                <BusinessPhoto
                  src={BUSINESS_IMAGERY.hero.feature}
                  alt={BUSINESS_IMAGERY.hero.featureAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  priority
                  imageClassName="transition duration-700 hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-4 right-4 text-xs font-medium text-white/85">
                  Individuelle Software — von der Analyse bis zum laufenden Betrieb
                </p>
              </div>
            </BusinessScrollReveal>
          </div>
        </div>
      </section>

      <BusinessSection className="py-12 md:py-16">
        <BusinessStatsStrip
          stats={[
            { value: "100%", label: "Individuelle Lösungen" },
            { value: "24/7", label: "Managed Service möglich" },
            { value: "DACH", label: "Persönliche Betreuung" },
            { value: "1 Team", label: "Von Konzept bis Betrieb" },
          ]}
        />
      </BusinessSection>

      <BusinessAnalysisPromoSection />

      <BusinessEntryPathsSection />

      <BusinessSection className="bg-gray-50">
        <BusinessScrollReveal>
          <BusinessSectionIntro
            eyebrow={<BusinessEyebrow>{c.problems.eyebrow}</BusinessEyebrow>}
            title={c.problems.title}
            className={`max-w-2xl ${BUSINESS_VISUAL.sectionIntroMb}`}
          />
        </BusinessScrollReveal>
        <div className={`${BUSINESS_VISUAL.cardGrid} md:grid-cols-3`}>
          {c.problems.items.map((item, i) => (
            <div key={item.title}>
              <BusinessBenefitCard
                title={item.title}
                text={item.text}
                imageSrc={PROBLEM_IMAGES[i]?.src ?? PROBLEM_IMAGES[0].src}
                imageAlt={PROBLEM_IMAGES[i]?.alt ?? ""}
                delay={i * 100}
              />
            </div>
          ))}
        </div>
      </BusinessSection>

      <BusinessSection>
        <div className={`grid items-start gap-12 lg:grid-cols-2 lg:gap-20`}>
          <BusinessScrollReveal>
            <BusinessEyebrow>{c.coreTeaser.eyebrow}</BusinessEyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
              {c.coreTeaser.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">{c.coreTeaser.text}</p>
            <div className="mt-8">
              <BusinessCtaButton href={c.coreTeaser.href} variant="primary">
                {c.coreTeaser.cta}
              </BusinessCtaButton>
            </div>
          </BusinessScrollReveal>
          <BusinessVisualShowcase
            variant="dashboard"
            industry="umzug"
            presentation="hero"
            caption={`Dashboard — Umzugsunternehmen ${DEMO_COMPANY_BY_INDUSTRY.umzug}`}
          />
        </div>
      </BusinessSection>

      <BusinessSection className="bg-gray-50">
        <BusinessScrollReveal>
          <BusinessSectionIntro
            eyebrow={<BusinessEyebrow>{c.servicesPreview.eyebrow}</BusinessEyebrow>}
            title={c.servicesPreview.title}
            intro={c.servicesPreview.subtitle}
            className={`max-w-2xl ${BUSINESS_VISUAL.sectionIntroMb}`}
          />
        </BusinessScrollReveal>
        <div className={`${BUSINESS_VISUAL.cardGrid} sm:grid-cols-2 lg:grid-cols-3`}>
          {c.servicesPreview.items.map((item, i) => (
            <div key={item.href}>
              <BusinessServiceCard
                title={item.title}
                text={item.text}
                href={item.href}
                delay={i * 80}
              />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <BusinessTextLink href={c.servicesPreview.link.href}>
            {c.servicesPreview.link.label}
          </BusinessTextLink>
        </div>
      </BusinessSection>

      <BusinessSection>
        <BusinessScrollReveal>
          <BusinessSectionIntro
            eyebrow={<BusinessEyebrow>{c.ownProducts.eyebrow}</BusinessEyebrow>}
            title={c.ownProducts.title}
            intro={c.ownProducts.subtitle}
            className={`max-w-2xl ${BUSINESS_VISUAL.sectionIntroMb}`}
          />
        </BusinessScrollReveal>
        <div className={`${BUSINESS_VISUAL.cardGrid} items-start md:grid-cols-2`}>
          {UNZE_OWN_PRODUCTS.map((product, i) => (
            <div key={product.id}>
              <BusinessProductShowcaseCard
                product={product}
                delay={i * 80}
              />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <BusinessTextLink href={c.ownProducts.href}>{c.ownProducts.cta}</BusinessTextLink>
        </div>
      </BusinessSection>

      <BusinessDevelopmentPortfolio className="bg-white" />

      <BusinessIndustryExamplesSection />

      <BusinessSection>
        <div className="relative overflow-hidden rounded-3xl bg-gray-950 text-white">
          <BusinessPhoto
            src={BUSINESS_IMAGERY.why.src}
            alt=""
            fill
            className="absolute inset-0 opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-gray-950/85 to-gray-950/75" />
          <div className="relative px-8 py-12 md:px-14 md:py-16">
            <BusinessEyebrow>{c.why.eyebrow}</BusinessEyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
              {c.why.title}
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {c.why.points.map((p, i) => (
                <div key={p.title}>
                  <BusinessScrollReveal delay={i * 100}>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                      <h3 className="font-semibold text-white">{p.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">{p.text}</p>
                    </div>
                  </BusinessScrollReveal>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BusinessSection>

      <BusinessWorkflowSection className="bg-gray-50" />

      <BusinessPhilosophySection />

      <PremiumCta
        title={c.ctaBand.title}
        text={c.ctaBand.text}
        cta={c.ctaBand.cta}
        href={c.ctaBand.href}
        ctaSecondary={c.ctaBand.ctaSecondary}
        hrefSecondary={c.ctaBand.hrefSecondary}
        mockVariant="dashboard"
      />
    </>
  );
}

import { BusinessEyebrow, BusinessSection, BusinessSectionIntro, BusinessTextLink } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { BusinessMockDisclaimer } from "@/components/business/visuals/BusinessMockDisclaimer";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { MockScreen } from "@/components/business/visuals/MockScreen";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";
import { INDUSTRY_TEMPLATES } from "@/lib/constants/business-industry-templates";
import {
  INDUSTRY_SHOWCASES,
  type IndustryId,
} from "@/lib/constants/business-industry-scenarios";
import { DEMO_COMPANY_BY_INDUSTRY } from "@/lib/constants/demo-companies";
import type { IndustryTemplate } from "@/lib/constants/business-industry-templates";
import { cn } from "@/lib/utils/cn";

const SHOWCASE_INDUSTRIES = ["umzug", "reinigung", "handwerk"] as const;
const FEATURED_INDUSTRY_ID = "umzug";

type IndustryStory = {
  problem: string;
  solution: string;
  benefit: string;
  variant: (typeof INDUSTRY_SHOWCASES)[IndustryId][number]["variant"];
};

function getIndustryStory(industryMock: IndustryId): IndustryStory {
  const showcase =
    INDUSTRY_SHOWCASES[industryMock].find((entry) => entry.id === "dashboard") ??
    INDUSTRY_SHOWCASES[industryMock][0];

  return {
    problem: showcase.problem,
    solution: showcase.solution,
    benefit: showcase.benefit,
    variant: showcase.variant,
  };
}

function IndustryStoryLines({ story, compact = false }: { story: IndustryStory; compact?: boolean }) {
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500";
  const textClass = compact
    ? "mt-1 text-sm leading-relaxed text-gray-700"
    : "mt-1.5 text-sm leading-relaxed text-gray-700 md:text-base";

  return (
    <dl className={compact ? "space-y-3" : "space-y-4 md:space-y-5"}>
      <div>
        <dt className={labelClass}>Typisches Problem</dt>
        <dd className={textClass}>{story.problem}</dd>
      </div>
      <div>
        <dt className={labelClass}>Digitale Lösung</dt>
        <dd className={textClass}>{story.solution}</dd>
      </div>
      <div>
        <dt className={labelClass}>Praktischer Nutzen</dt>
        <dd className={textClass}>{story.benefit}</dd>
      </div>
    </dl>
  );
}

function industryMockup(
  template: IndustryTemplate,
  story: IndustryStory,
  presentation: "hero" | "standard",
) {
  const industryMock = (template.industryMock ?? "umzug") as IndustryId;
  const screen = template.screens[0];
  const company = DEMO_COMPANY_BY_INDUSTRY[industryMock];

  return (
    <ProductMockupFrame
      device="laptop"
      label={template.label}
      caption={`${screen?.caption ?? "Dashboard"} — ${company}`}
      presentation={presentation}
      fillContainer
      synthetic
    >
      <MockScreen
        variant={screen?.variant ?? story.variant}
        industry={industryMock}
        bare
        showcase
      />
    </ProductMockupFrame>
  );
}

function SupportingPhoto({
  templateId,
  label,
  className,
}: {
  templateId: keyof typeof BUSINESS_IMAGERY.industries;
  label: string;
  className?: string;
}) {
  const image = BUSINESS_IMAGERY.industries[templateId];

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      <BusinessPhoto src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 320px" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-gray-950/10 to-transparent" />
      <p className="absolute bottom-3 left-3 right-3 text-xs font-medium text-white/90">{label}</p>
    </div>
  );
}

function FeaturedIndustryExample({ template }: { template: IndustryTemplate }) {
  const industryMock = (template.industryMock ?? "umzug") as IndustryId;
  const story = getIndustryStory(industryMock);
  const imageKey = template.id as keyof typeof BUSINESS_IMAGERY.industries;

  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-lg shadow-gray-900/[0.06]">
      <div className="grid items-stretch lg:grid-cols-2">
        <div className="flex flex-col border-b border-gray-100 bg-gray-50/60 px-6 py-8 md:px-10 md:py-10 lg:border-b-0 lg:border-r lg:py-12">
          <SupportingPhoto
            templateId={imageKey}
            label={template.label}
            className="mb-6 aspect-[16/7] max-h-[160px] w-full md:max-h-[180px]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-gray-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
              {template.status === "live" ? "Live-Referenz" : "In Entwicklung"}
            </span>
          </div>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
            {template.label}
          </h3>
          <p className="mt-2 text-sm text-gray-500 md:text-base">{template.tagline}</p>
          <div className="mt-6">
            <IndustryStoryLines story={story} />
          </div>
        </div>
        <div className={cn(BUSINESS_VISUAL.mockupBreathingRoom, "min-w-0 bg-white")}>
          {industryMockup(template, story, "hero")}
        </div>
      </div>
    </article>
  );
}

function SecondaryIndustryExample({ template }: { template: IndustryTemplate }) {
  const industryMock = (template.industryMock ?? "umzug") as IndustryId;
  const story = getIndustryStory(industryMock);
  const imageKey = template.id as keyof typeof BUSINESS_IMAGERY.industries;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="px-6 pt-7 md:px-8 md:pt-8">
        <SupportingPhoto
          templateId={imageKey}
          label={template.label}
          className="mb-5 aspect-[16/6] max-h-[120px] w-full"
        />
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-gray-900 md:text-xl">
          {template.label}
        </h3>
        <div className="mt-4">
          <IndustryStoryLines story={story} compact />
        </div>
      </div>
      <div className="mt-auto min-w-0 px-4 pb-6 pt-2 md:px-6 md:pb-8">
        {industryMockup(template, story, "standard")}
      </div>
    </article>
  );
}

export function BusinessIndustryExamplesSection() {
  const templates = INDUSTRY_TEMPLATES.filter((t) =>
    SHOWCASE_INDUSTRIES.includes(t.id as (typeof SHOWCASE_INDUSTRIES)[number]),
  );
  const featured = templates.find((t) => t.id === FEATURED_INDUSTRY_ID) ?? templates[0];
  const secondary = templates.filter((t) => t.id !== featured.id);

  return (
    <BusinessSection className="border-t border-gray-100 bg-gray-50">
      <BusinessScrollReveal>
        <BusinessSectionIntro
          eyebrow={<BusinessEyebrow>Branchenbeispiele</BusinessEyebrow>}
          title="So sieht maßgeschneiderte Software in der Praxis aus"
          intro="Anonymisierte Referenzszenarien auf Basis unseres Grundsystems — Design, Farben und Module werden für Ihr Unternehmen individuell konfiguriert."
          className={BUSINESS_VISUAL.sectionIntroMb}
        />
      </BusinessScrollReveal>

      <BusinessScrollReveal delay={40}>
        <BusinessMockDisclaimer variant="note" className="mx-auto max-w-2xl" />
      </BusinessScrollReveal>

      <div className={cn(BUSINESS_VISUAL.sectionContentMt, BUSINESS_VISUAL.showcaseStack)}>
        {featured ? (
          <BusinessScrollReveal delay={60}>
            <FeaturedIndustryExample template={featured} />
          </BusinessScrollReveal>
        ) : null}

        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
          {secondary.map((template, i) => (
            <BusinessScrollReveal key={template.id} delay={120 + i * 80}>
              <SecondaryIndustryExample template={template} />
            </BusinessScrollReveal>
          ))}
        </div>
      </div>

      <p className="mt-14 text-center md:mt-16">
        <BusinessTextLink href="/business/branchenloesungen">Branchenlösungen entdecken</BusinessTextLink>
      </p>
    </BusinessSection>
  );
}

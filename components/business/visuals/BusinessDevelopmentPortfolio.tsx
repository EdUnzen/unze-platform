import { BusinessEyebrow, BusinessSection, BusinessSectionIntro, BusinessTextLink } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessMockDisclaimer } from "@/components/business/visuals/BusinessMockDisclaimer";
import { PortfolioPhoneShowcase } from "@/components/business/visuals/OwnProductVisual";
import { AppPhoneStageShowcase } from "@/components/business/visuals/AppPhoneCollageShowcase";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import {
  CONNECT_ADMIN_SHOWCASE,
  CONNECT_CREATOR_SHOWCASE,
  CONNECT_PLATFORM_SHOWCASE,
  CONNECT_PROFILE_SHOWCASE,
} from "@/lib/constants/business-connect-showcase";
import { DEVELOPMENT_PORTFOLIO } from "@/lib/constants/business-industry-templates";
import { cn } from "@/lib/utils/cn";

const PORTFOLIO_SCREENSHOT: Record<string, (typeof CONNECT_PLATFORM_SHOWCASE)[number] | undefined> = {
  community: CONNECT_CREATOR_SHOWCASE,
  admin: CONNECT_ADMIN_SHOWCASE,
  profile: CONNECT_PROFILE_SHOWCASE,
};

const PORTFOLIO_VARIANT: Record<string, "community" | "dashboard" | "admin" | "profile"> = {
  community: "community",
  admin: "admin",
  profile: "profile",
};

function FeaturedPortfolioItem({
  item,
}: {
  item: (typeof DEVELOPMENT_PORTFOLIO.items)[number];
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-lg shadow-gray-900/[0.06]">
      <div className="grid items-stretch lg:grid-cols-2">
        <div className="flex flex-col justify-center border-b border-gray-100 bg-gray-50/60 px-6 py-8 md:px-10 md:py-10 lg:border-b-0 lg:border-r lg:py-12">
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-balance text-gray-900 md:text-3xl">
            {item.title}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">{item.text}</p>
        </div>
        <div className={cn(BUSINESS_VISUAL.mockupBreathingRoom, "min-w-0 bg-gradient-to-br from-gray-50 to-white")}>
          <AppPhoneStageShowcase items={CONNECT_PLATFORM_SHOWCASE} />
        </div>
      </div>
    </article>
  );
}

function SecondaryPortfolioItem({
  item,
  screenshot,
}: {
  item: (typeof DEVELOPMENT_PORTFOLIO.items)[number];
  screenshot: (typeof CONNECT_PLATFORM_SHOWCASE)[number] | undefined;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="px-6 pt-7 pb-2 md:px-8 md:pt-8">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-balance text-gray-900 md:text-xl">
          {item.title}
        </h3>
      </div>
      <div className={cn("mt-auto flex justify-center px-4 pb-6 md:px-6 md:pb-8")}>
        <PortfolioPhoneShowcase
          screenshot={screenshot}
          label={item.title}
          variant={PORTFOLIO_VARIANT[item.id] ?? "community"}
          presentation="standard"
        />
      </div>
    </article>
  );
}

export function BusinessDevelopmentPortfolio({ className = "" }: { className?: string }) {
  const p = DEVELOPMENT_PORTFOLIO;
  const [featured, ...secondary] = p.items;
  const servicesLink = BUSINESS_COPY.start.servicesPreview.link;

  return (
    <BusinessSection className={className}>
      <BusinessScrollReveal>
        <BusinessSectionIntro
          eyebrow={<BusinessEyebrow>{p.eyebrow}</BusinessEyebrow>}
          title={p.title}
          intro={p.lead}
          className={BUSINESS_VISUAL.sectionIntroMb}
        />
      </BusinessScrollReveal>

      <BusinessScrollReveal delay={40}>
        <BusinessMockDisclaimer variant="note" className="mx-auto max-w-2xl" />
      </BusinessScrollReveal>

      <div className={cn(BUSINESS_VISUAL.sectionContentMt, BUSINESS_VISUAL.showcaseStack)}>
        <BusinessScrollReveal delay={60}>
          <FeaturedPortfolioItem item={featured} />
        </BusinessScrollReveal>

        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
          {secondary.map((item, i) => (
            <BusinessScrollReveal
              key={item.id}
              delay={120 + i * 80}
              className={
                i === secondary.length - 1 && secondary.length % 2 !== 0
                  ? "md:col-span-2 md:mx-auto md:w-full md:max-w-2xl"
                  : undefined
              }
            >
              <SecondaryPortfolioItem item={item} screenshot={PORTFOLIO_SCREENSHOT[item.id]} />
            </BusinessScrollReveal>
          ))}
        </div>
      </div>

      <p className="mt-14 text-center md:mt-16">
        <BusinessTextLink href={servicesLink.href}>{servicesLink.label}</BusinessTextLink>
      </p>
    </BusinessSection>
  );
}

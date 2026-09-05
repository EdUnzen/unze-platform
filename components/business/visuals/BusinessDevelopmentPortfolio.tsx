import { BusinessEyebrow, BusinessSection, BusinessSectionIntro, BusinessTextLink } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessMockDisclaimer } from "@/components/business/visuals/BusinessMockDisclaimer";
import { PortfolioPhoneShowcase } from "@/components/business/visuals/OwnProductVisual";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import {
  CONNECT_ADMIN_SHOWCASE,
  CONNECT_PLATFORM_SHOWCASE,
  CONNECT_PROFILE_SHOWCASE,
} from "@/lib/constants/business-connect-showcase";
import { DEVELOPMENT_PORTFOLIO } from "@/lib/constants/business-industry-templates";
import { cn } from "@/lib/utils/cn";

const PORTFOLIO_SCREENSHOT: Record<string, (typeof CONNECT_PLATFORM_SHOWCASE)[number] | undefined> = {
  community: CONNECT_PLATFORM_SHOWCASE[0],
  admin: CONNECT_ADMIN_SHOWCASE,
  profile: CONNECT_PROFILE_SHOWCASE,
};

const PORTFOLIO_VARIANT: Record<string, "community" | "dashboard" | "admin" | "profile"> = {
  community: "community",
  admin: "admin",
  profile: "profile",
};

function PortfolioItem({
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
      <div className="mt-auto flex justify-center px-4 pb-6 md:px-6 md:pb-8">
        <PortfolioPhoneShowcase
          screenshot={screenshot}
          label={item.title}
          variant={PORTFOLIO_VARIANT[item.id] ?? "community"}
          presentation="standard"
          chrome="slim"
        />
      </div>
    </article>
  );
}

export function BusinessDevelopmentPortfolio({ className = "" }: { className?: string }) {
  const p = DEVELOPMENT_PORTFOLIO;
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

      <div className={cn(BUSINESS_VISUAL.sectionContentMt, "grid gap-8 md:grid-cols-3 md:gap-10")}>
        {p.items.map((item, i) => (
          <BusinessScrollReveal key={item.id} delay={80 + i * 80}>
            <PortfolioItem item={item} screenshot={PORTFOLIO_SCREENSHOT[item.id]} />
          </BusinessScrollReveal>
        ))}
      </div>

      <p className="mt-14 text-center md:mt-16">
        <BusinessTextLink href={servicesLink.href}>{servicesLink.label}</BusinessTextLink>
      </p>
    </BusinessSection>
  );
}

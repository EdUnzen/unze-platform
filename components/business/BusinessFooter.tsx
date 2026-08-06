import { BusinessLink } from "@/components/business/BusinessLink";
import { CommunityExitLink } from "@/components/business/CommunityExitLink";
import { BusinessFooterSecondaryShowcase } from "@/components/business/BusinessFooterSecondaryShowcase";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { BUSINESS_NAV_SECONDARY } from "@/lib/constants/business-site";

export function BusinessFooter({ communityExitHref }: { communityExitHref: string }) {
  const f = BUSINESS_COPY.footer;
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <BusinessFooterSecondaryShowcase />
      <div className="container mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-gray-900">
            UNZE Business
          </p>
          <p className="mt-1 text-sm text-gray-500">{f.tagline}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-gray-600" aria-label="Footer Navigation">
          <CommunityExitLink
            href={communityExitHref}
            className="font-medium text-gray-900 transition hover:text-[#00C853]"
          >
            {BUSINESS_COPY.nav.backToCommunity}
          </CommunityExitLink>
          {BUSINESS_NAV_SECONDARY.map((item) => (
            <BusinessLink key={item.href} href={item.href} className="transition hover:text-gray-900">
              {item.label}
            </BusinessLink>
          ))}
          {f.legal.map((item) => (
            <BusinessLink key={item.href} href={item.href} className="transition hover:text-gray-900">
              {item.label}
            </BusinessLink>
          ))}
        </nav>
      </div>
    </footer>
  );
}

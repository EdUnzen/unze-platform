import Image from "next/image";
import { headers } from "next/headers";
import { MarketingLink } from "@/components/landing/MarketingLink";
import { UnzeEcosystemNav } from "@/components/shared/UnzeEcosystemNav";
import { UNZE_BRAND_HREF } from "@/lib/constants/unze-ecosystem-nav";
import { getAppEntryPath } from "@/lib/constants/site";

export async function MarketingHeader() {
  const host = (await headers()).get("host");
  const appHref = getAppEntryPath(host);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <MarketingLink href={UNZE_BRAND_HREF} className="flex min-w-0 shrink-0 items-center gap-2.5">
          <Image
            src="/landing/unze-logo.png"
            alt="UNZE Logo"
            width={36}
            height={36}
            className="h-9 w-9"
            priority
          />
          <span className="font-display text-lg font-bold tracking-tight text-gray-900">UNZE</span>
        </MarketingLink>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <UnzeEcosystemNav />
          <a
            href={appHref}
            className="inline-flex h-9 shrink-0 items-center rounded-full bg-[#00C853] px-4 text-sm font-semibold leading-none text-white shadow-sm transition hover:bg-[#00b34a]"
          >
            App nutzen
          </a>
        </div>
      </div>
    </header>
  );
}

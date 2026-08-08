"use client";

import { AppNutzenButton } from "@/components/landing/marketing/MarketingAppEntryGate";
import { CTA_APP_USE, CTA_PROJECT_INQUIRY } from "@/lib/constants/cta-copy";

interface MarketingCtaBarProps {
  /** Legacy — Join läuft über App-Gate + Login. */
  communitySlug?: string;
}

export function MarketingCtaBar(_props: MarketingCtaBarProps = {}) {
  return (
    <div className="flex flex-wrap gap-3">
      <AppNutzenButton className="inline-flex rounded-full bg-[#00C853] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00b34a]">
        {CTA_APP_USE}
      </AppNutzenButton>
      <a
        href="/business"
        className="inline-flex rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#00C853]"
      >
        {CTA_PROJECT_INQUIRY}
      </a>
    </div>
  );
}

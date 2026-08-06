import { getAppEntryPath, getCommunityJoinUrl } from "@/lib/constants/site";
import { CTA_APP_USE, CTA_PROJECT_INQUIRY } from "@/lib/constants/cta-copy";

interface MarketingCtaBarProps {
  communitySlug?: string;
}

export function MarketingCtaBar({ communitySlug }: MarketingCtaBarProps) {
  const primaryUrl = communitySlug ? getCommunityJoinUrl(communitySlug) : getAppEntryPath();
  const primaryLabel = communitySlug ? "Community öffnen" : CTA_APP_USE;

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={primaryUrl}
        rel="noopener noreferrer"
        className="inline-flex rounded-full bg-[#00C853] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00b34a]"
      >
        {primaryLabel}
      </a>
      <a
        href="/business"
        className="inline-flex rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#00C853]"
      >
        {CTA_PROJECT_INQUIRY}
      </a>
    </div>
  );
}

import { MarketingCommunityPreview } from "@/components/landing/MarketingCommunityPreview";
import { SITE_HEADER, type SiteMode } from "@/lib/constants/site";
import type { CommunityPageProps } from "@/components/community/community-page-types";
import { headers } from "next/headers";

export const revalidate = 60;

export default async function CommunityPage(props: CommunityPageProps) {
  const headerList = await headers();
  const siteMode = headerList.get(SITE_HEADER) as SiteMode | null;
  const { slug } = await props.params;

  if (siteMode === "marketing") {
    return <MarketingCommunityPreview slug={slug} />;
  }

  const { CommunityPlatformPage } = await import(
    "@/components/community/CommunityPlatformPage"
  );
  return <CommunityPlatformPage {...props} />;
}

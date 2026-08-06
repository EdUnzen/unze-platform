import { MarketingShell } from "@/components/landing/MarketingShell";
import { SITE_HEADER, isLocalDevHost, type SiteMode } from "@/lib/constants/site";
import { headers } from "next/headers";

export const revalidate = 60;

export default async function HomePage() {
  const headerList = await headers();
  const siteMode = headerList.get(SITE_HEADER) as SiteMode | null;
  const host = headerList.get("host");

  // Marketing-Domain oder localhost: Community-Landing (nicht Connect-App)
  if (siteMode === "marketing" || isLocalDevHost(host)) {
    const { LandingPage } = await import("@/components/landing/LandingPage");
    return (
      <MarketingShell>
        <LandingPage />
      </MarketingShell>
    );
  }

  const { PlatformHome } = await import("@/components/home/PlatformHome");
  const { PlatformShell } = await import("@/components/layout/PlatformShell");
  return (
    <PlatformShell>
      <PlatformHome />
    </PlatformShell>
  );
}

import { MarketingShell } from "@/components/landing/MarketingShell";
import { SITE_HEADER, type SiteMode } from "@/lib/constants/site";
import { headers } from "next/headers";

/**
 * Marketing (unze.app): nur Vorschau-Shell — kein Connect BottomNav.
 * Connect (unzeconnect.app): PlatformShell für die echte Community-App.
 */
export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteMode = (await headers()).get(SITE_HEADER) as SiteMode | null;

  if (siteMode === "marketing") {
    return <MarketingShell>{children}</MarketingShell>;
  }

  const { default: PlatformAreaLayout } = await import(
    "@/components/layout/PlatformAreaLayout"
  );
  return <PlatformAreaLayout>{children}</PlatformAreaLayout>;
}

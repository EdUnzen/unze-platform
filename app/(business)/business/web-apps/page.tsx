import { BusinessWebAppsPage } from "@/components/business/pages/BusinessFeaturePages";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Apps (Web & Mobile) | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.webApps.hero.subline,
};

export default function Page() {
  return <BusinessWebAppsPage />;
}

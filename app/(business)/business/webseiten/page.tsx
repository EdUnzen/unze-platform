import { BusinessWebseitenPage } from "@/components/business/pages/BusinessFeaturePages";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Webseiten | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.webseiten.hero.subline,
};

export default function Page() {
  return <BusinessWebseitenPage />;
}

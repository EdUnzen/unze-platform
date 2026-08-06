import { BusinessKiPage } from "@/components/business/pages/BusinessFeaturePages";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `KI & Automatisierung | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.ki.hero.subline,
};

export default function Page() {
  return <BusinessKiPage />;
}

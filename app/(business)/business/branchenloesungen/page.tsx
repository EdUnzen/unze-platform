import { BusinessBranchenPage } from "@/components/business/pages/BusinessBranchenPage";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Branchenlösungen | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.branchen.hero.subline,
};

export default function Page() {
  return <BusinessBranchenPage />;
}

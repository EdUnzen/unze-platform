import { BusinessCorePage } from "@/components/business/pages/BusinessCorePage";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Business Core | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.businessCore.hero.subline,
};

export default function Page() {
  return <BusinessCorePage />;
}

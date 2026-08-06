import { BusinessPreisePage } from "@/components/business/pages/BusinessPreisePage";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Preise | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.preise.hero.subline,
};

export default function Page() {
  return <BusinessPreisePage />;
}

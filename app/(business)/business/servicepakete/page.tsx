import { BusinessServicepaketePage } from "@/components/business/pages/BusinessServicepaketePage";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Servicepakete | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.servicepakete.hero.subline,
};

export default function Page() {
  return <BusinessServicepaketePage />;
}

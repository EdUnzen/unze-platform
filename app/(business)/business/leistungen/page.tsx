import { BusinessLeistungenPage } from "@/components/business/pages/BusinessLeistungenPage";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Leistungen | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.leistungen.hero.subline,
};

export default function Page() {
  return <BusinessLeistungenPage />;
}

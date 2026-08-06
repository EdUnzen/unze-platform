import { BusinessProduktePage } from "@/components/business/pages/BusinessProduktePage";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Unsere Produkte | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.produkte.hero.subline,
};

export default function Page() {
  return <BusinessProduktePage />;
}

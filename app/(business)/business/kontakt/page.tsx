import { BusinessKontaktPage } from "@/components/business/pages/BusinessKontaktPage";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Kontakt | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.kontakt.hero.subline,
};

export default function Page() {
  return <BusinessKontaktPage />;
}

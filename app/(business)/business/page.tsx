import { BusinessStartPage } from "@/components/business/pages/BusinessStartPage";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: BUSINESS_COPY.meta.title,
  description: BUSINESS_COPY.meta.description,
};

export default function BusinessPage() {
  return <BusinessStartPage />;
}

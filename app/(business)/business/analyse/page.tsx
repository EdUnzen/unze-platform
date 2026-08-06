import { BusinessAnalysePage } from "@/components/business/pages/BusinessAnalysePage";
import { getPaidAnalysisShopOrder } from "@/lib/business/analysis-shop";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { isAnalysisTierId } from "@/lib/constants/business-analysis-tiers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Analyse | ${BUSINESS_COPY.meta.title}`,
  description: BUSINESS_COPY.analyse.hero.subline,
};

type Props = {
  searchParams: Promise<{ tier?: string; error?: string; order?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { tier, error, order } = await searchParams;
  const initialTier = tier && isAnalysisTierId(tier) ? tier : "quick";
  const paidShopOrder = await getPaidAnalysisShopOrder({
    orderReference: order,
    tier: initialTier,
  });

  return (
    <BusinessAnalysePage
      initialTier={initialTier}
      formError={error ?? null}
      paidShopOrder={paidShopOrder}
    />
  );
}

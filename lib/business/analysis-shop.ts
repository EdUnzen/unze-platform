import type { AnalysisTierId } from "@/lib/constants/business-analysis-tiers";
import { getShopOrderByReference } from "@/lib/studio/shop-orders";
import type { StudioShopOrder } from "@/lib/studio/shop-order-types";

const TIER_TO_SLUG: Record<AnalysisTierId, string> = {
  quick: "analyse-quick",
  business: "analyse-business",
  premium: "analyse-premium",
};

const SLUG_TO_TIER: Record<string, AnalysisTierId> = {
  "analyse-quick": "quick",
  "analyse-business": "business",
  "analyse-premium": "premium",
};

export function analysisTierToShopSlug(tier: AnalysisTierId): string {
  return TIER_TO_SLUG[tier];
}

export function shopSlugToAnalysisTier(slug: string): AnalysisTierId | null {
  return SLUG_TO_TIER[slug] ?? null;
}

export function shopSlugToShopPath(slug: string): string {
  return `/business/shop/${slug}`;
}

export async function getPaidAnalysisShopOrder(input: {
  orderReference?: string | null;
  tier?: AnalysisTierId;
}): Promise<StudioShopOrder | null> {
  if (!input.orderReference?.trim()) return null;

  const order = await getShopOrderByReference(input.orderReference.trim());
  if (!order) return null;
  if (order.paymentStatus !== "paid") return null;

  const orderTier = shopSlugToAnalysisTier(order.productSlug);
  if (!orderTier) return null;
  if (input.tier && orderTier !== input.tier) return null;

  return order;
}

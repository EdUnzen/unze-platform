import { resolveBannerFromPresetOrUrl } from "@/lib/constants/category-banners";
import type { PublicCommunityCard } from "@/lib/marketing/public-directory.service";

export type PublicCommunityVisual = {
  imageUrl: string;
  gradient: string;
};

export function resolvePublicCommunityVisual(
  community: Pick<
    PublicCommunityCard,
    "bannerUrl" | "bannerGradient" | "category" | "bannerPresetId"
  >,
): PublicCommunityVisual {
  const resolved = resolveBannerFromPresetOrUrl({
    bannerUrl: community.bannerUrl,
    bannerPresetId: community.bannerPresetId ?? null,
    bannerGradient: community.bannerGradient,
    category: community.category ?? "Community",
  });
  return { imageUrl: resolved.imageUrl, gradient: resolved.gradient };
}

import {
  getDefaultBannerPresetForCategory,
  resolveBannerFromPresetOrUrl,
} from "@/lib/constants/category-banners";
import { isUsableImageUrl } from "@/lib/visual/image-url";
import { normalizeBannerGradient } from "@/lib/visual/normalize-cover";

export function resolveCommunityBannerDisplay(community: {
  bannerUrl?: string | null;
  bannerGradient: string;
  category: string;
}) {
  return resolveBannerFromPresetOrUrl({
    bannerUrl: community.bannerUrl,
    category: community.category,
    bannerGradient: community.bannerGradient,
  });
}

export function resolveGroupCoverDisplay(group: {
  coverUrl?: string | null;
  bannerGradient: string;
  category: string;
}) {
  const preset = getDefaultBannerPresetForCategory(group.category);
  const gradient = normalizeBannerGradient(group.bannerGradient, group.category);

  if (isUsableImageUrl(group.coverUrl)) {
    return {
      imageUrl: group.coverUrl!.trim(),
      gradient,
    };
  }

  return {
    imageUrl: preset.imageUrl,
    gradient,
  };
}

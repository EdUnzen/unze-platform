import {
  getDefaultBannerPresetForCategory,
  resolveBannerFromPresetOrUrl,
} from "@/lib/constants/category-banners";

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
  if (group.coverUrl?.trim()) {
    return {
      imageUrl: group.coverUrl.trim(),
      gradient: group.bannerGradient,
    };
  }

  const preset = getDefaultBannerPresetForCategory(group.category);
  return {
    imageUrl: preset.imageUrl,
    gradient: group.bannerGradient || preset.gradient,
  };
}

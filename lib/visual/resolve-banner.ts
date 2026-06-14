import {
  resolveCommunityCover,
  resolveEventCover,
  resolveGroupOrServiceCover,
  type ResolvedCover,
} from "@/lib/visual/auto-cover";

export type { ResolvedCover };

/** @deprecated Nutze `resolveCommunityCover` + `cover`-Prop */
export function resolveCommunityBannerDisplay(community: {
  bannerUrl?: string | null;
  bannerGradient: string;
  category: string;
}) {
  const cover = resolveCommunityCover(community);
  return {
    imageUrl: cover.primaryImageUrl ?? cover.autoCoverUrl,
    gradient: cover.gradient,
    cover,
  };
}

export function resolveGroupCoverDisplay(group: {
  coverUrl?: string | null;
  communityBannerUrl?: string | null;
  bannerGradient: string;
  category: string;
  groupType?: "group" | "service";
}) {
  const cover = resolveGroupOrServiceCover(group);
  return {
    imageUrl:
      cover.primaryImageUrl ??
      cover.communityCoverUrl ??
      cover.autoCoverUrl ??
      cover.standardCoverUrl,
    gradient: cover.gradient,
    cover,
  };
}

export function resolveEventCoverDisplay(input: {
  coverUrl?: string | null;
  communityCategory: string;
  communityBannerUrl?: string | null;
  communityGradient?: string;
}) {
  const cover = resolveEventCover(input);
  return {
    imageUrl:
      cover.primaryImageUrl ??
      cover.communityCoverUrl ??
      cover.autoCoverUrl ??
      cover.standardCoverUrl,
    gradient: cover.gradient,
    cover,
  };
}

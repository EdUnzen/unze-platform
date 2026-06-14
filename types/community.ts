import type {
  CommunityAccessConfig,
  JoinAccessState,
  JoinApplication,
} from "@/types/access";
import type { CommunityLevel } from "@/lib/constants/community-level";
import type { CardEngagementMetrics } from "@/types/engagement";
import type { CommunityRole } from "@/types/database";

export type PlatformType =
  | "discord"
  | "whatsapp"
  | "telegram"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "website"
  | "unze"
  | "other";

export type CommunityVisibility = "public" | "private" | "premium" | "hidden";

export interface CommunityGroup {
  id: string;
  communityId: string;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  isPublic: boolean;
  groupType?: "group" | "service";
  coverUrl?: string | null;
  priceCents?: number | null;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  memberCount?: number;
}

/** Gruppe + Community-Kontext für Discover-Cards */
export interface DiscoverGroup extends CommunityGroup {
  communitySlug: string;
  communityTitle: string;
  platformType: PlatformType;
  memberCount: number;
  bannerGradient: string;
  communityBannerUrl?: string | null;
  isVerified: boolean;
  isTrending: boolean;
  category: string;
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  groupType?: "group" | "service";
  weeklyPostCount?: number;
  viewCountWeekly?: number;
  shareCount?: number;
  engagement?: CardEngagementMetrics;
}

export interface CommunityMembership {
  isMember: boolean;
  role: CommunityRole | null;
}

export interface Community {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerGradient: string;
  bannerUrl?: string | null;
  platformType: PlatformType;
  category: string;
  focusTags: string[];
  tags: string[];
  communityLevel: CommunityLevel;
  levelScore: number;
  showMemberArea: boolean;
  memberCount: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verifiedAt?: string | null;
  isTrending?: boolean;
  visibility: CommunityVisibility;
  creatorName: string;
  creatorId: string;
  externalUrl?: string | null;
  discoverEnabled?: boolean;
  monetizationEnabled?: boolean;
  /** Access & Governance */
  access?: CommunityAccessConfig;
  joinAccess?: JoinAccessState;
  /** Viewer-Kontext (optional) */
  membership?: CommunityMembership;
  isFollowing?: boolean;
  groupCount?: number;
  /** Erweiterte Anzeige (Beta / DB) */
  creatorAvatarUrl?: string | null;
  creatorUsername?: string | null;
  creatorIsVerified?: boolean;
  createdAt?: string;
  region?: string;
  language?: string;
  viewCount?: number;
  viewCountWeekly?: number;
  shareCount?: number;
  /** Kompakte Engagement-Anzeige für Cards */
  engagement?: CardEngagementMetrics;
  priceLabel?: string | null;
  pricing?: {
    monthlyCents?: number | null;
    semiannualCents?: number | null;
    yearlyCents?: number | null;
  };
  subscriptionPlans?: {
    monthly: boolean;
    semiannual: boolean;
    yearly: boolean;
  };
}

export interface CommunityFormInput {
  title: string;
  slug: string;
  description: string;
  platformType: PlatformType;
  category: string;
  focusTags: string[];
  tags: string[];
  visibility: CommunityVisibility;
  bannerGradient: string;
  bannerPresetId?: string;
  bannerUrl?: string;
  externalUrl?: string;
  discoverEnabled?: boolean;
}

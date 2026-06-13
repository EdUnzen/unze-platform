/** Creator-Profil für Discover & Community-Detail */
export interface PlatformCreator {
  id: string;
  name: string;
  username: string | null;
  bio: string | null;
  isVerified: boolean;
  verificationTier?: "identity" | "business" | null;
  verifiedAt?: string | null;
  avatarUrl: string | null;
  communityCount: number;
  totalMembers: number;
  primaryCategory: string | null;
}

/** Bewertung auf Community oder Gruppe — für Creator-Profil */
export interface CreatorNetworkReview {
  id: string;
  target: "community" | "group";
  targetTitle: string;
  targetSlug: string;
  communitySlug: string;
  rating: number;
  title?: string;
  body: string;
  authorName: string;
  createdAt: string;
}

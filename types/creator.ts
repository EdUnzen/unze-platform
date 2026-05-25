/** Creator-Profil für Discover & Community-Detail */
export interface PlatformCreator {
  id: string;
  name: string;
  username: string | null;
  bio: string | null;
  isVerified: boolean;
  avatarUrl: string | null;
  communityCount: number;
  totalMembers: number;
  primaryCategory: string | null;
}

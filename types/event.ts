export interface CommunityEvent {
  id: string;
  communityId: string;
  communitySlug?: string;
  communityTitle?: string;
  groupId: string | null;
  groupTitle?: string | null;
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  externalUrl: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  isFeatured: boolean;
  platformType?: string;
}

export type EventSort = "upcoming" | "featured";

/**
 * Vorbereitung für Community-Reviews (Sprint 2+).
 * Aggregierte Werte bleiben in communities.rating_avg / review_count.
 * Vollständiges Review-System = additive Migration ab 017.
 */

export type ReviewSort = "newest" | "highest" | "lowest";

export interface CommunityReviewDraft {
  communityId: string;
  authorId: string;
  rating: number;
  title?: string;
  body: string;
}

export interface CommunityReviewView extends CommunityReviewDraft {
  id: string;
  createdAt: string;
  authorName: string;
  isVerifiedMember: boolean;
}

/** UI-Hinweis bis Review-UI vollständig angebunden ist */
export const REVIEWS_COMING_SOON_MESSAGE =
  "Mitgliedsbewertungen mit Kommentaren — Schema bereit (Migration 022). Vollständige UI folgt in Phase 2.";

export type ReviewTarget = "community" | "group";

export type ReviewSort = "newest" | "highest" | "lowest";

export interface CommunityReviewDraft {
  communityId: string;
  authorId: string;
  rating: number;
  title?: string;
  body: string;
}

export interface CommunityReviewView {
  id: string;
  communityId: string;
  authorId: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
  authorName: string;
  isVerifiedMember: boolean;
}

export interface ReviewCommentView {
  id: string;
  reviewId: string;
  reviewTarget: ReviewTarget;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface EntityReviewContext {
  target: ReviewTarget;
  targetId: string;
  title: string;
  rating: number;
  reviewCount: number;
  returnPath: string;
  canReview: boolean;
}

export type ReviewWithComments = {
  review: CommunityReviewView;
  comments: ReviewCommentView[];
};

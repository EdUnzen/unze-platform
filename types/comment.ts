export interface CommentView {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  authorName: string;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
}

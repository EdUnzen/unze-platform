import type { FeedPost } from "@/lib/mappers/post.mapper";
import { FeedDiscoverView } from "./FeedDiscoverView";
import { FeedEmptyState, FeedPostCard } from "./FeedPostCard";

interface FeedPostListProps {
  posts: FeedPost[];
  emptyMessage?: string;
  isLoggedIn?: boolean;
  /** Discover feed: list/swipe toggle */
  interactive?: boolean;
}

export function FeedPostList({
  posts,
  emptyMessage = "Noch keine Beiträge im Feed.",
  isLoggedIn = false,
  interactive = false,
}: FeedPostListProps) {
  if (interactive) {
    return (
      <FeedDiscoverView
        posts={posts}
        isLoggedIn={isLoggedIn}
        emptyMessage={emptyMessage}
      />
    );
  }

  if (posts.length === 0) {
    return <FeedEmptyState message={emptyMessage} />;
  }

  return (
    <ul className="flex flex-col gap-3" data-testid="feed-post-list">
      {posts.map((post) => (
        <li key={post.id}>
          <FeedPostCard post={post} isLoggedIn={isLoggedIn} />
        </li>
      ))}
    </ul>
  );
}

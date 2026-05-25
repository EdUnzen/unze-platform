import type { FeedPost } from "@/lib/mappers/post.mapper";
import { cn } from "@/lib/utils/cn";
import { MessageSquare, Pin, Sparkles } from "lucide-react";
import Link from "next/link";

interface FeedPostListProps {
  posts: FeedPost[];
  emptyMessage?: string;
  communityNames?: Record<string, { title: string; slug: string }>;
}

const POST_TYPE_LABELS: Record<FeedPost["postType"], string> = {
  text: "Text",
  image: "Bild",
  poll: "Umfrage",
  event: "Event",
  community_update: "Update",
  question: "Frage",
};

function formatFeedDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Gerade eben";
  if (diffHours < 24) return `Vor ${diffHours} Std.`;
  if (diffHours < 48) return "Gestern";
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  });
}

export function FeedPostList({
  posts,
  emptyMessage = "Noch keine Beiträge im Feed.",
  communityNames,
}: FeedPostListProps) {
  if (posts.length === 0) {
    return (
      <div
        className="rounded-3xl bg-white p-8 text-center shadow-card"
        data-testid="feed-empty"
      >
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-unze-ink-muted" aria-hidden />
        <p className="text-sm text-unze-ink-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3" data-testid="feed-post-list">
      {posts.map((post) => {
        const communityInfo =
          post.communityId && communityNames?.[post.communityId];

        return (
        <li
          key={post.id}
          className="rounded-3xl bg-white p-4 shadow-card"
          data-testid={`feed-post-${post.id}`}
        >
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-unze-ink-muted">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide",
                post.postType === "community_update"
                  ? "bg-unze-green-muted text-unze-green-dark"
                  : "bg-unze-surface-muted text-unze-ink-secondary",
              )}
            >
              {POST_TYPE_LABELS[post.postType]}
            </span>
            <span>{formatFeedDate(post.createdAt)}</span>
            {post.visibility !== "public" && (
              <span className="rounded-full bg-unze-surface-muted px-2 py-0.5">
                {post.visibility === "community" ? "Community" : post.visibility}
              </span>
            )}
          </div>

          {post.title && (
            <h3 className="mb-1 font-semibold text-unze-ink">{post.title}</h3>
          )}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-unze-ink-secondary">
            {post.content}
          </p>
          <div className="mt-3 flex gap-4 text-xs text-unze-ink-muted">
            <span>{post.likeCount} Likes</span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              {post.commentCount}
            </span>
            {communityInfo ? (
              <Link
                href={`/community/${communityInfo.slug}`}
                className="inline-flex items-center gap-1 font-medium text-unze-green-dark hover:underline"
              >
                <Pin className="h-3.5 w-3.5" aria-hidden />
                {communityInfo.title}
              </Link>
            ) : (
              post.communityId && (
                <span className="inline-flex items-center gap-1 text-unze-green-dark">
                  <Pin className="h-3.5 w-3.5" aria-hidden />
                  Community-Beitrag
                </span>
              )
            )}
          </div>
        </li>
        );
      })}
    </ul>
  );
}

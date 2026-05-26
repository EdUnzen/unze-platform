"use client";

import type { FeedPost } from "@/lib/mappers/post.mapper";
import { formatFeedRelativeDate } from "@/lib/feed/format-date";
import { cn } from "@/lib/utils/cn";
import { MessageSquare, Pin, Sparkles } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { PostLikeButton } from "./PostLikeButton";

const POST_TYPE_LABELS: Record<FeedPost["postType"], string> = {
  text: "Text",
  image: "Bild",
  poll: "Umfrage",
  event: "Event",
  community_update: "Update",
  question: "Frage",
};

interface FeedPostCardProps {
  post: FeedPost;
  isLoggedIn?: boolean;
  variant?: "list" | "swipe";
  showCommunity?: boolean;
}

function FeedPostCardInner({
  post,
  isLoggedIn = false,
  variant = "list",
  showCommunity = true,
}: FeedPostCardProps) {
  const communityInfo = post.community;
  const authorInitial = (post.author?.name ?? "M").slice(0, 1).toUpperCase();

  return (
    <article
      className={cn(
        "rounded-3xl bg-white shadow-card",
        variant === "swipe"
          ? "relative flex h-full min-h-[440px] snap-start snap-always flex-col p-5"
          : "p-4",
      )}
      data-testid={`feed-post-${post.id}`}
    >
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-unze-green-muted text-sm font-bold text-unze-green-dark">
          {authorInitial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/post/${post.id}`}
              className="font-semibold text-unze-ink hover:text-unze-green-dark"
            >
              {post.author?.name ?? "Mitglied"}
            </Link>
            <span className="text-[11px] text-unze-ink-muted">
              {formatFeedRelativeDate(post.createdAt)}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-unze-ink-muted">
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
            {post.isPinned && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                Angepinnt
              </span>
            )}
            {post.feedSource === "explore" && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 font-semibold text-violet-800">
                Entdecken
              </span>
            )}
          </div>
        </div>
      </div>

      <Link href={`/post/${post.id}`} className="block flex-1">
        {post.title && (
          <h3 className="mb-1 font-semibold text-unze-ink">{post.title}</h3>
        )}
        <p
          className={cn(
            "whitespace-pre-wrap text-sm leading-relaxed text-unze-ink-secondary",
            variant === "swipe" ? "line-clamp-[12]" : "line-clamp-6",
          )}
        >
          {post.content}
        </p>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-unze-border/80 pt-3">
        <PostLikeButton
          postId={post.id}
          likeCount={post.likeCount}
          isLiked={Boolean(post.isLikedByViewer)}
          isLoggedIn={isLoggedIn}
        />
        <Link
          href={`/post/${post.id}#comments`}
          className="inline-flex items-center gap-1 rounded-full bg-unze-surface-muted px-2.5 py-1 text-xs font-medium text-unze-ink-secondary"
        >
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          {post.commentCount}
        </Link>
        {showCommunity && communityInfo && (
          <Link
            href={`/community/${communityInfo.slug}`}
            className="ml-auto inline-flex max-w-[55%] items-center gap-1 truncate text-xs font-medium text-unze-green-dark hover:underline"
          >
            <Pin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{communityInfo.title}</span>
          </Link>
        )}
      </div>
    </article>
  );
}

export const FeedPostCard = memo(FeedPostCardInner);

export function FeedEmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-3xl bg-white p-8 text-center shadow-card"
      data-testid="feed-empty"
    >
      <Sparkles className="mx-auto mb-3 h-8 w-8 text-unze-ink-muted" aria-hidden />
      <p className="text-sm text-unze-ink-secondary">{message}</p>
    </div>
  );
}

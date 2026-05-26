"use client";

import type { FeedPost } from "@/lib/mappers/post.mapper";
import { formatFeedRelativeDate } from "@/lib/feed/format-date";
import { cn } from "@/lib/utils/cn";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { PostContextHeader } from "./PostContextHeader";
import { PostEngagementBar } from "./PostEngagementBar";
import { PostMediaGallery } from "./PostMediaGallery";
import { PostVideoPreview } from "./PostVideoPreview";
import { ExternalContentCard } from "@/components/external/ExternalContentCard";
import {
  getHostedMedia,
  getPostExternalUrl,
} from "@/lib/external/post-external";

interface FeedPostCardProps {
  post: FeedPost;
  isLoggedIn?: boolean;
  variant?: "list" | "swipe" | "detail";
  showCommunity?: boolean;
}

function FeedPostCardInner({
  post,
  isLoggedIn = false,
  variant = "list",
  showCommunity = true,
}: FeedPostCardProps) {
  const isDetail = variant === "detail";
  const externalUrl = getPostExternalUrl(post);
  const hostedMedia = getHostedMedia(post);
  const videoMedia = hostedMedia.find((m) => m.type === "video");
  const hasGallery = hostedMedia.some((m) => m.type === "image");
  const showHostedMedia = hostedMedia.length > 0;

  const body = (
    <>
      {showCommunity && <PostContextHeader post={post} compact={variant === "swipe"} />}

      <div className={cn("space-y-3", !isDetail && "flex-1")}>
        {externalUrl && (
          <ExternalContentCard
            url={externalUrl}
            title={post.title ?? undefined}
            communityTitle={post.community?.title}
            variant={isDetail ? "detail" : "feed"}
          />
        )}

        {showHostedMedia && (
          <div className="overflow-hidden">
            {videoMedia ? (
              <PostVideoPreview
                media={videoMedia}
                postId={post.id}
                variant={isDetail ? "detail" : "feed"}
              />
            ) : hasGallery ? (
              <PostMediaGallery
                media={hostedMedia}
                variant={isDetail ? "detail" : "feed"}
              />
            ) : null}
          </div>
        )}

        <div>
          {!showCommunity && isDetail && <PostContextHeader post={post} />}
          <Link href={isDetail ? "#" : `/post/${post.id}`} className={isDetail ? "pointer-events-none" : "block"}>
            {post.title && (
              <h3
                className={cn(
                  "font-semibold text-unze-ink",
                  isDetail ? "text-lg" : "mb-1 text-base",
                )}
              >
                {post.title}
              </h3>
            )}
            <p
              className={cn(
                "whitespace-pre-wrap leading-relaxed text-unze-ink-secondary",
                isDetail ? "text-sm" : "text-sm",
                !isDetail && (variant === "swipe" ? "line-clamp-[8]" : "line-clamp-6"),
              )}
            >
              {post.content}
            </p>
          </Link>

          {post.metadata.eventAt && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-orange-800">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {new Date(post.metadata.eventAt).toLocaleString("de-DE", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}
          {post.metadata.location && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-unze-ink-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {post.metadata.location}
            </p>
          )}
        </div>

        {!isDetail && (
          <p className="text-[11px] text-unze-ink-muted">
            {formatFeedRelativeDate(post.createdAt)}
          </p>
        )}
      </div>

      <PostEngagementBar post={post} isLoggedIn={isLoggedIn} />
    </>
  );

  if (isDetail) {
    return (
      <article className="rounded-3xl bg-white p-4 shadow-card sm:p-5" data-testid={`feed-post-${post.id}`}>
        {body}
      </article>
    );
  }

  return (
    <article
      className={cn(
        "rounded-3xl bg-white shadow-card",
        variant === "swipe"
          ? "relative flex h-full min-h-[480px] snap-start snap-always flex-col p-4"
          : "p-4",
      )}
      data-testid={`feed-post-${post.id}`}
    >
      {body}
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

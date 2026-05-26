"use client";

import type { FeedPost } from "@/lib/mappers/post.mapper";
import { getAppUrl } from "@/lib/env";
import { formatCompactCount } from "@/lib/utils/format-metrics";
import { ShareMenu } from "@/components/share/ShareMenu";
import { Eye, MessageSquare, Share2 } from "lucide-react";
import Link from "next/link";
import { PostLikeButton } from "./PostLikeButton";

interface PostEngagementBarProps {
  post: FeedPost;
  isLoggedIn?: boolean;
}

export function PostEngagementBar({ post, isLoggedIn = false }: PostEngagementBarProps) {
  const shareTarget = {
    type: "post" as const,
    title: post.title ?? post.content.slice(0, 60),
    url: `${getAppUrl()}/post/${post.id}`,
    postId: post.id,
    communityId: post.communityId ?? undefined,
    groupId: post.groupId ?? undefined,
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-unze-border/80 pt-3">
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

      <ShareMenu target={shareTarget} label="Beitrag teilen" variant="inline" />

      {(post.viewCount > 0 || post.shareCount > 0) && (
        <div className="ml-auto flex items-center gap-2 text-[10px] text-unze-ink-muted">
          {post.viewCount > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Eye className="h-3 w-3" aria-hidden />
              {formatCompactCount(post.viewCount)}
            </span>
          )}
          {post.shareCount > 0 && (
            <span className="inline-flex items-center gap-0.5 font-medium text-unze-ink-secondary">
              <Share2 className="h-3 w-3" aria-hidden />
              {formatCompactCount(post.shareCount)}×
            </span>
          )}
        </div>
      )}
    </div>
  );
}

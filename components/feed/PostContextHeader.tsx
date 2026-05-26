import type { FeedPost } from "@/lib/mappers/post.mapper";
import { POST_TYPE_LABELS, POST_TYPE_STYLES } from "@/lib/constants/posts";
import { ROLE_LABELS } from "@/lib/constants/dashboard";
import { PlatformBadge } from "@/components/community/PlatformBadge";
import { cn } from "@/lib/utils/cn";
import { BadgeCheck, FolderOpen, TrendingUp } from "lucide-react";
import Link from "next/link";

interface PostContextHeaderProps {
  post: FeedPost;
  compact?: boolean;
}

export function PostContextHeader({ post, compact = false }: PostContextHeaderProps) {
  const community = post.community;
  const author = post.author;
  const authorInitial = (author?.name ?? "M").slice(0, 1).toUpperCase();
  const roleLabel = author?.communityRole
    ? ROLE_LABELS[author.communityRole] ?? author.communityRole
    : null;

  return (
    <header className={cn("flex gap-3", compact ? "mb-2" : "mb-3")}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-unze-green-muted text-sm font-bold text-unze-green-dark">
        {author?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.avatarUrl}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          authorInitial
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={`/post/${post.id}`}
            className="font-semibold text-unze-ink hover:text-unze-green-dark"
          >
            {author?.name ?? "Mitglied"}
          </Link>
          {author?.isVerified && (
            <BadgeCheck className="h-3.5 w-3.5 text-unze-green" aria-label="Verifiziert" />
          )}
          {roleLabel && (
            <span className="rounded-full bg-unze-surface-muted px-2 py-0.5 text-[10px] font-semibold text-unze-ink-secondary">
              {roleLabel}
            </span>
          )}
        </div>

        {community && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <PlatformBadge platform={community.platformType} variant="icon" />
            <Link
              href={`/community/${community.slug}`}
              className="truncate text-xs font-semibold text-unze-green-dark hover:underline"
            >
              {community.title}
            </Link>
            {community.isVerified && (
              <BadgeCheck className="h-3 w-3 shrink-0 text-unze-green" aria-hidden />
            )}
            {community.isTrending && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                <TrendingUp className="h-2.5 w-2.5" aria-hidden />
                Trend
              </span>
            )}
          </div>
        )}

        {post.group && (
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-unze-ink-muted">
            <FolderOpen className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{post.group.title}</span>
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <PostTypeBadge postType={post.postType} />
          {post.isPinned && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              Angepinnt
            </span>
          )}
          {post.feedSource === "explore" && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
              Entdecken
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function PostTypeBadge({ postType }: { postType: FeedPost["postType"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        POST_TYPE_STYLES[postType],
      )}
    >
      {POST_TYPE_LABELS[postType]}
    </span>
  );
}

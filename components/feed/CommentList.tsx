import type { CommentView } from "@/types/comment";
import { formatFeedRelativeDate } from "@/lib/feed/format-date";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface CommentListProps {
  comments: CommentView[];
  emptyMessage?: string;
}

export function CommentList({
  comments,
  emptyMessage = "Noch keine Kommentare — sei der Erste.",
}: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-unze-ink-secondary">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3" data-testid="comment-list">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-2xl border border-unze-border/60 bg-unze-surface-muted/40 px-3 py-3"
        >
          <div className="mb-2 flex items-center gap-2">
            <UserAvatar
              name={comment.authorName}
              seed={comment.authorId}
              avatarUrl={comment.authorAvatarUrl}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-unze-ink">
                {comment.authorName}
              </span>
              <span className="text-[11px] text-unze-ink-muted">
                {formatFeedRelativeDate(comment.createdAt)}
              </span>
            </div>
          </div>
          <p className="whitespace-pre-wrap pl-10 text-sm leading-relaxed text-unze-ink-secondary">
            {comment.content}
          </p>
        </li>
      ))}
    </ul>
  );
}

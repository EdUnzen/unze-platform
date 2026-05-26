import type { CommentView } from "@/types/comment";
import { formatFeedRelativeDate } from "@/lib/feed/format-date";

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
          className="rounded-2xl bg-unze-surface-muted/50 px-3 py-2.5"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-unze-ink">
              {comment.authorName}
            </span>
            <span className="text-[11px] text-unze-ink-muted">
              {formatFeedRelativeDate(comment.createdAt)}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-unze-ink-secondary">
            {comment.content}
          </p>
        </li>
      ))}
    </ul>
  );
}

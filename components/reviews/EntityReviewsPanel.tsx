"use client";

import {
  submitReviewAction,
  submitReviewCommentAction,
} from "@/app/review/actions";
import { RatingSummary } from "@/components/ui/RatingSummary";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { hasReviews } from "@/lib/utils/ratings";
import type { EntityReviewContext, ReviewWithComments } from "@/types/review";
import { Star } from "lucide-react";
import { useActionState } from "react";

interface EntityReviewsPanelProps {
  context: EntityReviewContext;
  items: ReviewWithComments[];
  isLoggedIn: boolean;
}

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

function StarRatingInput({ name }: { name: string }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <label key={value} className="cursor-pointer">
          <input type="radio" name={name} value={value} className="peer sr-only" required />
          <Star className="h-6 w-6 text-unze-border peer-checked:fill-amber-400 peer-checked:text-amber-400 hover:text-amber-300" />
        </label>
      ))}
    </div>
  );
}

export function EntityReviewsPanel({
  context,
  items,
  isLoggedIn,
}: EntityReviewsPanelProps) {
  const boundReview = submitReviewAction.bind(
    null,
    context.target,
    context.targetId,
    context.returnPath,
  );
  const [reviewState, reviewAction, reviewPending] = useActionState(boundReview, null);

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-unze-ink">Bewertungen</h2>
        {hasReviews(items.length) && (
          <RatingSummary
            rating={context.rating}
            reviewCount={items.length}
            className="text-sm font-semibold text-unze-ink"
          />
        )}
      </header>

      {isLoggedIn && context.canReview && (
        <form action={reviewAction} className="mb-6 space-y-3 rounded-2xl border border-unze-border/80 bg-unze-surface-muted/30 p-3">
          <p className="text-xs font-medium text-unze-ink-secondary">
            Bewertung für {context.title}
          </p>
          <StarRatingInput name="rating" />
          <input name="title" className={inputClass} placeholder="Titel (optional)" />
          <textarea
            name="body"
            required
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Deine Erfahrung mit dieser Community oder Gruppe…"
          />
          {reviewState?.error && (
            <p className="text-xs text-red-600">{reviewState.error}</p>
          )}
          <button
            type="submit"
            disabled={reviewPending}
            className="rounded-xl bg-unze-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {reviewPending ? "…" : "Bewertung abgeben"}
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-xs text-unze-ink-secondary">
          Noch keine Bewertungen. Mitglieder können als Erste bewerten.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map(({ review, comments }) => (
            <ReviewItem
              key={review.id}
              review={review}
              comments={comments}
              context={context}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewItem({
  review,
  comments,
  context,
  isLoggedIn,
}: {
  review: ReviewWithComments["review"];
  comments: ReviewWithComments["comments"];
  context: EntityReviewContext;
  isLoggedIn: boolean;
}) {
  const boundComment = submitReviewCommentAction.bind(
    null,
    review.id,
    context.target,
    context.returnPath,
  );
  const [commentState, commentAction, commentPending] = useActionState(boundComment, null);

  return (
    <li className="rounded-2xl border border-unze-border/80 p-3">
      <div className="mb-2 flex items-start gap-3">
        <UserAvatar name={review.authorName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-unze-ink">{review.authorName}</p>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {review.rating}
            </span>
          </div>
          {review.title && (
            <p className="text-sm font-medium text-unze-ink">{review.title}</p>
          )}
          <p className="mt-1 text-sm text-unze-ink-secondary">{review.body}</p>
          <p className="mt-1 text-[10px] text-unze-ink-muted">
            {new Date(review.createdAt).toLocaleDateString("de-DE")}
          </p>
        </div>
      </div>

      {comments.length > 0 && (
        <ul className="mb-3 ml-4 space-y-2 border-l-2 border-unze-border/60 pl-3">
          {comments.map((comment) => (
            <li key={comment.id} className="text-sm">
              <span className="font-medium text-unze-ink">{comment.authorName}: </span>
              <span className="text-unze-ink-secondary">{comment.body}</span>
            </li>
          ))}
        </ul>
      )}

      {isLoggedIn && (
        <form action={commentAction} className="flex gap-2">
          <input
            name="body"
            required
            className={`${inputClass} flex-1 py-2`}
            placeholder="Kommentar zur Bewertung…"
          />
          <button
            type="submit"
            disabled={commentPending}
            className="shrink-0 rounded-xl border border-unze-border px-3 py-2 text-xs font-semibold text-unze-ink disabled:opacity-60"
          >
            {commentPending ? "…" : "Antworten"}
          </button>
          {commentState?.error && (
            <p className="text-xs text-red-600">{commentState.error}</p>
          )}
        </form>
      )}
    </li>
  );
}

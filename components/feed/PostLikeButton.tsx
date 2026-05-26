"use client";

import { togglePostLikeAction } from "@/app/post/actions";
import { cn } from "@/lib/utils/cn";
import { Heart } from "lucide-react";
import { useOptimistic, useTransition } from "react";

interface PostLikeButtonProps {
  postId: string;
  likeCount: number;
  isLiked: boolean;
  isLoggedIn: boolean;
}

export function PostLikeButton({
  postId,
  likeCount,
  isLiked,
  isLoggedIn,
}: PostLikeButtonProps) {
  const [pending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic(
    { likeCount, isLiked },
    (current, next: { likeCount: number; isLiked: boolean }) => next,
  );

  function handleClick() {
    if (!isLoggedIn || pending) return;

    startTransition(async () => {
      setOptimistic({
        isLiked: !state.isLiked,
        likeCount: state.isLiked
          ? Math.max(0, state.likeCount - 1)
          : state.likeCount + 1,
      });
      await togglePostLikeAction(postId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isLoggedIn || pending}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition active:scale-95",
        state.isLiked
          ? "bg-red-50 text-red-600"
          : "bg-unze-surface-muted text-unze-ink-secondary",
        !isLoggedIn && "cursor-not-allowed opacity-60",
      )}
      aria-pressed={state.isLiked}
      aria-label={state.isLiked ? "Like entfernen" : "Gefällt mir"}
    >
      <Heart
        className={cn("h-3.5 w-3.5", state.isLiked && "fill-current")}
        aria-hidden
      />
      {state.likeCount}
    </button>
  );
}

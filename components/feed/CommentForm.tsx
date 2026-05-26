"use client";

import { createCommentAction } from "@/app/post/actions";
import { cn } from "@/lib/utils/cn";
import { Send } from "lucide-react";
import { useActionState } from "react";

const inputClass =
  "flex-1 rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const bound = createCommentAction.bind(null, postId);
  const [state, formAction, pending] = useActionState(bound, null);

  return (
    <form action={formAction} className="flex gap-2">
      <input
        name="content"
        required
        maxLength={2000}
        placeholder="Kommentar schreiben…"
        className={inputClass}
        disabled={pending}
      />
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-unze-green text-white",
          "disabled:opacity-60 active:scale-95",
        )}
        aria-label="Kommentar senden"
      >
        <Send className="h-4 w-4" aria-hidden />
      </button>
      {state?.error && (
        <p className="absolute mt-12 text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}

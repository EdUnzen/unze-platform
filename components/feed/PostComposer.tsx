"use client";

import { createPostAction } from "@/app/create/post-actions";
import type { ManagedCommunity } from "@/types/dashboard";
import { useActionState } from "react";

interface PostComposerProps {
  communities: ManagedCommunity[];
}

export function PostComposer({ communities }: PostComposerProps) {
  const [state, action, pending] = useActionState(createPostAction, null);

  return (
    <form action={action} className="space-y-4" data-testid="post-composer">
      {communities.length > 0 && (
        <div>
          <label
            htmlFor="communityId"
            className="mb-1 block text-sm font-medium text-unze-ink"
          >
            Community (optional)
          </label>
          <select
            id="communityId"
            name="communityId"
            className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm"
          >
            <option value="">Öffentlicher Beitrag</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-unze-ink">
          Titel (optional)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={120}
          placeholder="Kurzer Titel"
          className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium text-unze-ink">
          Inhalt *
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={5}
          placeholder="Was möchtest du teilen?"
          className="w-full resize-none rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm"
        />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Wird veröffentlicht…" : "Beitrag veröffentlichen"}
      </button>
    </form>
  );
}

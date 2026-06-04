"use client";

import { createPostAction } from "@/app/create/post-actions";
import { ExternalContentPolicyNotice } from "@/components/external/ExternalContentPolicyNotice";
import {
  COMPOSER_POST_TYPES,
  POST_TYPE_DESCRIPTIONS,
  POST_TYPE_LABELS,
} from "@/lib/constants/posts";
import type { CommunityGroup } from "@/types/community";
import type { ManagedCommunity } from "@/types/dashboard";
import type { PostType } from "@/types/database";
import { useActionState, useMemo, useState } from "react";

export interface ComposerCommunity extends ManagedCommunity {
  groups: CommunityGroup[];
}

interface PostComposerProps {
  communities: ComposerCommunity[];
}

export function PostComposer({ communities }: PostComposerProps) {
  const [state, action, pending] = useActionState(createPostAction, null);
  const [communityId, setCommunityId] = useState("");
  const [postType, setPostType] = useState<PostType>("text");

  const groups = useMemo(
    () => communities.find((c) => c.id === communityId)?.groups ?? [],
    [communities, communityId],
  );

  const showMedia = postType === "image";
  const showEventFields = postType === "event";
  const showExternalLink = postType === "community_update";

  return (
    <form action={action} className="space-y-4" data-testid="post-composer">
      {communities.length > 0 && (
        <div>
          <label htmlFor="communityId" className="mb-1 block text-sm font-medium text-unze-ink">
            Community
          </label>
          <select
            id="communityId"
            name="communityId"
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
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

      {groups.length > 0 && (
        <div>
          <label htmlFor="groupId" className="mb-1 block text-sm font-medium text-unze-ink">
            Gruppe (optional)
          </label>
          <select
            id="groupId"
            name="groupId"
            className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm"
          >
            <option value="">Gesamte Community</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="postType" className="mb-1 block text-sm font-medium text-unze-ink">
          Beitragstyp
        </label>
        <select
          id="postType"
          name="postType"
          value={postType}
          onChange={(e) => setPostType(e.target.value as PostType)}
          className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm"
        >
          {COMPOSER_POST_TYPES.map((type) => (
            <option key={type} value={type}>
              {POST_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        {POST_TYPE_DESCRIPTIONS[postType] && (
          <p className="mt-1 text-xs text-unze-ink-muted">
            {POST_TYPE_DESCRIPTIONS[postType]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-unze-ink">
          Titel (optional)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={120}
          placeholder="z. B. Turnier heute Abend"
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
          placeholder={
            postType === "community_update"
              ? "z. B. Neues Coaching-Angebot oder Community-Update"
              : postType === "event"
                ? "Beschreibung zum Event (Datum unten)"
                : "Ankündigung für deine Community"
          }
          className="w-full resize-none rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm"
        />
      </div>

      {showExternalLink && (
        <div>
          <label htmlFor="externalUrl" className="mb-1 block text-sm font-medium text-unze-ink">
            Link zu Service oder externem Inhalt (optional)
          </label>
          <input
            id="externalUrl"
            name="externalUrl"
            type="url"
            placeholder="https://youtube.com/watch?v=…"
            className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm"
          />
          <p className="mt-1 text-xs text-unze-ink-muted">
            Wird eingebettet oder verlinkt — UNZE lädt fremde Videos nicht neu hoch.
          </p>
        </div>
      )}

      {showMedia && (
        <div>
          <label htmlFor="mediaUrls" className="mb-1 block text-sm font-medium text-unze-ink">
            Eigene Bild-URLs (optional, eine pro Zeile)
          </label>
          <textarea
            id="mediaUrls"
            name="mediaUrls"
            rows={3}
            placeholder="https://… (nur eigene/erlaubte Bilder — keine YouTube/TikTok-Links)"
            className="w-full resize-none rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm"
          />
          <p className="mt-1 text-xs text-unze-ink-muted">
            Plattform-Links (YouTube, TikTok, …) bitte oben eintragen — kein Re-Upload.
          </p>
        </div>
      )}

      <ExternalContentPolicyNotice />

      {showEventFields && (
        <>
          <div>
            <label htmlFor="eventAt" className="mb-1 block text-sm font-medium text-unze-ink">
              Event-Datum & Uhrzeit
            </label>
            <input
              id="eventAt"
              name="eventAt"
              type="datetime-local"
              className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-medium text-unze-ink">
              Ort / Plattform
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Discord Voice / UNZE / vor Ort"
              className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm"
            />
          </div>
        </>
      )}

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

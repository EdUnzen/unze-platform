"use client";

import { createEventAction } from "@/app/dashboard/event-actions";
import { ActionSuccessBanner } from "@/components/ui/ActionSuccessBanner";
import { CommunityCoverVisual } from "@/components/visual/CommunityCoverVisual";
import {
  DEFAULT_EVENT_COVER_GRADIENT,
  DEFAULT_EVENT_COVER_URL,
} from "@/lib/constants/event-banners";
import { slugifyTitle } from "@/lib/utils/slug";
import { Camera } from "lucide-react";
import { useActionState, useRef, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface EventManagerProps {
  communityId: string;
  slug: string;
  communityBannerUrl?: string | null;
}

export function EventManager({
  slug,
  communityId,
  communityBannerUrl,
}: EventManagerProps) {
  const bound = createEventAction.bind(null, communityId, slug);
  const [state, action, pending] = useActionState(bound, null);
  const [title, setTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fallbackCover = communityBannerUrl ?? DEFAULT_EVENT_COVER_URL;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <h2 className="mb-1 text-base font-semibold text-unze-ink">Event erstellen</h2>
      <p className="mb-4 text-sm text-unze-ink-secondary">
        Termine erscheinen auf der Community-Seite und in Discover.
      </p>

      <form action={action} encType="multipart/form-data" className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl">
          <CommunityCoverVisual
            seed={`event-preview-${slug}`}
            bannerGradient={DEFAULT_EVENT_COVER_GRADIENT}
            imageUrl={previewUrl ?? fallbackCover}
            fallbackImageUrl={DEFAULT_EVENT_COVER_URL}
            className="h-32"
            overlay="card"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-unze-green px-3 py-2 text-xs font-semibold text-white shadow-lg"
          >
            <Camera className="h-4 w-4" aria-hidden />
            Eventbild
          </button>
          <input
            ref={fileRef}
            type="file"
            name="coverFile"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                setPreviewUrl(null);
                return;
              }
              setPreviewUrl(URL.createObjectURL(file));
            }}
          />
        </div>

        <input
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Event-Titel"
        />
        <input
          name="eventSlug"
          className={inputClass}
          placeholder="Slug (optional)"
          defaultValue={slugifyTitle(title)}
        />
        <textarea
          name="description"
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Beschreibung"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-unze-ink-secondary">Start</span>
            <input name="startsAt" type="datetime-local" required className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-unze-ink-secondary">Ende (optional)</span>
            <input name="endsAt" type="datetime-local" className={inputClass} />
          </label>
        </div>
        <input name="location" className={inputClass} placeholder="Ort (optional)" />
        <input name="externalUrl" className={inputClass} placeholder="Externer Link (optional)" />
        <label className="flex items-center gap-2 text-sm text-unze-ink-secondary">
          <input type="checkbox" name="isPublic" defaultChecked className="rounded" />
          Öffentlich sichtbar
        </label>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <ActionSuccessBanner message="Event erstellt" />}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "…" : "Event anlegen"}
        </button>
      </form>
    </section>
  );
}

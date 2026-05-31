"use client";

import { createEventAction } from "@/app/dashboard/event-actions";
import { slugifyTitle } from "@/lib/utils/slug";
import { useActionState, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface EventManagerProps {
  communityId: string;
  slug: string;
}

export function EventManager({ communityId, slug }: EventManagerProps) {
  const bound = createEventAction.bind(null, communityId, slug);
  const [state, action, pending] = useActionState(bound, null);
  const [title, setTitle] = useState("");

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <h2 className="mb-1 text-base font-semibold text-unze-ink">Event erstellen</h2>
      <p className="mb-4 text-sm text-unze-ink-secondary">
        Termine erscheinen auf der Community-Seite und in Discover.
      </p>

      <form action={action} className="space-y-3">
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
        {!state?.error && state && Object.keys(state).length === 0 && (
          <p className="text-sm text-unze-green">Event erstellt.</p>
        )}
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

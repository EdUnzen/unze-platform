"use client";

import { createGroupAction, deleteGroupAction } from "@/app/community/actions";
import type { CommunityGroup } from "@/types/community";
import { slugifyTitle } from "@/lib/utils/slug";
import { Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface CommunityGroupManagerProps {
  communityId: string;
  slug: string;
  groups: CommunityGroup[];
}

export function CommunityGroupManager({
  communityId,
  slug,
  groups,
}: CommunityGroupManagerProps) {
  const boundCreate = createGroupAction.bind(null, communityId, slug);
  const [state, formAction, pending] = useActionState(boundCreate, null);
  const [deletePending, startDelete] = useTransition();
  const [groupTitle, setGroupTitle] = useState("");

  return (
    <section className="mt-8 rounded-3xl bg-white p-4 shadow-card">
      <h2 className="mb-1 text-base font-semibold text-unze-ink">
        Gruppen verwalten
      </h2>
      <p className="mb-4 text-sm text-unze-ink-secondary">
        Organisiere deine Community in Gruppen (z. B. Channels, Themen).
      </p>

      {groups.length > 0 && (
        <ul className="mb-4 space-y-2">
          {groups.map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between rounded-xl bg-unze-surface-muted px-3 py-2"
            >
              <span className="text-sm font-medium text-unze-ink">{g.title}</span>
              <button
                type="button"
                disabled={deletePending}
                onClick={() =>
                  startDelete(async () => {
                    await deleteGroupAction(g.id, communityId, slug);
                  })
                }
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                aria-label={`Gruppe ${g.title} löschen`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="space-y-3 border-t border-unze-border pt-4">
        <input
          name="groupTitle"
          required
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          className={inputClass}
          placeholder="Gruppenname"
        />
        <input
          name="groupSlug"
          className={inputClass}
          placeholder="Slug (optional)"
          defaultValue={slugifyTitle(groupTitle)}
        />
        <textarea
          name="groupDescription"
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="Kurzbeschreibung"
        />
        <label className="flex items-center gap-2 text-sm text-unze-ink-secondary">
          <input type="checkbox" name="groupIsPublic" defaultChecked className="rounded" />
          Öffentlich sichtbar
        </label>
        <label className="block text-sm text-unze-ink-secondary">
          Typ
          <select name="groupType" className={`${inputClass} mt-1`} defaultValue="group">
            <option value="group">Gruppe</option>
            <option value="service">Dienstleistung</option>
          </select>
        </label>
        <input
          name="groupPriceCents"
          type="number"
          min={0}
          step="0.01"
          className={inputClass}
          placeholder="Preis in EUR (optional, für Dienstleistungen)"
        />
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "…" : "Gruppe hinzufügen"}
        </button>
      </form>
    </section>
  );
}

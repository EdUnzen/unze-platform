"use client";

import {
  createGroupAction,
  deleteGroupAction,
  toggleGroupPublicAction,
  updateGroupAction,
} from "@/app/community/actions";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import type { CommunityGroup } from "@/types/community";
import { slugifyTitle } from "@/lib/utils/slug";
import { Eye, EyeOff, Pencil, Trash2, Wrench } from "lucide-react";
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
  const [createState, formAction, createPending] = useActionState(boundCreate, null);
  const [actionPending, startAction] = useTransition();
  const [groupTitle, setGroupTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const serviceCount = groups.filter((g) => g.groupType === "service").length;

  function showResult(result: { error?: string; success?: boolean; message?: string }) {
    if (result.error) setFeedback({ type: "error", message: result.error });
    else if (result.message)
      setFeedback({ type: "success", message: result.message });
  }

  return (
    <section className="mt-8 rounded-3xl bg-white p-4 shadow-card">
      <h2 className="mb-1 text-base font-semibold text-unze-ink">
        Gruppen & Services verwalten
      </h2>
      <p className="mb-4 text-sm text-unze-ink-secondary">
        Organisiere deine Community in Gruppen oder biete Services an
        {serviceCount > 0 ? ` (${serviceCount} Service${serviceCount === 1 ? "" : "s"})` : ""}.
      </p>

      {feedback && (
        <ActionFeedback variant={feedback.type} className="mb-4">
          {feedback.message}
        </ActionFeedback>
      )}

      {createState?.error && (
        <ActionFeedback variant="error" className="mb-4">
          {createState.error}
        </ActionFeedback>
      )}
      {createState?.success && createState.message && (
        <ActionFeedback variant="success" className="mb-4">
          {createState.message}
        </ActionFeedback>
      )}

      {groups.length > 0 && (
        <ul className="mb-4 space-y-2">
          {groups.map((g) => {
            const isEditing = editingId === g.id;
            const boundUpdate = updateGroupAction.bind(null, g.id, communityId, slug);
            const isService = g.groupType === "service";

            if (isEditing) {
              return (
                <li key={g.id} className="rounded-2xl border border-unze-green/30 bg-unze-green-muted/10 p-3">
                  <form
                    action={async (fd) => {
                      const result = await boundUpdate(null, fd);
                      if (result.success) {
                        setEditingId(null);
                        showResult(result);
                      } else if (result.error) {
                        showResult(result);
                      }
                    }}
                    className="space-y-2"
                  >
                    <input
                      name="groupTitle"
                      required
                      defaultValue={g.title}
                      className={inputClass}
                      placeholder="Titel"
                    />
                    <textarea
                      name="groupDescription"
                      rows={2}
                      defaultValue={g.description}
                      className={`${inputClass} resize-none`}
                      placeholder="Beschreibung"
                    />
                    {isService && (
                      <input
                        name="groupPriceCents"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={
                          g.priceCents != null ? (g.priceCents / 100).toFixed(2) : ""
                        }
                        className={inputClass}
                        placeholder="Preis in EUR"
                      />
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-unze-green py-2 text-sm font-semibold text-white"
                      >
                        Speichern
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-xl border border-unze-border px-4 py-2 text-sm font-medium"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </form>
                </li>
              );
            }

            return (
              <li
                key={g.id}
                className="flex flex-col gap-2 rounded-xl bg-unze-surface-muted px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-unze-ink">{g.title}</span>
                    {isService && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-unze-green-muted px-2 py-0.5 text-[10px] font-semibold text-unze-green-dark">
                        <Wrench className="h-3 w-3" aria-hidden />
                        Service
                      </span>
                    )}
                    {!g.isPublic && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        Deaktiviert
                      </span>
                    )}
                  </div>
                  {g.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-unze-ink-secondary">
                      {g.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={actionPending}
                    onClick={() => setEditingId(g.id)}
                    className="rounded-lg p-2 text-unze-ink-secondary hover:bg-white"
                    aria-label={`${g.title} bearbeiten`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={actionPending}
                    onClick={() =>
                      startAction(async () => {
                        const result = await toggleGroupPublicAction(
                          g.id,
                          slug,
                          !g.isPublic,
                        );
                        showResult(result);
                      })
                    }
                    className="rounded-lg p-2 text-unze-ink-secondary hover:bg-white"
                    aria-label={g.isPublic ? `${g.title} deaktivieren` : `${g.title} aktivieren`}
                  >
                    {g.isPublic ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={actionPending}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `"${g.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
                        )
                      ) {
                        return;
                      }
                      startAction(async () => {
                        const result = await deleteGroupAction(g.id, communityId, slug);
                        showResult(result);
                      });
                    }}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    aria-label={`${g.title} löschen`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form action={formAction} className="space-y-3 border-t border-unze-border pt-4">
        <input
          name="groupTitle"
          required
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          className={inputClass}
          placeholder="Name (Gruppe oder Service)"
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
            <option value="service">Service / Dienstleistung</option>
          </select>
        </label>
        <input
          name="groupPriceCents"
          type="number"
          min={0}
          step="0.01"
          className={inputClass}
          placeholder="Preis in EUR (optional, für Services)"
        />
        <button
          type="submit"
          disabled={createPending}
          className="w-full rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {createPending ? "…" : "Hinzufügen"}
        </button>
      </form>
    </section>
  );
}

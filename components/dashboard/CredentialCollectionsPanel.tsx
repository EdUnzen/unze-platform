"use client";

import {
  deleteCredentialCollectionAction,
  saveCredentialCollectionAction,
} from "@/app/dashboard/requirement-actions";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import type { CredentialCollectionView } from "@/types/requirement-dashboard";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2 text-sm outline-none focus:border-unze-green";

interface RefOption {
  id: string;
  name: string;
}

interface CredentialCollectionsPanelProps {
  slug: string;
  collections: CredentialCollectionView[];
  credentials: RefOption[];
  canManage: boolean;
}

export function CredentialCollectionsPanel({
  slug,
  collections,
  credentials,
  canManage,
}: CredentialCollectionsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formState, formAction, formPending] = useActionState(
    saveCredentialCollectionAction.bind(null, slug),
    null,
  );
  const [deletePending, startDelete] = useTransition();

  if (!canManage) return null;

  const editing = collections.find((c) => c.id === editId);

  const startEdit = (collection: CredentialCollectionView) => {
    setEditId(collection.id);
    setSelectedIds(collection.credentialIds);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setSelectedIds([]);
    setShowForm(false);
  };

  const toggleCredential = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <section className="rounded-3xl border border-unze-border/60 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-unze-green" aria-hidden />
            <h3 className="text-sm font-semibold text-unze-ink">Auszeichnungs-Sammlungen</h3>
          </div>
          <p className="text-xs text-unze-ink-secondary">
            B{"ü"}ndle mehrere Auszeichnungen zu einer Sammlung f{"ü"}r
            UND-Regeln in der Requirement-Engine.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-unze-green px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Neu
          </button>
        )}
      </div>

      {showForm && (
        <form action={formAction} className="mb-4 space-y-3 rounded-2xl bg-unze-surface-muted/40 p-3">
          {editId && <input type="hidden" name="collectionId" value={editId} />}
          {selectedIds.map((id) => (
            <input key={id} type="hidden" name="credentialIds" value={id} />
          ))}

          <input
            name="name"
            required
            defaultValue={editing?.name ?? ""}
            className={inputClass}
            placeholder="Name der Sammlung"
          />
          <input
            name="description"
            defaultValue={editing?.description ?? ""}
            className={inputClass}
            placeholder="Beschreibung (optional)"
          />

          {credentials.length === 0 ? (
            <p className="text-xs text-unze-ink-muted">
              Noch keine Auszeichnungen vorhanden.
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-medium text-unze-ink">Auszeichnungen (alle erforderlich)</p>
              {credentials.map((cred) => (
                <label
                  key={cred.id}
                  className="flex items-center gap-2 rounded-lg bg-white/80 px-2 py-1.5 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(cred.id)}
                    onChange={() => toggleCredential(cred.id)}
                  />
                  {cred.name}
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={formPending}
              className="rounded-xl bg-unze-green px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {formPending ? "Speichern…" : editId ? "Aktualisieren" : "Anlegen"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-unze-border px-3 py-2 text-xs font-medium"
            >
              Abbrechen
            </button>
          </div>

          {formState?.error && <ActionFeedback variant="error">{formState.error}</ActionFeedback>}
          {formState?.success && (
            <ActionFeedback variant="success">Sammlung gespeichert</ActionFeedback>
          )}
        </form>
      )}

      {collections.length === 0 ? (
        <p className="text-xs text-unze-ink-muted">Noch keine Sammlungen angelegt.</p>
      ) : (
        <ul className="space-y-2">
          {collections.map((collection) => (
            <li
              key={collection.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-unze-border/60 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-unze-ink">{collection.name}</p>
                <p className="text-xs text-unze-ink-muted">
                  {collection.credentialIds.length} Auszeichnung
                  {collection.credentialIds.length === 1 ? "" : "en"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(collection)}
                  className="text-xs font-medium text-unze-green"
                >
                  Bearbeiten
                </button>
                <button
                  type="button"
                  disabled={deletePending}
                  onClick={() =>
                    startDelete(async () => {
                      await deleteCredentialCollectionAction(slug, collection.id);
                    })
                  }
                  className="text-red-600"
                  aria-label="Sammlung löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

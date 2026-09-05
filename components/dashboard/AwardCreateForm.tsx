"use client";

import { createBadgeAction } from "@/app/dashboard/actions";
import { CommunityBadgeIcon } from "@/components/badges/UserBadgeChip";
import { CREDENTIAL_CATEGORY_OPTIONS } from "@/lib/constants/credential-categories";
import { Plus } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { ActionSuccessBanner } from "@/components/ui/ActionSuccessBanner";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface AwardCreateFormProps {
  slug: string;
  onCreated?: (message: string) => void;
}

export function AwardCreateForm({ slug, onCreated }: AwardCreateFormProps) {
  const boundCreate = createBadgeAction.bind(null, slug);
  const [state, formAction, pending] = useActionState(boundCreate, null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("Vorschau");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (state?.success && state.message) {
      onCreated?.(state.message);
    }
  }, [state, onCreated]);

  function onIconChange(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-white p-4 shadow-card">
      <div className="mb-1 flex items-center gap-2">
        <Plus className="h-4 w-4 text-unze-green" aria-hidden />
        <h3 className="font-semibold text-unze-ink">Neue Auszeichnung</h3>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-unze-border/80 bg-unze-surface-muted/30 p-4">
        <CommunityBadgeIcon
          name={previewName}
          iconUrl={previewUrl}
          size="lg"
        />
        <div className="min-w-0 flex-1 text-xs text-unze-ink-secondary">
          <p className="font-medium text-unze-ink">Runde Medaille</p>
          <p className="mt-1">
            Optional eigenes Bild (quadratisch oder rund — wird als Kreis dargestellt).
            Ohne Bild erscheint das Standard-Abzeichen.
          </p>
        </div>
      </div>

      <input
        name="name"
        required
        className={inputClass}
        placeholder="Name der Auszeichnung"
        onChange={(e) => setPreviewName(e.target.value.trim() || "Vorschau")}
      />
      <input name="description" className={inputClass} placeholder="Beschreibung (optional)" />
      <textarea
        name="earnHint"
        className={inputClass}
        rows={2}
        placeholder="So erhältst du … (z. B. „Coaching absolvieren“ oder „Event-Check-in“)"
      />
      <select name="category" className={inputClass} defaultValue="community_award">
        {CREDENTIAL_CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select name="badgeType" className={inputClass} defaultValue="permanent">
        <option value="permanent">Dauerhaft</option>
        <option value="temporary">Temporär</option>
        <option value="event">Event-bezogen</option>
      </select>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-unze-ink-secondary">
          Badge-Bild (optional)
        </span>
        <input
          type="file"
          name="icon"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-unze-ink-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-unze-green-muted file:px-3 file:py-2 file:text-xs file:font-semibold file:text-unze-green-dark"
          onChange={(e) => onIconChange(e.target.files?.[0] ?? null)}
        />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && state.message && (
        <ActionSuccessBanner message={state.message} />
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-unze-green py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "…" : "Auszeichnung erstellen"}
      </button>
    </form>
  );
}

"use client";

import { updateBadgeAction } from "@/app/dashboard/actions";
import { CommunityBadgeIcon } from "@/components/badges/UserBadgeChip";
import { CREDENTIAL_CATEGORY_OPTIONS } from "@/lib/constants/credential-categories";
import type { CommunityBadgeView } from "@/types/dashboard";
import { useActionState, useEffect, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface AwardEditFormProps {
  slug: string;
  badge: CommunityBadgeView;
  onCancel: () => void;
  onSaved: () => void;
}

export function AwardEditForm({ slug, badge, onCancel, onSaved }: AwardEditFormProps) {
  const boundUpdate = updateBadgeAction.bind(null, slug, badge.id);
  const [state, formAction, pending] = useActionState(boundUpdate, null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(badge.iconUrl);
  const [previewName, setPreviewName] = useState(badge.name);

  useEffect(() => {
    if (state && !state.error) onSaved();
  }, [state, onSaved]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onIconChange(file: File | null) {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setPreviewUrl(badge.iconUrl);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="existingIconUrl" value={badge.iconUrl ?? ""} />

      <div className="flex items-center gap-3">
        <CommunityBadgeIcon
          name={previewName}
          badgeType={badge.badgeType}
          iconUrl={previewUrl}
          size="lg"
        />
        <p className="text-sm font-semibold text-unze-ink">Auszeichnung bearbeiten</p>
      </div>

      <input
        name="name"
        required
        defaultValue={badge.name}
        className={inputClass}
        onChange={(e) => setPreviewName(e.target.value.trim() || badge.name)}
      />
      <input
        name="description"
        defaultValue={badge.description ?? ""}
        className={inputClass}
        placeholder="Beschreibung"
      />
      <textarea
        name="earnHint"
        defaultValue={badge.earnHint ?? ""}
        className={inputClass}
        rows={2}
        placeholder="So erhältst du … (z. B. „SSL-Coaching absolvieren“)"
      />
      <select name="category" className={inputClass} defaultValue={badge.category ?? "community_award"}>
        {CREDENTIAL_CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select name="badgeType" className={inputClass} defaultValue={badge.badgeType}>
        <option value="permanent">Dauerhaft</option>
        <option value="temporary">Temporär</option>
        <option value="event">Event-bezogen</option>
      </select>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-unze-ink-secondary">
          Neues Badge-Bild (optional)
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-unze-border py-2.5 text-sm font-semibold text-unze-ink-secondary"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "…" : "Speichern"}
        </button>
      </div>
    </form>
  );
}

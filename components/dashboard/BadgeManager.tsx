"use client";

import { createBadgeAction, deleteBadgeAction } from "@/app/dashboard/actions";
import type { CommunityBadgeView } from "@/types/dashboard";
import { CommunityBadgeIcon } from "@/components/badges/UserBadgeChip";
import { Trash2 } from "lucide-react";
import { useActionState, useTransition } from "react";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface BadgeManagerProps {
  slug: string;
  badges: CommunityBadgeView[];
}

export function BadgeManager({ slug, badges }: BadgeManagerProps) {
  const boundCreate = createBadgeAction.bind(null, slug);
  const [state, formAction, pending] = useActionState(boundCreate, null);
  const [deletePending, startDelete] = useTransition();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-dashed border-unze-border bg-unze-surface-muted/50 p-4">
        <h3 className="mb-1 text-sm font-semibold text-unze-ink">
          Verifizierung (Vorbereitung)
        </h3>
        <p className="text-xs text-unze-ink-secondary">
          Community-Verifizierung wird später über Plattform- oder Creator-Freigabe
          aktiviert. Badge-System ist bereits nutzbar.
        </p>
      </section>

      {badges.length > 0 && (
        <ul className="space-y-2">
          {badges.map((badge) => (
            <li
              key={badge.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card"
            >
              <CommunityBadgeIcon name={badge.name} badgeType={badge.badgeType} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-unze-ink">{badge.name}</p>
                <p className="text-xs text-unze-ink-muted">
                  {badge.badgeType} · {badge.grantedCount} vergeben
                </p>
              </div>
              <button
                type="button"
                disabled={deletePending}
                onClick={() =>
                  startDelete(async () => {
                    await deleteBadgeAction(slug, badge.id);
                  })
                }
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                aria-label="Badge löschen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="space-y-3 rounded-3xl bg-white p-4 shadow-card">
        <h3 className="font-semibold text-unze-ink">Neues Badge</h3>
        <input name="name" required className={inputClass} placeholder="Badge-Name" />
        <input name="description" className={inputClass} placeholder="Beschreibung (optional)" />
        <select name="badgeType" className={inputClass} defaultValue="permanent">
          <option value="permanent">Permanent</option>
          <option value="temporary">Temporär</option>
          <option value="event">Event</option>
        </select>
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-unze-green py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "…" : "Badge erstellen"}
        </button>
        <p className="text-xs text-unze-ink-muted">
          Badges können an Mitglieder über die Mitgliederliste vergeben werden.
        </p>
      </form>
    </div>
  );
}

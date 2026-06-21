"use client";

import { deleteBadgeAction } from "@/app/dashboard/actions";
import type { CommunityBadgeView } from "@/types/dashboard";
import { CommunityBadgeIcon } from "@/components/badges/UserBadgeChip";
import { Award, Trash2 } from "lucide-react";
import { useTransition } from "react";

interface AuszeichnungenPanelProps {
  slug: string;
  badges: CommunityBadgeView[];
}

export function AuszeichnungenPanel({ slug, badges }: AuszeichnungenPanelProps) {
  const [deletePending, startDelete] = useTransition();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-unze-green/20 bg-unze-green-muted/25 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Award className="h-5 w-5 text-unze-green" aria-hidden />
          <h3 className="text-sm font-semibold text-unze-ink">
            Auszeichnungen & Qualifikationen
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-unze-ink-secondary">
          Auszeichnungen werden automatisch durch Plattformaktivit{"\u00e4"}t (Community,
          Gruppe, Event, Produkt) oder manuell durch Moderation vergeben. Creator erstellen
          keine eigenen Badge-Typen mehr.
        </p>
        <p className="mt-2 text-xs text-unze-ink-muted">
          Vergabe an Mitglieder: Mitgliederliste {"\u2192"} Auszeichnung vergeben.
        </p>
      </section>

      {badges.length === 0 ? (
        <div className="rounded-3xl bg-white py-12 text-center shadow-card">
          <Award className="mx-auto mb-3 h-10 w-10 text-unze-ink-muted" aria-hidden />
          <p className="text-sm font-medium text-unze-ink">Noch keine Auszeichnungen</p>
          <p className="mt-1 text-xs text-unze-ink-secondary">
            Sobald automatische oder manuelle Vergaben stattfinden, erscheinen sie hier.
          </p>
        </div>
      ) : (
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
                  {badge.badgeType} {"\u00b7"} {badge.grantedCount} vergeben
                </p>
                {badge.description && (
                  <p className="mt-1 text-xs text-unze-ink-secondary">{badge.description}</p>
                )}
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
                aria-label="Auszeichnung entfernen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

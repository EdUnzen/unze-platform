"use client";

import { deleteBadgeAction } from "@/app/dashboard/actions";
import { AwardCreateForm } from "@/components/dashboard/AwardCreateForm";
import { AwardEditForm } from "@/components/dashboard/AwardEditForm";
import { ActionSuccessBanner } from "@/components/ui/ActionSuccessBanner";
import { CommunityBadgeIcon } from "@/components/badges/UserBadgeChip";
import { getCredentialDisplayTerm } from "@/lib/constants/credential-categories";
import type { CommunityBadgeView } from "@/types/dashboard";
import { Archive, Award, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface AuszeichnungenPanelProps {
  slug: string;
  badges: CommunityBadgeView[];
  canCreateAwards: boolean;
  canGrantAwards: boolean;
}

export function AuszeichnungenPanel({
  slug,
  badges,
  canCreateAwards,
  canGrantAwards,
}: AuszeichnungenPanelProps) {
  const router = useRouter();
  const [archivePending, startArchive] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {feedback && (
        <ActionSuccessBanner message={feedback} />
      )}
      <section className="rounded-3xl border border-unze-green/20 bg-unze-green-muted/25 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Award className="h-5 w-5 text-unze-green" aria-hidden />
          <h3 className="text-sm font-semibold text-unze-ink">
            Auszeichnungen & Qualifikationen
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-unze-ink-secondary">
          Runde Medaillen mit optionalem Bild. Unter „So erhältst du …“ festhalten, wie Mitglieder
          die Auszeichnung bekommen — sichtbar in der Community-Übersicht.
        </p>
        {canGrantAwards && (
          <p className="mt-2 text-xs text-unze-ink-muted">
            Vergabe: Mitgliederliste → Auszeichnung vergeben.
          </p>
        )}
      </section>

      {badges.length === 0 ? (
        <div className="rounded-3xl bg-white py-12 text-center shadow-card">
          <Award className="mx-auto mb-3 h-10 w-10 text-unze-ink-muted" aria-hidden />
          <p className="text-sm font-medium text-unze-ink">Noch keine Auszeichnungen</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {badges.map((badge) => (
            <li key={badge.id} className="rounded-2xl bg-white shadow-card">
              {editingId === badge.id && canCreateAwards ? (
                <div className="p-4">
                  <AwardEditForm
                    slug={slug}
                    badge={badge}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => {
                      setEditingId(null);
                      setFeedback("Auszeichnung gespeichert");
                      router.refresh();
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <CommunityBadgeIcon
                    name={badge.name}
                    badgeType={badge.badgeType}
                    iconUrl={badge.iconUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-unze-ink">{badge.name}</p>
                    <p className="text-xs text-unze-ink-muted">
                      {getCredentialDisplayTerm(badge.category)} · {badge.grantedCount} vergeben
                    </p>
                    {badge.description && (
                      <p className="mt-1 text-xs text-unze-ink-secondary">{badge.description}</p>
                    )}
                    {badge.earnHint && (
                      <p className="mt-1 text-xs text-unze-green-dark">
                        So erhältst du: {badge.earnHint}
                      </p>
                    )}
                  </div>
                  {canCreateAwards && (
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(badge.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-unze-green hover:bg-unze-green-muted/40"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        disabled={archivePending}
                        onClick={() =>
                          startArchive(async () => {
                            setFeedback(null);
                            const result = await deleteBadgeAction(slug, badge.id);
                            if (result.error) return;
                            setFeedback(
                              result.message ?? "Auszeichnung archiviert",
                            );
                            router.refresh();
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                      >
                        <Archive className="h-4 w-4" aria-hidden />
                        Archivieren
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {canCreateAwards && editingId === null && (
        <AwardCreateForm
          slug={slug}
          onCreated={(message) => {
            setFeedback(message);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

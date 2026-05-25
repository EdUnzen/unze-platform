"use client";

import {
  banMemberAction,
  liftRestrictionAction,
} from "@/app/dashboard/lifecycle-actions";
import type { CommunityMemberRestriction } from "@/types/lifecycle";
import { Ban, ShieldOff, User } from "lucide-react";
import { useTransition, useState } from "react";

interface RestrictionsPanelProps {
  slug: string;
  restrictions: CommunityMemberRestriction[];
  canBan: boolean;
}

const TYPE_LABELS = {
  ban: "Ausschluss",
  cooldown: "Rejoin-Schutz",
  removed_block: "Entfernt",
};

export function RestrictionsPanel({
  slug,
  restrictions,
  canBan,
}: RestrictionsPanelProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!canBan) return null;

  const handleLift = (restrictionId: string) => {
    startTransition(async () => {
      setError(null);
      const result = await liftRestrictionAction(slug, restrictionId);
      if (result.error) setError(result.error);
    });
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-card">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-unze-ink">
        <Ban className="h-4 w-4 text-red-500" aria-hidden />
        Ausschlüsse & Rejoin-Schutz
      </h3>

      {restrictions.length === 0 ? (
        <p className="text-xs text-unze-ink-muted">Keine aktiven Einschränkungen.</p>
      ) : (
        <ul className="space-y-2">
          {restrictions.map((r) => {
            const name = r.displayName ?? r.username ?? "Nutzer";
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-xl bg-unze-surface-muted px-3 py-2 text-xs"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <User className="h-4 w-4 text-unze-ink-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-unze-ink">{name}</p>
                  <p className="text-unze-ink-muted">
                    {TYPE_LABELS[r.restrictionType]}
                    {r.reason && ` · ${r.reason}`}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleLift(r.id)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-unze-green"
                >
                  <ShieldOff className="h-3.5 w-3.5" />
                  Aufheben
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

export function BanMemberButton({
  slug,
  memberId,
  userId,
  memberName,
}: {
  slug: string;
  memberId: string;
  userId: string;
  memberName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (open) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm font-semibold text-unze-ink">
            {memberName} ausschließen
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Grund (optional)"
            className="mt-3 w-full resize-none rounded-xl border border-unze-border px-3 py-2 text-sm"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border border-unze-border py-2.5 text-sm"
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={pending}
              data-testid={`ban-member-confirm-${memberId}`}
              onClick={() => {
                startTransition(async () => {
                  await banMemberAction(
                    slug,
                    memberId,
                    userId,
                    reason.trim() || undefined,
                  );
                  setOpen(false);
                  setReason("");
                });
              }}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Ausschließen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => setOpen(true)}
      data-testid={`ban-member-${memberId}`}
      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
      aria-label={`${memberName} ausschließen`}
      title="Ausschließen / Bann"
    >
      <Ban className="h-4 w-4" />
    </button>
  );
}

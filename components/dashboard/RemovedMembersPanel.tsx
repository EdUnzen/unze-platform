"use client";

import { restoreMemberAction } from "@/app/dashboard/governance-actions";
import { RotateCcw } from "lucide-react";
import { useTransition } from "react";

interface RemovedMembersPanelProps {
  slug: string;
  members: {
    id: string;
    userId: string;
    role: string;
    deletedAt: string;
    displayName: string | null;
  }[];
}

export function RemovedMembersPanel({ slug, members }: RemovedMembersPanelProps) {
  const [pending, startTransition] = useTransition();

  if (members.length === 0) return null;

  return (
    <section className="mt-6 rounded-2xl border border-unze-border bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-unze-ink">
        Entfernte Mitglieder ({members.length})
      </h3>
      <ul className="space-y-2">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-2 rounded-xl bg-unze-surface-muted/30 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-unze-ink">
                {m.displayName ?? "Unbekannt"}
              </p>
              <p className="text-[10px] text-unze-ink-muted">
                Entfernt {new Date(m.deletedAt).toLocaleDateString("de-DE")}
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await restoreMemberAction(slug, m.id, m.userId);
                })
              }
              className="inline-flex items-center gap-1 rounded-lg bg-unze-green-muted px-2.5 py-1 text-[11px] font-semibold text-unze-green-dark"
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              Wiederherstellen
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

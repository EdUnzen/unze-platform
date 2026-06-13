"use client";

import { confirmMemberRemovalAction } from "@/app/dashboard/removal-actions";
import { removalReasonLabel } from "@/lib/lifecycle/removal-labels";
import type { MemberRemovalTaskView } from "@/types/removal";
import { UserMinus } from "lucide-react";
import { useTransition } from "react";

interface PendingRemovalPanelProps {
  slug: string;
  tasks: MemberRemovalTaskView[];
}

export function PendingRemovalPanel({ slug, tasks }: PendingRemovalPanelProps) {
  const [pending, startTransition] = useTransition();

  if (tasks.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4"
      data-testid="pending-removal-panel"
    >
      <div className="mb-3 flex items-center gap-2">
        <UserMinus className="h-5 w-5 text-amber-800" aria-hidden />
        <h3 className="text-sm font-semibold text-amber-950">
          Zu entfernen ({tasks.length})
        </h3>
      </div>
      <p className="mb-3 text-xs text-amber-900/90">
        Diese Personen haben gekündigt oder die Community verlassen. Entferne sie aus
        WhatsApp, Discord oder Telegram und bestätige anschließend hier.
      </p>
      <ul className="space-y-2">
        {tasks.map((task) => {
          const name = task.displayName ?? task.username ?? "Unbekannt";
          const periodEnd = task.metadata.currentPeriodEnd as string | undefined;

          return (
            <li
              key={task.id}
              className="flex flex-col gap-2 rounded-xl bg-white/90 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-unze-ink">{name}</p>
                <p className="text-xs text-unze-ink-secondary">
                  {removalReasonLabel(task.reason)}
                </p>
                {periodEnd && task.reason === "subscription_canceling" && (
                  <p className="mt-0.5 text-[10px] text-unze-ink-muted">
                    Zugang bis{" "}
                    {new Date(periodEnd).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
                <p className="mt-0.5 text-[10px] text-unze-ink-muted">
                  Gemeldet {new Date(task.createdAt).toLocaleDateString("de-DE")}
                </p>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await confirmMemberRemovalAction(slug, task.id);
                  })
                }
                className="shrink-0 rounded-xl bg-unze-green px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                Entfernung bestätigen
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

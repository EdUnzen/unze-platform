"use client";

import type { AuditLogEntry } from "@/types/governance";
import { ScrollText } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  role_change: "Rollen",
  application: "Anträge",
  invite: "Einladungen",
  restriction: "Sperren",
  settings: "Einstellungen",
  membership: "Mitglieder",
  moderation: "Moderation",
  community_lifecycle: "Lifecycle",
  permission: "Rechte",
};

interface AuditLogPanelProps {
  entries: AuditLogEntry[];
}

export function AuditLogPanel({ entries }: AuditLogPanelProps) {
  return (
    <section className="rounded-2xl border border-unze-border bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-unze-green" aria-hidden />
        <h2 className="font-semibold text-unze-ink">Audit-Log</h2>
        <span className="text-xs text-unze-ink-muted">{entries.length} Einträge</span>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-unze-ink-muted">Noch keine Audit-Einträge.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-unze-border/60 bg-unze-surface-muted/20 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-unze-ink">{entry.action}</p>
                  <p className="text-xs text-unze-ink-muted">
                    {entry.actorDisplayName ?? "System"} ·{" "}
                    {CATEGORY_LABELS[entry.category] ?? entry.category}
                  </p>
                </div>
                <time className="shrink-0 text-[10px] text-unze-ink-muted">
                  {new Date(entry.createdAt).toLocaleString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import {
  muteMemberAction,
  resolveReportAction,
  strikeMemberAction,
  warnMemberAction,
} from "@/app/dashboard/governance-actions";
import { REPORT_TARGET_LABELS } from "@/lib/constants/report-labels";
import type { ModerationAction, PlatformReport, ReportStatus } from "@/types/governance";
import { cn } from "@/lib/utils/cn";
import { AlertTriangle, Ban, MessageSquareOff, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Offen",
  reviewing: "In Prüfung",
  resolved: "Erledigt",
  dismissed: "Abgewiesen",
};

const ACTION_LABELS: Record<string, string> = {
  warn: "Verwarnung",
  mute: "Stummgeschaltet",
  strike: "Strike",
  ban: "Gebannt",
  unban: "Entbannt",
  lift_restriction: "Einschränkung aufgehoben",
  dismiss_report: "Meldung abgewiesen",
  restore_member: "Mitglied wiederhergestellt",
};

type ReportFilter = ReportStatus | "all";

interface ModerationPanelProps {
  slug: string;
  reports: PlatformReport[];
  history: ModerationAction[];
}

export function ModerationPanel({ slug, reports, history }: ModerationPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportFilter>("pending");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reports.length };
    for (const r of reports) {
      c[r.status] = (c[r.status] ?? 0) + 1;
    }
    return c;
  }, [reports]);

  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  function act(
    fn: () => Promise<{ error?: string; success?: boolean }>,
    successMsg: string,
  ) {
    startTransition(async () => {
      setMessage(null);
      const result = await fn();
      if (result.error) setMessage(result.error);
      else {
        setMessage(successMsg);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6" data-testid="moderation-panel">
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/dashboard/community/${slug}/requests`}
          className="rounded-full bg-unze-surface-muted px-3 py-1.5 text-xs font-medium text-unze-ink"
        >
          Beitrittsanträge
        </Link>
        <Link
          href={`/dashboard/community/${slug}/members`}
          className="rounded-full bg-unze-surface-muted px-3 py-1.5 text-xs font-medium text-unze-ink"
        >
          Mitglieder moderieren
        </Link>
        <Link
          href={`/dashboard/community/${slug}/audit`}
          className="rounded-full bg-unze-surface-muted px-3 py-1.5 text-xs font-medium text-unze-ink"
        >
          Audit-Log
        </Link>
      </div>

      {message && (
        <p
          className="rounded-xl bg-unze-green-muted px-4 py-2 text-sm text-unze-green-dark"
          role="status"
        >
          {message}
        </p>
      )}

      <section className="rounded-2xl border border-unze-border bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-unze-green" aria-hidden />
          <h2 className="font-semibold text-unze-ink">Meldungen</h2>
        </div>

        <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
          {(["all", "pending", "reviewing", "resolved", "dismissed"] as const).map(
            (key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                data-testid={`moderation-filter-${key}`}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                  filter === key
                    ? "bg-unze-green text-white"
                    : "bg-unze-surface-muted text-unze-ink-secondary",
                )}
              >
                {key === "all" ? "Alle" : STATUS_LABELS[key]}
                {counts[key] ? ` (${counts[key]})` : ""}
              </button>
            ),
          )}
        </div>

        {filteredReports.length === 0 ? (
          <p className="text-sm text-unze-ink-muted">
            {filter === "pending"
              ? "Keine offenen Meldungen."
              : "Keine Meldungen in dieser Kategorie."}
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredReports.map((report) => (
              <li
                key={report.id}
                data-testid={`moderation-report-${report.id}`}
                className="rounded-xl border border-unze-border bg-unze-surface-muted/30 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-unze-ink">
                      {report.reason}
                    </p>
                    <p className="text-xs text-unze-ink-muted">
                      Ziel: {REPORT_TARGET_LABELS[report.targetType] ?? report.targetType} · Melder:{" "}
                      {report.reporterDisplayName ??
                        report.reporterUsername ??
                        "Anonym"}
                    </p>
                    {report.details && (
                      <p className="mt-1 text-xs text-unze-ink-secondary">
                        {report.details}
                      </p>
                    )}
                    {report.resolutionNote && (
                      <p className="mt-1 text-xs text-unze-green-dark">
                        {report.resolutionNote}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      report.status === "pending" && "bg-amber-100 text-amber-800",
                      report.status === "reviewing" && "bg-blue-100 text-blue-800",
                      report.status === "resolved" && "bg-unze-green-muted text-unze-green-dark",
                      report.status === "dismissed" && "bg-unze-surface-muted text-unze-ink-muted",
                    )}
                  >
                    {STATUS_LABELS[report.status]}
                  </span>
                </div>

                {report.status === "pending" && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        act(
                          () =>
                            resolveReportAction(
                              slug,
                              report.id,
                              "resolved",
                              "Bearbeitet",
                            ),
                          "Meldung erledigt",
                        )
                      }
                      className="rounded-lg bg-unze-green px-2.5 py-1 text-[11px] font-semibold text-white"
                    >
                      Erledigen
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        act(
                          () => resolveReportAction(slug, report.id, "dismissed"),
                          "Meldung abgewiesen",
                        )
                      }
                      className="rounded-lg border border-unze-border px-2.5 py-1 text-[11px] font-medium"
                    >
                      Abweisen
                    </button>
                    {report.targetType === "user" && (
                      <>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            act(
                              () =>
                                warnMemberAction(
                                  slug,
                                  report.targetId,
                                  report.reason,
                                ),
                              "Verwarnung ausgesprochen",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Verwarnen
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            act(
                              () =>
                                strikeMemberAction(
                                  slug,
                                  report.targetId,
                                  report.reason,
                                ),
                              "Strike ausgesprochen",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-800"
                        >
                          <Ban className="h-3 w-3" />
                          Strike
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            act(
                              () =>
                                muteMemberAction(
                                  slug,
                                  report.targetId,
                                  report.reason,
                                  24,
                                ),
                              "Mitglied 24h stummgeschaltet",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-unze-border px-2.5 py-1 text-[11px] font-medium"
                        >
                          <MessageSquareOff className="h-3 w-3" />
                          24h Mute
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-unze-border bg-white p-4">
        <h2 className="mb-3 font-semibold text-unze-ink">Moderationshistorie</h2>
        {history.length === 0 ? (
          <p className="text-sm text-unze-ink-muted">Noch keine Aktionen.</p>
        ) : (
          <ul className="space-y-2">
            {history.slice(0, 30).map((action) => (
              <li
                key={action.id}
                className="flex items-start justify-between gap-2 border-b border-unze-border/50 pb-2 last:border-0"
              >
                <div>
                  <p className="text-sm text-unze-ink">
                    <span className="font-medium">
                      {ACTION_LABELS[action.actionType] ?? action.actionType}
                    </span>
                    {action.targetDisplayName && (
                      <span className="text-unze-ink-muted">
                        {" "}
                        → {action.targetDisplayName}
                      </span>
                    )}
                    {action.actorDisplayName && (
                      <span className="block text-xs text-unze-ink-muted">
                        von {action.actorDisplayName}
                      </span>
                    )}
                  </p>
                  {action.reason && (
                    <p className="text-xs text-unze-ink-secondary">{action.reason}</p>
                  )}
                </div>
                <time className="shrink-0 text-[10px] text-unze-ink-muted">
                  {new Date(action.createdAt).toLocaleDateString("de-DE")}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

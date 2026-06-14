"use client";

import {
  approveOwnerVerificationAction,
  rejectOwnerVerificationAction,
  resolveOwnerReportAction,
  revokeOwnerVerificationAction,
  suspendCommunityAction,
  suspendCreatorAction,
  unsuspendCommunityAction,
  unsuspendCreatorAction,
} from "@/app/owner/actions";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { REPORT_TARGET_LABELS } from "@/lib/constants/report-labels";
import {
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_TYPE_LABELS,
} from "@/lib/verification/constants";
import type { PlatformOverviewStats } from "@/services/platform/owner-center.service";
import type { PlatformReport } from "@/types/governance";
import type { VerificationRequest } from "@/types/verification";
import { cn } from "@/lib/utils/cn";
import {
  Ban,
  Check,
  Flag,
  LayoutGrid,
  Shield,
  ShieldCheck,
  Unlock,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type OwnerTab = "overview" | "reports" | "verifications" | "measures";

const TABS: { id: OwnerTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Übersicht", icon: LayoutGrid },
  { id: "reports", label: "Meldungen", icon: Flag },
  { id: "verifications", label: "Verifizierung", icon: ShieldCheck },
  { id: "measures", label: "Maßnahmen", icon: Shield },
];

interface OwnerCenterProps {
  initialTab: string;
  stats: PlatformOverviewStats;
  pendingReports: PlatformReport[];
  resolvedReports: PlatformReport[];
  dismissedReports: PlatformReport[];
  verifications: VerificationRequest[];
}

export function OwnerCenter({
  initialTab,
  stats,
  pendingReports,
  resolvedReports,
  dismissedReports,
  verifications,
}: OwnerCenterProps) {
  const router = useRouter();
  const tab = (TABS.some((t) => t.id === initialTab) ? initialTab : "overview") as OwnerTab;
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [reportFilter, setReportFilter] = useState<"pending" | "resolved" | "dismissed">(
    "pending",
  );
  const [communitySlug, setCommunitySlug] = useState("");
  const [creatorUsername, setCreatorUsername] = useState("");

  const filteredReports =
    reportFilter === "pending"
      ? pendingReports
      : reportFilter === "resolved"
        ? resolvedReports
        : dismissedReports;

  function run(fn: () => Promise<{ error?: string; success?: boolean; message?: string }>) {
    startTransition(async () => {
      setFeedback(null);
      const result = await fn();
      if (result.error) setFeedback({ type: "error", text: result.error });
      else setFeedback({ type: "success", text: result.message ?? "Erledigt." });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <nav
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        aria-label="Owner Center Bereiche"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <Link
            key={id}
            href={`/owner?tab=${id}`}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]",
              tab === id
                ? "bg-unze-green text-white shadow-md"
                : "border-2 border-unze-border bg-white text-unze-ink shadow-sm hover:border-unze-green/40",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>

      {feedback && (
        <ActionFeedback variant={feedback.type === "success" ? "success" : "error"}>
          {feedback.text}
        </ActionFeedback>
      )}

      {tab === "overview" && (
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { label: "Nutzer", value: stats.users },
            { label: "Communities", value: stats.communities },
            { label: "Gruppen", value: stats.groups },
            { label: "Events", value: stats.events },
            { label: "Services", value: stats.services },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white p-4 shadow-card"
            >
              <p className="text-2xl font-bold tabular-nums text-unze-ink">{item.value}</p>
              <p className="mt-0.5 text-xs font-medium text-unze-ink-secondary">{item.label}</p>
            </div>
          ))}
        </section>
      )}

      {tab === "reports" && (
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["pending", "Offen", pendingReports.length],
                ["resolved", "Bearbeitet", resolvedReports.length],
                ["dismissed", "Ignoriert", dismissedReports.length],
              ] as const
            ).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => setReportFilter(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  reportFilter === key
                    ? "bg-unze-green text-white"
                    : "bg-white text-unze-ink-secondary shadow-card",
                )}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {filteredReports.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-unze-ink-secondary shadow-card">
              Keine Meldungen in dieser Kategorie.
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredReports.map((report) => (
                <li key={report.id} className="rounded-2xl bg-white p-4 shadow-card">
                  <p className="text-sm font-medium text-unze-ink">{report.reason}</p>
                  <p className="mt-0.5 text-xs text-unze-ink-muted">
                    {REPORT_TARGET_LABELS[report.targetType]} ·{" "}
                    {report.reporterDisplayName ?? report.reporterUsername ?? "Anonym"}
                  </p>
                  {report.details && (
                    <p className="mt-1 text-xs text-unze-ink-secondary">{report.details}</p>
                  )}
                  {report.status === "pending" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(() => resolveOwnerReportAction(report.id, "resolved"))
                        }
                        className="inline-flex items-center gap-1 rounded-xl bg-unze-green px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" /> Bearbeitet
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(() => resolveOwnerReportAction(report.id, "dismissed"))
                        }
                        className="inline-flex items-center gap-1 rounded-xl border border-unze-border px-3 py-2 text-xs font-semibold disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" /> Ignorieren
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "verifications" && (
        <section className="space-y-3">
          {verifications.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-unze-ink-secondary shadow-card">
              Keine Verifizierungsanträge.
            </p>
          ) : (
            verifications.map((req) => (
              <div key={req.id} className="rounded-2xl bg-white p-4 shadow-card">
                <p className="text-sm font-semibold text-unze-ink">
                  {VERIFICATION_TYPE_LABELS[req.verificationType]}
                </p>
                <p className="text-xs text-unze-ink-muted">
                  {VERIFICATION_STATUS_LABELS[req.status]} · {req.subjectType}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["pending", "reviewing"].includes(req.status) && (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => approveOwnerVerificationAction(req.id))}
                        className="inline-flex items-center gap-1 rounded-xl bg-unze-green px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" /> Genehmigen
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          const reason = prompt("Ablehnungsgrund (optional)") ?? undefined;
                          run(() => rejectOwnerVerificationAction(req.id, reason));
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" /> Ablehnen
                      </button>
                    </>
                  )}
                  {req.status === "approved" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        run(() =>
                          revokeOwnerVerificationAction({
                            subjectType: req.subjectType,
                            subjectId: req.subjectId,
                          }),
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800 disabled:opacity-60"
                    >
                      Verifizierung entfernen
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {tab === "measures" && (
        <section className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-unze-ink">Community</h2>
            <input
              value={communitySlug}
              onChange={(e) => setCommunitySlug(e.target.value)}
              placeholder="Community-Slug (z. B. rocket-league-ssl)"
              className="mb-3 w-full rounded-xl border border-unze-border px-3 py-2.5 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending || !communitySlug.trim()}
                onClick={() => run(() => suspendCommunityAction(communitySlug.trim()))}
                className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                <Ban className="h-3.5 w-3.5" /> Sperren
              </button>
              <button
                type="button"
                disabled={pending || !communitySlug.trim()}
                onClick={() => run(() => unsuspendCommunityAction(communitySlug.trim()))}
                className="inline-flex items-center gap-1 rounded-xl bg-unze-green px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                <Unlock className="h-3.5 w-3.5" /> Freigeben
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-unze-ink">Creator</h2>
            <input
              value={creatorUsername}
              onChange={(e) => setCreatorUsername(e.target.value)}
              placeholder="Username (ohne @)"
              className="mb-3 w-full rounded-xl border border-unze-border px-3 py-2.5 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending || !creatorUsername.trim()}
                onClick={() => run(() => suspendCreatorAction(creatorUsername.trim()))}
                className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                <Ban className="h-3.5 w-3.5" /> Sperren
              </button>
              <button
                type="button"
                disabled={pending || !creatorUsername.trim()}
                onClick={() => run(() => unsuspendCreatorAction(creatorUsername.trim()))}
                className="inline-flex items-center gap-1 rounded-xl bg-unze-green px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                <Unlock className="h-3.5 w-3.5" /> Freigeben
              </button>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-unze-ink-muted">
            Community-Verwaltung bleibt beim Creator. Owner-Maßnahmen sind rechtlich notwendige
            Plattform-Eingriffe — keine Community-Moderation.
          </p>
        </section>
      )}
    </div>
  );
}

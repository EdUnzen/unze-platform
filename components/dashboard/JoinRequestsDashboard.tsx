"use client";

import {
  promoteWaitlistAction,
  reviewApplicationAction,
} from "@/app/dashboard/access-actions";
import { ApplicationAnswersPanel } from "@/components/dashboard/ApplicationAnswersPanel";
import { ApplicationProofViewer } from "@/components/dashboard/ApplicationProofViewer";
import { ApplicationStatusBadge } from "@/components/dashboard/StatusBadge";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  APPLICATION_SOURCE_LABELS,
  APPLICATION_STATUS_LABELS,
} from "@/lib/constants/access";
import type { JoinApplication, JoinApplicationStatus, JoinQuestion } from "@/types/access";
import { cn } from "@/lib/utils/cn";
import { Check, Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const STATUS_FILTERS: { value: JoinApplicationStatus | "all"; label: string }[] =
  [
    { value: "all", label: "Alle" },
    { value: "pending", label: "Offen" },
    { value: "waitlisted", label: "Warteliste" },
    { value: "accepted", label: "Angenommen" },
    { value: "rejected", label: "Abgelehnt" },
    { value: "withdrawn", label: "Zurückgezogen" },
  ];

interface JoinRequestsDashboardProps {
  slug: string;
  applications: JoinApplication[];
  statusCounts: Record<string, number>;
  canReview: boolean;
  initialFilter?: JoinApplicationStatus | "all";
  questions?: JoinQuestion[];
}

export function JoinRequestsDashboard({
  slug,
  applications,
  statusCounts,
  canReview,
  initialFilter = "all",
  questions = [],
}: JoinRequestsDashboardProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<JoinApplicationStatus | "all">(
    initialFilter,
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (!canReview) {
    return (
      <p className="text-sm text-unze-ink-muted">
        Keine Berechtigung zur Antragsprüfung.
      </p>
    );
  }

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  const handleReview = (
    applicationId: string,
    action: "accept" | "reject" | "waitlist",
    reason?: string,
  ) => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await reviewApplicationAction(
        slug,
        applicationId,
        action,
        reason,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(
        "message" in result && result.message
          ? result.message
          : "Aktion gespeichert",
      );
      setRejectingId(null);
      setRejectReason("");
      router.refresh();
    });
  };

  const handlePromoteWaitlist = () => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await promoteWaitlistAction(slug);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess("Nächster Wartelisten-Platz wurde angenommen.");
      router.refresh();
    });
  };

  const pendingCount =
    (statusCounts.pending ?? 0) + (statusCounts.waitlisted ?? 0);

  return (
    <div className="space-y-4" data-testid="join-requests-dashboard">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {(["pending", "waitlisted", "accepted", "rejected", "withdrawn"] as const).map(
          (key) => (
            <div
              key={key}
              className="rounded-xl bg-white p-3 text-center shadow-card"
            >
              <p className="text-lg font-bold text-unze-ink">
                {statusCounts[key] ?? 0}
              </p>
              <p className="text-[10px] text-unze-ink-muted">
                {APPLICATION_STATUS_LABELS[key]}
              </p>
            </div>
          ),
        )}
      </div>

      {(statusCounts.waitlisted ?? 0) > 0 && (
        <button
          type="button"
          disabled={pending}
          onClick={handlePromoteWaitlist}
          data-testid="join-promote-waitlist"
          className="w-full rounded-xl border border-unze-green bg-unze-green-muted/30 py-2.5 text-sm font-medium text-unze-green-dark disabled:opacity-60"
        >
          Nächsten von Warteliste annehmen (wenn Platz frei)
        </button>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            data-testid={`join-filter-${f.value}`}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
              filter === f.value
                ? "bg-unze-green text-white"
                : "bg-unze-surface-muted text-unze-ink-secondary",
            )}
          >
            {f.label}
            {f.value !== "all" && statusCounts[f.value]
              ? ` (${statusCounts[f.value]})`
              : ""}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white py-10 text-center shadow-card">
          <p className="text-sm font-medium text-unze-ink">
            {filter === "all"
              ? "Noch keine Beitrittsanträge"
              : `Keine Anträge: ${APPLICATION_STATUS_LABELS[filter as JoinApplicationStatus] ?? filter}`}
          </p>
          <p className="mt-1 text-xs text-unze-ink-muted">
            Bewerbungen erscheinen hier, sobald Nutzer sich bewerben.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((app) => {
            const name =
              app.applicant?.displayName ??
              app.applicant?.username ??
              "Nutzer";
            const canAct = ["pending", "waitlisted"].includes(app.status);

            return (
              <li
                key={app.id}
                data-testid={`join-request-${app.id}`}
                className="rounded-2xl bg-white p-3 shadow-card"
              >
                <div className="mb-2 flex items-start gap-3">
                  <UserAvatar
                    name={name}
                    seed={app.userId}
                    avatarUrl={app.applicant?.avatarUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-unze-ink">
                        {name}
                      </p>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-unze-ink-muted">
                      {APPLICATION_SOURCE_LABELS[app.source] ?? app.source}
                      {" · "}
                      {new Date(app.createdAt).toLocaleDateString("de-DE")}
                    </p>
                    {app.systemMessage && (
                      <p className="mt-0.5 text-xs text-unze-ink-secondary">
                        {app.systemMessage}
                      </p>
                    )}
                    {app.rejectionReason && (
                      <p className="mt-0.5 text-xs text-red-600">
                        {app.rejectionReason}
                      </p>
                    )}
                    <ApplicationAnswersPanel
                      application={app}
                      questions={questions}
                    />
                    <ApplicationProofViewer
                      slug={slug}
                      applicationId={app.id}
                      applicantUserId={app.userId}
                    />
                  </div>
                </div>

                {canAct && (
                  <>
                    {rejectingId === app.id ? (
                      <div className="space-y-2">
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Individuelle Antwort / Ablehnungsgrund"
                          className="w-full rounded-lg border border-unze-border px-3 py-2 text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              handleReview(app.id, "reject", rejectReason)
                            }
                            data-testid={`join-request-reject-${app.id}`}
                            className="flex-1 rounded-lg bg-red-50 py-2 text-xs font-medium text-red-700"
                          >
                            Ablehnen bestätigen
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingId(null)}
                            className="rounded-lg px-3 py-2 text-xs"
                          >
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleReview(app.id, "accept")}
                          data-testid={`join-request-accept-${app.id}`}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-unze-green py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Annehmen
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleReview(app.id, "waitlist")}
                          data-testid={`join-request-waitlist-${app.id}`}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-unze-border py-2.5 text-xs font-medium disabled:opacity-60"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Warteliste
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => setRejectingId(app.id)}
                          data-testid={`join-request-reject-open-${app.id}`}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-medium text-red-700 disabled:opacity-60"
                        >
                          <X className="h-3.5 w-3.5" />
                          Ablehnen
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pendingCount > 0 && filter === "all" && (
        <p className="text-center text-xs text-unze-ink-muted">
          {pendingCount} offene Anträge warten auf Prüfung
        </p>
      )}

      {success && (
        <ActionFeedback variant="success">{success}</ActionFeedback>
      )}

      {error && (
        <ActionFeedback variant="error">{error}</ActionFeedback>
      )}
    </div>
  );
}

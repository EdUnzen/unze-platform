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
import { Check, ChevronDown, Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type PrimaryFilter = "pending" | "waitlisted" | "done";

const DONE_STATUSES: JoinApplicationStatus[] = [
  "accepted",
  "rejected",
  "withdrawn",
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
  initialFilter = "pending",
  questions = [],
}: JoinRequestsDashboardProps) {
  const router = useRouter();
  const [primary, setPrimary] = useState<PrimaryFilter>(() => {
    if (initialFilter === "waitlisted") return "waitlisted";
    if (initialFilter === "all" || DONE_STATUSES.includes(initialFilter as JoinApplicationStatus)) {
      return "done";
    }
    return "pending";
  });
  const [doneStatus, setDoneStatus] = useState<JoinApplicationStatus>(() => {
    if (DONE_STATUSES.includes(initialFilter as JoinApplicationStatus)) {
      return initialFilter as JoinApplicationStatus;
    }
    return "accepted";
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => {
    if (primary === "pending") {
      return applications.filter((a) => a.status === "pending");
    }
    if (primary === "waitlisted") {
      return applications.filter((a) => a.status === "waitlisted");
    }
    return applications.filter((a) => a.status === doneStatus);
  }, [applications, primary, doneStatus]);

  if (!canReview) {
    return (
      <p className="text-sm text-unze-ink-muted">
        Keine Berechtigung zur Antragspr{"\u00fc"}fung.
      </p>
    );
  }

  const openCount = (statusCounts.pending ?? 0) + (statusCounts.waitlisted ?? 0);
  const doneCount = DONE_STATUSES.reduce(
    (sum, key) => sum + (statusCounts[key] ?? 0),
    0,
  );

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
      setSuccess("N\u00e4chster Wartelisten-Platz wurde angenommen.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4" data-testid="join-requests-dashboard">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-unze-green-muted/40 p-4 shadow-card">
          <p className="text-2xl font-bold tabular-nums text-unze-ink">{openCount}</p>
          <p className="text-xs font-medium text-unze-green-dark">Offen & Warteliste</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-2xl font-bold tabular-nums text-unze-ink">{doneCount}</p>
          <p className="text-xs font-medium text-unze-ink-muted">Erledigt</p>
        </div>
      </div>

      {(statusCounts.waitlisted ?? 0) > 0 && primary === "waitlisted" && (
        <button
          type="button"
          disabled={pending}
          onClick={handlePromoteWaitlist}
          data-testid="join-promote-waitlist"
          className="w-full rounded-xl border border-unze-green bg-unze-green-muted/30 py-2.5 text-sm font-medium text-unze-green-dark disabled:opacity-60"
        >
          N{"\u00e4"}chsten von Warteliste annehmen (wenn Platz frei)
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { value: "pending" as const, label: "Offen", count: statusCounts.pending ?? 0 },
            {
              value: "waitlisted" as const,
              label: "Warteliste",
              count: statusCounts.waitlisted ?? 0,
            },
            { value: "done" as const, label: "Erledigt", count: doneCount },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setPrimary(tab.value)}
            data-testid={`join-filter-${tab.value}`}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold",
              primary === tab.value
                ? "bg-unze-green text-white"
                : "bg-unze-surface-muted text-unze-ink-secondary",
            )}
          >
            {tab.label}
            {tab.count > 0 ? ` (${tab.count})` : ""}
          </button>
        ))}

        {primary === "done" && (
          <div className="relative ml-auto">
            <select
              value={doneStatus}
              onChange={(e) => setDoneStatus(e.target.value as JoinApplicationStatus)}
              className="appearance-none rounded-full border border-unze-border bg-white py-2 pl-3 pr-8 text-xs font-medium"
              aria-label="Erledigt-Status filtern"
            >
              {DONE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {APPLICATION_STATUS_LABELS[status]} ({statusCounts[status] ?? 0})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-unze-ink-muted" />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white py-10 text-center shadow-card">
          <p className="text-sm font-medium text-unze-ink">
            {primary === "pending"
              ? "Keine offenen Antr\u00e4ge"
              : primary === "waitlisted"
                ? "Keine Eintr\u00e4ge auf der Warteliste"
                : `Keine Antr\u00e4ge: ${APPLICATION_STATUS_LABELS[doneStatus]}`}
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
                      {" \u00b7 "}
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
                            Ablehnen best{"\u00e4"}tigen
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

      {success && <ActionFeedback variant="success">{success}</ActionFeedback>}
      {error && <ActionFeedback variant="error">{error}</ActionFeedback>}
    </div>
  );
}

"use client";

import { reviewApplicationAction } from "@/app/dashboard/access-actions";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants/access";
import type { JoinApplication } from "@/types/access";
import { Check, Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

interface ApplicationReviewListProps {
  slug: string;
  applications: JoinApplication[];
  canReview: boolean;
}

export function ApplicationReviewList({
  slug,
  applications,
  canReview,
}: ApplicationReviewListProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  if (!canReview) {
    return (
      <p className="text-sm text-unze-ink-muted">
        Keine Berechtigung zur Antragsprüfung.
      </p>
    );
  }

  const pendingApps = applications.filter((a) =>
    ["pending", "waitlisted"].includes(a.status),
  );

  const handleReview = (
    applicationId: string,
    action: "accept" | "reject" | "waitlist",
  ) => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await reviewApplicationAction(slug, applicationId, action);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(result.message ?? "Aktion erfolgreich");
      router.refresh();
    });
  };

  if (pendingApps.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-unze-ink-muted">
        Keine offenen Anträge.
      </p>
    );
  }

  return (
    <div>
      <ul className="space-y-2">
        {pendingApps.map((app) => {
          const name =
            app.applicant?.displayName ??
            app.applicant?.username ??
            "Nutzer";

          return (
            <li
              key={app.id}
              className="rounded-2xl bg-white p-3 shadow-card"
            >
              <div className="mb-2 flex items-center gap-3">
                <UserAvatar
                  name={name}
                  seed={app.userId}
                  avatarUrl={app.applicant?.avatarUrl}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-unze-ink">
                    {name}
                  </p>
                  <p className="text-xs text-unze-ink-muted">
                    {APPLICATION_STATUS_LABELS[app.status]} ·{" "}
                    {new Date(app.createdAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleReview(app.id, "accept")}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-unze-green py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" />
                  Annehmen
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleReview(app.id, "waitlist")}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-unze-border py-2 text-xs font-medium disabled:opacity-60"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Warteliste
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleReview(app.id, "reject")}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-medium text-red-700 disabled:opacity-60"
                >
                  <X className="h-3.5 w-3.5" />
                  Ablehnen
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {success && (
        <ActionFeedback variant="success" className="mt-3">
          {success}
        </ActionFeedback>
      )}
      {error && (
        <ActionFeedback variant="error" className="mt-3">
          {error}
        </ActionFeedback>
      )}
    </div>
  );
}

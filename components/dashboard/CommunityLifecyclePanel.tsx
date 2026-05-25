"use client";

import {
  archiveCommunityAction,
  pauseCommunityAction,
} from "@/app/dashboard/governance-actions";
import { ACCESS_STATUS_OPTIONS } from "@/lib/constants/access";
import type { CommunityAccessConfig } from "@/types/access";
import { Archive, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface CommunityLifecyclePanelProps {
  slug: string;
  access: CommunityAccessConfig | null | undefined;
  canManageLifecycle: boolean;
}

export function CommunityLifecyclePanel({
  slug,
  access,
  canManageLifecycle,
}: CommunityLifecyclePanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"pause" | "archive" | null>(
    null,
  );

  if (!canManageLifecycle || !access) return null;

  const statusLabel =
    ACCESS_STATUS_OPTIONS.find((o) => o.value === access.accessStatus)?.label ??
    access.accessStatus;

  const isArchived = access.accessStatus === "archived";
  const isPaused =
    access.accessStatus === "paused" || access.admissionsPaused;

  function runAction(action: "pause" | "archive") {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result =
        action === "archive"
          ? await archiveCommunityAction(slug)
          : await pauseCommunityAction(slug);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(
        action === "archive"
          ? "Community archiviert"
          : "Community pausiert — keine neuen Beitritte",
      );
      setConfirmAction(null);
      router.refresh();
    });
  }

  return (
    <section
      className="rounded-3xl border border-unze-border bg-white p-4 shadow-card"
      data-testid="community-lifecycle-panel"
    >
      <h3 className="mb-1 text-sm font-semibold text-unze-ink">
        Community-Lifecycle
      </h3>
      <p className="mb-3 text-xs text-unze-ink-secondary">
        Status: <span className="font-medium text-unze-ink">{statusLabel}</span>
        {access.admissionsPaused && !isArchived && " · Aufnahme pausiert"}
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        <Link
          href={`/dashboard/community/${slug}/access`}
          className="rounded-full bg-unze-surface-muted px-3 py-1 text-xs font-medium text-unze-ink"
        >
          Zugang & Limit
        </Link>
        <Link
          href={`/dashboard/community/${slug}/requests`}
          className="rounded-full bg-unze-surface-muted px-3 py-1 text-xs font-medium text-unze-ink"
        >
          Bewerbungen
        </Link>
        <Link
          href={`/dashboard/community/${slug}/moderation`}
          className="rounded-full bg-unze-surface-muted px-3 py-1 text-xs font-medium text-unze-ink"
        >
          Moderation
        </Link>
      </div>

      {!isArchived && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {!isPaused && (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmAction("pause")}
              data-testid="community-pause-button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-sm font-medium text-amber-900 disabled:opacity-60"
            >
              <Pause className="h-4 w-4" aria-hidden />
              Pausieren
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmAction("archive")}
            data-testid="community-archive-button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-800 disabled:opacity-60"
          >
            <Archive className="h-4 w-4" aria-hidden />
            Archivieren
          </button>
        </div>
      )}

      {isArchived && (
        <p className="rounded-xl bg-unze-surface-muted px-3 py-2 text-xs text-unze-ink-secondary">
          Diese Community ist archiviert. Beitritte sind gesperrt. Zugangseinstellungen
          können unter „Zugang“ angepasst werden.
        </p>
      )}

      {isPaused && !isArchived && (
        <p className="mt-2 flex items-center gap-1 text-xs text-amber-800">
          <Play className="h-3.5 w-3.5" aria-hidden />
          Zum Reaktivieren: Zugang → Status „Offen“ und Aufnahme-Pause deaktivieren.
        </p>
      )}

      {confirmAction && (
        <div className="mt-3 rounded-xl border border-unze-border bg-unze-surface-muted/50 p-3">
          <p className="text-sm font-medium text-unze-ink">
            {confirmAction === "archive"
              ? "Community wirklich archivieren?"
              : "Community wirklich pausieren?"}
          </p>
          <p className="mt-1 text-xs text-unze-ink-secondary">
            {confirmAction === "archive"
              ? "Keine neuen Beitritte mehr. Mitglieder bleiben erhalten."
              : "Neue Bewerbungen werden blockiert, bis du reaktivierst."}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              className="flex-1 rounded-lg border border-unze-border py-2 text-xs font-medium"
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => runAction(confirmAction)}
              className="flex-1 rounded-lg bg-unze-green py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              Bestätigen
            </button>
          </div>
        </div>
      )}

      {success && (
        <p className="mt-2 text-xs font-medium text-unze-green-dark" role="status">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

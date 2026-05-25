"use client";

import { ApplicationStatusBadge, MemberRestrictionBadge } from "@/components/dashboard/StatusBadge";
import { PLATFORM_IDENTITY_OPTIONS } from "@/lib/constants/access";
import {
  clearDemoSession,
  getDemoApplication,
  getDemoMember,
  pushDemoNotification,
  setDemoApplication,
  setDemoMember,
  type DemoApplicationState,
} from "@/lib/demo/demo-store.client";
import { formatMaxSizeHint } from "@/lib/storage/validation";
import type { Community } from "@/types/community";
import type { JoinQuestion } from "@/types/access";
import {
  CheckCircle2,
  Clock,
  FlaskConical,
  LogIn,
  Send,
  Upload,
  UserPlus,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

interface DemoJoinPanelProps {
  community: Community;
  slug: string;
  isLoggedIn: boolean;
  questions?: JoinQuestion[];
}

export function DemoJoinPanel({
  community,
  slug,
  isLoggedIn,
  questions = [],
}: DemoJoinPanelProps) {
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [demoApp, setDemoApp] = useState<DemoApplicationState | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<Record<string, string>>({});

  const access = community.access;
  const joinAccess = community.joinAccess;
  const loginHref = `/auth/login?next=${encodeURIComponent(`/community/${slug}`)}`;

  useEffect(() => {
    setDemoApp(getDemoApplication(slug));
    setIsMember(Boolean(getDemoMember(slug)));
  }, [slug]);

  if (!isLoggedIn) {
    return (
      <div className="space-y-3" data-testid="demo-join-login">
        <div className="rounded-xl border border-dashed border-unze-green/40 bg-unze-green-muted/20 px-3 py-2 text-xs text-unze-green-dark">
          <FlaskConical className="mb-1 inline h-4 w-4" aria-hidden /> Demo-Modus:
          Anmelden für simulierten Bewerbungsflow.
        </div>
        <Link
          href={loginHref}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white active:scale-[0.98]"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Anmelden zum Beitreten
        </Link>
      </div>
    );
  }

  const blockReason = joinAccess?.blockReason;
  const isRestricted = Boolean(joinAccess?.userRestriction);
  const requiresApplication = joinAccess?.requiresApplication ?? questions.length > 0;
  const canDirectJoin =
    !requiresApplication &&
    !blockReason &&
    access?.joinApprovalMode === "auto_accept";

  const handleSubmitApplication = () => {
    startTransition(() => {
      setError(null);
      setSuccess(null);

      for (const q of questions) {
        if (!q.isRequired) continue;
        if (q.questionType === "rules_consent" && !consents[q.id]) {
          setError("Bitte den Regeln zustimmen.");
          return;
        }
        if (
          (q.questionType === "text" || q.questionType === "age_verification") &&
          !answers[q.id]?.trim()
        ) {
          setError(`Pflichtfeld: ${q.label}`);
          return;
        }
        if (
          (q.questionType === "file_upload" ||
            q.questionType === "image_upload" ||
            q.questionType === "age_proof") &&
          !files[q.id]
        ) {
          setError(`Nachweis erforderlich: ${q.label}`);
          return;
        }
      }

      const status =
        joinAccess?.waitlistAtCapacity || access?.joinApprovalMode === "waitlist"
          ? "waitlisted"
          : "pending";

      const app: DemoApplicationState = {
        id: `demo-app-${Date.now()}`,
        communityId: community.id,
        communitySlug: slug,
        communityTitle: community.title,
        status,
        createdAt: new Date().toISOString(),
        systemMessage:
          status === "waitlisted"
            ? "Du stehst auf der Warteliste"
            : "Antrag eingereicht — Creator prüft deine Antworten",
        answersSummary: Object.values(answers).filter(Boolean).join(" · ") || undefined,
      };

      setDemoApplication(slug, app);
      setDemoApp(app);
      setShowForm(false);

      pushDemoNotification({
        category: "application",
        type: "membership.application_submitted",
        title: "Bewerbung eingereicht",
        body: `${community.title}: Dein Antrag wurde übermittelt.`,
        data: { communitySlug: slug, communityId: community.id, category: "application" },
        createdAt: new Date().toISOString(),
      });

      setSuccess(
        status === "waitlisted"
          ? "Du stehst auf der Warteliste."
          : "Bewerbung eingereicht — Status: Offen",
      );
    });
  };

  const simulateCreatorAction = (action: "accept" | "reject") => {
    if (!demoApp) return;
    startTransition(() => {
      if (action === "accept") {
        setDemoMember(slug, {
          communityId: community.id,
          communitySlug: slug,
          joinedAt: new Date().toISOString(),
        });
        setDemoApplication(slug, null);
        setDemoApp(null);
        setIsMember(true);
        pushDemoNotification({
          category: "application",
          type: "membership.application_accepted",
          title: "Antrag angenommen",
          body: `Willkommen bei ${community.title}!`,
          data: { communitySlug: slug, communityId: community.id, category: "application" },
          createdAt: new Date().toISOString(),
        });
        setSuccess("Angenommen — du bist jetzt Mitglied (Demo).");
      } else {
        const rejected: DemoApplicationState = {
          ...demoApp,
          status: "rejected",
          rejectionReason: "Demo: Creator hat abgelehnt",
          systemMessage: "Antrag abgelehnt",
        };
        setDemoApplication(slug, rejected);
        setDemoApp(rejected);
        pushDemoNotification({
          category: "application",
          type: "membership.application_rejected",
          title: "Antrag abgelehnt",
          body: `${community.title}: Dein Antrag wurde abgelehnt.`,
          data: { communitySlug: slug, communityId: community.id, category: "application" },
          createdAt: new Date().toISOString(),
        });
        setSuccess("Abgelehnt — Notification gesendet (Demo).");
      }
    });
  };

  const handleDirectJoin = () => {
    startTransition(() => {
      setDemoMember(slug, {
        communityId: community.id,
        communitySlug: slug,
        joinedAt: new Date().toISOString(),
      });
      setIsMember(true);
      pushDemoNotification({
        category: "application",
        type: "membership.joined",
        title: "Community beigetreten",
        body: `Du bist jetzt Mitglied bei ${community.title}.`,
        data: { communitySlug: slug, communityId: community.id, category: "application" },
        createdAt: new Date().toISOString(),
      });
      setSuccess("Willkommen in der Community (Demo)!");
    });
  };

  return (
    <div className="space-y-3" data-testid="demo-join-panel">
      <div className="rounded-xl border border-dashed border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <FlaskConical className="mb-0.5 inline h-4 w-4" aria-hidden />{" "}
        <strong>Demo-Modus:</strong> Bewerbung, Status & Notifications werden lokal simuliert.
        <Link href="/notifications" className="ml-1 font-semibold underline">
          Benachrichtigungen
        </Link>
      </div>

      {isMember && (
        <div className="rounded-xl bg-unze-green-muted px-3 py-2 text-center text-xs font-semibold text-unze-green-dark">
          <CheckCircle2 className="mb-0.5 inline h-4 w-4" aria-hidden /> Mitglied (Demo)
        </div>
      )}

      {blockReason && !isMember && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            {isRestricted ? (
              <MemberRestrictionBadge className="mb-1" />
            ) : (
              <ApplicationStatusBadge status="rejected" className="mb-1" />
            )}
            <span>{blockReason}</span>
          </div>
        </div>
      )}

      {demoApp && !isMember && (
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <ApplicationStatusBadge status={demoApp.status} />
            <Clock className="h-3.5 w-3.5" aria-hidden />
            <span>{new Date(demoApp.createdAt).toLocaleDateString("de-DE")}</span>
          </div>
          {demoApp.systemMessage && <p>{demoApp.systemMessage}</p>}
          {demoApp.rejectionReason && (
            <p className="mt-1 text-red-700">{demoApp.rejectionReason}</p>
          )}
        </div>
      )}

      {success && (
        <p className="rounded-xl bg-unze-green-muted px-3 py-2 text-center text-xs font-medium text-unze-green-dark">
          {success}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-700">
          {error}
        </p>
      )}

      {!isMember && !blockReason && !demoApp && !showForm && (
        <button
          type="button"
          disabled={pending}
          onClick={() => (canDirectJoin ? handleDirectJoin() : setShowForm(true))}
          data-testid="demo-join-cta"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white active:scale-[0.98] disabled:opacity-60"
        >
          {canDirectJoin ? (
            <>
              <UserPlus className="h-4 w-4" aria-hidden />
              Jetzt beitreten
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden />
              Bewerbung starten
            </>
          )}
        </button>
      )}

      {showForm && !isMember && (
        <div className="space-y-3 rounded-2xl border border-unze-border bg-unze-surface-muted/30 p-3">
          <h3 className="text-sm font-semibold text-unze-ink">Bewerbungsformular</h3>

          {access?.requiredPlatformIds?.map((platform) => {
            const opt = PLATFORM_IDENTITY_OPTIONS.find((o) => o.value === platform);
            return (
              <label key={platform} className="block text-xs">
                <span className="font-medium text-unze-ink">
                  {opt?.label ?? platform} *
                </span>
                <input
                  type="text"
                  required
                  placeholder={opt?.placeholder}
                  className="mt-1 w-full rounded-xl border border-unze-border bg-white px-3 py-2"
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [`platform-${platform}`]: e.target.value }))
                  }
                />
              </label>
            );
          })}

          {questions.map((q) => (
            <div key={q.id} className="text-xs">
              <span className="font-medium text-unze-ink">
                {q.label}
                {q.isRequired && " *"}
              </span>

              {q.questionType === "text" && (
                <textarea
                  rows={2}
                  placeholder={q.placeholder ?? undefined}
                  className="mt-1 w-full rounded-xl border border-unze-border bg-white px-3 py-2"
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              )}

              {q.questionType === "age_verification" && (
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-unze-border bg-white px-3 py-2"
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              )}

              {q.questionType === "rules_consent" && (
                <label className="mt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setConsents((c) => ({ ...c, [q.id]: e.target.checked }))
                    }
                  />
                  Ich akzeptiere die Regeln
                </label>
              )}

              {(q.questionType === "file_upload" ||
                q.questionType === "image_upload" ||
                q.questionType === "age_proof") && (
                <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-unze-border bg-white px-3 py-3">
                  <Upload className="h-4 w-4 text-unze-green" aria-hidden />
                  <span className="text-unze-ink-secondary">
                    {files[q.id] ?? "Datei wählen (Demo)"}
                    {" "}
                    {formatMaxSizeHint(q.questionType)}
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    accept={
                      q.questionType === "image_upload" ? "image/*" : undefined
                    }
                    onChange={(e) => {
                      const name = e.target.files?.[0]?.name;
                      if (name) setFiles((f) => ({ ...f, [q.id]: name }));
                    }}
                  />
                </label>
              )}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-unze-border py-2.5 text-sm font-medium"
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleSubmitApplication}
              data-testid="demo-submit-application"
              className="rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Absenden
            </button>
          </div>
        </div>
      )}

      {demoApp && !isMember && demoApp.status !== "rejected" && (
        <div className="rounded-xl border border-unze-border bg-white p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-unze-ink-muted">
            Demo: Creator-Aktion simulieren
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => simulateCreatorAction("accept")}
              data-testid="demo-creator-accept"
              className="rounded-xl bg-unze-green py-2 text-xs font-semibold text-white"
            >
              Annehmen
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => simulateCreatorAction("reject")}
              data-testid="demo-creator-reject"
              className="rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-700"
            >
              Ablehnen
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          clearDemoSession(slug);
          setDemoApp(null);
          setIsMember(false);
          setShowForm(false);
          setSuccess(null);
        }}
        className="w-full text-center text-[10px] text-unze-ink-muted underline"
      >
        Demo-Session zurücksetzen
      </button>
    </div>
  );
}

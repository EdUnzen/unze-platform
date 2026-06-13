"use client";

import {
  joinCommunityAction,
  submitJoinApplicationAction,
  withdrawJoinApplicationAction,
} from "@/app/community/access-actions";
import { toggleFollowCommunity } from "@/app/community/actions";
import { CommunityActivityToggle } from "@/components/community/CommunityActivityToggle";
import { SubscribeCommunityPanel } from "@/components/billing/SubscribeCommunityPanel";
import { ApplicationStatusBadge, MemberRestrictionBadge } from "@/components/dashboard/StatusBadge";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { ACTION_MESSAGES } from "@/lib/constants/action-messages";
import { PLATFORM_IDENTITY_OPTIONS } from "@/lib/constants/access";
import { formatMaxSizeHint } from "@/lib/storage/validation";
import { ROLE_LABELS } from "@/lib/constants/dashboard";
import type { Community } from "@/types/community";
import type { JoinQuestion } from "@/types/access";
import { cn } from "@/lib/utils/cn";
import {
  Link2,
  Clock,
  Heart,
  LogIn,
  LogOut,
  Send,
  UserPlus,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface CommunityJoinPanelProps {
  community: Community;
  slug: string;
  isLoggedIn: boolean;
  questions?: JoinQuestion[];
  inviteCode?: string;
  activityFeedEnabled?: boolean;
  checkoutCancelled?: boolean;
}

export function CommunityJoinPanel({
  community,
  slug,
  isLoggedIn,
  questions = [],
  inviteCode,
  activityFeedEnabled = true,
  checkoutCancelled = false,
}: CommunityJoinPanelProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [following, setFollowing] = useState(community.isFollowing ?? false);
  const [isMember, setIsMember] = useState(
    community.membership?.isMember ?? false,
  );
  const [showApplication, setShowApplication] = useState(false);
  const router = useRouter();

  const role = community.membership?.role;
  const isCreator = role === "creator";
  const joinAccess = community.joinAccess;
  const access = community.access;
  const existingApp = joinAccess?.existingApplication;
  const hasActiveApplication =
    existingApp &&
    (existingApp.status === "pending" || existingApp.status === "waitlisted");
  const canReapply =
    !existingApp ||
    existingApp.status === "rejected" ||
    existingApp.status === "withdrawn";
  const loginHref = `/auth/login?next=${encodeURIComponent(`/community/${slug}${inviteCode ? `?invite=${inviteCode}` : ""}`)}`;

  if (!isLoggedIn) {
    const signupHref = `/auth/login?mode=signup&next=${encodeURIComponent(`/community/${slug}${inviteCode ? `?invite=${inviteCode}` : ""}`)}`;

    return (
      <div className="mt-6 space-y-3">
        <p className="text-center text-sm text-unze-ink-secondary">
          Folge dieser Community oder tritt bei — kostenlos anmelden oder registrieren.
        </p>
        <Link
          href={loginHref}
          data-testid="join-login-link"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white active:scale-[0.98]"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Anmelden
        </Link>
        <Link
          href={signupHref}
          className="flex w-full items-center justify-center rounded-xl border border-unze-border bg-white py-3.5 text-sm font-semibold text-unze-ink active:scale-[0.98]"
        >
          Kostenlos registrieren
        </Link>
      </div>
    );
  }

  const handleJoinLeave = () => {
    if (joinAccess?.requiresApplication && !isMember) {
      setShowApplication(true);
      return;
    }

    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const wasMember = isMember;
      const result = wasMember
        ? await import("@/app/community/actions").then((m) =>
            m.leaveCommunityAction(community.id, slug),
          )
        : await joinCommunityAction(community.id, slug);

      if (result.error) {
        if ("requiresApplication" in result && result.requiresApplication) {
          setShowApplication(true);
          return;
        }
        setError(result.error);
        return;
      }

      if ("alreadyMember" in result && result.alreadyMember) {
        setIsMember(true);
        setSuccess(ACTION_MESSAGES.community.alreadyMember);
      } else {
        setIsMember(!wasMember);
        setSuccess(
          result.message ??
            (wasMember
              ? ACTION_MESSAGES.community.left
              : ACTION_MESSAGES.community.joined),
        );
      }
      router.refresh();
    });
  };

  const handleFollow = () => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await toggleFollowCommunity(
        community.id,
        slug,
        following,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setFollowing(!following);
      if (result.message) setSuccess(result.message);
    });
  };

  const handleWithdraw = () => {
    if (!existingApp) return;
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await withdrawJoinApplicationAction(
        community.id,
        slug,
        existingApp.id,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(result.message ?? ACTION_MESSAGES.community.applicationWithdrawn);
      router.refresh();
    });
  };

  const blockReason = joinAccess?.blockReason;
  const isRestricted = Boolean(joinAccess?.userRestriction);
  const requiredPlatforms = access?.requiredPlatformIds ?? [];

  return (
    <div className="mt-6 space-y-4">
      {isMember ? (
        <div className="rounded-xl bg-unze-green-muted px-3 py-2.5 text-center text-xs font-semibold text-unze-green-dark">
          {isCreator ? ROLE_LABELS.creator : `Mitglied · ${ROLE_LABELS[role ?? "member"]}`}
        </div>
      ) : (
        <div className="rounded-xl border border-unze-border bg-unze-surface-muted/40 px-3 py-2.5 text-xs text-unze-ink-secondary">
          <p className="font-semibold text-unze-ink">So trittst du bei</p>
          <ol className="mt-1.5 list-inside list-decimal space-y-0.5">
            <li>Community folgen (optional)</li>
            <li>
              {joinAccess?.requiresApplication || joinAccess?.waitlistAtCapacity
                ? "Beitrittsantrag stellen"
                : joinAccess?.requiresInvite
                  ? "Einladungslink verwenden"
                  : community.visibility === "premium" && community.monetizationEnabled
                    ? "Abo abschließen oder beitreten"
                    : "Beitreten"}
            </li>
          </ol>
        </div>
      )}

      {!isMember &&
        community.visibility === "premium" &&
        community.monetizationEnabled && (
          <SubscribeCommunityPanel
            communityId={community.id}
            slug={slug}
            monetizationEnabled={Boolean(community.monetizationEnabled)}
            pricing={community.pricing}
            hasMonthly={community.subscriptionPlans?.monthly}
            hasSemiannual={community.subscriptionPlans?.semiannual}
            hasYearly={community.subscriptionPlans?.yearly}
            checkoutCancelled={checkoutCancelled}
          />
        )}

      {access && !isMember && (
        <div className="rounded-xl border border-unze-border bg-unze-surface-muted/50 px-3 py-2 text-xs text-unze-ink-secondary">
          {access.accessStatus === "archived" && (
            <p className="font-medium text-unze-ink-muted">Archiviert</p>
          )}
          {access.admissionsPaused && (
            <p className="font-medium text-amber-700">Aufnahme pausiert</p>
          )}
          {access.memberLimit && (
            <p>
              Mitglieder: {community.memberCount}/{access.memberLimit}
            </p>
          )}
          {access.accessStatus === "invite_only" && (
            <p>Nur auf Einladung</p>
          )}
          {community.visibility === "premium" && !community.monetizationEnabled && !isMember && (
            <p className="text-xs text-unze-ink-secondary">Kostenpflichtig — Preise folgen</p>
          )}
        </div>
      )}

      {joinAccess?.requiresInvite && !isMember && !inviteCode && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <Link2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>Nur mit Einladungslink — bitte Link vom Creator verwenden.</span>
        </div>
      )}

      {inviteCode && !isMember && (
        <Link
          href={`/invite/${inviteCode}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-unze-green bg-unze-green-muted/30 py-3 text-sm font-semibold text-unze-green-dark"
        >
          <Link2 className="h-4 w-4" aria-hidden />
          Einladung annehmen
        </Link>
      )}

      {joinAccess?.waitlistAtCapacity && !isMember && (
        <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Mitgliederlimit erreicht — neue Bewerbungen landen auf der Warteliste.
          </span>
        </div>
      )}

      {blockReason && !isMember && !inviteCode && (
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

      {existingApp && !isMember && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <ApplicationStatusBadge status={existingApp.status} />
              <span className="text-[10px] text-unze-ink-muted">
                {new Date(existingApp.createdAt).toLocaleDateString("de-DE")}
              </span>
            </div>
            {existingApp.systemMessage && (
              <span>{existingApp.systemMessage}</span>
            )}
            {existingApp.rejectionReason && (
              <p className="mt-1 text-red-700">{existingApp.rejectionReason}</p>
            )}
            {hasActiveApplication && (
              <button
                type="button"
                disabled={pending}
                onClick={handleWithdraw}
                data-testid="join-withdraw-application"
                className="mt-2 text-xs font-semibold underline"
              >
                Antrag zurückziehen
              </button>
            )}
          </div>
        </div>
      )}

      {success && <ActionFeedback variant="success">{success}</ActionFeedback>}

      {!showApplication ? (
        <div className="grid grid-cols-2 gap-2">
          {!isCreator && !blockReason && !joinAccess?.requiresInvite && canReapply && (
            <button
              type="button"
              onClick={handleJoinLeave}
              disabled={pending || Boolean(hasActiveApplication)}
              data-testid="join-community-button"
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold active:scale-[0.98] disabled:opacity-60",
                isMember
                  ? "border border-unze-border bg-white text-unze-ink"
                  : "bg-unze-green text-white",
              )}
            >
              {isMember ? (
                <>
                  <LogOut className="h-4 w-4" aria-hidden />
                  Verlassen
                </>
              ) : joinAccess?.requiresApplication || joinAccess?.waitlistAtCapacity ? (
                <>
                  <Send className="h-4 w-4" aria-hidden />
                  {existingApp?.status === "rejected" ||
                  existingApp?.status === "withdrawn"
                    ? "Erneut bewerben"
                    : "Bewerben"}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" aria-hidden />
                  Beitreten
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleFollow}
            disabled={pending}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-semibold active:scale-[0.98] disabled:opacity-60",
              following
                ? "border-unze-green bg-unze-green-muted text-unze-green-dark"
                : "border-unze-border bg-white text-unze-ink",
              (isCreator || blockReason) && "col-span-2",
            )}
          >
            <Heart
              className={cn("h-4 w-4", following && "fill-current")}
              aria-hidden
            />
            {following ? "Gefolgt" : "Folgen"}
          </button>
        </div>
      ) : (
        <form
          action={(formData) => {
            startTransition(async () => {
              setError(null);
              setSuccess(null);
              const result = await submitJoinApplicationAction(
                community.id,
                slug,
                formData,
              );
              if (result.error) {
                setError(result.error);
                return;
              }
              setShowApplication(false);
              if (result.joined || result.alreadyMember) setIsMember(true);
              setSuccess(
                result.message ??
                  (result.joined
                    ? ACTION_MESSAGES.community.joined
                    : ACTION_MESSAGES.community.applicationSent),
              );
              router.refresh();
            });
          }}
          encType="multipart/form-data"
          data-testid="join-application-form"
          className="space-y-3 rounded-2xl border border-unze-border bg-unze-surface-muted/30 p-4"
        >
          <p className="text-sm font-semibold text-unze-ink">Beitrittsantrag</p>

          {access?.communityRules && (
            <div className="rounded-xl bg-white p-3 text-xs text-unze-ink-secondary">
              <p className="mb-2 font-medium text-unze-ink">Community-Regeln</p>
              <p className="whitespace-pre-wrap">{access.communityRules}</p>
              {access.requireRulesConsent && (
                <label className="mt-3 flex items-center gap-2 font-medium text-unze-ink">
                  <input
                    type="checkbox"
                    name="rules_consent"
                    required
                    className="h-4 w-4 rounded"
                  />
                  Ich akzeptiere die Regeln
                </label>
              )}
            </div>
          )}

          {questions.map((q) => (
            <div key={q.id}>
              <label className="mb-1 block text-xs font-medium text-unze-ink">
                {q.label}
                {q.isRequired && " *"}
              </label>
              {q.questionType === "checkbox" || q.questionType === "rules_consent" ? (
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    name={`q_${q.id}`}
                    required={q.isRequired}
                    className="h-4 w-4 rounded"
                  />
                  {q.placeholder ?? "Zustimmen"}
                </label>
              ) : q.questionType === "age_verification" ? (
                <input
                  type="date"
                  name={`q_${q.id}`}
                  required={q.isRequired}
                  className="w-full rounded-xl border border-unze-border bg-white px-3 py-2 text-sm"
                />
              ) : q.questionType === "file_upload" ||
                q.questionType === "identity_proof" ? (
                <>
                  <input
                    type="file"
                    name={`q_${q.id}`}
                    required={q.isRequired}
                    accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                    className="w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-unze-green-muted file:px-3 file:py-2 file:text-unze-green-dark"
                  />
                  <p className="mt-1 text-[10px] text-unze-ink-muted">
                    {formatMaxSizeHint(q.questionType)}
                  </p>
                </>
              ) : q.questionType === "image_upload" ||
                q.questionType === "age_proof" ? (
                <>
                  <input
                    type="file"
                    name={`q_${q.id}`}
                    required={q.isRequired}
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    capture={q.questionType === "age_proof" ? "environment" : undefined}
                    className="w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-unze-green-muted file:px-3 file:py-2 file:text-unze-green-dark"
                  />
                  <p className="mt-1 text-[10px] text-unze-ink-muted">
                    {formatMaxSizeHint(q.questionType)}
                    {q.questionType === "age_proof" && " · Kamera oder Galerie"}
                  </p>
                </>
              ) : (
                <textarea
                  name={`q_${q.id}`}
                  required={q.isRequired}
                  rows={2}
                  placeholder={q.placeholder ?? undefined}
                  className="w-full resize-none rounded-xl border border-unze-border bg-white px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}

          {requiredPlatforms.map((platform) => {
            const opt = PLATFORM_IDENTITY_OPTIONS.find((p) => p.value === platform);
            return (
              <div key={platform}>
                <label className="mb-1 block text-xs font-medium text-unze-ink">
                  {opt?.label ?? platform} *
                </label>
                <input
                  name={`platform_${platform}`}
                  required
                  placeholder={opt?.placeholder}
                  className="w-full rounded-xl border border-unze-border bg-white px-3 py-2 text-sm"
                />
              </div>
            );
          })}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowApplication(false)}
              className="flex-1 rounded-xl border border-unze-border py-2.5 text-sm font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={pending}
              data-testid="join-application-submit"
              className="flex-1 rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Senden…" : "Antrag senden"}
            </button>
          </div>
        </form>
      )}

      {(isMember || following) && (
        <CommunityActivityToggle
          communityId={community.id}
          initialEnabled={activityFeedEnabled}
        />
      )}

      {error && <ActionFeedback variant="error">{error}</ActionFeedback>}
    </div>
  );
}

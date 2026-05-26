"use client";

import {
  createSandboxCheckoutAction,
  startStripeConnectAction,
} from "@/app/dashboard/referral-actions";
import { cn } from "@/lib/utils/cn";
import type { CreatorStripeStatus } from "@/types/referral";
import { CreditCard, ExternalLink, FlaskConical } from "lucide-react";
import { useState, useTransition } from "react";

interface StripeConnectPanelProps {
  stripeStatus: CreatorStripeStatus;
  sandboxCommunity?: { id: string; title: string } | null;
}

export function StripeConnectPanel({
  stripeStatus,
  sandboxCommunity,
}: StripeConnectPanelProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const connect = () => {
    startTransition(async () => {
      setError(null);
      const { url, error: err } = await startStripeConnectAction();
      if (err) {
        setError(err);
        return;
      }
      if (url) window.location.href = url;
    });
  };

  const sandboxCheckout = () => {
    if (!sandboxCommunity) return;
    startTransition(async () => {
      setError(null);
      const { url, error: err } = await createSandboxCheckoutAction({
        communityId: sandboxCommunity.id,
        communityTitle: sandboxCommunity.title,
      });
      if (err) {
        setError(err);
        return;
      }
      if (url) window.location.href = url;
    });
  };

  return (
    <section className="rounded-3xl bg-gradient-to-br from-unze-green-muted to-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-unze-green-dark" aria-hidden />
        <h2 className="text-base font-semibold text-unze-ink">Stripe Sandbox</h2>
        <ModeBadge mode={stripeStatus.mode} />
      </div>

      <p className="mb-4 text-sm text-unze-ink-secondary">{stripeStatus.message}</p>

      <div className="space-y-2">
        <button
          type="button"
          onClick={connect}
          disabled={!stripeStatus.configured || pending}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold",
            stripeStatus.configured
              ? "bg-unze-green text-white"
              : "bg-unze-border text-unze-ink-muted",
          )}
        >
          <ExternalLink className="h-4 w-4" />
          {stripeStatus.onboardingComplete
            ? "Stripe Connect verwalten"
            : "Stripe Connect starten"}
        </button>

        {stripeStatus.mode === "sandbox" && sandboxCommunity && (
          <button
            type="button"
            onClick={sandboxCheckout}
            disabled={!stripeStatus.configured || pending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-unze-green/40 bg-white py-3 text-sm font-semibold text-unze-green-dark disabled:opacity-50"
          >
            <FlaskConical className="h-4 w-4" />
            Sandbox-Testzahlung ({sandboxCommunity.title})
          </button>
        )}
      </div>

      {stripeStatus.connectAccountId && (
        <p className="mt-3 truncate text-[10px] text-unze-ink-muted">
          Connect: {stripeStatus.connectAccountId}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </section>
  );
}

function ModeBadge({ mode }: { mode: CreatorStripeStatus["mode"] }) {
  const label =
    mode === "sandbox" ? "Testmodus" : mode === "live" ? "Live" : "Deaktiviert";
  const cls =
    mode === "sandbox"
      ? "bg-amber-100 text-amber-800"
      : mode === "live"
        ? "bg-red-100 text-red-800"
        : "bg-unze-surface-muted text-unze-ink-muted";

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cls)}>
      {label}
    </span>
  );
}

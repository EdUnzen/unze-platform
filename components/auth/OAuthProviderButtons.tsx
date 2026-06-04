"use client";

import { signInWithOAuthAction } from "@/app/auth/actions";
import { AppleBrandIcon } from "@/components/auth/AppleBrandIcon";
import { GoogleBrandIcon } from "@/components/auth/GoogleBrandIcon";
import { useTransition } from "react";

interface OAuthProviderButtonsProps {
  returnTo?: string;
  mode?: "login" | "signup";
}

export function OAuthProviderButtons({
  returnTo = "/",
  mode = "login",
}: OAuthProviderButtonsProps) {
  const verb = mode === "signup" ? "registrieren" : "anmelden";
  const [pending, startTransition] = useTransition();

  function start(provider: "google" | "apple") {
    startTransition(() => {
      void signInWithOAuthAction(provider, returnTo);
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-unze-ink-muted">oder weiter mit</p>
      <button
        type="button"
        disabled={pending}
        onClick={() => start("google")}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-unze-border bg-white py-3 pl-4 pr-4 text-sm font-semibold text-unze-ink shadow-sm transition hover:bg-unze-surface-muted disabled:opacity-60"
      >
        <GoogleBrandIcon className="h-5 w-5 shrink-0" />
        <span>Mit Google {verb}</span>
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => start("apple")}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-unze-ink/10 bg-unze-ink py-3 pl-4 pr-4 text-sm font-semibold text-white transition hover:bg-unze-ink/90 disabled:opacity-60"
      >
        <AppleBrandIcon className="h-5 w-5 shrink-0" />
        <span>Mit Apple {verb}</span>
      </button>
    </div>
  );
}

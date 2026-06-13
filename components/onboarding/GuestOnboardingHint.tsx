"use client";

import {
  UnzeOnboardingDialog,
  useOnboardingDialog,
} from "@/components/onboarding/UnzeOnboardingDialog";
import { HelpCircle } from "lucide-react";

/** Gast-Startseite: UNZE erklären ohne Profil */
export function GuestOnboardingHint() {
  const dialog = useOnboardingDialog();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.show("intro")}
        className="flex w-full items-center gap-3 rounded-2xl border border-unze-border/80 bg-white px-4 py-3 text-left shadow-card active:scale-[0.99]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-unze-green-muted text-unze-green">
          <HelpCircle className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-unze-ink">Was ist UNZE?</span>
          <span className="mt-0.5 block text-xs text-unze-ink-secondary">
            Kurze Einführung — Communities, Gruppen, Events &amp; Services
          </span>
        </span>
      </button>
      <UnzeOnboardingDialog open={dialog.open} mode={dialog.mode} onClose={dialog.close} />
    </>
  );
}

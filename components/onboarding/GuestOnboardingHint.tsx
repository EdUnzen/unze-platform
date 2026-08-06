"use client";

import {
  UnzeOnboardingDialog,
  useOnboardingDialog,
} from "@/components/onboarding/UnzeOnboardingDialog";
import { PLATFORM_PILLAR_LIST } from "@/lib/constants/platform-copy";
import { useMarketingMode } from "@/hooks/useMarketingMode";
import { HelpCircle } from "lucide-react";

/** Gast-Startseite: UNZE erklären ohne Profil */
export function GuestOnboardingHint() {
  const dialog = useOnboardingDialog();
  const marketingMode = useMarketingMode();

  if (marketingMode) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.show("intro")}
        data-marketing-overlay
        className="flex min-h-[44px] w-full items-center gap-3 rounded-2xl border-2 border-unze-green/30 bg-gradient-to-r from-unze-green-muted/60 to-white px-4 py-3.5 text-left shadow-card active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-unze-green text-white shadow-sm">
          <HelpCircle className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-unze-ink">Was ist UNZE?</span>
          <span className="mt-0.5 block text-xs text-unze-ink-secondary">
            Kurze Einführung — {PLATFORM_PILLAR_LIST}
          </span>
        </span>
      </button>
      <UnzeOnboardingDialog open={dialog.open} mode={dialog.mode} onClose={dialog.close} />
    </>
  );
}

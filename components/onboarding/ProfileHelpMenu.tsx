"use client";

import {
  UnzeOnboardingDialog,
  useOnboardingDialog,
} from "@/components/onboarding/UnzeOnboardingDialog";
import { ChevronRight, Download, HelpCircle } from "lucide-react";

export function ProfileHelpMenu() {
  const dialog = useOnboardingDialog();

  return (
    <>
      <nav
        className="overflow-hidden rounded-2xl bg-white shadow-card divide-y divide-unze-border/70"
        aria-label="Hilfe & Installation"
      >
        <button
          type="button"
          onClick={() => dialog.show("intro")}
          className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors active:bg-unze-surface-muted/80"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-green">
            <HelpCircle className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-unze-ink">Was ist UNZE?</span>
            <span className="mt-0.5 block text-xs text-unze-ink-secondary">
              Communities, Gruppen, Events &amp; Services erklärt
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-unze-ink-muted" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => dialog.show("install")}
          className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors active:bg-unze-surface-muted/80"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-green">
            <Download className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-unze-ink">UNZE installieren</span>
            <span className="mt-0.5 block text-xs text-unze-ink-secondary">
              Android-App oder iOS Home-Bildschirm
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-unze-ink-muted" aria-hidden />
        </button>
      </nav>

      <UnzeOnboardingDialog
        open={dialog.open}
        mode={dialog.mode}
        onClose={dialog.close}
      />
    </>
  );
}

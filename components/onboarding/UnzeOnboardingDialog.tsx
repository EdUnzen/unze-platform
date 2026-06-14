"use client";

import { ONBOARDING_COPY, ONBOARDING_STORAGE_KEY } from "@/lib/constants/onboarding-copy";
import { cn } from "@/lib/utils/cn";
import {
  BadgeCheck,
  Calendar,
  Compass,
  Download,
  FolderOpen,
  Share,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type OnboardingMode = "full" | "intro" | "install";

const PILLAR_ICONS = [Users, FolderOpen, Calendar, Wrench, BadgeCheck] as const;
const INSTALL_DISMISS_KEY = "unze-pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

interface UnzeOnboardingDialogProps {
  open: boolean;
  mode?: OnboardingMode;
  onClose: () => void;
  /** Erstbesuch abschließen — speichert „nicht erneut anzeigen“ */
  markComplete?: boolean;
}

export function UnzeOnboardingDialog({
  open,
  mode = "full",
  onClose,
  markComplete = false,
}: UnzeOnboardingDialogProps) {
  const [step, setStep] = useState(0);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const ios = isIOS();

  useEffect(() => {
    if (!open) return;
    setStep(mode === "install" ? 2 : 0);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [open, mode]);

  const finish = useCallback(() => {
    if (markComplete) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
      localStorage.setItem(INSTALL_DISMISS_KEY, "1");
    }
    onClose();
  }, [markComplete, onClose]);

  const installAndroid = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (!open) return null;

  const showIntro = mode === "full" || mode === "intro";
  const showInstall = mode === "full" || mode === "install";
  const steps = [
    ...(showIntro ? [0, 1] : []),
    ...(showInstall && !isStandalone() ? [2] : []),
  ];
  const current = steps[step] ?? steps[0] ?? 0;
  const isLast = step >= steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      onClick={finish}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl"
        role="dialog"
        aria-labelledby="unze-onboarding-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-unze-green-muted">
              <Sparkles className="h-5 w-5 text-unze-green" aria-hidden />
            </span>
            <div>
              <h2 id="unze-onboarding-title" className="text-base font-semibold text-unze-ink">
                {current === 0
                  ? "Was ist UNZE?"
                  : current === 1
                    ? "Wie funktioniert UNZE?"
                    : ONBOARDING_COPY.installTitle}
              </h2>
              <p className="text-xs text-unze-ink-secondary">{ONBOARDING_COPY.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={finish}
            className="rounded-xl p-2 text-unze-ink-muted hover:bg-unze-surface-muted"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {current === 0 && (
          <div className="space-y-3 text-sm text-unze-ink-secondary">
            <p>{ONBOARDING_COPY.whatIsUnze}</p>
            <p className="rounded-2xl bg-unze-green-muted/50 px-3 py-2.5 text-xs leading-relaxed text-unze-green-dark">
              UNZE ist die App — die Startseite ist dein Einstieg. Entdecke Communities, tritt bei
              und installiere UNZE optional auf deinem Gerät.
            </p>
          </div>
        )}

        {current === 1 && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-unze-ink-secondary">
              {ONBOARDING_COPY.howItWorks}
            </p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            {ONBOARDING_COPY.pillars.map((pillar, i) => {
              const Icon = PILLAR_ICONS[i] ?? Users;
              return (
                <li
                  key={pillar.title}
                  className="rounded-2xl border border-unze-border/80 bg-unze-surface-muted/30 p-3"
                >
                  <Icon className="mb-1.5 h-4 w-4 text-unze-green" aria-hidden />
                  <p className="text-xs font-semibold text-unze-ink">{pillar.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-unze-ink-secondary">
                    {pillar.description}
                  </p>
                </li>
              );
            })}
          </ul>
          </div>
        )}

        {current === 2 && (
          <div className="space-y-3 text-sm text-unze-ink-secondary">
            {ios ? (
              <>
                <p className="font-semibold text-unze-ink">
                  {ONBOARDING_COPY.installIosTitle}
                </p>
                <p>{ONBOARDING_COPY.installIosIntro}</p>
                <ol className="list-inside list-decimal space-y-2 text-sm">
                  {ONBOARDING_COPY.installIosSteps.map((line) => (
                    <li key={line} className="flex items-center gap-2">
                      {line.startsWith("Teilen") && (
                        <Share className="h-4 w-4 shrink-0 text-unze-green" aria-hidden />
                      )}
                      {line}
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <>
                <p className="font-semibold text-unze-ink">
                  {ONBOARDING_COPY.installAndroidTitle}
                </p>
                <p>{ONBOARDING_COPY.installAndroid}</p>
                {deferredPrompt ? (
                  <button
                    type="button"
                    onClick={() => void installAndroid()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3 text-sm font-semibold text-white"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    App installieren
                  </button>
                ) : (
                  <p className="text-xs text-unze-ink-muted">
                    Im Browser-Menü findest du „App installieren“ oder „Zum Startbildschirm
                    hinzufügen“.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="rounded-xl border border-unze-border px-4 py-2.5 text-sm font-semibold text-unze-ink-secondary"
            >
              Zurück
            </button>
          )}
          {!isLast ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="ml-auto rounded-xl bg-unze-green px-4 py-2.5 text-sm font-semibold text-white"
            >
              Weiter
            </button>
          ) : (
            <>
              <Link
                href="/discover"
                onClick={finish}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-unze-green px-4 py-2.5 text-sm font-semibold text-white",
                  "ml-auto",
                )}
              >
                <Compass className="h-4 w-4" aria-hidden />
                {ONBOARDING_COPY.discoverCta}
              </Link>
              <button
                type="button"
                onClick={finish}
                className="rounded-xl border border-unze-border px-4 py-2.5 text-sm font-semibold text-unze-ink-secondary"
              >
                Fertig
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function useOnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<OnboardingMode>("full");

  return {
    open,
    mode,
    show: (nextMode: OnboardingMode = "intro") => {
      setMode(nextMode);
      setOpen(true);
    },
    close: () => setOpen(false),
  };
}

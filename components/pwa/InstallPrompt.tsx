"use client";

import { cn } from "@/lib/utils/cn";
import { Download, Share, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "unze-pwa-install-dismissed";
const ONBOARDING_KEY = "unze-onboarding-complete-v1";

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

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIosDevice, setIsIosDevice] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (!localStorage.getItem(ONBOARDING_KEY)) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    setIsIosDevice(isIOS());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (isIOS()) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }, []);

  const installAndroid = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed left-4 right-4 z-50 mx-auto max-w-lg animate-slide-up",
        "bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom)+0.75rem)]",
      )}
      role="region"
      aria-label="App installieren"
    >
      <div className="glass-card rounded-2xl p-4 shadow-card">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-unze-ink">
            UNZE als App installieren
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-full p-1 text-unze-ink-muted hover:bg-unze-surface-muted"
            aria-label="Hinweis schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isIosDevice ? (
          <div className="space-y-2 text-sm text-unze-ink-secondary">
            <p>
              UNZE funktioniert wie eine App. Füge UNZE zu deinem Home-Bildschirm
              hinzu, um sie schneller zu öffnen.
            </p>
            <ol className="list-inside list-decimal space-y-1 text-xs">
              <li className="flex items-center gap-1">
                <Share className="inline h-3.5 w-3.5" aria-hidden />
                Teilen-Symbol in Safari antippen
              </li>
              <li>„Zum Home-Bildschirm“ wählen</li>
              <li>„Hinzufügen“ bestätigen</li>
            </ol>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-unze-ink-secondary">
              Installiere UNZE für schnelleren Zugriff und App-Modus auf deinem
              Gerät.
            </p>
            <button
              type="button"
              onClick={installAndroid}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3 text-sm font-semibold text-white active:scale-[0.98]"
            >
              <Download className="h-4 w-4" aria-hidden />
              UNZE als App installieren
            </button>
          </>
        )}
      </div>
    </div>
  );
}

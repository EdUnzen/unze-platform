"use client";

import { MARKETING_APP_ENTRY } from "@/lib/constants/marketing-app-entry";
import { getLoginUrl } from "@/lib/constants/site";
import { CTA_APP_USE } from "@/lib/constants/cta-copy";
import { useCallback, useEffect, useId, useState, type ReactNode } from "react";

type GateTone = "default" | "group" | "event";

function copyForTone(tone: GateTone) {
  if (tone === "group") {
    return {
      title: MARKETING_APP_ENTRY.groupTitle,
      body: MARKETING_APP_ENTRY.groupBody,
    };
  }
  if (tone === "event") {
    return {
      title: MARKETING_APP_ENTRY.eventTitle,
      body: MARKETING_APP_ENTRY.eventBody,
    };
  }
  return {
    title: MARKETING_APP_ENTRY.title,
    body: MARKETING_APP_ENTRY.body,
  };
}

/**
 * Bestätigt vor dem Wechsel zur Connect-App / Login.
 * Marketing bleibt Vorschau — App nur nach bewusster Zustimmung.
 */
export function MarketingAppEntryGate({
  open,
  onClose,
  returnTo,
  tone = "default",
}: {
  open: boolean;
  onClose: () => void;
  /** Optionaler Connect-Pfad nach Login (z. B. /community/…/group/…). */
  returnTo?: string;
  tone?: GateTone;
}) {
  const titleId = useId();
  const copy = copyForTone(tone);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const href = getLoginUrl(returnTo);

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-black/45 px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="presentation"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center py-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="my-auto w-full max-w-md max-h-[min(90dvh,40rem)] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl shadow-black/20"
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            id={titleId}
            className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-gray-900"
          >
            {copy.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{copy.body}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
            <a
              href={href}
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-[#00C853] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00b34a]"
            >
              {MARKETING_APP_ENTRY.confirm}
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
            >
              {MARKETING_APP_ENTRY.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type AppNutzenButtonProps = {
  children?: ReactNode;
  className?: string;
  returnTo?: string;
  tone?: GateTone;
};

/**
 * App-CTA mit Hinweis-Dialog (Gruppen, Events, Inhalts-CTAs).
 * Header „App nutzen“ geht direkt zur Connect-App — siehe MarketingHeader.
 */
export function AppNutzenButton({
  children = CTA_APP_USE,
  className,
  returnTo,
  tone = "default",
}: AppNutzenButtonProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <MarketingAppEntryGate open={open} onClose={close} returnTo={returnTo} tone={tone} />
    </>
  );
}

export function useMarketingAppEntryGate() {
  const [open, setOpen] = useState(false);
  const [returnTo, setReturnTo] = useState<string | undefined>();
  const [tone, setTone] = useState<GateTone>("default");

  const requestAppEntry = useCallback((opts?: { returnTo?: string; tone?: GateTone }) => {
    setReturnTo(opts?.returnTo);
    setTone(opts?.tone ?? "default");
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return {
    open,
    returnTo,
    tone,
    requestAppEntry,
    close,
    gate: (
      <MarketingAppEntryGate open={open} onClose={close} returnTo={returnTo} tone={tone} />
    ),
  };
}

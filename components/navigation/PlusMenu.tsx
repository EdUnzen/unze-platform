"use client";

import { PLUS_MENU_ITEMS } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";
import { LayoutDashboard, Megaphone, UsersRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const MENU_ICONS = {
  post: Megaphone,
  community: UsersRound,
  dashboard: LayoutDashboard,
} as const;

interface PlusMenuProps {
  open: boolean;
  onClose: () => void;
}

export function PlusMenu({ open, onClose }: PlusMenuProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Creator-Menü">
      <button
        type="button"
        className="absolute inset-0 bg-unze-ink/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-label="Menü schließen"
      />

      <div
        className={cn(
          "relative mx-auto w-full max-w-lg rounded-t-3xl bg-white px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2 shadow-nav animate-slide-up",
        )}
      >
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-unze-border" />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-unze-ink">Erstellen</h2>
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex h-10 w-10 items-center justify-center rounded-full bg-unze-surface-muted text-unze-ink-secondary"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {PLUS_MENU_ITEMS.map((item) => {
            const Icon = MENU_ICONS[item.id];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-2xl p-4 transition-colors active:bg-unze-surface-muted"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unze-green-muted text-unze-green-dark">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium text-unze-ink">
                      {item.label}
                    </span>
                    <span className="block text-sm text-unze-ink-secondary">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

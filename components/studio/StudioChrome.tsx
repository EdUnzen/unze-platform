"use client";

import { StudioAreaList } from "@/components/studio/StudioAreaList";
import { StudioPrimaryNav } from "@/components/studio/StudioNav";
import { STUDIO_BRAND } from "@/lib/studio/constants";
import { LayoutGrid, LogOut, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";

type StudioChromeProps = {
  email: string;
  roleId: string;
  children: ReactNode;
};

export function StudioChrome({ email, roleId, children }: StudioChromeProps) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2.5 sm:px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2.5 py-2 text-left hover:bg-gray-50"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
            <LayoutGrid className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              UNZE Studio
            </span>
            <span className="block text-sm font-semibold" style={{ color: STUDIO_BRAND.primary }}>
              Bereiche
            </span>
          </span>
        </button>

        <form action="/api/studio/auth/logout" method="post">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs text-gray-500 hover:text-gray-800"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Abmelden
          </button>
        </form>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-gray-900/40"
            aria-label="Bereiche schließen"
            onClick={() => setOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 left-0 flex w-[min(100%,22rem)] flex-col bg-gray-50 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
              <div>
                <p id={titleId} className="text-base font-semibold text-gray-900">
                  Bereiche
                </p>
                <p className="text-xs text-gray-500">Alle Räume — unten bleiben nur die drei täglichen.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <StudioAreaList pathname={pathname} onNavigate={() => setOpen(false)} compact />
            </div>

            <div className="border-t border-gray-200 bg-white px-4 py-3">
              <p className="truncate text-xs text-gray-500">{email}</p>
              <p className="text-xs text-gray-400">{roleId}</p>
            </div>
          </aside>
        </div>
      ) : null}

      <main className="flex-1 pb-24">{children}</main>
      <StudioPrimaryNav />
    </div>
  );
}

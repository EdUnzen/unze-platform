import type { ReactNode } from "react";

/** Minimale Shell fuer interne Admin-/Studio-Seiten ohne Marketing-Navigation. */
export function StudioShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          UNZE Intern
        </p>
      </header>
      <main>{children}</main>
    </div>
  );
}

"use client";

import { useEffect } from "react";

export default function DashboardCommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard.community]", error);
  }, [error]);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card text-center">
      <h2 className="text-base font-semibold text-unze-ink">
        Dashboard konnte nicht geladen werden
      </h2>
      <p className="mt-2 text-sm text-unze-ink-secondary">
        Bitte erneut versuchen. Wenn das Problem bleibt, öffne die öffentliche
        Community-Ansicht oder kontaktiere den Support.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-unze-green px-4 py-2.5 text-sm font-semibold text-white"
        >
          Erneut laden
        </button>
        <a
          href="/dashboard"
          className="rounded-xl border border-unze-border px-4 py-2.5 text-sm font-semibold text-unze-ink"
        >
          Zum Dashboard
        </a>
      </div>
    </div>
  );
}

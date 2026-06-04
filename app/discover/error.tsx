"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DiscoverError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[discover/error]", error);
  }, [error]);

  return (
    <div className="page-padding">
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center shadow-card">
        <h1 className="text-lg font-bold text-red-900">Discover nicht verfügbar</h1>
        <p className="mt-2 text-sm text-red-800">
          Die Seite konnte nicht geladen werden. Bitte erneut versuchen.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[10px] text-red-700/80">Ref: {error.digest}</p>
        )}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-unze-green px-5 py-2.5 text-sm font-semibold text-white"
          >
            Erneut laden
          </button>
          <Link
            href="/"
            className="rounded-xl border border-unze-border bg-white px-5 py-2.5 text-sm font-semibold text-unze-ink"
          >
            Zur Startseite
          </Link>
        </div>
      </section>
    </div>
  );
}

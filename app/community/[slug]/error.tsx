"use client";

import { UnzeLogo } from "@/components/brand/UnzeLogo";
import Link from "next/link";
import { useEffect } from "react";

export default function CommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[community/error]", error);
  }, [error]);

  return (
    <div className="page-padding flex min-h-[50vh] flex-col items-center justify-center text-center">
      <UnzeLogo href="/" size="md" />
      <h1 className="mt-6 text-lg font-bold text-unze-ink">
        Community konnte nicht geladen werden
      </h1>
      <p className="mt-2 max-w-sm text-sm text-unze-ink-secondary">
        Ein Teil der Daten war nicht verfügbar. Du kannst es erneut versuchen oder zu
        Favoriten zurückkehren.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[10px] text-unze-ink-muted">Ref: {error.digest}</p>
      )}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-unze-green px-5 py-2.5 text-sm font-semibold text-white"
        >
          Erneut laden
        </button>
        <Link
          href="/favorites"
          className="rounded-xl border border-unze-border bg-white px-5 py-2.5 text-sm font-semibold text-unze-ink"
        >
          Zu Favoriten
        </Link>
      </div>
    </div>
  );
}

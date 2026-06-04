"use client";

import { UnzeLogo } from "@/components/brand/UnzeLogo";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="page-padding flex min-h-[50vh] flex-col items-center justify-center text-center">
      <UnzeLogo href="/" size="md" />
      <h1 className="mt-6 text-lg font-bold text-unze-ink">Etwas ist schiefgelaufen</h1>
      <p className="mt-2 max-w-sm text-sm text-unze-ink-secondary">
        Die Seite konnte nicht geladen werden. Bitte erneut versuchen oder zur Startseite
        wechseln.
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
          href="/"
          className="rounded-xl border border-unze-border bg-white px-5 py-2.5 text-sm font-semibold text-unze-ink"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

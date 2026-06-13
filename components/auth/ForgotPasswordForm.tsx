"use client";

import { requestPasswordResetAction } from "@/app/auth/password-actions";
import Link from "next/link";
import { useActionState } from "react";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, null);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card">
      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-unze-ink">
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-4 py-3 text-base outline-none focus:border-unze-green focus:ring-2 focus:ring-unze-green/20 sm:text-sm"
            placeholder="du@beispiel.de"
          />
        </div>

        {state?.error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        {state?.success && (
          <p className="rounded-xl bg-unze-green-muted px-3 py-2 text-sm text-unze-green-dark" role="status">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Wird gesendet…" : "Link senden"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-unze-ink-secondary">
        <Link href="/auth/login" className="font-semibold text-unze-green">
          Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  );
}

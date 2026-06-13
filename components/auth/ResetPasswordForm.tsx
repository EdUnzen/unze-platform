"use client";

import { updatePasswordAction } from "@/app/auth/password-actions";
import { useActionState } from "react";

interface ResetPasswordFormProps {
  returnTo?: string;
}

export function ResetPasswordForm({ returnTo = "/auth/login" }: ResetPasswordFormProps) {
  const [state, action, pending] = useActionState(updatePasswordAction, null);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card">
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={returnTo} />

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-unze-ink">
            Neues Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-4 py-3 text-base outline-none focus:border-unze-green focus:ring-2 focus:ring-unze-green/20 sm:text-sm"
            placeholder="Mindestens 8 Zeichen"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-unze-ink">
            Passwort bestätigen
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-4 py-3 text-base outline-none focus:border-unze-green focus:ring-2 focus:ring-unze-green/20 sm:text-sm"
            placeholder="Passwort wiederholen"
          />
        </div>

        {state?.error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Wird gespeichert…" : "Passwort speichern"}
        </button>
      </form>
    </div>
  );
}

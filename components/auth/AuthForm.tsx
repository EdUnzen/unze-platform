"use client";

import { signInWithEmail, signUpWithEmail } from "@/app/auth/actions";
import { cn } from "@/lib/utils/cn";
import { useActionState, useState } from "react";

interface AuthFormProps {
  returnTo?: string;
  initialMode?: "login" | "signup";
}

export function AuthForm({ returnTo = "/", initialMode = "login" }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loginState, loginAction, loginPending] = useActionState(signInWithEmail, null);
  const [signupState, signupAction, signupPending] = useActionState(signUpWithEmail, null);

  const isLogin = mode === "login";
  const state = isLogin ? loginState : signupState;
  const pending = isLogin ? loginPending : signupPending;
  const signupSuccess =
    !isLogin && signupState && "success" in signupState && signupState.success;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card">
      <div className="mb-6 flex rounded-2xl bg-unze-surface-muted p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={cn(
            "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
            isLogin ? "bg-white text-unze-ink shadow-sm" : "text-unze-ink-muted",
          )}
        >
          Anmelden
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={cn(
            "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
            !isLogin ? "bg-white text-unze-ink shadow-sm" : "text-unze-ink-muted",
          )}
        >
          Registrieren
        </button>
      </div>

      <form action={isLogin ? loginAction : signupAction} className="space-y-4">
        <input type="hidden" name="next" value={returnTo} />
        {!isLogin && (
          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-unze-ink">
              Anzeigename
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="name"
              className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-4 py-3 text-sm outline-none focus:border-unze-green focus:ring-2 focus:ring-unze-green/20"
              placeholder="Dein Name"
            />
          </div>
        )}

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
            className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-4 py-3 text-sm outline-none focus:border-unze-green focus:ring-2 focus:ring-unze-green/20"
            placeholder="du@beispiel.de"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-unze-ink">
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-4 py-3 text-sm outline-none focus:border-unze-green focus:ring-2 focus:ring-unze-green/20"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        {signupSuccess && (
          <p className="rounded-xl bg-unze-green-muted px-3 py-2 text-sm text-unze-green-dark" role="status">
            {signupState!.success}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Bitte warten…" : isLogin ? "Anmelden" : "Konto erstellen"}
        </button>
      </form>
    </div>
  );
}

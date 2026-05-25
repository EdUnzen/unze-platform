"use client";

import { signOutAction } from "@/app/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="w-full rounded-xl border border-unze-border py-3 text-sm font-medium text-unze-ink-secondary active:scale-[0.98]"
      >
        Abmelden
      </button>
    </form>
  );
}

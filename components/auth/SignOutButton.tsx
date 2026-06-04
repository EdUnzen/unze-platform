"use client";

import { signOutAction } from "@/app/auth/actions";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-unze-border/80 bg-white py-3 text-sm font-medium text-unze-ink-secondary shadow-sm active:scale-[0.98]"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Abmelden
      </button>
    </form>
  );
}

"use client";

import { redeemInviteAction } from "@/app/invite/actions";
import { UserPlus } from "lucide-react";
import { useTransition } from "react";

export function InviteRedeemButton({ code }: { code: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await redeemInviteAction(code);
        })
      }
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white active:scale-[0.98] disabled:opacity-60"
    >
      <UserPlus className="h-4 w-4" aria-hidden />
      {pending ? "Beitreten…" : "Einladung annehmen"}
    </button>
  );
}

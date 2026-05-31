"use client";

import { startGroupCheckoutAction } from "@/app/billing/actions";
import { formatGroupPrice } from "@/lib/monetization/pricing-display";
import { CreditCard } from "lucide-react";
import { useTransition } from "react";

interface GroupCheckoutButtonProps {
  communityId: string;
  communitySlug: string;
  groupId: string;
  groupSlug: string;
  groupTitle: string;
  priceCents: number;
  currency?: string;
  stripePriceId?: string | null;
  label?: string;
}

export function GroupCheckoutButton({
  communityId,
  communitySlug,
  groupId,
  groupSlug,
  groupTitle,
  priceCents,
  currency,
  stripePriceId,
  label,
}: GroupCheckoutButtonProps) {
  const [pending, startTransition] = useTransition();
  const priceLabel = formatGroupPrice(priceCents, currency);
  const buttonLabel =
    label ?? (priceLabel ? `${priceLabel} · Jetzt buchen` : "Jetzt buchen");

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await startGroupCheckoutAction({
            communityId,
            communitySlug,
            groupId,
            groupSlug,
            groupTitle,
            priceCents,
            stripePriceId,
          });
        })
      }
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3 text-sm font-semibold text-white disabled:opacity-60"
    >
      <CreditCard className="h-4 w-4" aria-hidden />
      {pending ? "Weiterleitung…" : buttonLabel}
    </button>
  );
}

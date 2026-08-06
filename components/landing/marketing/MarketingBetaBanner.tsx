import { BETA_BANNER, isClosedBeta } from "@/lib/constants/beta-communication";
import Link from "next/link";

export function MarketingBetaBanner() {
  if (!isClosedBeta()) return null;

  return (
    <div
      className="border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950"
      role="status"
    >
      <span className="mr-2 inline-block rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
        {BETA_BANNER.label}
      </span>
      {BETA_BANNER.message}{" "}
      <Link href={BETA_BANNER.href} className="font-semibold text-amber-900 underline-offset-2 hover:underline">
        {BETA_BANNER.linkLabel}
      </Link>
    </div>
  );
}

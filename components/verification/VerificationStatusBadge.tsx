import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface VerificationStatusBadgeProps {
  type: "creator" | "community";
  tier?: string;
  className?: string;
}

export function VerificationStatusBadge({
  type,
  tier,
  className,
}: VerificationStatusBadgeProps) {
  const label =
    type === "creator"
      ? tier === "platform"
        ? "Verifizierter Creator"
        : tier === "business"
          ? "Business Creator"
          : "Verifizierter Creator"
      : "Verifizierte Community";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-unze-green-muted px-2.5 py-1 text-[10px] font-semibold text-unze-green-dark",
        className,
      )}
    >
      <BadgeCheck className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

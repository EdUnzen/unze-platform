import { formatGroupPrice } from "@/lib/monetization/pricing-display";
import { cn } from "@/lib/utils/cn";
import { Tag, Wallet } from "lucide-react";

interface PriceBadgeProps {
  label: string;
  variant?: "default" | "prominent" | "inline";
  className?: string;
  showIcon?: boolean;
}

export function PriceBadge({
  label,
  variant = "default",
  className,
  showIcon = true,
}: PriceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold",
        variant === "prominent" &&
          "rounded-xl bg-unze-green-muted px-3 py-1.5 text-sm text-unze-green-dark",
        variant === "default" &&
          "rounded-full bg-unze-green-muted px-2.5 py-1 text-[11px] text-unze-green-dark",
        variant === "inline" && "text-sm text-unze-ink",
        className,
      )}
    >
      {showIcon &&
        (variant === "prominent" ? (
          <Wallet className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <Tag className="h-3 w-3 shrink-0" aria-hidden />
        ))}
      {label}
    </span>
  );
}

interface GroupPriceBadgeProps {
  priceCents?: number | null;
  currency?: string;
  isService?: boolean;
  className?: string;
}

export function GroupPriceBadge({
  priceCents,
  currency,
  isService,
  className,
}: GroupPriceBadgeProps) {
  const label = formatGroupPrice(priceCents, currency);
  if (!label) {
    if (isService) return null;
    return (
      <PriceBadge
        label="Kostenlos"
        variant="default"
        className={cn("bg-unze-surface-muted text-unze-ink-secondary", className)}
        showIcon={false}
      />
    );
  }

  return (
    <PriceBadge
      label={isService ? `${label} einmalig` : label}
      variant="default"
      className={className}
    />
  );
}

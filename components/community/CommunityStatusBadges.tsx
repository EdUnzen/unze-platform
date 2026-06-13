import { ACCESS_STATUS_OPTIONS } from "@/lib/constants/access";
import { VISIBILITY_OPTIONS } from "@/lib/constants/community";
import { VerificationInfoTrigger } from "@/components/verification/VerificationInfoTrigger";
import type { Community } from "@/types/community";
import { cn } from "@/lib/utils/cn";
import { Crown, Lock, PauseCircle } from "lucide-react";

interface CommunityStatusBadgesProps {
  community: Community;
  className?: string;
  variant?: "light" | "dark";
}

export function CommunityStatusBadges({
  community,
  className,
  variant = "dark",
}: CommunityStatusBadgesProps) {
  const visibilityLabel =
    VISIBILITY_OPTIONS.find((o) => o.value === community.visibility)?.label ??
    community.visibility;
  const accessLabel = community.access
    ? ACCESS_STATUS_OPTIONS.find((o) => o.value === community.access?.accessStatus)
        ?.label
    : null;

  const pill =
    variant === "dark"
      ? "bg-black/35 text-white backdrop-blur-md"
      : "bg-unze-surface-muted text-unze-ink-secondary";

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold", pill)}>
        {community.visibility !== "public" && <Lock className="h-3 w-3" aria-hidden />}
        {visibilityLabel}
      </span>

      {accessLabel && accessLabel !== "Offen" && (
        <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold", pill)}>
          {community.access?.admissionsPaused && (
            <PauseCircle className="h-3 w-3" aria-hidden />
          )}
          {accessLabel}
        </span>
      )}

      {community.isVerified && (
        <VerificationInfoTrigger
          kind="community"
          variant="pill"
          className={cn(
            "rounded-lg px-2 py-0.5 text-[11px] font-semibold",
            variant === "dark"
              ? "bg-black/35 text-white backdrop-blur-md"
              : "bg-unze-green-muted text-unze-green-dark",
          )}
          iconClassName={variant === "dark" ? "text-white" : undefined}
        />
      )}

      {(community.monetizationEnabled || community.priceLabel) && (
        <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold", pill)}>
          <Crown className="h-3 w-3" aria-hidden />
          {community.priceLabel ?? "Premium"}
        </span>
      )}
    </div>
  );
}

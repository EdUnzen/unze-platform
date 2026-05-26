import { cn } from "@/lib/utils/cn";
import type { BadgeType } from "@/types/database";
import { Award } from "lucide-react";

const BADGE_STYLES: Record<BadgeType, string> = {
  permanent: "bg-unze-green-muted text-unze-green-dark",
  temporary: "bg-blue-100 text-blue-800",
  event: "bg-amber-100 text-amber-900",
};

interface UserBadgeChipProps {
  name: string;
  badgeType?: BadgeType;
  className?: string;
}

export function UserBadgeChip({
  name,
  badgeType = "permanent",
  className,
}: UserBadgeChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        BADGE_STYLES[badgeType],
        className,
      )}
      title={name}
    >
      <Award className="h-3 w-3" aria-hidden />
      {name}
    </span>
  );
}

interface CommunityBadgeIconProps {
  name: string;
  badgeType?: BadgeType;
  size?: "sm" | "md";
}

export function CommunityBadgeIcon({
  name,
  badgeType = "permanent",
  size = "md",
}: CommunityBadgeIconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl shadow-sm",
        BADGE_STYLES[badgeType],
        size === "sm" ? "h-9 w-9" : "h-11 w-11",
      )}
      title={name}
    >
      <Award className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5")} aria-hidden />
    </div>
  );
}

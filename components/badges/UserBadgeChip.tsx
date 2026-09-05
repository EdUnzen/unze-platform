import { cn } from "@/lib/utils/cn";
import type { BadgeType } from "@/types/database";
import { Award } from "lucide-react";
import Image from "next/image";

const BADGE_STYLES: Record<BadgeType, string> = {
  permanent: "bg-unze-green-muted text-unze-green-dark ring-unze-green/25",
  temporary: "bg-blue-100 text-blue-800 ring-blue-200/80",
  event: "bg-amber-100 text-amber-900 ring-amber-200/80",
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
  iconUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
} as const;

const ICON_SIZE_MAP = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
} as const;

/** Runde Auszeichnungs-Medaille — optional mit individuellem Bild */
export function CommunityBadgeIcon({
  name,
  badgeType = "permanent",
  iconUrl,
  size = "md",
}: CommunityBadgeIconProps) {
  const hasImage = Boolean(iconUrl?.trim());

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-white shadow-sm",
        BADGE_STYLES[badgeType],
        SIZE_MAP[size],
      )}
      title={name}
    >
      {hasImage ? (
        <Image
          src={iconUrl!}
          alt={name}
          fill
          className="object-cover"
          sizes={size === "lg" ? "64px" : size === "md" ? "48px" : "40px"}
        />
      ) : (
        <Award className={cn(ICON_SIZE_MAP[size], "opacity-90")} aria-hidden />
      )}
    </div>
  );
}

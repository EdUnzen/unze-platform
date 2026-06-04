import {
  COMMUNITY_LEVEL_LABELS,
  levelUsesDiamondIcon,
  type CommunityLevel,
} from "@/lib/constants/community-level";
import { cn } from "@/lib/utils/cn";
import { Gem } from "lucide-react";

interface CommunityLevelBadgeProps {
  level: CommunityLevel;
  className?: string;
  variant?: "light" | "dark";
}

export function CommunityLevelBadge({
  level,
  className,
  variant = "light",
}: CommunityLevelBadgeProps) {
  const showDiamond = levelUsesDiamondIcon(level);
  const pill =
    variant === "dark"
      ? "bg-black/35 text-white backdrop-blur-md"
      : "bg-unze-green-muted text-unze-green-dark";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold",
        pill,
        className,
      )}
    >
      {showDiamond && <Gem className="h-3 w-3" aria-hidden />}
      {COMMUNITY_LEVEL_LABELS[level]} Community
    </span>
  );
}

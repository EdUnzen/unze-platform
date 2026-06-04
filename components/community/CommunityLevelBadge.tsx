import {
  COMMUNITY_LEVEL_LABELS,
  type CommunityLevel,
} from "@/lib/constants/community-level";
import {
  COMMUNITY_LEVEL_BADGE_STYLES,
  COMMUNITY_LEVEL_ICONS,
} from "@/lib/constants/community-level-styles";
import { cn } from "@/lib/utils/cn";

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
  const Icon = COMMUNITY_LEVEL_ICONS[level];
  const styles = COMMUNITY_LEVEL_BADGE_STYLES[level];
  const pill = variant === "dark" ? styles.pillDark : styles.pillLight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold",
        pill,
        className,
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5 shrink-0", variant === "dark" ? styles.iconClass : "opacity-90")}
        aria-hidden
      />
      {COMMUNITY_LEVEL_LABELS[level]} Community
    </span>
  );
}

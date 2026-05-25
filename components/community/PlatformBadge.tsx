import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/constants/platforms";
import type { PlatformType } from "@/types/community";
import { cn } from "@/lib/utils/cn";

interface PlatformBadgeProps {
  platform: PlatformType;
  className?: string;
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        PLATFORM_COLORS[platform],
        className,
      )}
    >
      {PLATFORM_LABELS[platform]}
    </span>
  );
}

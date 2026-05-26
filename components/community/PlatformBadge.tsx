import {
  PLATFORM_COLORS,
  PLATFORM_LABELS,
} from "@/lib/constants/platforms";
import { PlatformIcon } from "@/components/platform/PlatformIcon";
import type { PlatformType } from "@/types/community";
import { cn } from "@/lib/utils/cn";

interface PlatformBadgeProps {
  platform: PlatformType;
  className?: string;
  /** overlay = auf Bannern, icon = nur Icon, footer = unter Cards, default = Pill */
  variant?: "default" | "overlay" | "icon" | "footer";
  showLabel?: boolean;
}

export function PlatformBadge({
  platform,
  className,
  variant = "default",
  showLabel = true,
}: PlatformBadgeProps) {
  const label = PLATFORM_LABELS[platform];

  if (variant === "icon") {
    return (
      <span
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5",
          className,
        )}
        title={label}
        aria-label={label}
      >
        <PlatformIcon platform={platform} size="sm" />
      </span>
    );
  }

  if (variant === "overlay") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg bg-black/35 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md",
          className,
        )}
        title={label}
      >
        <PlatformIcon platform={platform} size="xs" onDark />
        {showLabel && label}
      </span>
    );
  }

  if (variant === "footer") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-unze-surface-muted px-2 py-1 text-[11px] font-medium text-unze-ink-secondary",
          className,
        )}
        title={label}
      >
        <PlatformIcon platform={platform} size="xs" />
        {showLabel && label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        PLATFORM_COLORS[platform],
        className,
      )}
      title={label}
    >
      <PlatformIcon platform={platform} size="xs" />
      {showLabel && label}
    </span>
  );
}

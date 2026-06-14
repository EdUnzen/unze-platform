import {
  PLATFORM_COLORS,
  PLATFORM_ICON_COLORS,
  PLATFORM_LABELS,
} from "@/lib/constants/platforms";
import { PlatformIcon } from "@/components/platform/PlatformIcon";
import type { PlatformType } from "@/types/community";
import { cn } from "@/lib/utils/cn";

interface PlatformBadgeProps {
  platform: PlatformType;
  className?: string;
  /** overlay = Banner, card = Community-Karte, icon = nur Icon, footer = unter Cards, default = Pill */
  variant?: "default" | "overlay" | "icon" | "footer" | "card";
  showLabel?: boolean;
}

export function PlatformBadge({
  platform,
  className,
  variant = "default",
  showLabel = true,
}: PlatformBadgeProps) {
  const label = PLATFORM_LABELS[platform];
  const brandColor = PLATFORM_ICON_COLORS[platform];

  if (variant === "card") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2.5 rounded-2xl px-3 py-2 shadow-md ring-1 ring-black/5",
          PLATFORM_COLORS[platform],
          className,
        )}
        title={label}
        aria-label={label}
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 shadow-sm"
          style={{ color: brandColor }}
        >
          <PlatformIcon platform={platform} size="md" active />
        </span>
        {showLabel && (
          <span className="text-sm font-bold">{label}</span>
        )}
      </span>
    );
  }

  if (variant === "icon") {
    return (
      <span
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5",
          className,
        )}
        title={label}
        aria-label={label}
      >
        <PlatformIcon platform={platform} size="md" active />
      </span>
    );
  }

  if (variant === "overlay") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-md",
          className,
        )}
        style={{ backgroundColor: `${brandColor}dd` }}
        title={label}
      >
        <PlatformIcon platform={platform} size="sm" onDark active />
        {showLabel && label}
      </span>
    );
  }

  if (variant === "footer") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold",
          PLATFORM_COLORS[platform],
          className,
        )}
        title={label}
      >
        <PlatformIcon platform={platform} size="sm" active />
        {showLabel && label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide",
        PLATFORM_COLORS[platform],
        className,
      )}
      title={label}
    >
      <PlatformIcon platform={platform} size="sm" active />
      {showLabel && label}
    </span>
  );
}

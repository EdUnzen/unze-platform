import type { ReactNode } from "react";
import {
  PLATFORM_ICON_COLORS,
  PLATFORM_LABELS,
} from "@/lib/constants/platforms";
import type { PlatformType } from "@/types/community";
import { cn } from "@/lib/utils/cn";

interface PlatformIconProps {
  platform: PlatformType;
  className?: string;
  size?: "xs" | "sm" | "md";
  /** Auf dunklen Bannern: Icon in Weiß */
  onDark?: boolean;
  /** false = ausgegraut (Plattform nicht verknüpft) */
  active?: boolean;
}

const SIZE = { xs: 12, sm: 14, md: 18 } as const;

export function PlatformIcon({
  platform,
  className,
  size = "sm",
  onDark = false,
  active = true,
}: PlatformIconProps) {
  const px = SIZE[size];
  const color = onDark ? "#ffffff" : PLATFORM_ICON_COLORS[platform];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      className={cn(
        "shrink-0 transition-all",
        active && "drop-shadow-sm",
        !active && "opacity-55",
        className,
      )}
      aria-hidden
      fill="currentColor"
      style={{ color: active ? color : "#9ca3af" }}
    >
      {ICON_PATHS[platform]}
    </svg>
  );
}

export function getPlatformLabel(platform: PlatformType): string {
  return PLATFORM_LABELS[platform];
}

/** Marken-Icons — kompakt, ohne externe Assets */
const ICON_PATHS: Record<PlatformType, ReactNode> = {
  discord: (
    <path d="M20.3 4.4A17.2 17.2 0 0 0 15.5 3c-.2.4-.5 1-.7 1.4a15.9 15.9 0 0 0-4.6 0C9.9 4 9.6 3.4 9.4 3a17.2 17.2 0 0 0-4.8 1.4C2.5 8.2 1.8 12 2.1 15.7a17.3 17.3 0 0 0 5.2 2.6c.4-.6.8-1.2 1.1-1.8-.6-.2-1.2-.5-1.7-.8.1-.1.3-.2.4-.3 3.2 1.5 6.7 1.5 9.8 0l.4.3c-.5.3-1.1.6-1.7.8.3.6.7 1.2 1.1 1.8a17.2 17.2 0 0 0 5.2-2.6c.4-4.3-.5-8.1-2.8-11.3ZM8.7 13.6c-.9 0-1.7-.8-1.7-1.8s.7-1.8 1.7-1.8 1.7.8 1.7 1.8-.8 1.8-1.7 1.8Zm6.6 0c-.9 0-1.7-.8-1.7-1.8s.7-1.8 1.7-1.8 1.7.8 1.7 1.8-.8 1.8-1.7 1.8Z" />
  ),
  whatsapp: (
    <path d="M17.5 14.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.5-1.7-1.7-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2.1-1.4.2-.7.2-1.3.2-1.4 0-.2-.2-.3-.4-.4Z M12 2C6.5 2 2 6.1 2 11.2c0 1.8.5 3.5 1.4 5L2 22l6-1.4c1.4.8 3 1.2 4.6 1.2 5.5 0 10-4.1 10-9.2S17.5 2 12 2Z" />
  ),
  telegram: (
    <path d="M21.9 4.6 2.8 11.5c-1.1.4-1.1 1.1-.2 1.4l4.9 1.5 1.9 5.9c.2.6.8.7 1.2.3l2.6-2.4 5.1 3.8c.9.5 1.5.2 1.7-.9L22.8 6c.3-1.3-.5-1.9-1.9-1.4Z M9.2 13.8l9.9-6.2c.5-.3.9-.1.5.2l-8.1 7.4-.3 3.5-.9-2.5 3.9-2.4Z" />
  ),
  facebook: (
    <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V9.1c0-.9.2-1.5 1.6-1.5H17V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H8v3.1h2.3v8h3.2Z" />
  ),
  instagram: (
    <>
      <path d="M12 7.4A4.6 4.6 0 1 0 12 16.6 4.6 4.6 0 0 0 12 7.4Z" />
      <path d="M17.8 2H6.2A4.2 4.2 0 0 0 2 6.2v11.6A4.2 4.2 0 0 0 6.2 22h11.6a4.2 4.2 0 0 0 4.2-4.2V6.2A4.2 4.2 0 0 0 17.8 2ZM12 18.1A6.1 6.1 0 1 1 12 5.9a6.1 6.1 0 0 1 0 12.2Zm6.5-11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    </>
  ),
  tiktok: (
    <path d="M16.6 5.8a5.5 5.5 0 0 0 3.4-1.2V8.6a8.2 8.2 0 0 1-3.4-.7v6.8a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.4a2.2 2.2 0 1 0 1.6 2.1V2h3.1a5.5 5.5 0 0 0 0 3.8Z" />
  ),
  youtube: (
    <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.6.6a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.6 7.6.6 7.6.6s5.8 0 7.6-.6a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .4-4.8 29 29 0 0 0-.4-4.8ZM10 15.5V8.5l5.5 3.5L10 15.5Z" />
  ),
  website: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.9 9h-3.2a15.8 15.8 0 0 0-1.2-5 8 8 0 0 1 4.4 5ZM12 4c.9 1.4 1.6 3.1 1.9 5H10.1c.3-1.9 1-3.6 1.9-5ZM4.1 13h3.2c.2 1.8.6 3.5 1.2 5a8 8 0 0 1-4.4-5Zm3.2-2H4.1a8 8 0 0 1 4.4-5c-.6 1.5-1 3.2-1.2 5Zm5.7 0h3.6c-.3-1.9-1-3.6-1.9-5-.9 1.4-1.6 3.1-1.7 5Zm0 2c.1 1.9.8 3.6 1.7 5 .9-1.4 1.6-3.1 1.9-5h-3.6Zm2.4 5c.6-1.5 1-3.2 1.2-5h3.2a8 8 0 0 1-4.4 5ZM9.3 15c-.6-1.5-1-3.2-1.2-5H4.9a8 8 0 0 0 4.4 5Z" />
  ),
  unze: (
    <path d="M12 2 4 6.5v11L12 22l8-4.5v-11L12 2Zm0 2.2 5.5 3.1v6.2L12 16.6l-5.5-3.1V7.3L12 4.2Z" />
  ),
  other: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
  ),
};

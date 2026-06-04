"use client";

import {
  avatarGradientForSeed,
  initialsFromName,
} from "@/lib/visual/seed-from-string";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

const SIZE_CLASSES = {
  xs: "h-6 w-6 text-[10px] rounded-full",
  sm: "h-8 w-8 text-xs rounded-full",
  md: "h-10 w-10 text-sm rounded-full",
  lg: "h-14 w-14 text-base rounded-2xl",
  xl: "h-20 w-20 text-xl rounded-full",
  "2xl": "h-28 w-28 text-2xl rounded-full",
} as const;

export type UserAvatarSize = keyof typeof SIZE_CLASSES;

interface UserAvatarProps {
  name: string;
  seed?: string;
  avatarUrl?: string | null;
  size?: UserAvatarSize;
  className?: string;
  verifiedRing?: boolean;
}

export function UserAvatar({
  name,
  seed,
  avatarUrl,
  size = "md",
  className,
  verifiedRing,
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const displaySeed = seed ?? name;
  const showImage = Boolean(avatarUrl) && !imageFailed;
  const initials = initialsFromName(name);
  const gradient = avatarGradientForSeed(displaySeed);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-bold text-white shadow-sm",
        SIZE_CLASSES[size],
        !showImage && `bg-gradient-to-br ${gradient}`,
        verifiedRing && "ring-2 ring-unze-green ring-offset-2 ring-offset-white",
        className,
      )}
      aria-hidden={!name}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl!}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

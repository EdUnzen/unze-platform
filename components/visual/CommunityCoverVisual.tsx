"use client";

import { AbstractNetworkPattern } from "@/components/visual/AbstractNetworkPattern";
import { patternVariantForSeed } from "@/lib/visual/seed-from-string";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

interface CommunityCoverVisualProps {
  seed: string;
  bannerGradient: string;
  imageUrl?: string | null;
  className?: string;
  overlay?: "card" | "hero" | "subtle";
}

export function CommunityCoverVisual({
  seed,
  bannerGradient,
  imageUrl,
  className,
  overlay = "card",
}: CommunityCoverVisualProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;
  const variant = patternVariantForSeed(seed);

  const overlayClass =
    overlay === "hero"
      ? "from-black/55 via-black/15 to-transparent"
      : overlay === "subtle"
        ? "from-black/25 to-transparent"
        : "from-black/35 via-black/5 to-transparent";

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn("absolute inset-0 bg-gradient-to-br", bannerGradient)}
        aria-hidden
      />

      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      )}

      <AbstractNetworkPattern variant={variant} opacity={showImage ? 0.2 : 0.42} />

      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-6 left-1/4 h-24 w-24 rounded-full bg-white/8 blur-xl"
        aria-hidden
      />

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t",
          overlayClass,
        )}
        aria-hidden
      />
    </div>
  );
}

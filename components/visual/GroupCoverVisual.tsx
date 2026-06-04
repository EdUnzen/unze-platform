"use client";

import { AbstractNetworkPattern } from "@/components/visual/AbstractNetworkPattern";
import { patternVariantForSeed } from "@/lib/visual/seed-from-string";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { Users } from "lucide-react";
import { useState } from "react";

interface GroupCoverVisualProps {
  seed: string;
  bannerGradient: string;
  imageUrl?: string | null;
  className?: string;
  compact?: boolean;
}

function isNextImageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".supabase.co") || host === "images.unsplash.com";
  } catch {
    return false;
  }
}

export function GroupCoverVisual({
  seed,
  bannerGradient,
  imageUrl,
  className,
  compact = false,
}: GroupCoverVisualProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;
  const useNextImage = showImage && isNextImageUrl(imageUrl!);
  const variant = patternVariantForSeed(`${seed}-group`);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn("absolute inset-0 bg-gradient-to-br", bannerGradient)}
        aria-hidden
      />

      {showImage && useNextImage ? (
        <Image
          src={imageUrl!}
          alt=""
          fill
          sizes={compact ? "280px" : "(max-width: 512px) 100vw, 384px"}
          className="object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : null}

      {showImage && !useNextImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : null}

      <AbstractNetworkPattern variant={variant} opacity={showImage ? 0.2 : 0.38} />
      <div
        className={cn(
          "absolute flex items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md",
          compact ? "bottom-2 right-2 h-8 w-8" : "bottom-3 right-3 h-9 w-9",
        )}
        aria-hidden
      >
        <Users className="h-4 w-4 text-white/90" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
    </div>
  );
}

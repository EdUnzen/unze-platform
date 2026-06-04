"use client";

import { AbstractNetworkPattern } from "@/components/visual/AbstractNetworkPattern";
import { patternVariantForSeed } from "@/lib/visual/seed-from-string";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { useState } from "react";

interface CommunityCoverVisualProps {
  seed: string;
  bannerGradient: string;
  imageUrl?: string | null;
  className?: string;
  overlay?: "card" | "hero" | "subtle";
}

function isNextImageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".supabase.co") || host === "images.unsplash.com";
  } catch {
    return false;
  }
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
  const useNextImage = showImage && isNextImageUrl(imageUrl!);
  const variant = patternVariantForSeed(seed);
  const isHero = overlay === "hero";

  const overlayClass =
    overlay === "hero"
      ? "from-black/55 via-black/15 to-transparent"
      : overlay === "subtle"
        ? "from-black/25 to-transparent"
        : "from-black/35 via-black/5 to-transparent";

  const imageSizes = isHero
    ? "100vw"
    : "(max-width: 512px) 100vw, 384px";

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
          sizes={imageSizes}
          className="object-cover"
          priority={isHero}
          loading={isHero ? "eager" : "lazy"}
          onError={() => setImageFailed(true)}
        />
      ) : null}

      {showImage && !useNextImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt=""
          loading={isHero ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={isHero ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : null}

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

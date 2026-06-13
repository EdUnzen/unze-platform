"use client";

import { AbstractNetworkPattern } from "@/components/visual/AbstractNetworkPattern";
import { patternVariantForSeed } from "@/lib/visual/seed-from-string";
import { getListThumbnailUrl, getHeroImageUrl } from "@/lib/visual/optimized-image-url";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { useState } from "react";

interface CommunityCoverVisualProps {
  seed: string;
  bannerGradient: string;
  /** Primäres Banner (Upload oder Kategorie) */
  imageUrl?: string | null;
  /** Fallback wenn primäres Bild fehlschlägt — immer Kategorie-Standard */
  fallbackImageUrl: string;
  className?: string;
  overlay?: "card" | "hero" | "subtle";
  /** Listen-Thumbnails statt Vollbild-URLs */
  imageVariant?: "card" | "list" | "hero";
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
  fallbackImageUrl,
  className,
  overlay = "card",
  imageVariant = "card",
}: CommunityCoverVisualProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const primary = imageUrl?.trim() || null;
  const useFallback = !primary || failedUrl === primary;
  const rawUrl = useFallback ? fallbackImageUrl : primary!;
  const activeUrl =
    imageVariant === "hero"
      ? getHeroImageUrl(rawUrl) ?? rawUrl
      : getListThumbnailUrl(rawUrl) ?? rawUrl;
  const showImage = Boolean(activeUrl) && failedUrl !== activeUrl;

  const useNextImage = showImage && isNextImageUrl(activeUrl);
  const patternVariant = patternVariantForSeed(seed);
  const isHero = overlay === "hero";

  const overlayClass =
    overlay === "hero"
      ? "from-black/55 via-black/15 to-transparent"
      : overlay === "subtle"
        ? "from-black/25 to-transparent"
        : "from-black/40 via-black/10 to-transparent";

  const imageSizes =
    imageVariant === "hero" || overlay === "hero"
      ? "100vw"
      : imageVariant === "list"
        ? "(max-width: 512px) 50vw, 240px"
        : "(max-width: 512px) 100vw, 480px";

  const handleError = (url: string) => {
    setFailedUrl(url);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-opacity",
          bannerGradient,
          showImage ? "opacity-30" : "opacity-100",
        )}
        aria-hidden
      />

      {showImage && useNextImage ? (
        <Image
          src={activeUrl}
          alt=""
          fill
          sizes={imageSizes}
          className="object-cover"
          priority={isHero}
          loading={isHero ? "eager" : "lazy"}
          onError={() => handleError(activeUrl)}
        />
      ) : null}

      {showImage && !useNextImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activeUrl}
          alt=""
          loading={isHero ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={isHero ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => handleError(activeUrl)}
        />
      ) : null}

      {!showImage && (
        <AbstractNetworkPattern variant={patternVariant} opacity={0.35} />
      )}

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

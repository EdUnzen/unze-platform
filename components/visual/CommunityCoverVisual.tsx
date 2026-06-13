"use client";

import { AbstractNetworkPattern } from "@/components/visual/AbstractNetworkPattern";
import { coverImageCandidates, type ResolvedCover } from "@/lib/visual/auto-cover";
import { patternVariantForSeed } from "@/lib/visual/seed-from-string";
import { getListThumbnailUrl, getHeroImageUrl } from "@/lib/visual/optimized-image-url";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { useMemo, useState } from "react";

interface CommunityCoverVisualProps {
  seed: string;
  bannerGradient: string;
  /** Nur Nutzer-Upload */
  imageUrl?: string | null;
  /** Auto-Cover / Standard-Fallback (Legacy) */
  fallbackImageUrl?: string;
  /** Einheitliches 3-Stufen-Cover (empfohlen) */
  cover?: ResolvedCover;
  className?: string;
  overlay?: "card" | "hero" | "subtle";
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

function optimizeUrl(raw: string, imageVariant: CommunityCoverVisualProps["imageVariant"]) {
  if (imageVariant === "hero") {
    return getHeroImageUrl(raw) ?? raw;
  }
  return getListThumbnailUrl(raw) ?? raw;
}

export function CommunityCoverVisual({
  seed,
  bannerGradient,
  imageUrl,
  fallbackImageUrl,
  cover,
  className,
  overlay = "card",
  imageVariant = "card",
}: CommunityCoverVisualProps) {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());

  const candidates = useMemo(() => {
    if (cover) return coverImageCandidates(cover);
    const list: string[] = [];
    const primary = imageUrl?.trim();
    if (primary) list.push(primary);
    if (fallbackImageUrl?.trim() && !list.includes(fallbackImageUrl.trim())) {
      list.push(fallbackImageUrl.trim());
    }
    return list;
  }, [cover, imageUrl, fallbackImageUrl]);

  const gradient = cover?.gradient ?? bannerGradient;

  const activeUrl = useMemo(() => {
    for (const raw of candidates) {
      const optimized = optimizeUrl(raw, imageVariant);
      if (!failedUrls.has(optimized) && !failedUrls.has(raw)) {
        return optimized;
      }
    }
    return null;
  }, [candidates, failedUrls, imageVariant]);

  const showImage = Boolean(activeUrl);
  const useNextImage = showImage && isNextImageUrl(activeUrl!);
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

  const markFailed = (url: string) => {
    setFailedUrls((prev) => new Set(prev).add(url));
  };

  return (
    <div className={cn("relative overflow-hidden bg-unze-green-dark/20", className)}>
      <div
        className={cn("absolute inset-0 bg-gradient-to-br", gradient)}
        aria-hidden
      />

      <AbstractNetworkPattern
        variant={patternVariant}
        opacity={showImage ? 0.14 : 0.4}
      />

      {showImage && useNextImage ? (
        <Image
          src={activeUrl!}
          alt=""
          fill
          sizes={imageSizes}
          className="object-cover"
          priority={isHero}
          loading={isHero ? "eager" : "lazy"}
          onError={() => markFailed(activeUrl!)}
        />
      ) : null}

      {showImage && !useNextImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activeUrl!}
          alt=""
          loading={isHero ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={isHero ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => markFailed(activeUrl!)}
        />
      ) : null}

      <div
        className={cn("absolute inset-0 bg-gradient-to-t", overlayClass)}
        aria-hidden
      />
    </div>
  );
}

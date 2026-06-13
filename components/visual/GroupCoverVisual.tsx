"use client";

import { AbstractNetworkPattern } from "@/components/visual/AbstractNetworkPattern";
import { patternVariantForSeed } from "@/lib/visual/seed-from-string";
import { isUsableImageUrl } from "@/lib/visual/image-url";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { Users, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

interface GroupCoverVisualProps {
  seed: string;
  bannerGradient: string;
  imageUrl?: string | null;
  className?: string;
  compact?: boolean;
  groupType?: "group" | "service";
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
  groupType = "group",
}: GroupCoverVisualProps) {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());
  const url = isUsableImageUrl(imageUrl) ? imageUrl!.trim() : null;
  const activeUrl = useMemo(() => {
    if (!url) return null;
    return failedUrls.has(url) ? null : url;
  }, [url, failedUrls]);

  const showImage = Boolean(activeUrl);
  const useNextImage = showImage && isNextImageUrl(activeUrl!);
  const variant = patternVariantForSeed(`${seed}-group`);
  const Icon = groupType === "service" ? Wrench : Users;

  return (
    <div className={cn("relative overflow-hidden bg-unze-green-dark/15", className)}>
      <div
        className={cn("absolute inset-0 bg-gradient-to-br", bannerGradient)}
        aria-hidden
      />

      <AbstractNetworkPattern variant={variant} opacity={showImage ? 0.16 : 0.4} />

      {showImage && useNextImage ? (
        <Image
          src={activeUrl!}
          alt=""
          fill
          sizes={compact ? "280px" : "(max-width: 512px) 100vw, 384px"}
          className="object-cover"
          loading="lazy"
          onError={() =>
            setFailedUrls((prev) => new Set(prev).add(activeUrl!))
          }
        />
      ) : null}

      {showImage && !useNextImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activeUrl!}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() =>
            setFailedUrls((prev) => new Set(prev).add(activeUrl!))
          }
        />
      ) : null}

      <div
        className={cn(
          "absolute flex items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md",
          compact ? "bottom-2 right-2 h-8 w-8" : "bottom-3 right-3 h-9 w-9",
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4 text-white/90" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
    </div>
  );
}

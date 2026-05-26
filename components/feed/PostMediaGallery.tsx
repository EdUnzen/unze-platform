"use client";

import type { PostMediaItem } from "@/types/post";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

interface PostMediaGalleryProps {
  media: PostMediaItem[];
  className?: string;
  variant?: "feed" | "detail";
}

export function PostMediaGallery({
  media,
  className,
  variant = "feed",
}: PostMediaGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const images = media.filter((m) => m.type === "image");

  if (images.length === 0) return null;

  function scrollTo(next: number) {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(images.length - 1, next));
    setIndex(clamped);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-unze-surface-muted", className)}>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn(
          "flex snap-x snap-mandatory overflow-x-auto scrollbar-none",
          variant === "feed" ? "max-h-[min(52vw,320px)]" : "max-h-[min(70vw,480px)]",
        )}
      >
        {images.map((item, i) => (
          <div
            key={`${item.url}-${i}`}
            className="relative w-full shrink-0 snap-center snap-always"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.alt ?? "Community-Bild"}
              className={cn(
                "w-full object-cover",
                variant === "feed" ? "aspect-[4/5] max-h-[320px]" : "aspect-[4/5]",
              )}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
          {index > 0 && (
            <button
              type="button"
              onClick={() => scrollTo(index - 1)}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              aria-label="Vorheriges Bild"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {index < images.length - 1 && (
            <button
              type="button"
              onClick={() => scrollTo(index + 1)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              aria-label="Nächstes Bild"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export type ProductBrandPanelSize = "footer" | "compact" | "card" | "hero";

const SHELL_SIZE: Record<ProductBrandPanelSize, string> = {
  footer: "h-28 w-28 sm:h-32 sm:w-32",
  compact: "h-40 w-40 sm:h-44 sm:w-44 md:h-48 md:w-48",
  card: "h-48 w-48 sm:h-52 sm:w-52 md:h-60 md:w-60 lg:h-64 lg:w-64",
  hero: "h-44 w-44 sm:h-52 sm:w-52 md:h-60 md:w-60 lg:h-72 lg:w-72",
};

const PANEL_PADDING: Record<ProductBrandPanelSize, string> = {
  footer: "",
  compact: "min-h-[220px] px-5 py-8 sm:min-h-[240px] sm:py-10",
  card: "min-h-[280px] px-8 py-12 md:min-h-[320px] md:py-16 lg:min-h-[360px]",
  hero: "px-6 py-8 md:px-8 md:py-10",
};

const IMAGE_PADDING: Record<ProductBrandPanelSize, string> = {
  footer: "p-2.5",
  compact: "p-3 sm:p-3.5",
  card: "p-4 md:p-5",
  hero: "p-4 sm:p-5",
};

/** Quadratisches Produktlogo — zentriert, proportional, mit ausreichend Raum */
export function ProductBrandPanel({
  src,
  alt,
  caption,
  size = "card",
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  size?: ProductBrandPanelSize;
  className?: string;
}) {
  const isInline = size === "footer";

  if (isInline) {
    return (
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl",
          SHELL_SIZE.footer,
          className,
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={1024}
          height={1024}
          className={cn("aspect-square h-full w-full object-contain", IMAGE_PADDING.footer)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950",
        PANEL_PADDING[size],
        className,
      )}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30",
          SHELL_SIZE[size],
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={1024}
          height={1024}
          priority={size === "hero" || size === "card"}
          className={cn("aspect-square h-full w-full object-contain", IMAGE_PADDING[size])}
        />
      </div>
      {caption ? (
        <p className="mt-5 max-w-xs text-center text-xs leading-relaxed text-pretty text-white/60">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

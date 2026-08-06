import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export type ProductBrandPanelSize = "footer" | "compact" | "card" | "hero";

const SHELL_SIZE: Record<ProductBrandPanelSize, string> = {
  footer: "h-24 w-24 sm:h-28 sm:w-28",
  compact: "h-36 w-36 sm:h-40 sm:w-40 md:h-44 md:w-44",
  card: "h-44 w-44 sm:h-48 sm:w-48 md:h-56 md:w-56",
  hero: "h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56",
};

const PANEL_PADDING: Record<ProductBrandPanelSize, string> = {
  footer: "",
  compact: "min-h-[240px] px-5 pb-8 pt-12 sm:min-h-[260px] sm:pt-14",
  card: "min-h-[300px] px-8 pb-12 pt-14 md:min-h-[340px] md:pt-16 lg:min-h-[380px]",
  hero: "px-6 pb-8 pt-10 md:px-8 md:pt-12",
};

/** Quadratisches Produktlogo — heller Hintergrund, gleiche Maße, Luft nach oben */
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
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lg",
          SHELL_SIZE.footer,
          className,
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={512}
          height={512}
          className="aspect-square h-full w-full object-contain p-2"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", PANEL_PADDING[size], className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-xl shadow-gray-900/10",
          SHELL_SIZE[size],
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={1024}
          height={1024}
          priority={size === "hero" || size === "card"}
          className="aspect-square h-full w-full object-contain p-3 md:p-4"
        />
      </div>
      {caption ? (
        <p className="mt-6 max-w-xs text-center text-xs leading-relaxed text-pretty text-gray-500">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

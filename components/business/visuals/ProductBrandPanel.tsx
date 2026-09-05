import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export type ProductBrandPanelSize = "footer" | "compact" | "card" | "hero";

/** Icon-Größe — bündig, ohne zusätzlichen weißen Innenrahmen */
const SHELL_SIZE: Record<ProductBrandPanelSize, string> = {
  footer: "h-20 w-20 sm:h-24 sm:w-24",
  compact: "h-28 w-28 sm:h-32 sm:w-32",
  card: "h-36 w-36 sm:h-40 sm:w-40 md:h-44 md:w-44",
  hero: "h-36 w-36 sm:h-40 sm:w-40 md:h-44 md:w-44",
};

/**
 * Produktlogo bündig — App-Icons haben bereits eigenen Rahmen.
 * Kein zweites weißes Padding-Feld und kein gestapeltes Wordmark-PNG
 * (Wordmark enthält die Bildmarke bereits → doppelte Flächen/„Flüsse“).
 */
export function ProductBrandPanel({
  src,
  alt,
  caption,
  productName,
  size = "card",
  className,
  discontinued = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  /** Native Typografie statt Wordmark-PNG (Logo-Usage) */
  productName?: string;
  size?: ProductBrandPanelSize;
  className?: string;
  discontinued?: boolean;
}) {
  const isInline = size === "footer";

  const icon = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[22%]",
        SHELL_SIZE[size],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={512}
        height={512}
        priority={size === "hero" || size === "card"}
        className="h-full w-full object-cover"
      />
    </div>
  );

  if (isInline) {
    return icon;
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
      {icon}
      {productName ? (
        <p className="mt-4 text-center font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
          <span className={discontinued ? "line-through decoration-gray-400 decoration-2" : undefined}>
            {productName}
          </span>
        </p>
      ) : null}
      {caption ? (
        <p className="mt-2 max-w-[16rem] text-center text-xs leading-relaxed text-pretty text-gray-500">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

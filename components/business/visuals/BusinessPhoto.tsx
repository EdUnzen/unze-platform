import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface BusinessPhotoProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  aspect?: "video" | "square" | "portrait" | "wide" | "auto";
}

const aspectClass = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  wide: "aspect-[21/9]",
  auto: "",
} as const;

const fillShellClass = "absolute inset-0 overflow-hidden";

/** Server-sicheres Bild — kein Client-Hook, kein Webpack-Grenzen-Crash im Dev-Modus. */
export function BusinessPhoto({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  fill = false,
  aspect = "auto",
}: BusinessPhotoProps) {
  if (fill) {
    return (
      <div className={cn(fillShellClass, className)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspect !== "auto" && aspectClass[aspect],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}

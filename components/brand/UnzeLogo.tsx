import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import Link from "next/link";

interface UnzeLogoProps {
  href?: string;
  /** Kompakt für Top-Bar, groß für Login */
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  /** Auf dunklen Flächen (z. B. Footer) — leichter Rand für Kontrast */
  onDark?: boolean;
  className?: string;
}

/** sm = App-Header (Design Screen 24/25), md = kompakt, lg = Login */
const HEIGHT = { sm: 36, md: 44, lg: 56 } as const;

export function UnzeLogo({
  href = "/",
  size = "sm",
  showTagline = false,
  onDark = false,
  className,
}: UnzeLogoProps) {
  const height = HEIGHT[size];
  const width = Math.round(height * 1.05);

  const content = (
    <span
      className={cn(
        "inline-flex flex-col items-center",
        onDark && "rounded-xl ring-1 ring-white/15",
        className,
      )}
    >
      <Image
        src="/brand/unze-logo.png"
        alt="UNZE"
        width={width}
        height={height}
        className="block object-contain"
        style={{
          height,
          width: "auto",
          maxWidth: height * 1.15,
        }}
        priority={size === "lg"}
      />
      {showTagline && (
        <span className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-unze-ink-muted">
          Connect · Build · Grow
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex shrink-0 bg-transparent" data-testid="unze-logo-link">
      {content}
    </Link>
  );
}

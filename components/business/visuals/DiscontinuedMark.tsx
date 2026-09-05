import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type DiscontinuedBadgeSize = "sm" | "md" | "lg";

const SIZE: Record<
  DiscontinuedBadgeSize,
  { wrap: string; text: string; icon: string }
> = {
  sm: { wrap: "px-2.5 py-1", text: "text-[11px]", icon: "h-4 w-4" },
  md: { wrap: "px-3.5 py-1.5", text: "text-sm", icon: "h-5 w-5" },
  lg: { wrap: "px-5 py-2.5", text: "text-base sm:text-lg", icon: "h-8 w-8" },
};

/** Status: Text + großes X dahinter */
export function DiscontinuedBadge({
  size = "md",
  className,
}: {
  size?: DiscontinuedBadgeSize;
  className?: string;
}) {
  const s = SIZE[size];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gray-950 font-bold uppercase tracking-wide text-white",
        s.wrap,
        s.text,
        className,
      )}
    >
      Nicht mehr verfügbar
      <X className={cn(s.icon, "shrink-0")} strokeWidth={3.5} aria-hidden />
    </span>
  );
}

/** Liegt über Produktvisuals, damit der Status sofort lesbar ist */
export function DiscontinuedOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/55">
      <DiscontinuedBadge size="lg" className="shadow-lg shadow-gray-900/20" />
    </div>
  );
}

import { AbstractNetworkPattern } from "@/components/visual/AbstractNetworkPattern";
import { patternVariantForSeed } from "@/lib/visual/seed-from-string";
import { cn } from "@/lib/utils/cn";
import { Users } from "lucide-react";

interface GroupCoverVisualProps {
  seed: string;
  bannerGradient: string;
  className?: string;
  compact?: boolean;
}

export function GroupCoverVisual({
  seed,
  bannerGradient,
  className,
  compact = false,
}: GroupCoverVisualProps) {
  const variant = patternVariantForSeed(`${seed}-group`);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn("absolute inset-0 bg-gradient-to-br", bannerGradient)}
        aria-hidden
      />
      <AbstractNetworkPattern variant={variant} opacity={0.38} />
      <div
        className={cn(
          "absolute flex items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md",
          compact ? "bottom-2 right-2 h-8 w-8" : "bottom-3 right-3 h-9 w-9",
        )}
        aria-hidden
      >
        <Users className="h-4 w-4 text-white/90" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
    </div>
  );
}

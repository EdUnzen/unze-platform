import { AbstractNetworkPattern } from "@/components/visual/AbstractNetworkPattern";
import { patternVariantForSeed } from "@/lib/visual/seed-from-string";
import { cn } from "@/lib/utils/cn";
import { MessageCircle } from "lucide-react";

interface PostContentVisualProps {
  seed: string;
  className?: string;
}

/** Dezenter Hintergrund für Text-Posts ohne Medien */
export function PostContentVisual({ seed, className }: PostContentVisualProps) {
  const variant = patternVariantForSeed(`${seed}-post`);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-unze-green-muted/80 via-white to-emerald-50/60",
        className,
      )}
    >
      <AbstractNetworkPattern variant={variant} opacity={0.18} className="text-unze-green" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent" />
      <div className="relative flex items-center gap-2 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 shadow-sm">
          <MessageCircle className="h-4 w-4 text-unze-green" aria-hidden />
        </span>
        <span className="text-xs font-medium text-unze-ink-secondary">
          Community-Beitrag · UNZE Netzwerk
        </span>
      </div>
    </div>
  );
}

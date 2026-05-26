import { AbstractNetworkPattern } from "@/components/visual/AbstractNetworkPattern";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface EmptyStateVisualProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyStateVisual({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateVisualProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-unze-green-muted/50 via-white to-emerald-50/40 p-8 text-center shadow-card",
        className,
      )}
    >
      <AbstractNetworkPattern variant="network" opacity={0.12} />
      <div className="relative">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-sm">
          <Icon className="h-7 w-7 text-unze-green" aria-hidden />
        </span>
        <h3 className="text-base font-semibold text-unze-ink">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-unze-ink-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}

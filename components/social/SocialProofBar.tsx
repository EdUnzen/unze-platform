import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

export interface SocialProofItem {
  icon: LucideIcon;
  label: string;
  highlight?: boolean;
}

interface SocialProofBarProps {
  items: SocialProofItem[];
  className?: string;
}

export function SocialProofBar({ items, className }: SocialProofBarProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map(({ icon: Icon, label, highlight }) => (
        <span
          key={label}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            highlight
              ? "bg-unze-green-muted/70 text-unze-green-dark"
              : "bg-unze-surface-muted text-unze-ink-secondary",
          )}
        >
          <Icon className="h-3 w-3" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

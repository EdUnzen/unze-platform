import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface CommunityTabSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  className?: string;
}

export function CommunityTabSectionHeader({
  title,
  subtitle,
  icon: Icon,
  className,
}: CommunityTabSectionHeaderProps) {
  return (
    <header className={cn("mb-3 flex items-start gap-2", className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-unze-green" aria-hidden />
      <div>
        <h2 className="text-sm font-semibold text-unze-ink">{title}</h2>
        {subtitle && (
          <p className="text-xs text-unze-ink-secondary">{subtitle}</p>
        )}
      </div>
    </header>
  );
}

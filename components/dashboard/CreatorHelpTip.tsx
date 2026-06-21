import { cn } from "@/lib/utils/cn";
import { HelpCircle } from "lucide-react";
import type { ReactNode } from "react";

interface CreatorHelpTipProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** Kurzer Kontext f\u00fcr Creator-Einstellungen ohne Handbuch. */
export function CreatorHelpTip({ title, children, className }: CreatorHelpTipProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-unze-border/60 bg-unze-surface-muted/40 px-3 py-2.5",
        className,
      )}
    >
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-unze-ink">
        <HelpCircle className="h-3.5 w-3.5 text-unze-green" aria-hidden />
        {title}
      </p>
      <div className="mt-1 text-[11px] leading-relaxed text-unze-ink-secondary">
        {children}
      </div>
    </div>
  );
}

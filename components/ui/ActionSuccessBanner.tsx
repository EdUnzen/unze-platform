"use client";

import { cn } from "@/lib/utils/cn";
import { CheckCircle2 } from "lucide-react";

interface ActionSuccessBannerProps {
  message: string;
  className?: string;
}

/** Einheitliches Erfolgs-Feedback nach Server Actions */
export function ActionSuccessBanner({ message, className }: ActionSuccessBannerProps) {
  return (
    <p
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-xl bg-unze-green-muted/60 px-3 py-2.5 text-sm font-medium text-unze-green-dark",
        className,
      )}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

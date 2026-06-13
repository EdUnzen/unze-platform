import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ActionFeedbackVariant = "success" | "info" | "error";

interface ActionFeedbackProps {
  variant: ActionFeedbackVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<ActionFeedbackVariant, string> = {
  success: "bg-unze-green-muted text-unze-green-dark border border-unze-green/20",
  info: "bg-sky-50 text-sky-900 border border-sky-200/80",
  error: "bg-red-50 text-red-700 border border-red-200/80",
};

export function ActionFeedback({
  variant,
  children,
  className,
}: ActionFeedbackProps) {
  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-3 py-2.5 text-center text-sm font-medium",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {children}
    </p>
  );
}

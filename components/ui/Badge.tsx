import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "green" | "muted" | "platform";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-unze-surface-muted text-unze-ink-secondary",
        variant === "green" && "bg-unze-green-muted text-unze-green-dark",
        variant === "muted" && "bg-unze-ink/5 text-unze-ink-muted",
        variant === "platform" && "",
        className,
      )}
    >
      {children}
    </span>
  );
}

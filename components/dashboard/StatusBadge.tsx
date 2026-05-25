import { cn } from "@/lib/utils/cn";
import type { JoinApplicationStatus } from "@/types/access";

const STATUS_STYLES: Record<
  JoinApplicationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Offen",
    className: "bg-amber-100 text-amber-800",
  },
  waitlisted: {
    label: "Warteliste",
    className: "bg-blue-100 text-blue-800",
  },
  accepted: {
    label: "Angenommen",
    className: "bg-unze-green-muted text-unze-green-dark",
  },
  rejected: {
    label: "Abgelehnt",
    className: "bg-red-100 text-red-700",
  },
  withdrawn: {
    label: "Zurückgezogen",
    className: "bg-unze-surface-muted text-unze-ink-muted",
  },
};

interface ApplicationStatusBadgeProps {
  status: JoinApplicationStatus;
  className?: string;
}

export function ApplicationStatusBadge({
  status,
  className,
}: ApplicationStatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}

export function MemberRestrictionBadge({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-900",
        className,
      )}
    >
      Gesperrt
    </span>
  );
}

interface AttentionBadgeProps {
  count: number;
  label?: string;
}

export function AttentionBadge({ count, label }: AttentionBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
      aria-label={label ?? `${count} offen`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

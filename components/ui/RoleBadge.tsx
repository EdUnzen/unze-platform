import { cn } from "@/lib/utils/cn";
import type { CommunityRole } from "@/types/database";

export const ROLE_DISPLAY: Record<
  CommunityRole,
  { emoji: string; label: string; color: string; muted: string }
> = {
  creator: {
    emoji: "\u{1F451}",
    label: "Creator",
    color: "bg-amber-100 text-amber-900 ring-amber-200",
    muted: "bg-unze-surface-muted text-unze-ink-muted ring-unze-border",
  },
  admin: {
    emoji: "\u{1F6E0}",
    label: "Admin",
    color: "bg-violet-100 text-violet-900 ring-violet-200",
    muted: "bg-unze-surface-muted text-unze-ink-muted ring-unze-border",
  },
  expert: {
    emoji: "\u2B50",
    label: "Experte",
    color: "bg-sky-100 text-sky-900 ring-sky-200",
    muted: "bg-unze-surface-muted text-unze-ink-muted ring-unze-border",
  },
  moderator: {
    emoji: "\u{1F6E1}",
    label: "Moderator",
    color: "bg-blue-100 text-blue-900 ring-blue-200",
    muted: "bg-unze-surface-muted text-unze-ink-muted ring-unze-border",
  },
  verified_member: {
    emoji: "\u2705",
    label: "Verifiziert",
    color: "bg-unze-green-muted text-unze-green-dark ring-unze-green/20",
    muted: "bg-unze-surface-muted text-unze-ink-muted ring-unze-border",
  },
  member: {
    emoji: "\u{1F464}",
    label: "Mitglied",
    color: "bg-slate-100 text-slate-700 ring-slate-200",
    muted: "bg-unze-surface-muted text-unze-ink-muted ring-unze-border",
  },
};

interface RoleBadgeProps {
  role: CommunityRole;
  active?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function RoleBadge({
  role,
  active = true,
  className,
  size = "sm",
}: RoleBadgeProps) {
  const config = ROLE_DISPLAY[role] ?? ROLE_DISPLAY.member;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold ring-1",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        active ? config.color : config.muted,
        className,
      )}
    >
      <span aria-hidden>{config.emoji}</span>
      {config.label}
    </span>
  );
}

interface RoleBadgeRowProps {
  roles: CommunityRole[];
  className?: string;
}

export function RoleBadgeRow({ roles, className }: RoleBadgeRowProps) {
  if (roles.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {roles.map((role) => (
        <RoleBadge key={role} role={role} active />
      ))}
    </div>
  );
}

import {
  membershipStatusLabel,
  MEMBERSHIP_STATUS_UI,
  resolveMembershipDisplayStatus,
  type MembershipDisplayStatus,
  type MembershipStatusInput,
} from "@/lib/monetization/membership-status";
import { cn } from "@/lib/utils/cn";

interface MembershipStatusBadgeProps {
  input: MembershipStatusInput;
  showEmoji?: boolean;
  className?: string;
}

export function MembershipStatusBadge({
  input,
  showEmoji = true,
  className,
}: MembershipStatusBadgeProps) {
  const display = resolveMembershipDisplayStatus(input);
  const ui = MEMBERSHIP_STATUS_UI[display];
  const label = membershipStatusLabel(input);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        ui.badgeClass,
        className,
      )}
    >
      {showEmoji ? (
        <span aria-hidden>{ui.emoji}</span>
      ) : (
        <span className={cn("h-2 w-2 shrink-0 rounded-full", ui.dotClass)} aria-hidden />
      )}
      {label}
    </span>
  );
}

export function MembershipStatusDot({ display }: { display: MembershipDisplayStatus }) {
  const ui = MEMBERSHIP_STATUS_UI[display];
  return (
    <span
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", ui.dotClass)}
      aria-hidden
    />
  );
}

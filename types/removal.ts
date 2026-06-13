export type MemberRemovalReason =
  | "subscription_canceling"
  | "subscription_ended"
  | "user_left";

export type MemberRemovalTaskStatus = "pending" | "confirmed";

export interface MemberRemovalTaskView {
  id: string;
  communityId: string;
  userId: string;
  memberId: string | null;
  reason: MemberRemovalReason;
  status: MemberRemovalTaskStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  confirmedAt: string | null;
  displayName: string | null;
  username: string | null;
}

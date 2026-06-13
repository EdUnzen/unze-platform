import type { MemberRemovalReason } from "@/types/removal";

const REASON_LABELS: Record<MemberRemovalReason, string> = {
  subscription_canceling: "Abo gekündigt — läuft zum Periodenende aus",
  subscription_ended: "Abo beendet — aus externen Kanälen entfernen",
  user_left: "Community verlassen — aus externen Kanälen entfernen",
};

export function removalReasonLabel(reason: MemberRemovalReason): string {
  return REASON_LABELS[reason];
}

export { REASON_LABELS as memberRemovalReasonLabels };

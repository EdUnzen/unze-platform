import type { ReportTargetType } from "@/types/governance";

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  user: "Nutzer",
  community: "Community",
  creator: "Creator",
  post: "Beitrag",
  comment: "Kommentar",
  group: "Gruppe / Service",
  event: "Event",
};

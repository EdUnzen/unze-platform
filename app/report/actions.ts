"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { submitReport } from "@/services/governance/report.service";
import type { ReportTargetType } from "@/types/governance";
import { revalidatePath } from "next/cache";

export async function submitReportAction(input: {
  targetType: ReportTargetType;
  targetId: string;
  communityId?: string | null;
  reason: string;
  details?: string;
  returnPath?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Bitte zuerst anmelden" };

  const result = await submitReport(user.id, {
    targetType: input.targetType,
    targetId: input.targetId,
    communityId: input.communityId,
    reason: input.reason,
    details: input.details,
  });

  if (result.error) return { error: result.error };

  if (input.returnPath) revalidatePath(input.returnPath);
  return { success: true, id: result.id };
}

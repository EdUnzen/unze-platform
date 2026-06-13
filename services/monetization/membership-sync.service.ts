import { createAdminClient } from "@/lib/supabase/admin";
import {
  isActiveSubscriptionStatus,
} from "@/services/monetization/subscription.repository";
import { queueMemberRemovalTask } from "@/services/lifecycle/removal-task.service";
import { softRemoveMemberByUserInDb } from "@/services/lifecycle/removal-task.repository";
import type { SubscriptionStatus } from "@/types/database";

function shouldRevokeMembership(status: SubscriptionStatus): boolean {
  return status === "canceled" || status === "unpaid" || status === "inactive";
}

/**
 * Hält community_members mit subscriptions.status synchron.
 * Kündigung → Queue „Zu entfernen"; Ende → Soft-Remove + Queue.
 */
export async function syncMembershipForSubscription(input: {
  userId: string;
  communityId: string;
  status: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Service Role nicht konfiguriert — Membership-Sync nicht möglich");
  }

  const { data: existing } = await admin
    .from("community_members")
    .select("id, role")
    .eq("community_id", input.communityId)
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing?.role === "creator") return;

  if (isActiveSubscriptionStatus(input.status)) {
    if (!existing) {
      const { error } = await admin.from("community_members").insert({
        community_id: input.communityId,
        user_id: input.userId,
        role: "member",
      });

      if (error && !error.message.includes("duplicate")) {
        throw new Error(`Membership-Sync Join: ${error.message}`);
      }
    }

    if (input.cancelAtPeriodEnd) {
      const { error: taskError } = await queueMemberRemovalTask({
        communityId: input.communityId,
        userId: input.userId,
        memberId: (existing?.id as string) ?? null,
        reason: "subscription_canceling",
        metadata: {
          currentPeriodEnd: input.currentPeriodEnd ?? null,
        },
      });
      if (taskError) {
        throw new Error(`Removal-Task: ${taskError}`);
      }
    }

    return;
  }

  if (shouldRevokeMembership(input.status)) {
    const softResult = await softRemoveMemberByUserInDb(
      input.communityId,
      input.userId,
      input.userId,
    );
    if (softResult.error) {
      throw new Error(`Membership-Sync Soft-Remove: ${softResult.error}`);
    }

    const { error: taskError } = await queueMemberRemovalTask({
      communityId: input.communityId,
      userId: input.userId,
      memberId: softResult.memberId ?? (existing?.id as string) ?? null,
      reason: "subscription_ended",
      metadata: { subscriptionStatus: input.status },
      notifyManagers: true,
    });
    if (taskError) {
      throw new Error(`Removal-Task: ${taskError}`);
    }
  }
}

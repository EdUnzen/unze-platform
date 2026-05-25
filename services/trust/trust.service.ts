import type { TrustEventType, TrustFlagType } from "@/types/governance";
import {
  adjustCommunityTrustInDb,
  adjustUserReputationInDb,
  fetchActiveTrustFlagsFromDb,
  fetchUserTrustEventsFromDb,
  insertTrustEventInDb,
  insertTrustFlagInDb,
} from "./trust.repository";

export async function recordTrustEvent(input: {
  userId?: string | null;
  communityId?: string | null;
  eventType: TrustEventType;
  delta?: number;
  metadata?: Record<string, unknown>;
}) {
  const result = await insertTrustEventInDb(input);
  if (result.error) return result;

  if (input.userId && input.delta) {
    await adjustUserReputationInDb(input.userId, input.delta);
  }

  if (input.communityId && input.delta) {
    await adjustCommunityTrustInDb(input.communityId, input.delta);
  }

  const { publishPlatformEvent } = await import(
    "@/services/platform/event-bus.service"
  );
  await publishPlatformEvent({
    eventType: "trust.score_changed",
    targetUserId: input.userId ?? null,
    communityId: input.communityId ?? null,
    payload: {
      trustEventType: input.eventType,
      delta: input.delta ?? 0,
      ...input.metadata,
    },
    skipHandlers: ["notification"],
  });

  return { error: null };
}

export async function grantVerifiedMemberTrust(input: {
  userId: string;
  communityId: string;
  actorId: string;
}) {
  return recordTrustEvent({
    userId: input.userId,
    communityId: input.communityId,
    eventType: "verified_member_granted",
    delta: 10,
    metadata: { grantedBy: input.actorId },
  });
}

export async function flagUserForReview(input: {
  userId: string;
  flagType: TrustFlagType;
  communityId?: string | null;
  reason?: string;
  createdBy?: string;
}) {
  await insertTrustFlagInDb(input);

  const eventType =
    input.flagType === "scam_suspect" ? "scam_flag" : "spam_flag";

  return recordTrustEvent({
    userId: input.userId,
    communityId: input.communityId,
    eventType,
    delta: -10,
    metadata: { flagType: input.flagType, reason: input.reason },
  });
}

export async function getUserTrustProfile(userId: string) {
  const [events, flags] = await Promise.all([
    fetchUserTrustEventsFromDb(userId),
    fetchActiveTrustFlagsFromDb(userId),
  ]);

  return { events, flags };
}

export async function isUserRestrictedByTrust(userId: string): Promise<boolean> {
  const flags = await fetchActiveTrustFlagsFromDb(userId);
  return flags.some(
    (f) =>
      f.flagType === "restricted" ||
      f.flagType === "scam_suspect" ||
      f.flagType === "spam_suspect",
  );
}

export async function grantCreatorVerificationTrust(input: {
  userId: string;
  tier: "identity" | "business" | "platform";
  reviewerId: string;
}) {
  const delta = input.tier === "platform" ? 50 : input.tier === "business" ? 30 : 20;

  await insertTrustFlagInDb({
    userId: input.userId,
    flagType: "verified",
    reason: `Creator verifiziert (${input.tier})`,
    createdBy: input.reviewerId,
  });

  return recordTrustEvent({
    userId: input.userId,
    eventType: "creator_verified",
    delta,
    metadata: { tier: input.tier, reviewerId: input.reviewerId },
  });
}

export async function grantCommunityVerificationTrust(input: {
  communityId: string;
  reviewerId: string;
}) {
  return recordTrustEvent({
    communityId: input.communityId,
    eventType: "community_verified",
    delta: 50,
    metadata: { reviewerId: input.reviewerId },
  });
}

export async function recordVerificationRejected(input: {
  userId: string;
  communityId?: string | null;
  reason?: string;
}) {
  return recordTrustEvent({
    userId: input.userId,
    communityId: input.communityId,
    eventType: "verification_rejected",
    delta: -5,
    metadata: { reason: input.reason },
  });
}

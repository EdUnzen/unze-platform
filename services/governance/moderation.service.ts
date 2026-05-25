import { canBanMembers, canModerateCommunity } from "@/lib/permissions/engine";
import { notifyGovernanceEvent } from "@/lib/notifications/events";
import { logModerationAction } from "@/services/governance/audit.service";
import { banCommunityMember } from "@/services/lifecycle/restriction.service";
import { recordTrustEvent } from "@/services/trust/trust.service";
import type {
  IssueStrikeInput,
  MemberStrike,
  ModerationAction,
} from "@/types/governance";
import type { CommunityRole } from "@/types/database";
import {
  countActiveStrikesFromDb,
  fetchActiveStrikesFromDb,
  fetchModerationHistoryFromDb,
  insertModerationActionInDb,
  insertMuteRestrictionInDb,
  insertStrikeInDb,
} from "./moderation.repository";

const STRIKE_BAN_THRESHOLD = 3;

export async function getModerationHistory(
  communityId: string,
  actorRole: CommunityRole,
  limit = 50,
): Promise<{ error: string | null; actions: ModerationAction[] }> {
  if (!canModerateCommunity(actorRole)) {
    return { error: "Keine Berechtigung", actions: [] };
  }

  const actions = await fetchModerationHistoryFromDb(communityId, limit);
  return { error: null, actions };
}

export async function issueStrike(input: IssueStrikeInput) {
  if (!canBanMembers(input.actorRole)) {
    return { error: "Keine Berechtigung" };
  }

  const currentCount = await countActiveStrikesFromDb(
    input.communityId,
    input.userId,
  );
  const strikeNumber = currentCount + 1;

  const modAction = await insertModerationActionInDb({
    communityId: input.communityId,
    actorId: input.actorId,
    targetUserId: input.userId,
    actionType: "strike",
    reason: input.reason,
    metadata: { strikeNumber },
  });

  const strikeResult = await insertStrikeInDb({
    communityId: input.communityId,
    userId: input.userId,
    strikeNumber,
    reason: input.reason,
    issuedBy: input.actorId,
    moderationActionId: modAction.id,
    expiresAt: input.expiresAt,
  });

  if (strikeResult.error) return strikeResult;

  await recordTrustEvent({
    userId: input.userId,
    communityId: input.communityId,
    eventType: "strike_received",
    delta: -5,
    metadata: { strikeNumber },
  });

  await notifyGovernanceEvent({
    userId: input.userId,
    category: "moderation",
    event: "strike_received",
    communityId: input.communityId,
    body: input.reason ?? `Strike ${strikeNumber}/${STRIKE_BAN_THRESHOLD}`,
  });

  await logModerationAction({
    communityId: input.communityId,
    actorId: input.actorId,
    action: `Strike ${strikeNumber} ausgesprochen`,
    targetUserId: input.userId,
    metadata: { strikeNumber, reason: input.reason },
  });

  if (strikeNumber >= STRIKE_BAN_THRESHOLD) {
    await banCommunityMember({
      communityId: input.communityId,
      userId: input.userId,
      actorId: input.actorId,
      actorRole: input.actorRole,
      reason: `Automatischer Bann nach ${STRIKE_BAN_THRESHOLD} Strikes`,
      permanent: true,
      removeMembership: true,
    });
  }

  return { error: null, strikeNumber };
}

export async function muteMember(input: {
  communityId: string;
  userId: string;
  actorId: string;
  actorRole: CommunityRole;
  reason?: string;
  durationHours?: number;
}) {
  if (!canBanMembers(input.actorRole)) {
    return { error: "Keine Berechtigung" };
  }

  const restrictedUntil = input.durationHours
    ? new Date(Date.now() + input.durationHours * 3600_000).toISOString()
    : null;

  const restriction = await insertMuteRestrictionInDb({
    communityId: input.communityId,
    userId: input.userId,
    actorId: input.actorId,
    reason: input.reason,
    restrictedUntil,
  });

  if (restriction.error) return restriction;

  await insertModerationActionInDb({
    communityId: input.communityId,
    actorId: input.actorId,
    targetUserId: input.userId,
    actionType: "mute",
    restrictionId: restriction.id,
    reason: input.reason,
  });

  await notifyGovernanceEvent({
    userId: input.userId,
    category: "moderation",
    event: "member_muted",
    communityId: input.communityId,
    body: input.reason,
  });

  await logModerationAction({
    communityId: input.communityId,
    actorId: input.actorId,
    action: "Mitglied stummgeschaltet",
    targetUserId: input.userId,
    metadata: { restrictedUntil },
  });

  return { error: null };
}

export async function warnMember(input: {
  communityId: string;
  userId: string;
  actorId: string;
  actorRole: CommunityRole;
  reason?: string;
}) {
  if (!canModerateCommunity(input.actorRole)) {
    return { error: "Keine Berechtigung" };
  }

  await insertModerationActionInDb({
    communityId: input.communityId,
    actorId: input.actorId,
    targetUserId: input.userId,
    actionType: "warn",
    reason: input.reason,
  });

  await notifyGovernanceEvent({
    userId: input.userId,
    category: "moderation",
    event: "member_warned",
    communityId: input.communityId,
    body: input.reason,
  });

  await logModerationAction({
    communityId: input.communityId,
    actorId: input.actorId,
    action: "Verwarnung ausgesprochen",
    targetUserId: input.userId,
    metadata: { reason: input.reason },
  });

  return { error: null };
}

export async function getMemberStrikes(
  communityId: string,
  userId: string,
  actorRole: CommunityRole,
): Promise<{ error: string | null; strikes: MemberStrike[] }> {
  if (!canModerateCommunity(actorRole)) {
    return { error: "Keine Berechtigung", strikes: [] };
  }

  const strikes = await fetchActiveStrikesFromDb(communityId, userId);
  return { error: null, strikes };
}

export { STRIKE_BAN_THRESHOLD };

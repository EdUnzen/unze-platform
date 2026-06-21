import {
  grantCredentialInDb,
  updateEventCheckInRewardsInDb,
  userHasGroupUnlockInDb,
} from "./credential.repository";

export async function grantCredentialToMember(input: {
  credentialId: string;
  userId: string;
  communityId: string;
  grantedBy: string;
  sourceType?: string;
  sourceId?: string;
}) {
  return grantCredentialInDb(input);
}

export async function updateEventCheckInRewards(input: {
  eventId: string;
  checkInCredentialId: string | null;
  checkInGroupId: string | null;
}) {
  return updateEventCheckInRewardsInDb(input);
}

export async function userHasGroupUnlock(userId: string, groupId: string) {
  return userHasGroupUnlockInDb(userId, groupId);
}

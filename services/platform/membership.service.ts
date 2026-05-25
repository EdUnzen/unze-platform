/**
 * Membership Service — Fassade für Access/Invite-Modul
 */

export {
  submitJoinApplication,
  reviewJoinApplication,
  getCommunityApplications,
  directJoinCommunity,
} from "@/services/access/access.service";

export {
  createCommunityInviteLink,
  redeemCommunityInvite,
} from "@/services/access/invite.service";

export {
  notifyApplicant,
  notifyReviewers,
  notifyLifecycleEvent,
} from "@/lib/access/lifecycle-notifications";

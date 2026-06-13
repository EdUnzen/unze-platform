import {
  COMMUNITY_LEVEL_THRESHOLDS,
  type CommunityLevel,
} from "@/lib/constants/community-level";

/** Nächster Score-Meilenstein (Punktezahl, nicht Level-Name) */
export function getNextScoreTarget(
  nextLevel: CommunityLevel | null,
): number | null {
  if (!nextLevel) return null;
  return COMMUNITY_LEVEL_THRESHOLDS[nextLevel];
}

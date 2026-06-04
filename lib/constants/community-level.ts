export const COMMUNITY_LEVELS = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "elite",
] as const;

export type CommunityLevel = (typeof COMMUNITY_LEVELS)[number];

export const COMMUNITY_LEVEL_LABELS: Record<CommunityLevel, string> = {
  bronze: "Bronze",
  silver: "Silber",
  gold: "Gold",
  platinum: "Platin",
  diamond: "Diamant",
  elite: "Elite",
};

/** Mindest-Score (0–100) für Stufe */
export const COMMUNITY_LEVEL_THRESHOLDS: Record<CommunityLevel, number> = {
  bronze: 0,
  silver: 25,
  gold: 40,
  platinum: 55,
  diamond: 70,
  elite: 85,
};

/** Anzeige: „Bronze-Level“ (kein „Bronze Community“) */
export function getCommunityLevelDisplayLabel(level: CommunityLevel): string {
  return `${COMMUNITY_LEVEL_LABELS[level]}-Level`;
}

/** @deprecated — Nutze getCommunityLevelDisplayLabel */
export function levelUsesDiamondIcon(level: CommunityLevel): boolean {
  return level === "diamond" || level === "elite";
}

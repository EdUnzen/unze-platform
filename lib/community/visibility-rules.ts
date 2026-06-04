import type { CommunityVisibility } from "@/types/community";

/** Discover / Verzeichnis: nur öffentlich (+ optional Premium). */
export function discoverEnabledForVisibility(
  visibility: CommunityVisibility,
  formDiscoverChecked?: boolean,
): boolean {
  if (visibility === "private" || visibility === "hidden") return false;
  return formDiscoverChecked !== false;
}

export function isPubliclyListedVisibility(visibility: CommunityVisibility): boolean {
  return visibility === "public" || visibility === "premium";
}

/** DB access_status beim Anlegen. */
export function accessStatusForNewCommunity(
  visibility: CommunityVisibility,
): "open" | "invite_only" {
  return visibility === "private" ? "invite_only" : "open";
}

/** Neue Communities starten immer kostenlos — Premium später im Dashboard. */
export function monetizationEnabledOnCreate(): boolean {
  return false;
}

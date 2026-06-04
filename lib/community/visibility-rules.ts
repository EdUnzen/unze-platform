import type { CommunityVisibility } from "@/types/community";

/** Discover: nur öffentlich und Premium (nicht privat). */
export function discoverEnabledForVisibility(
  visibility: CommunityVisibility,
  formDiscoverChecked?: boolean,
): boolean {
  if (visibility === "private" || visibility === "hidden") return false;
  if (visibility === "public") return formDiscoverChecked !== false;
  return formDiscoverChecked !== false;
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

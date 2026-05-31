/**
 * Plattform-Feature-Flags — Feed deaktiviert, Daten bleiben in der DB.
 * Server: NEXT_PUBLIC_FEED_ENABLED=false (Standard)
 * DB-Backup: platform_feature_flags (Migration 021)
 */

export function isFeedEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FEED_ENABLED === "true";
}

export function isPostComposerEnabled(): boolean {
  return isFeedEnabled();
}

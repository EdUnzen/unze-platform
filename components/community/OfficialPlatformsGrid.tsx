import { PlatformIcon } from "@/components/platform/PlatformIcon";
import {
  OFFICIAL_EXTERNAL_PLATFORMS,
  PLATFORM_LABELS,
} from "@/lib/constants/platforms";
import type { CommunityPlatformLink } from "@/services/community/platform-links.repository";
import type { PlatformType } from "@/types/community";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface OfficialPlatformsGridProps {
  links: CommunityPlatformLink[];
  primaryPlatform?: PlatformType;
  primaryUrl?: string | null;
  communityVerified?: boolean;
  communityVerifiedAt?: string | null;
}

function findLink(
  links: CommunityPlatformLink[],
  platform: PlatformType,
  primaryPlatform?: PlatformType,
  primaryUrl?: string | null,
) {
  if (primaryPlatform === platform && primaryUrl) {
    return {
      url: primaryUrl,
      label: PLATFORM_LABELS[platform],
      isVerified: false,
      verifiedAt: null as string | null,
    };
  }
  const match = links.find((l) => l.platformType === platform);
  if (!match) return null;
  return {
    url: match.url,
    label: match.label ?? PLATFORM_LABELS[platform],
    isVerified: match.isVerified ?? false,
    verifiedAt: match.verifiedAt ?? null,
  };
}

export function OfficialPlatformsGrid({
  links,
  primaryPlatform,
  primaryUrl,
  communityVerified = false,
  communityVerifiedAt: _communityVerifiedAt = null,
}: OfficialPlatformsGridProps) {
  void _communityVerifiedAt;
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
      {OFFICIAL_EXTERNAL_PLATFORMS.map((platform) => {
        const entry = findLink(links, platform, primaryPlatform, primaryUrl);
        const connected = Boolean(entry?.url);
        const linkVerified =
          entry?.isVerified || (communityVerified && connected);

        const inner = (
          <>
            <span
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all sm:h-16 sm:w-16",
                connected
                  ? "border-unze-green/60 bg-white shadow-lg ring-2 ring-unze-green/15"
                  : "border-unze-border bg-unze-surface-muted/60",
              )}
            >
              <PlatformIcon
                platform={platform}
                size="md"
                active={connected}
                className={connected ? "scale-110" : undefined}
              />
            </span>
            <span
              className={cn(
                "mt-2 block truncate text-center text-xs font-semibold",
                connected ? "text-unze-ink" : "text-unze-ink-muted",
              )}
            >
              {PLATFORM_LABELS[platform]}
            </span>
            {connected && linkVerified && (
              <span className="mt-0.5 inline-flex items-center justify-center gap-0.5 text-[10px] font-semibold text-unze-green-dark">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                Verifiziert
              </span>
            )}
            {connected && !linkVerified && (
              <span className="mt-0.5 block text-center text-[10px] font-medium text-unze-green-dark">
                Verbunden
              </span>
            )}
            {!connected && (
              <span className="mt-0.5 block text-center text-[10px] text-unze-ink-muted">
                —
              </span>
            )}
          </>
        );

        if (entry?.url) {
          return (
            <a
              key={platform}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] flex-col items-center rounded-2xl p-2.5 transition-colors active:bg-unze-green-muted/30 hover:bg-unze-surface-muted/80"
            >
              {inner}
              <ExternalLink className="mt-1 h-3.5 w-3.5 text-unze-green" aria-hidden />
            </a>
          );
        }

        return (
          <div
            key={platform}
            className="flex flex-col items-center rounded-2xl p-2.5 opacity-75"
            aria-label={`${PLATFORM_LABELS[platform]} — nicht verknüpft`}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

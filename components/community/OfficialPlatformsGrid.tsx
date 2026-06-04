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
}

function findLink(
  links: CommunityPlatformLink[],
  platform: PlatformType,
  primaryPlatform?: PlatformType,
  primaryUrl?: string | null,
) {
  if (primaryPlatform === platform && primaryUrl) {
    return { url: primaryUrl, label: PLATFORM_LABELS[platform] };
  }
  const match = links.find((l) => l.platformType === platform);
  if (!match) return null;
  return { url: match.url, label: match.label ?? PLATFORM_LABELS[platform] };
}

export function OfficialPlatformsGrid({
  links,
  primaryPlatform,
  primaryUrl,
  communityVerified = false,
}: OfficialPlatformsGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-4">
      {OFFICIAL_EXTERNAL_PLATFORMS.map((platform) => {
        const entry = findLink(links, platform, primaryPlatform, primaryUrl);
        const connected = Boolean(entry?.url);

        const inner = (
          <>
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors sm:h-11 sm:w-11",
                connected
                  ? "border-unze-green/50 bg-white shadow-md"
                  : "border-unze-border bg-unze-surface-muted/50",
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
                "mt-1.5 block truncate text-center text-[10px] font-medium",
                connected ? "text-unze-ink" : "text-unze-ink-muted",
              )}
            >
              {PLATFORM_LABELS[platform]}
            </span>
            {connected && communityVerified && (
              <span className="mt-0.5 inline-flex items-center justify-center gap-0.5 text-[9px] font-semibold text-unze-green-dark">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                Verifiziert
              </span>
            )}
            {connected && !communityVerified && (
              <span className="mt-0.5 block text-center text-[9px] text-unze-ink-muted">
                Verbunden
              </span>
            )}
            {!connected && (
              <span className="mt-0.5 block text-center text-[9px] text-unze-ink-muted">
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
              className="flex flex-col items-center rounded-2xl p-2 transition-colors active:bg-unze-surface-muted"
            >
              {inner}
              <ExternalLink className="mt-1 h-3 w-3 text-unze-green" aria-hidden />
            </a>
          );
        }

        return (
          <div
            key={platform}
            className="flex flex-col items-center rounded-2xl p-2 opacity-80"
            aria-label={`${PLATFORM_LABELS[platform]} — nicht verknüpft`}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

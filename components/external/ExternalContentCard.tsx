import type { PlatformType } from "@/types/community";
import { PlatformBadge } from "@/components/community/PlatformBadge";
import { ExternalLinkTrustNotice } from "@/components/trust/ExternalLinkTrustNotice";
import {
  resolveExternalContent,
  type ResolvedExternalContent,
} from "@/lib/external/resolve-external-content";
import { cn } from "@/lib/utils/cn";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ExternalContentCardProps {
  url: string;
  title?: string;
  communityTitle?: string;
  variant?: "feed" | "detail";
  className?: string;
  resolved?: ResolvedExternalContent | null;
}

export function ExternalContentCard({
  url,
  title,
  communityTitle,
  variant = "feed",
  className,
  resolved: resolvedProp,
}: ExternalContentCardProps) {
  const resolved = resolvedProp ?? resolveExternalContent(url);
  if (!resolved) return null;

  const showEmbed = variant === "detail" && resolved.mode === "iframe" && resolved.embedUrl;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-unze-border/80 bg-unze-surface-muted/30",
        className,
      )}
      data-testid="external-content-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-unze-border/60 bg-white/80 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge
            platform={resolved.platform as PlatformType}
            variant="footer"
            showLabel
          />
          <span className="text-[10px] font-medium uppercase tracking-wide text-unze-ink-muted">
            Extern · {resolved.platformLabel}
          </span>
        </div>
        <span className="text-[10px] text-unze-ink-muted">{resolved.host}</span>
      </div>

      {showEmbed ? (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={resolved.embedUrl}
            title={title ?? `Inhalt auf ${resolved.platformLabel}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : resolved.previewImageUrl ? (
        <Link
          href={resolved.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-video overflow-hidden bg-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolved.previewImageUrl}
            alt={title ?? `Vorschau auf ${resolved.platformLabel}`}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-unze-ink shadow">
              Auf {resolved.platformLabel} ansehen
            </span>
          </div>
        </Link>
      ) : (
        <Link
          href={resolved.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-5 transition hover:bg-unze-surface-muted/50"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <ExternalLink className="h-5 w-5 text-unze-green" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-unze-ink">
              {title ?? "Externer Link"}
            </p>
            <p className="truncate text-xs text-unze-ink-muted">{resolved.originalUrl}</p>
          </div>
        </Link>
      )}

      <div className="space-y-2 border-t border-unze-border/60 bg-white/60 px-3 py-2.5">
        <Link
          href={resolved.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-unze-green-dark hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          Original auf {resolved.platformLabel} öffnen
        </Link>
        {communityTitle && variant === "detail" && (
          <ExternalLinkTrustNotice communityTitle={communityTitle} compact />
        )}
      </div>
    </div>
  );
}

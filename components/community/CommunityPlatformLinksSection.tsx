import { PlatformBadge } from "@/components/community/PlatformBadge";
import { ExternalLinkTrustNotice } from "@/components/trust/ExternalLinkTrustNotice";
import type { CommunityPlatformLink } from "@/services/community/platform-links.repository";
import type { Community } from "@/types/community";
import { ExternalLink, Link2 } from "lucide-react";

interface CommunityPlatformLinksSectionProps {
  community: Community;
  links: CommunityPlatformLink[];
}

export function CommunityPlatformLinksSection({
  community,
  links,
}: CommunityPlatformLinksSectionProps) {
  const hasExternal = Boolean(community.externalUrl);
  if (!hasExternal && links.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <header className="mb-3 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-unze-green" aria-hidden />
        <h2 className="text-sm font-semibold text-unze-ink">Plattformen & Links</h2>
      </header>
      <p className="mb-3 text-xs text-unze-ink-secondary">
        Kommunikation und Inhalte bleiben auf den verbundenen Plattformen — UNZE
        verwaltet Community, Gruppen und Monetarisierung.
      </p>

      <div className="mb-3">
        <PlatformBadge platform={community.platformType} showLabel />
      </div>

      <ul className="space-y-2">
        {hasExternal && (
          <li>
            <a
              href={community.externalUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-2xl border border-unze-border bg-unze-surface-muted/30 px-3 py-3 text-sm font-medium text-unze-ink transition-colors active:bg-unze-surface-muted"
            >
              <span className="inline-flex items-center gap-2">
                <PlatformBadge platform={community.platformType} variant="icon" />
                Hauptplattform öffnen
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-unze-green" aria-hidden />
            </a>
          </li>
        )}
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-2xl border border-unze-border bg-unze-surface-muted/30 px-3 py-3 text-sm font-medium text-unze-ink transition-colors active:bg-unze-surface-muted"
            >
              <span className="inline-flex items-center gap-2">
                <PlatformBadge platform={link.platformType} variant="icon" />
                {link.label ?? link.platformType}
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-unze-green" aria-hidden />
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        <ExternalLinkTrustNotice communityTitle={community.title} />
      </div>
    </section>
  );
}

import { OfficialPlatformsGrid } from "@/components/community/OfficialPlatformsGrid";
import { VerificationInfoTrigger } from "@/components/verification/VerificationInfoTrigger";
import { ExternalLinkTrustNotice } from "@/components/trust/ExternalLinkTrustNotice";
import type { CommunityPlatformLink } from "@/services/community/platform-links.repository";
import type { Community } from "@/types/community";
import { Link2, Shield } from "lucide-react";

interface CommunityPlatformLinksSectionProps {
  community: Community;
  links: CommunityPlatformLink[];
}

export function CommunityPlatformLinksSection({
  community,
  links,
}: CommunityPlatformLinksSectionProps) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <Link2 className="h-4 w-4 text-unze-green" aria-hidden />
        <h2 className="text-sm font-semibold text-unze-ink">Plattformen</h2>
        {community.isVerified && (
          <VerificationInfoTrigger
            kind="community"
            verifiedAt={community.verifiedAt}
            variant="pill"
          />
        )}
      </header>
      <p className="mb-4 text-xs text-unze-ink-secondary">
        Kommunikation läuft über verbundene Kanäle — UNZE organisiert Community,
        Gruppen, Services und Events.
      </p>

      <OfficialPlatformsGrid
        links={links}
        primaryPlatform={community.platformType}
        primaryUrl={community.externalUrl}
        communityVerified={community.isVerified}
        communityVerifiedAt={community.verifiedAt}
      />

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-unze-green/20 bg-unze-green-muted/40 px-3 py-2.5">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-unze-green-dark" aria-hidden />
        <p className="text-[11px] leading-relaxed text-unze-ink-secondary">
          Verifizierte Communities erhalten den grünen Haken auf verbundenen
          Plattformen — Vergabe nur durch UNZE.
        </p>
      </div>

      <div className="mt-3">
        <ExternalLinkTrustNotice communityTitle={community.title} />
      </div>
    </section>
  );
}

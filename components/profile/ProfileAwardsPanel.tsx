import { CommunityBadgeIcon } from "@/components/badges/UserBadgeChip";
import { getAwardSourceLabel } from "@/lib/constants/award-source-labels";
import { getCredentialDisplayTerm } from "@/lib/constants/credential-categories";
import type { UserAwardView } from "@/services/badges/badge.repository";
import { Award } from "lucide-react";
import Link from "next/link";

interface ProfileAwardsPanelProps {
  awards: UserAwardView[];
}

const BADGE_TYPE_LABELS: Record<string, string> = {
  permanent: "Dauerhaft",
  temporary: "Tempor\u00e4r",
  event: "Event",
};

function formatGrantDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ProfileAwardsPanel({ awards }: ProfileAwardsPanelProps) {
  if (awards.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-card">
        <Award className="mx-auto mb-3 h-10 w-10 text-unze-ink-muted" aria-hidden />
        <p className="text-sm font-semibold text-unze-ink">Noch keine Auszeichnungen</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-unze-ink-secondary">
          Qualifikationen, Zertifikate und Auszeichnungen aus Communities, Events und Services
          erscheinen hier mit Datum, Community und Verleiher.
        </p>
        <Link
          href="/discover"
          className="mt-4 inline-block text-sm font-semibold text-unze-green hover:underline"
        >
          Communities entdecken
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {awards.map((award) => {
        const sourceLabel = getAwardSourceLabel(award.sourceType);
        const displayTerm = getCredentialDisplayTerm(award.category, {
          isCollectionQualification: award.isCollectionQualification,
        });

        return (
          <li key={award.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-start gap-3">
              <CommunityBadgeIcon name={award.name} badgeType={award.badgeType} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-unze-ink">{award.name}</p>
                  {award.isCollectionQualification && (
                    <span className="rounded-full bg-unze-green-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-unze-green-dark">
                      Qualifikation
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-unze-ink-muted">
                  {displayTerm}
                  {" \u00b7 "}
                  {BADGE_TYPE_LABELS[award.badgeType] ?? award.badgeType}
                  {" \u00b7 "}
                  <Link
                    href={`/community/${award.communitySlug}`}
                    className="font-medium text-unze-green hover:underline"
                  >
                    {award.communityTitle}
                  </Link>
                </p>
                {award.description && (
                  <p className="mt-2 text-sm text-unze-ink-secondary">{award.description}</p>
                )}
                {award.isCollectionQualification && award.collectionCredentialCount && (
                  <p className="mt-1 text-xs text-unze-ink-muted">
                    {award.collectionCredentialCount} Auszeichnungen in dieser Qualifikation
                  </p>
                )}
                <p className="mt-2 text-[11px] text-unze-ink-secondary">
                  Vergeben am {formatGrantDate(award.grantedAt)}
                  {award.grantedByName && (
                    <>
                      {" \u00b7 "}
                      durch {award.grantedByName}
                    </>
                  )}
                  {sourceLabel && (
                    <>
                      {" \u00b7 "}
                      {sourceLabel}
                    </>
                  )}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

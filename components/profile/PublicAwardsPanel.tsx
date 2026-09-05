import { CommunityBadgeIcon } from "@/components/badges/UserBadgeChip";
import { getCredentialDisplayTerm } from "@/lib/constants/credential-categories";
import type { UserAwardView } from "@/services/badges/badge.repository";
import { Award } from "lucide-react";
import Link from "next/link";

interface PublicAwardsPanelProps {
  awards: UserAwardView[];
  creatorName: string;
}

export function PublicAwardsPanel({ awards, creatorName }: PublicAwardsPanelProps) {
  if (awards.length === 0) return null;

  return (
    <section className="mb-6 rounded-3xl bg-white p-5 shadow-card">
      <header className="mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-unze-green" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold text-unze-ink">Auszeichnungen &amp; Qualifikationen</h2>
          <p className="text-xs text-unze-ink-secondary">
            Öffentlich geteilte Nachweise von {creatorName}
          </p>
        </div>
      </header>
      <ul className="space-y-3">
        {awards.map((award) => {
          const displayTerm = getCredentialDisplayTerm(award.category, {
            isCollectionQualification: award.isCollectionQualification,
          });

          return (
            <li
              key={award.id}
              className="flex items-start gap-3 rounded-2xl border border-unze-border/60 bg-unze-surface-muted/20 p-3"
            >
              <CommunityBadgeIcon name={award.name} badgeType={award.badgeType} iconUrl={award.iconUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-unze-ink">{award.name}</p>
                <p className="mt-0.5 text-xs text-unze-ink-muted">
                  {displayTerm}
                  {" · "}
                  <Link
                    href={`/community/${award.communitySlug}`}
                    className="font-medium text-unze-green hover:underline"
                  >
                    {award.communityTitle}
                  </Link>
                </p>
                {award.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-unze-ink-secondary">
                    {award.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import { CommunityBadgeIcon } from "@/components/badges/UserBadgeChip";
import { getCredentialDisplayTerm } from "@/lib/constants/credential-categories";
import type { CommunityBadgeView } from "@/types/dashboard";
import { Award } from "lucide-react";
import Link from "next/link";

interface CommunityAvailableAwardsProps {
  slug: string;
  awards: CommunityBadgeView[];
  communityTitle: string;
}

export function CommunityAvailableAwards({
  slug,
  awards,
  communityTitle,
}: CommunityAvailableAwardsProps) {
  if (awards.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 shrink-0 text-unze-green" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-unze-ink">Erreichbare Auszeichnungen</h2>
            <p className="text-xs text-unze-ink-secondary">
              Qualifikationen &amp; Nachweise, die du in {communityTitle} erhalten kannst
            </p>
          </div>
        </div>
        <Link
          href={`/community/${slug}?tab=overview#beitritt`}
          className="shrink-0 text-xs font-semibold text-unze-green"
        >
          Beitreten →
        </Link>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {awards.map((award) => (
          <li
            key={award.id}
            className="flex items-start gap-3 rounded-2xl border border-unze-border/70 bg-unze-surface-muted/20 p-3"
          >
            <CommunityBadgeIcon
              name={award.name}
              badgeType={award.badgeType}
              iconUrl={award.iconUrl}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-unze-ink">{award.name}</p>
              <p className="text-[11px] text-unze-ink-muted">
                {getCredentialDisplayTerm(award.category ?? "community_award")}
                {award.grantedCount > 0 && (
                  <>
                    {" · "}
                    {award.grantedCount} bereits vergeben
                  </>
                )}
              </p>
              {award.description && (
                <p className="mt-1 line-clamp-2 text-xs text-unze-ink-secondary">
                  {award.description}
                </p>
              )}
              {award.earnHint && (
                <p className="mt-2 rounded-lg bg-unze-green-muted/30 px-2 py-1.5 text-xs text-unze-green-dark">
                  <span className="font-semibold">So erhältst du:</span> {award.earnHint}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

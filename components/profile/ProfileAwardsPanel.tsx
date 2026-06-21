import { CommunityBadgeIcon } from "@/components/badges/UserBadgeChip";
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

export function ProfileAwardsPanel({ awards }: ProfileAwardsPanelProps) {
  if (awards.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-card">
        <Award className="mx-auto mb-3 h-10 w-10 text-unze-ink-muted" aria-hidden />
        <p className="text-sm font-semibold text-unze-ink">Noch keine Auszeichnungen</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-unze-ink-secondary">
          Qualifikationen und Auszeichnungen aus Communities, Events und Services erscheinen
          hier, sobald sie vergeben wurden.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {awards.map((award) => (
        <li
          key={award.id}
          className="rounded-2xl bg-white p-4 shadow-card"
        >
          <div className="flex items-start gap-3">
            <CommunityBadgeIcon name={award.name} badgeType={award.badgeType} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-unze-ink">{award.name}</p>
              <p className="mt-0.5 text-xs text-unze-ink-muted">
                {BADGE_TYPE_LABELS[award.badgeType] ?? award.badgeType}
                {" \u00b7 "}
                <Link
                  href={`/community/${award.communitySlug}`}
                  className="font-medium text-unze-green hover:underline"
                >
                  {award.communityTitle}
                </Link>
              </p>
              <p className="mt-2 text-[11px] text-unze-ink-secondary">
                Vergeben am{" "}
                {new Date(award.grantedAt).toLocaleDateString("de-DE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {award.grantedByName && (
                  <>
                    {" \u00b7 "}
                    durch {award.grantedByName}
                  </>
                )}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

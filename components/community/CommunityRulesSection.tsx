import type { Community } from "@/types/community";
import { ScrollText } from "lucide-react";

interface CommunityRulesSectionProps {
  community: Community;
}

export function CommunityRulesSection({ community }: CommunityRulesSectionProps) {
  const rules = community.access?.communityRules;
  if (!rules) return null;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card" data-testid="community-rules">
      <div className="mb-2 flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-unze-green" aria-hidden />
        <h2 className="text-sm font-semibold text-unze-ink">Community-Regeln</h2>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-unze-ink-secondary">
        {rules}
      </p>
      {community.access?.requireRulesConsent && (
        <p className="mt-2 text-xs text-unze-ink-muted">
          Zustimmung zu den Regeln ist für den Beitritt erforderlich.
        </p>
      )}
    </section>
  );
}

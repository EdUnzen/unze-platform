import { ACCESS_STATUS_OPTIONS, JOIN_APPROVAL_OPTIONS } from "@/lib/constants/access";
import { VISIBILITY_OPTIONS } from "@/lib/constants/community";
import { PLATFORM_LABELS } from "@/lib/constants/platforms";
import { PlatformBadge } from "@/components/community/PlatformBadge";
import { formatMemberCount } from "@/lib/utils/format-metrics";
import type { Community } from "@/types/community";
import { Lock, Users, Wallet } from "lucide-react";

interface CommunityAtAGlanceProps {
  community: Community;
}

export function CommunityAtAGlance({ community }: CommunityAtAGlanceProps) {
  const access = community.access;
  const visibilityLabel =
    VISIBILITY_OPTIONS.find((o) => o.value === community.visibility)?.label;
  const accessLabel = access
    ? ACCESS_STATUS_OPTIONS.find((o) => o.value === access.accessStatus)?.label
    : null;
  const joinLabel = access
    ? JOIN_APPROVAL_OPTIONS.find((o) => o.value === access.joinApprovalMode)?.label
    : null;

  const rows = [
    { label: "Status", value: accessLabel ?? joinLabel ?? "Offen" },
    {
      label: "Sichtbarkeit",
      value: visibilityLabel ?? community.visibility,
    },
    {
      label: "Kosten",
      value: community.priceLabel ?? (community.monetizationEnabled ? "Premium" : "Kostenlos"),
    },
    {
      label: "Mitglieder",
      value: access?.memberLimit
        ? `${formatMemberCount(community.memberCount)} / ${access.memberLimit}`
        : formatMemberCount(community.memberCount),
    },
    {
      label: "Warteliste",
      value: access?.waitlistEnabled ? "Aktiv" : "Inaktiv",
    },
    {
      label: "Plattform",
      value: PLATFORM_LABELS[community.platformType],
    },
  ];

  return (
    <aside
      className="rounded-3xl border border-unze-border bg-unze-surface-muted/40 p-4"
      data-testid="community-at-a-glance"
    >
      <h2 className="mb-3 text-sm font-semibold text-unze-ink">Auf einen Blick</h2>
      <div className="mb-3">
        <PlatformBadge platform={community.platformType} variant="footer" />
      </div>
      <dl className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2 text-xs">
            <dt className="text-unze-ink-muted">{row.label}</dt>
            <dd className="font-semibold text-unze-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      {community.access?.memberLimit && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-unze-ink-secondary">
          <Users className="h-3.5 w-3.5" aria-hidden />
          Mitgliederlimit: {community.access.memberLimit}
        </p>
      )}

      {community.priceLabel && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-unze-green-dark">
          <Wallet className="h-4 w-4" aria-hidden />
          {community.priceLabel}
        </p>
      )}

      {community.visibility === "private" && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-unze-ink-muted">
          <Lock className="h-3 w-3" aria-hidden />
          Inhalte nur für Mitglieder sichtbar
        </p>
      )}
    </aside>
  );
}

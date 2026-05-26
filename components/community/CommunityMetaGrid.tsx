import { JOIN_APPROVAL_OPTIONS } from "@/lib/constants/access";
import { PLATFORM_LABELS } from "@/lib/constants/platforms";
import { PlatformIcon } from "@/components/platform/PlatformIcon";
import type { Community } from "@/types/community";
import {
  Calendar,
  Globe,
  Languages,
  MapPin,
  Shield,
  Users,
} from "lucide-react";

interface CommunityMetaGridProps {
  community: Community;
}

const META_ICONS = {
  category: Globe,
  platform: Shield,
  region: MapPin,
  join: Users,
  created: Calendar,
  language: Languages,
} as const;

export function CommunityMetaGrid({ community }: CommunityMetaGridProps) {
  const joinLabel =
    JOIN_APPROVAL_OPTIONS.find(
      (o) => o.value === community.access?.joinApprovalMode,
    )?.label ?? "Offen";

  const platformLabel = PLATFORM_LABELS[community.platformType];

  const createdLabel = community.createdAt
    ? new Date(community.createdAt).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const items = [
    { key: "category", label: "Kategorie", value: community.category, icon: META_ICONS.category },
    { key: "platform", label: "Plattform", value: platformLabel, icon: META_ICONS.platform },
    { key: "region", label: "Region", value: community.region ?? "DACH", icon: META_ICONS.region },
    { key: "join", label: "Beitritt", value: joinLabel, icon: META_ICONS.join },
    { key: "created", label: "Erstellt am", value: createdLabel, icon: META_ICONS.created },
    { key: "language", label: "Sprache", value: community.language ?? "Deutsch", icon: META_ICONS.language },
  ] as const;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card" data-testid="community-meta-grid">
      <h2 className="mb-3 text-sm font-semibold text-unze-ink">Details</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isPlatform = item.key === "platform";
          return (
            <div
              key={item.key}
              className="rounded-2xl border border-unze-border/80 bg-unze-surface-muted/30 p-3"
            >
              <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-unze-green-muted">
                {isPlatform ? (
                  <PlatformIcon platform={community.platformType} size="md" />
                ) : (
                  <Icon className="h-4 w-4 text-unze-green-dark" aria-hidden />
                )}
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-unze-ink-muted">
                {item.label}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-unze-ink">{item.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

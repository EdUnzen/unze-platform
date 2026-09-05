import { formatMemberCount } from "@/lib/utils/format-metrics";
import { cn } from "@/lib/utils/cn";
import { Calendar, Layers, Users, Wrench } from "lucide-react";

interface CommunityStatsRowProps {
  memberCount: number;
  groupCount: number;
  eventCount: number;
  serviceCount: number;
  rating?: number;
  className?: string;
}

export function CommunityStatsRow({
  memberCount,
  groupCount,
  eventCount,
  serviceCount,
  rating,
  className,
}: CommunityStatsRowProps) {
  const items = [
    { icon: Users, label: "Mitglieder", value: formatMemberCount(memberCount) },
    { icon: Layers, label: "Gruppen", value: String(groupCount) },
    { icon: Calendar, label: "Events", value: String(eventCount) },
    { icon: Wrench, label: "Services", value: String(serviceCount) },
  ] as const;

  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-2 rounded-2xl border border-unze-border/80 bg-white px-2 py-3 shadow-card",
        className,
      )}
      data-testid="community-stats-row"
    >
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="text-center">
          <Icon className="mx-auto h-4 w-4 text-unze-green" aria-hidden />
          <p className="mt-1 text-sm font-bold text-unze-ink">{value}</p>
          <p className="text-[10px] text-unze-ink-muted">{label}</p>
        </div>
      ))}
      {rating != null && rating > 0 && (
        <p className="col-span-4 mt-1 text-center text-[10px] text-unze-ink-muted">
          Ø {rating.toFixed(1)} Bewertung
        </p>
      )}
    </div>
  );
}

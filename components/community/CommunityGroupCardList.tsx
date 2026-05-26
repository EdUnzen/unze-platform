import { EmptyStateVisual } from "@/components/visual/EmptyStateVisual";
import type { DiscoverGroup } from "@/types/community";
import { cn } from "@/lib/utils/cn";
import { FolderOpen } from "lucide-react";
import { CommunityGroupCard } from "./CommunityGroupCard";

interface CommunityGroupCardListProps {
  groups: DiscoverGroup[];
  title?: string;
  subtitle?: string;
  layout?: "vertical" | "horizontal";
}

export function CommunityGroupCardList({
  groups,
  title,
  subtitle,
  layout = "vertical",
}: CommunityGroupCardListProps) {
  if (groups.length === 0) {
    return (
      <EmptyStateVisual
        icon={FolderOpen}
        title="Noch keine Gruppen"
        description="Neue Gruppen erscheinen hier — mit modernen Community-Visuals statt leerer Flächen."
        className="py-10"
      />
    );
  }

  return (
    <section>
      {(title || subtitle) && (
        <header className="mb-4">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-unze-ink">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-0.5 text-sm text-unze-ink-secondary">{subtitle}</p>
          )}
        </header>
      )}

      {layout === "horizontal" ? (
        <ul
          className={cn(
            "flex gap-3 overflow-x-auto pb-1",
            "snap-x snap-mandatory scrollbar-none",
          )}
        >
          {groups.map((group) => (
            <li key={group.id}>
              <CommunityGroupCard group={group} compact />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-4">
          {groups.map((group) => (
            <li key={group.id}>
              <CommunityGroupCard group={group} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

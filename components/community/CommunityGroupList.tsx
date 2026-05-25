import type { CommunityGroup } from "@/types/community";
import { FolderOpen } from "lucide-react";

interface CommunityGroupListProps {
  groups: CommunityGroup[];
  title?: string;
}

export function CommunityGroupList({
  groups,
  title = "Gruppen",
}: CommunityGroupListProps) {
  if (groups.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-base font-semibold text-unze-ink">{title}</h2>
      <ul className="flex flex-col gap-2">
        {groups.map((group) => (
          <li
            key={group.id}
            className="flex gap-3 rounded-2xl bg-white p-4 shadow-card"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-unze-green-muted text-unze-green-dark">
              <FolderOpen className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-unze-ink">{group.title}</h3>
              {group.description && (
                <p className="mt-0.5 line-clamp-2 text-sm text-unze-ink-secondary">
                  {group.description}
                </p>
              )}
              {!group.isPublic && (
                <span className="mt-1 inline-block text-[10px] font-medium text-unze-ink-muted">
                  Privat
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

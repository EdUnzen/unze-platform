import type { Community } from "@/types/community";
import { CommunityCard } from "./CommunityCard";

interface CommunityCardListProps {
  communities: Community[];
  title?: string;
  subtitle?: string;
}

export function CommunityCardList({
  communities,
  title,
  subtitle,
}: CommunityCardListProps) {
  if (communities.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-unze-ink-muted">
        Keine Communities gefunden.
      </p>
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
      <ul className="flex flex-col gap-4">
        {communities.map((community, index) => (
          <li key={community.id}>
            <CommunityCard community={community} priority={index < 2} />
          </li>
        ))}
      </ul>
    </section>
  );
}

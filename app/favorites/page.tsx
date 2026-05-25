import { CommunityCardList } from "@/components/community/CommunityCardList";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getFollowedCommunities } from "@/services/community/community.service";
import { Heart } from "lucide-react";
import Link from "next/link";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  const followed = user ? await getFollowedCommunities() : [];

  return (
    <div className="page-padding">
      <PageHeader
        title="Favoriten"
        subtitle="Communities, denen du folgst"
      />

      {!user ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-16 shadow-card">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-unze-green-muted">
            <Heart className="h-8 w-8 text-unze-green" aria-hidden />
          </div>
          <p className="text-sm font-medium text-unze-ink">Anmelden erforderlich</p>
          <p className="mt-1 max-w-xs text-center text-sm text-unze-ink-secondary">
            Folge Communities aus Discover, um sie hier zu sehen.
          </p>
          <Link
            href="/auth/login"
            className="mt-4 text-sm font-medium text-unze-green"
          >
            Jetzt anmelden
          </Link>
        </div>
      ) : followed.length > 0 ? (
        <CommunityCardList communities={followed} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-16 shadow-card">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-unze-green-muted">
            <Heart className="h-8 w-8 text-unze-green" aria-hidden />
          </div>
          <p className="text-sm font-medium text-unze-ink">Noch keine Favoriten</p>
          <p className="mt-1 max-w-xs text-center text-sm text-unze-ink-secondary">
            Folge Communities in Discover — sie erscheinen hier.
          </p>
          <Link
            href="/discover"
            className="mt-4 text-sm font-medium text-unze-green"
          >
            Discover öffnen
          </Link>
        </div>
      )}
    </div>
  );
}
